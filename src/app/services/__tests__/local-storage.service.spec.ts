import { LocalStorageService } from '../local-storage.service';
import { TestBed } from '@angular/core/testing';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('localStorage (default)', () => {
    it('should set and get a string value', () => {
      service.setItem('test-key', 'hello');
      expect(service.getItem<string>('test-key')).toBe('hello');
    });

    it('should store strings without JSON encoding in localStorage', () => {
      service.setItem('raw', 'dark');
      expect(localStorage.getItem('raw')).toBe('dark');
    });

    it('should set and get a number value', () => {
      service.setItem('num', 42);
      expect(service.getItem<number>('num')).toBe(42);
    });

    it('should set and get an object value', () => {
      const obj = { a: 1, b: 'two' };
      service.setItem('obj', obj);
      expect(service.getItem<typeof obj>('obj')).toEqual(obj);
    });

    it('should return null for non-existent key', () => {
      expect(service.getItem('missing')).toBeNull();
    });

    it('should remove an item', () => {
      service.setItem('to-remove', 'value');
      service.removeItem('to-remove');
      expect(service.getItem('to-remove')).toBeNull();
    });

    it('should report has() correctly', () => {
      expect(service.has('exists')).toBeFalsy();
      service.setItem('exists', true);
      expect(service.has('exists')).toBeTruthy();
    });

    it('should clear all items', () => {
      service.setItem('a', 1);
      service.setItem('b', 2);
      service.clear();
      expect(service.has('a')).toBeFalsy();
      expect(service.has('b')).toBeFalsy();
    });

    it('should handle plain string values that are not JSON', () => {
      localStorage.setItem('plain', 'not-json');
      expect(service.getItem<string>('plain')).toBe('not-json');
    });
  });

  describe('sessionStorage', () => {
    it('should set and get from sessionStorage', () => {
      service.setItem('session-key', 'val', 'session');
      expect(service.getItem<string>('session-key', 'session')).toBe('val');
    });

    it('should not leak to localStorage', () => {
      service.setItem('only-session', true, 'session');
      expect(service.getItem('only-session', 'local')).toBeNull();
    });

    it('should clear only sessionStorage', () => {
      service.setItem('local-item', 'l', 'local');
      service.setItem('session-item', 's', 'session');
      service.clear('session');
      expect(service.getItem('local-item', 'local')).toBe('l');
      expect(service.getItem('session-item', 'session')).toBeNull();
    });
  });
});
