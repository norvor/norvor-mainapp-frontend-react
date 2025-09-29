// src/index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux'; // <-- 1. Import the Provider
import { store } from './store/store';     // <-- 2. Import your store
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* 3. Wrap your App component with the Provider */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);