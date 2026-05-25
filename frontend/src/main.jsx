import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './auth/AuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        gutter={12}
        toastOptions={{
          duration: 3500,
          ariaProps: {
            role: 'status',
            'aria-live': 'polite',
          },
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 18px 50px rgba(15, 23, 42, 0.16)',
            maxWidth: 'min(92vw, 420px)',
            fontWeight: 700,
          },
          success: {
            iconTheme: {
              primary: '#059669',
              secondary: '#ffffff',
            },
          },
          error: {
            duration: 5200,
            ariaProps: {
              role: 'alert',
              'aria-live': 'assertive',
            },
            iconTheme: {
              primary: '#dc2626',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </AuthProvider>
  </React.StrictMode>,
);
