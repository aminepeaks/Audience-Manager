// frontend-app/src/state/StoreProvider.jsx
import React from 'react';
import { useStore } from './store';

export const StoreContext = React.createContext(null);

export const StoreProvider = ({ children }) => {
  const store = useStore();
  
  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
};

// Custom hook to use the store
export const useGlobalStore = () => {
  const context = React.useContext(StoreContext);
  if (context === null) {
    throw new Error('useGlobalStore must be used within a StoreProvider');
  }
  return context;
};