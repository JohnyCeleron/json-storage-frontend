import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MetricPage } from './pages/MetricPage'


export function App() {
  return (
    <Router>
      <Routes>
        <Route index element={<MetricPage />} /> {/* Страница по умолчанию */}
        <Route path="/metrics" element={<MetricPage />} />
      </Routes>
    </Router>
  );
}