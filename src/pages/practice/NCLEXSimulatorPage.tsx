import { useNavigate } from 'react-router-dom';
import { NCLEXSimulator } from '../../components/NCLEXSimulator';

export default function NCLEXSimulatorPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/app/dashboard');
  };

  const handleComplete = (result: any) => {
    // TODO: Store result via API
    console.log('NCLEX Simulator completed:', result);
    navigate('/app/progress/analytics');
  };

  return (
    <NCLEXSimulator
      onBack={handleBack}
      onComplete={handleComplete}
    />
  );
}
