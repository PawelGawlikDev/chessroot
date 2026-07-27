import { Injectable } from '@angular/core';

export type StorageType = 'local' | 'session';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  private getStorage(type: StorageType): Storage {
    return type === 'session' ? sessionStorage : localStorage;
  }

  public getItem<T>(key: string, type: StorageType = 'local'): T | null {
    const raw = this.getStorage(type).getItem(key);
    if (raw === null) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as T;
    }
  }

  public setItem<T>(key: string, value: T, type: StorageType = 'local'): void {
    const storage = this.getStorage(type);
    if (typeof value === 'string') {
      storage.setItem(key, value);
    } else {
      storage.setItem(key, JSON.stringify(value));
    }
  }

  public removeItem(key: string, type: StorageType = 'local'): void {
    this.getStorage(type).removeItem(key);
  }

  public has(key: string, type: StorageType = 'local'): boolean {
    return this.getStorage(type).getItem(key) !== null;
  }

  public clear(type: StorageType = 'local'): void {
    this.getStorage(type).clear();
  }
}
