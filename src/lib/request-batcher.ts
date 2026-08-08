// Request batching utility to reduce API calls
class RequestBatcher {
  private pending: Map<string, Promise<any>> = new Map();
  
  async batch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // If request is already pending, return the existing promise
    if (this.pending.has(key)) {
      return this.pending.get(key) as Promise<T>;
    }
    
    // Create new request
    const promise = fetcher().finally(() => {
      this.pending.delete(key);
    });
    
    this.pending.set(key, promise);
    return promise;
  }
  
  clear() {
    this.pending.clear();
  }
}

export const requestBatcher = new RequestBatcher();
