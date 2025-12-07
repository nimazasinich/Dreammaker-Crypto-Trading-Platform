/**
 * usePersistedTab Hook - Tab State Persistence
 *
 * Automatically persists and restores active tab state using localStorage.
 * Prevents tab state from resetting on page refresh, improving UX.
 *
 * @example
 * ```tsx
 * const [activeTab, setActiveTab] = usePersistedTab('my-component', 'overview');
 * ```
 *
 * @param storageKey - Unique key for localStorage (should be component-specific)
 * @param defaultTab - Default tab to show if no saved state exists
 * @returns [activeTab, setActiveTab] - Stateful value and setter function
 *
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Logger } from '../core/Logger';

const logger = Logger.getInstance();

/**
 * Hook for managing tab state with localStorage persistence
 */
export function usePersistedTab<T extends string = string>(
  storageKey: string,
  defaultTab: T
): [T, (tab: T) => void] {
  // Initialize state from localStorage or use default
  const [activeTab, setActiveTabState] = useState<T>(() => {
    try {
      const savedTab = localStorage.getItem(`tab-${storageKey}`);
      if (savedTab) {
        logger.debug(`Restored tab state for ${storageKey}:`, { tab: savedTab });
        return savedTab as T;
      }
    } catch (error) {
      logger.error('Failed to read tab state from localStorage:', {}, error as Error);
    }
    return defaultTab;
  });

  // Setter function that also persists to localStorage
  const setActiveTab = useCallback(
    (tab: T) => {
      try {
        setActiveTabState(tab);
        localStorage.setItem(`tab-${storageKey}`, tab);
        logger.debug(`Saved tab state for ${storageKey}:`, { tab });
      } catch (error) {
        logger.error('Failed to save tab state to localStorage:', {}, error as Error);
        // Still update state even if localStorage fails
        setActiveTabState(tab);
      }
    },
    [storageKey]
  );

  // Sync with URL params if present (optional enhancement)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const urlTab = params.get('tab');

    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab as T);
    }
  }, []);

  // Update URL when tab changes (optional enhancement)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    url.searchParams.set('tab', activeTab);
    window.history.replaceState({}, '', url.toString());
  }, [activeTab]);

  return [activeTab, setActiveTab];
}

/**
 * Alternative hook that uses URL params as the source of truth
 * instead of localStorage
 */
export function useURLTab<T extends string = string>(
  paramName: string = 'tab',
  defaultTab: T
): [T, (tab: T) => void] {
  const [activeTab, setActiveTabState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultTab;

    const params = new URLSearchParams(window.location.search);
    const urlTab = params.get(paramName);
    return (urlTab as T) || defaultTab;
  });

  const setActiveTab = useCallback(
    (tab: T) => {
      setActiveTabState(tab);

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set(paramName, tab);
        window.history.replaceState({}, '', url.toString());
      }
    },
    [paramName]
  );

  // Listen for URL changes (back/forward navigation)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get(paramName);
      if (urlTab) {
        setActiveTabState(urlTab as T);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [paramName]);

  return [activeTab, setActiveTab];
}

export default usePersistedTab;
