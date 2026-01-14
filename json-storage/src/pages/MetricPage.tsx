import '../css/header.css';
import '../css/index.css';
import '../css/sidebar.css';
import { Header } from '../components/header.tsx';
import { Sidebar } from '../components/sidebar.tsx';
import { useState } from 'react';
import '../css/metric-page.css';
import { API_METRICS_URL } from '../config/api.ts';

export function MetricPage() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const metrics = [
    {
      id: 'rps',
      title: 'RPS',
      subtitle: 'Requests Per Second',
      description: 'Number of requests per second',
      href: `${API_METRICS_URL}/d/rps`,
      icon: '📊',
      color: '#10B981',
    },
    {
      id: 'latency',
      title: 'Latency',
      subtitle: 'Response time',
      description: 'System delays and response time',
      href: `${API_METRICS_URL}/d/latency`,
      icon: '⚡',
      color: '#3B82F6',
    },
    {
      id: 'elastic',
      title: 'Elasticsearch',
      subtitle: 'Search cluster',
      description: 'Elasticsearch index and node metrics',
      href: `${API_METRICS_URL}/d/elastic`,
      icon: '🔍',
      color: '#F59E0B',
    },
    {
      id: 'postgres',
      title: 'PostgreSQL',
      subtitle: 'Database',
      description: 'Database performance and statistics',
      href: `${API_METRICS_URL}/d/postgres`,
      icon: '🗄️',
      color: '#8B5CF6',
    },
    {
      id: 'errors',
      title: 'Errors',
      subtitle: 'System errors',
      description: 'Error and exception statistics',
      href: `${API_METRICS_URL}/d/errors`,
      icon: '⚠️',
      color: '#EF4444',
    },
  ];

  return (
    <div className="metrics-page">
      <Header
        title="System Metrics"
        onBurgerClick={() => setIsSidebarVisible(!isSidebarVisible)}
      />

      <Sidebar
        isVisible={isSidebarVisible}
        onClose={() => setIsSidebarVisible(false)}
      />

      <main className="metrics-container">

        <div className="metrics-grid">
          {metrics.map((metric) => (
            <a
              key={metric.id}
              href={metric.href}
              className="metric-card"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="metric-card-header">
                <span
                  className="metric-icon"
                  style={{
                    backgroundColor: `${metric.color}1A`,
                    color: metric.color,
                  }}
                >
                  {metric.icon}
                </span>

                <div className="metric-title-wrapper">
                  <h3 className="metric-title">{metric.title}</h3>
                  <span className="metric-subtitle">{metric.subtitle}</span>
                </div>
              </div>

              <p className="metric-description">{metric.description}</p>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
