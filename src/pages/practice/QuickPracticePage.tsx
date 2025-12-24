import { useNavigate } from 'react-router-dom';
import { QuickPracticeSetup } from '../../components/practice/QuickPracticeSetup';

export default function QuickPracticePage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <QuickPracticeSetup onBack={() => navigate('/app/practice')} />
    </div>
  );
}
