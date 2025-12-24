import { useNavigate, useParams } from 'react-router-dom';
import { FlashcardsEnhanced } from '../../components/FlashcardsEnhanced';

export default function FlashcardsPage() {
  const navigate = useNavigate();
  const { setId } = useParams<{ setId?: string }>();

  const handleBack = () => {
    navigate('/app/dashboard');
  };

  return <FlashcardsEnhanced onBack={handleBack} />;
}
