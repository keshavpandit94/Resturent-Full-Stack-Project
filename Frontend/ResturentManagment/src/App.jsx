import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Global CSS Reset Injection tailored for dark mode core components */}
        <style>{`
          /* 1. Prevent native web view overscroll bounces and light flash defaults */
          html, body, #root {
            margin: 0;
            padding: 0;
            width: 100%;
            min-height: 100vh;
            background-color: #060814; /* Deep Tech Obsidian Baseline */
            color: #F9FAFB;            /* High Contrast light text entry standard */
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          /* 2. Standardized styling configuration across scroll rails */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: rgba(6, 8, 20, 0.5);
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 999px;
            border: 2px solid #060814;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(99, 102, 241, 0.3); /* Neon Indigo focus track match */
          }

          /* 3. Global focus mask overrides for native control tags */
          input, select, textarea, button {
            font-family: inherit;
          }
          
          /* 4. Selection Highlight Balance */
          ::selection {
            background-color: rgba(99, 102, 241, 0.3);
            color: #FFFFFF;
          }
        `}</style>

        {/* Render core structural route layers */}
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;