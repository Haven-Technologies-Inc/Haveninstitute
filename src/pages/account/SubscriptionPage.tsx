import { useNavigate } from 'react-router-dom';
import { SubscriptionManager } from '../../components/payments/SubscriptionManager';

export default function SubscriptionPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/app/dashboard');
  };

  return <SubscriptionManager onBack={handleBack} />;
}
