/**
 * ضغط الصور قبل الرفع لتقليل استهلاك الإنترنت والبطارية.
 * - الحد الأقصى للعرض: 1080 بكسل
 * - الجودة: 0.8
 * - التنسيق: WebP عند توفر الدعم، وإلا JPEG
 */

const MAX_WIDTH = 1080;
const INITIAL_QUALITY = 0.8;
const MIN_QUALITY = 0.5;
const TARGET_MAX_SIZE_MB = 1;

function fileExtension(name: string): string {
  const match = name.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : 'jpg';
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });
}

export async function compressImageFile(file: File): Promise<File> {
  // إذا كان الملف أصغر من 1 ميغابايت ومتجاوزاً للحد الأقصى، لا داعي للضغط
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB <= TARGET_MAX_SIZE_MB && file.type.startsWith('image/')) {
    return file;
  }

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });

  let width = img.naturalWidth;
  let height = img.naturalHeight;

  if (width > MAX_WIDTH) {
    height = Math.round((height * MAX_WIDTH) / width);
    width = MAX_WIDTH;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  ctx.drawImage(img, 0, 0, width, height);
  URL.revokeObjectURL(img.src);

  const supportsWebP = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
  const mimeType = supportsWebP ? 'image/webp' : 'image/jpeg';
  const ext = supportsWebP ? 'webp' : 'jpg';

  let quality = INITIAL_QUALITY;
  let blob: Blob | null = await canvasToBlob(canvas, mimeType, quality);

  // خفض الجودة تدريجياً حتى يصبح الحجم أقل من 1 ميغابايت
  while (blob && blob.size / (1024 * 1024) > TARGET_MAX_SIZE_MB && quality > MIN_QUALITY) {
    quality = Math.max(MIN_QUALITY, quality - 0.1);
    blob = await canvasToBlob(canvas, mimeType, quality);
  }

  if (!blob) return file;

  const originalExt = fileExtension(file.name);
  const newName = file.name.replace(/\.[^.]+$/, '') + (originalExt === ext ? '' : `.${ext}`);
  return new File([blob], newName, { type: mimeType });
}
