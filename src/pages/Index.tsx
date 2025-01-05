import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DashboardView from '@/components/DashboardView';
import MembersList from '@/components/MembersList';
import CollectorsList from '@/components/CollectorsList';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { canAccessTab, userRole } = useRoleAccess();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Session check error:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = () => {
    navigate('/login');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      Loading...
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Routes>
        <Route 
          path="/" 
          element={
            canAccessTab('dashboard') 
              ? <DashboardView onLogout={handleLogout} /> 
              : null
          } 
        />
        <Route 
          path="/members" 
          element={
            canAccessTab('users') 
              ? <MembersList searchTerm={searchTerm} userRole={userRole} /> 
              : null
          } 
        />
        <Route 
          path="/collectors" 
          element={
            canAccessTab('users') 
              ? <CollectorsList /> 
              : null
          } 
        />
      </Routes>
    </div>
  );
};

export default Index;