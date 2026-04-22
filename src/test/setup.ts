import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock File API
global.File = class MockFile {
  name: string;
  type: string;
  size: number;

  constructor(parts: BlobPart[], filename: string, options?: FilePropertyBag) {
    this.name = filename;
    this.type = options?.type || '';
    this.size = parts.reduce((acc, part) => {
      if (typeof part === 'string') return acc + part.length;
      return acc;
    }, 0);
  }
} as any;
