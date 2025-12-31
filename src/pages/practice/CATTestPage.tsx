import { useNavigate } from 'react-router-dom';
import { CATTestEnhanced } from '../../components/CATTestEnhanced';

export default function CATTestPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/app/dashboard');
  };

  const handleComplete = (result: any) => {
    // TODO: Store result via API
    console.log('CAT Test completed:', result);
    navigate('/app/progress/analytics');
  };

  return (
    <CATTestEnhanced
      onBack={handleBack}
      onComplete={handleComplete}
    />
  );
}
