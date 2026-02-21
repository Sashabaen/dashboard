import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RaterProvider } from './context/RaterContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Compare from './pages/Compare';
import History from './pages/History';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <RaterProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </RaterProvider>
    </BrowserRouter>
  );
}
