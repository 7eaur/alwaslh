import imageCompression from 'browser-image-compression';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker using unpkg for reliable loading
// We use a specific version for stability, and we use unpkg as it handles .mjs files correctly
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 0.5, // 500KB is plenty for a high-quality A4 scan (was 0.9)
    maxWidthOrHeight: 1200, // Very balanced (was 2048)
    useWebWorker: true,
    initialQuality: 0.75, // Good quality (was 0.85)
  };
  
  try {
    const compressedFile = await imageCompression(file, options);
    // If compressed file is somehow larger (rare), return original
    return compressedFile.size < file.size ? compressedFile : file;
  } catch (error) {
    console.error('Image compression failed:', error);
    return file; // Return original on error
  }
};

/**
 * Creates a very small version of the image specifically for AI analysis 
 * to stay within memory and worker limits.
 */
export const createAiOptimizedImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 0.1, // Very small (100KB)
    maxWidthOrHeight: 1024, // Sufficient for AI OCR
    useWebWorker: true,
    initialQuality: 0.6,
  };
  
  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('AI Image optimization failed:', error);
    return file;
  }
};

export const processPdf = async (file: File): Promise<File[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const imageFiles: File[] = Array(numPages).fill(null);
  
  // Use a pool to avoid crashing browser memory with too many concurrent canvas renders
  const CONCURRENCY_LIMIT = 4;
  const pageIndices = Array.from({ length: numPages }, (_, i) => i + 1);
  const queue = [...pageIndices.entries()];

  const worker = async () => {
    while (queue.length > 0) {
      const entry = queue.shift();
      if (!entry) break;
      const [index, pageNum] = entry;

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.6 }); // Slightly lower scale to save memory (was 2.0)
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { alpha: false }); // Disable alpha for memory/perf
      if (!context) throw new Error('Canvas context failed');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await (page as any).render({ canvasContext: context, viewport } as any).promise;
      
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.8); // Slightly lower quality
      });

      // Clear canvas memory immediately
      canvas.width = 0;
      canvas.height = 0;
      
      if (!blob) throw new Error('Blob generation failed');
      
      const fileName = `${file.name.replace('.pdf', '')}-page-${pageNum}.jpg`;
      const imageFile = new File([blob], fileName, { type: 'image/jpeg' });
      
      imageFiles[index] = await compressImage(imageFile);
      
      // Cleanup
      (page as any).cleanup();
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(2, numPages) }).map(worker) // Reduce concurrency to 2 (was 4)
  );

  return imageFiles;
};

export const processFiles = async (
  files: File[], 
  onProgress: (percent: number) => void
): Promise<File[]> => {
  const totalFiles = files.length;
  let processedCount = 0;
  const allResults: File[] = [];

  // Use a pool for file processing to avoid crashing memory
  const CONCURRENCY_LIMIT = 3;
  const queue = [...files.entries()];

  const worker = async () => {
    while (queue.length > 0) {
      const entry = queue.shift();
      if (!entry) break;
      const [index, file] = entry;

      let result: File | File[];
      try {
        if (file.type.startsWith('image/')) {
          result = await compressImage(file);
        } else if (file.type === 'application/pdf') {
          result = await processPdf(file);
        } else {
          result = file;
        }

        if (Array.isArray(result)) {
          allResults.push(...result);
        } else {
          allResults.push(result);
        }
      } catch (err) {
        console.error(`Failed to process file ${file.name}:`, err);
        // On failure, we still want to keep the original file if possible, or skip it
        allResults.push(file);
      }
      
      processedCount++;
      onProgress(Math.round((processedCount / totalFiles) * 100));
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY_LIMIT, totalFiles) }).map(worker)
  );

  return allResults;
};
