import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/login';
import Panel from './components/panel';
import Pista from './components/clue';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/panel" element={<Panel />} />
          <Route path="/pista/:id" element={<Pista />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
