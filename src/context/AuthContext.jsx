import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabase.client";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMethod, setAuthMethod] = useState(null);
  const navigate = useNavigate();

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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/home", // Dynamic redirect
        },
      });
      
      if (error) {
        throw error;
      }
      setAuthMethod('supabase');
    } catch (error) {
      throw error;
    }
  };
  const logout = async () => {
    try {
      setLoading(true);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setAuthMethod(null);
      if (authMethod === 'supabase') {
        await supabase.auth.signOut({ scope: 'global' });
      } else {
        supabase.auth.signOut({ scope: 'global' }).catch(console.error);
      }
      navigate("/login");
      setLoading(false);
    } catch (error) {
      setToken(null);
      setUser(null);
      setAuthMethod(null);
      setLoading(false);
      navigate("/login");
    }
  };
  const fetchUserProfile = async (authToken) => {
    try {
      const res = await fetch("http://localhost:5000/api/user/profile", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType?.includes("application/json")) {
        throw new Error("Invalid or expired token");
      }
      
      const data = await res.json();
      setUser(data);
    } catch (err) {
      localStorage.removeItem("token");
      setToken(null);
      setAuthMethod(null);
      throw err;
    }
  };
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Supabase session error:", error.message);
        }

        if (session?.user && mounted) {
          console.log("🧠 Supabase session found:", session.user.email);
          setUser(session.user);
          setAuthMethod('supabase');
          if (token) {
            localStorage.removeItem("token");
            setToken(null);
          }
          if (mounted) setLoading(false);
          return;
        }
        if (token && mounted) {
          console.log("📦 JWT token found, validating...");
          try {
            await fetchUserProfile(token);
            setAuthMethod('jwt');
          } catch (error) {
            console.error("❌ JWT validation failed:", error.message);
            localStorage.removeItem("token");
            setToken(null);
          }
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []); 
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Supabase auth event:", event, session?.user?.email);
        if (loading && !user && !authMethod) {
          console.log("🚫 Ignoring auth event during logout");
          return;
        }
        
        if (event === "SIGNED_IN" && session?.user) {

          if (authMethod !== null || user === null) {
            setUser(session.user);
            setAuthMethod('supabase');
            if (token) {
              localStorage.removeItem("token");
              setToken(null);
            }

            if (window.location.pathname === "/login" || window.location.pathname === "/") {
              navigate("/home");
            }
          }
        } else if (event === "SIGNED_OUT") {
          console.log("🔄 Supabase signed out event");
          if (authMethod === 'supabase' && user) {
            setUser(null);
            setAuthMethod(null);
            if (window.location.pathname !== "/login") {
              navigate("/login");
            }
          }
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          console.log("🔄 Token refreshed");
          if (authMethod === 'supabase') {
            setUser(session.user);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, token, authMethod, loading, user]);
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
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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