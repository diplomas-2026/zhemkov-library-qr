import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import OptionalLayout from './components/OptionalLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BooksPage from './pages/BooksPage';
import ReadersPage from './pages/ReadersPage';
import LoansPage from './pages/LoansPage';
import ReportsPage from './pages/ReportsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import BookDetailsPage from './pages/BookDetailsPage';
import ReaderDetailsPage from './pages/ReaderDetailsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Navigate to="/books" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/books" element={<OptionalLayout><BooksPage /></OptionalLayout>} />
      <Route path="/books/:id" element={<OptionalLayout><BookDetailsPage /></OptionalLayout>} />
      <Route path="/readers" element={<ProtectedRoute roles={['ADMIN', 'LIBRARIAN']}><Layout><ReadersPage /></Layout></ProtectedRoute>} />
      <Route path="/readers/:id" element={<ProtectedRoute roles={['ADMIN', 'LIBRARIAN']}><Layout><ReaderDetailsPage /></Layout></ProtectedRoute>} />
      <Route path="/loans" element={<ProtectedRoute roles={['ADMIN', 'LIBRARIAN']}><Layout><LoansPage /></Layout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute roles={['ADMIN', 'LIBRARIAN']}><Layout><ReportsPage /></Layout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><Layout><AdminUsersPage /></Layout></ProtectedRoute>} />
    </Routes>
  );
}
