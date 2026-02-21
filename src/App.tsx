import { HashRouter, Routes, Route } from 'react-router-dom';
import { RaterProvider } from './context/RaterContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Submissions from './pages/Submissions';
import Compare from './pages/Compare';
import History from './pages/History';
import Settings from './pages/Settings';

export default function App() {
  return (
    <HashRouter>
      <RaterProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/submissions" element={<Submissions />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/compare/:submissionId" element={<Compare />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </RaterProvider>
    </HashRouter>
  );
}
