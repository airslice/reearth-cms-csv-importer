import type { Credentials } from '@/types';

/**
 * Storage Service
 * Manages sessionStorage for credentials and state persistence
 */

const STORAGE_KEY = 'reearth-cms-csv-importer-credentials';

export class StorageService {
  /**
   * Save credentials to sessionStorage
   */
  saveCredentials(credentials: Credentials): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
    } catch (error) {
      console.error('Failed to save credentials to sessionStorage:', error);
    }
  }

  /**
   * Load credentials from sessionStorage
   */
  loadCredentials(): Credentials | null {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      return JSON.parse(stored) as Credentials;
    } catch (error) {
      console.error('Failed to load credentials from sessionStorage:', error);
      return null;
    }
  }

  /**
   * Clear all saved data from sessionStorage
   */
  clear(): void {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error);
    }
  }
}

// Export singleton instance
export const storage = new StorageService();
