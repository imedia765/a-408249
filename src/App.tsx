import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import Index from './pages/Index';
import Login from './pages/Login';
import { Toaster } from "@/components/ui/toaster";
import { supabase } from "@/integrations/supabase/client";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            session ? <Navigate to="/" replace /> : <Login />
          } 
        />
        <Route 
          path="/" 
          element={
            session ? <Index /> : <Navigate to="/login" replace />
          } 
        />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;