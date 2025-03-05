// frontend-app/src/state/store.js
import {create} from 'zustand';
import { devtools } from 'zustand/middleware';

export const useStore = create(devtools((set) => ({
  // UI State
  uiState: {
    loading: false,
    error: null,
  },

  // Accounts State
  accounts: [],
  selectedAccounts: [],

  // Properties State
  properties: {},
  selectedProperties: [],

  // Audiences State
  audiences: [],
  selectedAudience: null,

  // Actions
  setLoading: (loading) => set((state) => ({ uiState: { ...state.uiState, loading } })),
  setError: (error) => set((state) => ({ uiState: { ...state.uiState, error } })),

  // Account Actions
  setAccounts: (accounts) => set({ accounts }),
  setSelectedAccounts: (selectedAccounts) => set({ selectedAccounts }),

  // Property Actions
  setProperties: (properties) => set({ properties }),
  setSelectedProperties: (selectedProperties) => set({ selectedProperties }),

  // Audience Actions
  setAudiences: (audiences) => set({ audiences }),
  setSelectedAudience: (selectedAudience) => set({ selectedAudience }),
})));