import React from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import './styles/global.css';
import App from './App';
import SelectPage from './pages/SelectPage';
import ReaderPage from './pages/ReaderPage';

// Hash routing: the built output is a single static index.html that works from
// file://, from a GitHub Pages subdirectory and inside an iframe — no server
// rewrite rules needed for deep links. (D1/D2)
const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <SelectPage /> },
      { path: 'module/:moduleId', element: <ReaderPage /> },
      { path: 'module/:moduleId/:step', element: <ReaderPage /> },
      { path: '*', element: <SelectPage /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
