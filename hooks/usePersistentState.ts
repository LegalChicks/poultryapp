import React, { useState, useEffect, useCallback } from 'react';

// Dispatch a custom event whenever storage changes so other components sync instantly
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
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.key === key) {
        setState(customEvent.detail.newValue);
      }
    };

    window.addEventListener('poultry_storage_sync', handleSync);
    return () => window.removeEventListener('poultry_storage_sync', handleSync);
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