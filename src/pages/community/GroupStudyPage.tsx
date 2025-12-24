import { useNavigate } from 'react-router-dom';
import { GroupStudyComplete } from '../../components/GroupStudyComplete';

export default function GroupStudyPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/app/dashboard');
  };

  return <GroupStudyComplete onBack={handleBack} />;
}
