import { useNavigate } from 'react-router-dom';
import { StudyPlannerComplete } from '../../components/StudyPlannerComplete';

export default function PlannerPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/app/dashboard');
  };

  return <StudyPlannerComplete onBack={handleBack} />;
}
