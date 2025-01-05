import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DashboardView from '@/components/DashboardView';
import MembersList from '@/components/MembersList';
import CollectorsList from '@/components/CollectorsList';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ShieldOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const UnauthorizedMessage = () => (
  <Alert variant="destructive">
    <ShieldOff className="h-4 w-4" />
    <AlertTitle>Unauthorized Access</AlertTitle>
    <AlertDescription>
      You don't have permission to view this page.
    </AlertDescription>
  </Alert>
);

const LoadingState = () => (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { canAccessTab, userRole, roleLoading } = useRoleAccess();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (!session) {
          console.log('No session found, redirecting to login');
          navigate('/login');
        } else {
          console.log('Session found:', session.user.id);
        }
      } catch (error) {
        console.error('Session check error:', error);
        if (mounted) {
          navigate('/login');
        }
      } finally {
        if (mounted) {
          setIsAuthChecking(false);
        }
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
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Show loading state while either auth or role is being checked
  if (isAuthChecking || roleLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingState />
      </div>
    );
  }

  const renderProtectedRoute = (path: string, Component: React.ComponentType<any>, props: any = {}) => {
    if (!canAccessTab(path)) {
      return <UnauthorizedMessage />;
    }
    return <Component {...props} />;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Routes>
        <Route 
          path="/" 
          element={renderProtectedRoute('dashboard', DashboardView, { onLogout: () => navigate('/login') })} 
        />
        <Route 
          path="/members" 
          element={renderProtectedRoute('users', MembersList, { searchTerm, userRole })} 
        />
        <Route 
          path="/collectors" 
          element={renderProtectedRoute('collectors', CollectorsList)} 
        />
      </Routes>
    </div>
  );
};

export default Index;