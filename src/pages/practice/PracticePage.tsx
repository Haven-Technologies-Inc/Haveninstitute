import { Navigate } from 'react-router-dom';

export default function PracticePage() {
  // Redirect to unified practice page
  return <Navigate to="/app/practice/unified" replace />;
}
