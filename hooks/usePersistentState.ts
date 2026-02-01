import React, { useState, useEffect, useCallback } from 'react';

// Dispatch a custom event for same-tab sync
const dispatchStorageEvent = (key: string, newValue: any) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('poultry_storage_sync', { detail: { key, newValue } }));
  }
};

export function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading localStorage key:", key, error);
      return initialValue;
    }
  });

  // Listener: Update state when another component modifies this key
  useEffect(() => {
    // Handler for same-tab changes (CustomEvent)
    const handleLocalSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.key === key) {
        setState(customEvent.detail.newValue);
      }
    };

    // Handler for cross-tab changes (StorageEvent)
    // This allows multiple windows to stay in sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setState(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Error parsing storage event', err);
        }
      }
    };

    window.addEventListener('poultry_storage_sync', handleLocalSync);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('poultry_storage_sync', handleLocalSync);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  const setPersistentState = useCallback((newValue: T | ((prev: T) => T)) => {
    setState((prev) => {
      const valueToStore = newValue instanceof Function ? newValue(prev) : newValue;
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        dispatchStorageEvent(key, valueToStore);
      } catch (error) {
        console.error("Error writing to localStorage key:", key, error);
      }
      return valueToStore;
    });
  }, [key]);

  return [state, setPersistentState];
}

// Helper to inject audit metadata
export const withAudit = <T extends object>(item: T): T => {
  const user = localStorage.getItem('poultry_current_user') || 'Admin';
  const device = localStorage.getItem('poultry_device_name') || 'Unknown Device';
  const now = new Date().toISOString();

  return {
    ...item,
    lastModifiedBy: user,
    lastModifiedDevice: device,
    lastModifiedAt: now
  };
};