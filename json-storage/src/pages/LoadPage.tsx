import { Header } from "../components/header.tsx";
import { LoadingSpinner } from "../components/load-spinner.tsx";
import { Sidebar } from "../components/sidebar.tsx";


export function LoadPage({title, isSidebarVisible, onBurgerClick, onClose}: 
    {title: string,
     isSidebarVisible: boolean,
     onBurgerClick: () => void,
     onClose: () => void
}) {
return (
    <div>
        <Header 
            title={title} 
            onBurgerClick={onBurgerClick} 
        />
        <Sidebar 
            isVisible={isSidebarVisible} 
            onClose={onClose} 
        />
        <LoadingSpinner/>
    </div>
    );
}