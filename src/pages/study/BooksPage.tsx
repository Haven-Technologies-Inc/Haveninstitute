import { useNavigate, useParams } from 'react-router-dom';
import { BookReaderComplete } from '../../components/BookReaderComplete';

export default function BooksPage() {
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId?: string }>();

  const handleBack = () => {
    navigate('/app/dashboard');
  };

  return <BookReaderComplete onBack={handleBack} />;
}
