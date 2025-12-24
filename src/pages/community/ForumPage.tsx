import { useNavigate, useParams } from 'react-router-dom';
import { Forum } from '../../components/ForumEnhanced';

export default function ForumPage() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId?: string }>();

  const handleBack = () => {
    navigate('/app/dashboard');
  };

  return <Forum onBack={handleBack} />;
}
