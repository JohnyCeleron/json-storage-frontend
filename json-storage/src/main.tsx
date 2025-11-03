import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './css/header.css'
import './css/index.css'
import './css/sidebar.css'
import { Header } from './components/header.tsx'
import { Sidebar } from './components/sidebar.tsx'

function App() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  return (
    <div>
      <Header 
        title="Metrics" 
        onBurgerClick={() => setIsSidebarVisible(!isSidebarVisible)} 
      />
      <Sidebar 
        isVisible={isSidebarVisible} 
        onClose={() => setIsSidebarVisible(false)} 
      />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App/>   
  </StrictMode>,
)
