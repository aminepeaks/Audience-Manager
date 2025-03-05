// frontend-app/src/hooks/useAccounts.js
import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../state/store';
import { DataService } from '../Services/dataService';

export const useAccounts = () => {
  // Rename the global store setter to avoid naming conflict
  const { setAccounts: setGlobalAccounts, setLoading, setError } = useStore();
  // Keep the local state management
  const [accounts, setAccounts] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLocalLoading(true);
      setLoading(true);
      
      const accountsData = await DataService.fetchAllAccountsAndProperties();
      // Update both local and global state
      setAccounts(accountsData.accounts);
      setGlobalAccounts(accountsData.accounts);
      
      setLocalError(null);
    } catch (error) {
      setLocalError(error.message);
      setError(error.message);
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  }, [setGlobalAccounts, setLoading, setError]);

  return {
    accounts,
    loading: localLoading,
    error: localError,
    fetchAccounts
  };
};