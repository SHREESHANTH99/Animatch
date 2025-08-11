import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../utils/supabase.client";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMethod, setAuthMethod] = useState(null);
  const navigate = useNavigate();
  
  // Prevent multiple simultaneous auth operations
  const authOperationRef = useRef(false);
  const mountedRef = useRef(true);

  const login = async (newToken) => {
    try {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setAuthMethod('jwt');

      await fetchUserProfile(newToken);
      navigate("/home");
    } catch (error) {
      localStorage.removeItem("token");
      setToken(null);
      setAuthMethod(null);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "/home",
        },
      });
      
      if (error) {
        setLoading(false);
        throw error;
      }
      // Don't set loading to false here - let the auth state change handle it
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Clear local state first
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setAuthMethod(null);
      
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (authToken) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType?.includes("application/json")) {
        throw new Error("Invalid or expired token");
      }
      
      const data = await res.json();
      if (mountedRef.current) {
        setUser(data);
      }
      return data;
    } catch (err) {
      localStorage.removeItem("token");
      setToken(null);
      setAuthMethod(null);
      throw err;
    }
  };

  const exchangeToken = async (supabaseUser) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/exchange-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          supabaseToken: 'placeholder',
          userData: supabaseUser
        }),
      });
      
      if (!response.ok) {
        throw new Error('Token exchange failed');
      }
      
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Token exchange error:", error);
      throw error;
    }
  };

  // Handle Supabase Google OAuth flow
  const handleSupabaseAuth = async (session) => {
    if (authOperationRef.current || !mountedRef.current) {
      return;
    }
    
    authOperationRef.current = true;
    
    try {
      console.log("🔄 Processing Supabase auth for:", session.user.email);
      
      const customToken = await exchangeToken(session.user);
      
      if (mountedRef.current) {
        localStorage.setItem("token", customToken);
        setToken(customToken);
        setUser(session.user);
        setAuthMethod('supabase');
        
        // Navigate to home if we're on login page
        if (window.location.pathname === "/login" || window.location.pathname === "/") {
          navigate("/home");
        }
      }
    } catch (error) {
      console.error("❌ Supabase auth processing failed:", error);
      if (mountedRef.current) {
        await logout();
      }
    } finally {
      authOperationRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Initial auth check
  useEffect(() => {
    let mounted = true;
    mountedRef.current = true;

    const initializeAuth = async () => {
      try {
        console.log("🚀 Initializing auth...");
        
        // Check for Supabase session first
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Supabase session error:", error.message);
        }

        if (session?.user && mounted) {
          console.log("🧠 Supabase session found:", session.user.email);
          await handleSupabaseAuth(session);
          return;
        }

        // Check for existing JWT token
        const existingToken = localStorage.getItem("token");
        if (existingToken && mounted) {
          console.log("📦 JWT token found, validating...");
          try {
            await fetchUserProfile(existingToken);
            if (mounted) {
              setAuthMethod('jwt');
            }
          } catch (error) {
            console.error("❌ JWT validation failed:", error.message);
            localStorage.removeItem("token");
            if (mounted) {
              setToken(null);
            }
          }
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error.message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      mountedRef.current = false;
    };
  }, []); // Only run once on mount

  // Handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Supabase auth event:", event, session?.user?.email);
        
        // Prevent handling events during logout or if already processing
        if (authOperationRef.current || !mountedRef.current) {
          console.log("🚫 Ignoring auth event - operation in progress");
          return;
        }
        
        if (event === "SIGNED_IN" && session?.user) {
          // Only handle if we don't already have this user authenticated
          if (!user || user.id !== session.user.id) {
            await handleSupabaseAuth(session);
          }
        } else if (event === "SIGNED_OUT") {
          console.log("🔄 Supabase signed out event");
          if (mountedRef.current && authMethod === 'supabase') {
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
            setAuthMethod(null);
            
            if (window.location.pathname !== "/login") {
              navigate("/login");
            }
          }
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          console.log("🔄 Token refreshed for:", session.user.email);
          if (mountedRef.current && authMethod === 'supabase') {
            // For token refresh, we might want to exchange the new token
            // but for now, just update the user data
            setUser(session.user);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, authMethod, user]); // Removed token and loading from dependencies

  const isAuthenticated = !!user;
  const getAuthMethod = () => authMethod;

  const value = {
    user,
    token,
    login,
    loginWithGoogle,
    logout,
    isAuthenticated,
    loading,
    authMethod,
    getAuthMethod,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};