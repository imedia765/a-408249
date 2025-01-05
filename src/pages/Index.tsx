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
  const { canAccessTab, userRole, roleLoading } = useRoleAccess();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log('No session found, redirecting to login');
          navigate('/login');
        } else {
          console.log('Session found:', session.user.id);
        }
      } catch (error) {
        console.error('Session check error:', error);
        navigate('/login');
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
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

  // Show loading state while either auth or role is being checked
  if (isAuthChecking || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dashboard-dark">
        <div className="text-white">Loading...</div>
      </div>
    );
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