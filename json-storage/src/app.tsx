import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MetricPage } from './pages/MetricPage'
import { LogPage } from './pages/LogPage';


export function App() {
  return (
    <Router>
      <Routes>
        <Route index element={<MetricPage />} /> {/* Страница по умолчанию */}
        <Route path="/metrics" element={<MetricPage />} />
        <Route path="/logs" element={<LogPage />} />
      </Routes>
    </Router>
  );
}