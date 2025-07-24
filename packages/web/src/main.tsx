import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import WalletContextProvider from './providers/WalletProvider.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <WalletContextProvider>
    <App />
  </WalletContextProvider>
);
