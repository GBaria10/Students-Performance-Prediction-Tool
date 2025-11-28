import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { PredictionProvider } from './context/PredictionContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PredictionProvider>
          <App />
          <Toaster position="top-right" expand richColors />
        </PredictionProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
