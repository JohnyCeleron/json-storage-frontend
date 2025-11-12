import '../css/header.css'
import '../css/index.css'
import '../css/sidebar.css'
import { useState } from "react";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";

export function LogPage() {
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);

    return (
    <div>
      <Header 
        title="Logs" 
        onBurgerClick={() => setIsSidebarVisible(!isSidebarVisible)} 
      />
      <Sidebar 
        isVisible={isSidebarVisible} 
        onClose={() => setIsSidebarVisible(false)} 
      />
    </div>
  );
}