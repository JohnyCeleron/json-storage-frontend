import '../css/header.css'
import '../css/index.css'
import '../css/sidebar.css'
import { Header } from '../components/header.tsx';
import { Sidebar } from '../components/sidebar.tsx';
import { useState } from 'react';

export function MetricPage() {
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);

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