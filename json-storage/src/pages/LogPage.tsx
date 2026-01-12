import "../css/index.css";
import "../css/header.css";
import "../css/sidebar.css";
import "../css/log-page.css";
import { useState } from "react";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { API_BASE_URL } from "../config/api";




export function LogPage() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const kibana = {
    title: "Kibana Logs",
    subtitle: "Event log",
    description: "Open the full log stream in Kibana Discover",
    href: `http://${API_BASE_URL}:5601/app/discover#`,
    icon: "📊",
    color: "#8B5CF6",
  };

  return (
    <div className="page-container">
      <Header
        title="Logs"
        onBurgerClick={() => setIsSidebarVisible(!isSidebarVisible)}
      />

      <Sidebar
        isVisible={isSidebarVisible}
        onClose={() => setIsSidebarVisible(false)}
      />

      <main className="logs-container">
        <div className="logs-grid">
          <button
            className="log-card"
            onClick={() => window.open(kibana.href, "_blank")}
            type="button"
            title="Open the full log stream in Kibana"
            aria-label="Open the full log stream in Kibana"
          >
            <div className="log-card-header">
              <span
                className="log-icon"
                style={{
                  backgroundColor: `${kibana.color}1A`,
                  color: kibana.color,
                }}
                aria-hidden="true"
              >
                {kibana.icon}
              </span>

              <div className="log-title-wrapper">
                <h3 className="log-title">{kibana.title}</h3>
                <span className="log-subtitle">{kibana.subtitle}</span>
              </div>

              <span className="log-arrow" aria-hidden="true">↗</span>
            </div>

            <p className="log-description">{kibana.description}</p>
          </button>
        </div>
      </main>
    </div>
  );

}
