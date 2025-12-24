import { useNavigate } from 'react-router-dom';
import { Login } from '../../components/auth/Login';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <Login
      onSwitchToSignup={() => navigate('/signup')}
      onBackToHome={() => navigate('/')}
    />
  );
}
