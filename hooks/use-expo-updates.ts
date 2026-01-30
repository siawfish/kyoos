import { useCallback, useEffect, useState } from 'react';
import * as Updates from 'expo-updates';

export interface UseExpoUpdatesReturn {
  /** Whether we're currently checking for an update */
  isCheckingForUpdate: boolean;
  /** Whether an update is available to download */
  isUpdateAvailable: boolean;
  /** Whether we're currently downloading an update */
  isDownloading: boolean;
  /** Download progress percentage (0-100) - simulated since API doesn't provide real progress */
  downloadProgress: number;
  /** Whether an update has been downloaded and is ready to apply */
  isUpdateReady: boolean;
  /** Any error that occurred during the update process */
  error: string | null;
  /** Manually check for updates */
  checkForUpdate: () => Promise<void>;
  /** Start downloading the available update */
  downloadUpdate: () => Promise<void>;
  /** Apply the downloaded update (reloads the app) */
  applyUpdate: () => Promise<void>;
  /** Dismiss the update notification */
  dismissUpdate: () => void;
}

/**
 * Hook to manage Expo Updates (OTA) functionality.
 * Handles checking, downloading, and applying updates with proper state management.
 */
export function useExpoUpdates(): UseExpoUpdatesReturn {
  const [isCheckingForUpdate, setIsCheckingForUpdate] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isUpdateReady, setIsUpdateReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check for available updates
   */
  const checkForUpdate = useCallback(async () => {
    // Skip in development mode or if updates are not enabled
    if (__DEV__ || !Updates.isEnabled) {
      return;
    }

    try {
      setIsCheckingForUpdate(true);
      setError(null);

      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setIsUpdateAvailable(true);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to check for updates';
      setError(errorMessage);
      console.warn('Error checking for updates:', errorMessage);
    } finally {
      setIsCheckingForUpdate(false);
    }
  }, []);

  /**
   * Download the available update
   */
  const downloadUpdate = useCallback(async () => {
    if (__DEV__ || !Updates.isEnabled || !isUpdateAvailable) {
      return;
    }

    try {
      setIsDownloading(true);
      setDownloadProgress(0);
      setError(null);

      // Simulate progress since the API doesn't provide real progress callbacks
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          // Slowly increase progress, cap at 90% until actual completion
          if (prev < 90) {
            return prev + Math.random() * 15;
          }
          return prev;
        });
      }, 300);

      // Fetch the update
      const result = await Updates.fetchUpdateAsync();

      // Clear the progress interval
      clearInterval(progressInterval);

      if (result.isNew) {
        setDownloadProgress(100);
        setIsUpdateReady(true);
        setIsUpdateAvailable(false);
      } else {
        // No new update was actually downloaded
        setIsUpdateAvailable(false);
        setDownloadProgress(0);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to download update';
      setError(errorMessage);
      console.warn('Error downloading update:', errorMessage);
      setDownloadProgress(0);
    } finally {
      setIsDownloading(false);
    }
  }, [isUpdateAvailable]);

  /**
   * Apply the downloaded update by reloading the app
   */
  const applyUpdate = useCallback(async () => {
    if (__DEV__ || !Updates.isEnabled || !isUpdateReady) {
      return;
    }

    try {
      await Updates.reloadAsync();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to apply update';
      setError(errorMessage);
      console.warn('Error applying update:', errorMessage);
    }
  }, [isUpdateReady]);

  /**
   * Dismiss the update notification
   */
  const dismissUpdate = useCallback(() => {
    setIsUpdateAvailable(false);
    setError(null);
  }, []);

  // Check for updates on mount
  useEffect(() => {
    checkForUpdate();
  }, [checkForUpdate]);

  return {
    isCheckingForUpdate,
    isUpdateAvailable,
    isDownloading,
    downloadProgress,
    isUpdateReady,
    error,
    checkForUpdate,
    downloadUpdate,
    applyUpdate,
    dismissUpdate,
  };
}
