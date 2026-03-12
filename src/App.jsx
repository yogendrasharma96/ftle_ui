import { Route, Routes } from 'react-router-dom';
import './App.css'
import AddTrade from './components/AddTrade';
import Home from './components/Home';
import NotFound from './components/NotFound';
import Dashboard from './components/Dashboard';
import AdminRoute from './routes/AdminRoutes';
import { useLiveMarketData } from './hooks/useLiveMarketData';
import LandingPage from './components/LandingPage';
import AuthorView from './components/AuthorView';

function App() {
  useLiveMarketData(5000);
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/" element={<Home />} >
      <Route
        path="dashboard"
        element={
            <Dashboard />
        }
      />
      <Route
        path="trades/new"
        element={
          <AdminRoute>
            <AddTrade />
          </AdminRoute>
        }
      />
        <Route
        path="admin/view"
        element={
          <AdminRoute>
            <AuthorView />
          </AdminRoute>
        }
      />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
