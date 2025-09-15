import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import SensoryFriendlyHome from '@/components/SensoryFriendlyHome';

const Home = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-calm flex items-center justify-center">
        <div className="text-text-gentle">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <SensoryFriendlyHome />;
};

export default Home;