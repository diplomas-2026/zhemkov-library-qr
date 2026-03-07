import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BooksPage from './pages/BooksPage';
import ReadersPage from './pages/ReadersPage';
import LoansPage from './pages/LoansPage';
import ReportsPage from './pages/ReportsPage';
import AdminUsersPage from './pages/AdminUsersPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/books" element={<ProtectedRoute><Layout><BooksPage /></Layout></ProtectedRoute>} />
      <Route path="/readers" element={<ProtectedRoute><Layout><ReadersPage /></Layout></ProtectedRoute>} />
      <Route path="/loans" element={<ProtectedRoute><Layout><LoansPage /></Layout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Layout><ReportsPage /></Layout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><Layout><AdminUsersPage /></Layout></ProtectedRoute>} />
    </Routes>
  );
}
