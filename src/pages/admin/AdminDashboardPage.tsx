import { useNavigate } from 'react-router-dom';
import { AdminDashboard } from '../../components/admin/AdminDashboard';
import { useAuth } from '../../components/auth/AuthContext';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleBack = () => {
    logout();
    navigate('/');
  };

  return <AdminDashboard onBack={handleBack} />;
}
