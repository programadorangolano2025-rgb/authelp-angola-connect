import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PWAWrapper } from './components/PWAWrapper'

createRoot(document.getElementById("root")!).render(
  <PWAWrapper>
    <App />
  </PWAWrapper>
);
