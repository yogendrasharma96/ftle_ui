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
import TradeTable from './components/TradeTable';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

function App() {
  useLiveMarketData(5000);
  const trade = useSelector((state) => state.trade);
  const auth = useSelector((state) => state.auth);
  return (
    <>
    <Toaster position="top-right" reverseOrder={false} />
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
        path="trades"
        element={
            <TradeTable tradeDetails={trade} authDetails={auth}/>
        }
      />
      <Route
        path="trade/new"
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
    </>
  );
}

export default App;
