import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const LoginForm = () => {
  const [memberNumber, setMemberNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Starting login process for member:', memberNumber);
      
      const { data: members, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('member_number', memberNumber)
        .limit(1);

      if (memberError) {
        console.error('Member verification error:', memberError);
        throw memberError;
      }

      if (!members || members.length === 0) {
        console.error('Member not found');
        throw new Error('Member not found');
      }

      const member = members[0];
      console.log('Member found:', member);

      const email = `${memberNumber.toLowerCase()}@temp.com`;
      const password = memberNumber;

      console.log('Attempting sign in with:', { email });
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        
        if (signInError.message === 'Invalid login credentials') {
          console.log('Attempting signup for new user');
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                member_number: memberNumber,
              }
            }
          });

          if (signUpError) {
            console.error('Signup error:', signUpError);
            throw signUpError;
          }

          if (signUpData.user) {
            const { error: updateError } = await supabase
              .from('members')
              .update({ auth_user_id: signUpData.user.id })
              .eq('member_number', memberNumber);

            if (updateError) {
              console.error('Error updating member with auth_user_id:', updateError);
              throw updateError;
            }
          }

          console.log('Signup successful, attempting final sign in');
          
          const { error: finalSignInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (finalSignInError) {
            console.error('Final sign in error:', finalSignInError);
            throw finalSignInError;
          }
        } else {
          throw signInError;
        }
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dashboard-card rounded-lg shadow-lg p-8 mb-12">
      <form onSubmit={handleLogin} className="space-y-6 max-w-md mx-auto">
        <div>
          <label htmlFor="memberNumber" className="block text-sm font-medium text-dashboard-text mb-2">
            Member Number
          </label>
          <Input
            id="memberNumber"
            type="text"
            value={memberNumber}
            onChange={(e) => setMemberNumber(e.target.value)}
            placeholder="Enter your member number"
            className="w-full"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-dashboard-accent1 hover:bg-dashboard-accent1/90"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;