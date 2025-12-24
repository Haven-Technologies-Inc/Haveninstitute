import { useNavigate, useParams } from 'react-router-dom';
import { PracticeQuizEnhanced } from '../../components/PracticeQuizEnhanced';

export default function QuizPage() {
  const navigate = useNavigate();
  const { category } = useParams<{ category?: string }>();

  const handleBack = () => {
    navigate('/app/dashboard');
  };

  const handleComplete = (result: any) => {
    // TODO: Store result via API
    console.log('Quiz completed:', result);
    navigate('/app/progress');
  };

  return (
    <PracticeQuizEnhanced
      onBack={handleBack}
      onComplete={handleComplete}
    />
  );
}
