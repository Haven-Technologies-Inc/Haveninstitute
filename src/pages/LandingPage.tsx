import { useNavigate } from 'react-router-dom';
import { HeroEnhanced } from '../components/HeroEnhanced';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return <HeroEnhanced onGetStarted={handleGetStarted} />;
}
