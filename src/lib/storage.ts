// Optimized localStorage with compression for large data
export const storage = {
  set(key: string, value: any, compress: boolean = false): void {
    try {
      const serialized = JSON.stringify(value);
      
      // Only store if data is reasonable size (< 1MB)
      if (serialized.length > 1024 * 1024) {
        console.warn(`Data too large for localStorage: ${key}`);
        return;
      }
      
      localStorage.setItem(key, serialized);
      localStorage.setItem(`${key}_time`, Date.now().toString());
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      // Clear old items if quota exceeded
      this.clearOldest();
    }
  },

  get<T>(key: string, maxAge?: number): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      // Check age if maxAge provided
      if (maxAge) {
        const timestamp = localStorage.getItem(`${key}_time`);
        if (timestamp) {
          const age = Date.now() - parseInt(timestamp);
          if (age > maxAge) {
            this.remove(key);
            return null;
          }
        }
      }

      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_time`);
  },

  clear(): void {
    localStorage.clear();
  },

  clearOldest(): void {
    const items: Array<{ key: string; time: number }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.endsWith('_time')) {
        const time = parseInt(localStorage.getItem(key) || '0');
        items.push({ key: key.replace('_time', ''), time });
      }
    }

    // Sort by time and remove oldest 25%
    items.sort((a, b) => a.time - b.time);
    const toRemove = Math.ceil(items.length * 0.25);
    
    for (let i = 0; i < toRemove; i++) {
      this.remove(items[i].key);
    }
  }
};
