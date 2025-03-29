import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// const html = document.documentElement;
// html.classList.add('dark'); // Add the 'dark' class to the <html> element

createRoot(document.getElementById('root')!).render(  
  <StrictMode>
    <App />
  </StrictMode>,
)
