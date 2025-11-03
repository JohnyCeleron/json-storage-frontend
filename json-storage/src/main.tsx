import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css'
import { Header } from './components/header.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Header title="Metrics"/>
  </StrictMode>,
)
