import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Sidebar from './components/Sidebar';
import Accounts from './pages/Accounts';
import Properties from './pages/Properties';
import Audiences from './pages/Audiences';
import AudienceManager from './pages/AudienceManager';

const Main = () => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  const handleNavigation = (path, label) => {
    navigate(path);
    setHistory(prevHistory => {
      const newHistory = [...prevHistory];
      if (!newHistory.find(item => item.path === path)) {
        newHistory.push({ label, path });
      }
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar history={history} onNavigate={handleNavigation} onClearHistory={clearHistory} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Routes>
          <Route path="/" element={<Accounts onNavigate={handleNavigation} />} />
          <Route path="/properties" element={<Properties onNavigate={handleNavigation} />} />
          <Route path="/audience-manager" element={<AudienceManager />} />
          <Route path="/accounts/:accountName/properties" element={<Properties onNavigate={handleNavigation} />} />
          <Route path="/accounts/:accountName/properties/:propertyId" element={<Audiences onNavigate={handleNavigation} />} />
        </Routes>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <Router>
      <CssBaseline />
      <Main />
    </Router>
  );
}

export default App;