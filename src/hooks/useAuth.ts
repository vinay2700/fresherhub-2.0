import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [resetTime, setResetTime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserCredits(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserCredits(session.user.id);
      } else {
        setCredits(0);
        setResetTime(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserCredits = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('credits, credits_reset_at')
        .eq('id', userId)
        .single();
      
      if (data) {
        // Check if credits need to be reset
        const now = new Date();
        const resetTime = new Date(data.credits_reset_at);
        
        if (now >= resetTime) {
          // Reset credits to 5 and set new 24-hour timer
          const newResetTime = new Date();
          newResetTime.setHours(newResetTime.getHours() + 24);
          
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
              credits: 5,
              credits_reset_at: newResetTime.toISOString()
            })
            .eq('id', userId);
          
          if (!updateError) {
            setCredits(5);
            setResetTime(newResetTime.toISOString());
          }
        } else {
          setCredits(data.credits || 5);
          setResetTime(data.credits_reset_at);
        }
      }
    } catch (error) {
      console.error('Error fetching user credits:', error);
      setCredits(5);
    }
  };

  const resetPassword = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email);
  };

  return {
    user,
    credits,
    resetTime,
    loading,
    isAuthenticated: !!user,
    resetPassword
  };
};