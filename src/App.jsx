import { Route, Routes } from 'react-router-dom';
import './App.css'
import AddTrade from './components/AddTrade';
import Home from './components/Home';
import NotFound from './components/NotFound';
import Dashboard from './components/Dashboard';
import AdminRoute from './routes/AdminRoutes';
import { useLiveMarketData } from './hooks/useLiveMarketData';
import LandingPage from './components/LandingPage';

function App() {
  useLiveMarketData(5000);
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/home" element={<Home />} />

      <Route
        path="/addtrade"
        element={
          <AdminRoute>
            <AddTrade />
          </AdminRoute>
        }
      />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
