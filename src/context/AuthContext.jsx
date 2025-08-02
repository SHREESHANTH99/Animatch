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
      setUser(data);
    } catch (err) {
      localStorage.removeItem("token");
      setToken(null);
      setAuthMethod(null);
      throw err;
    }
  };

  const exchangeToken=async(supabaseUser)=>{
    try{
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/exchange-token`,{
        method:'Post',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          supabaseToken:'placeholder',
          userData:supabaseUser
        }),
      });
      if(!response.ok){
        throw new Error('Token exchange failed')
      }
      const data= await response.json();
      return data.token;
    }catch(error){
      console.error("Token exchange error:",error)
      throw error;
    }
  }
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
      try {
        const customToken = await exchangeToken(session.user);
        localStorage.setItem("token", customToken);
        setToken(customToken);
        setUser(session.user);
        setAuthMethod('supabase');
        if (mounted) setLoading(false);
        return;
      } catch (err) {
        console.error("Token exchange failed", err);
        await logout();
      }
    }
    
    if (token && mounted) {
      console.log("📦 JWT token found, validating...");
      try {
        // Check if we have stored JWT user data first
        const storedJwtUserData = localStorage.getItem('jwtUserData');
        
        if (storedJwtUserData) {
          console.log("📦 Restoring JWT user data from localStorage");
          setUser(JSON.parse(storedJwtUserData));
          setAuthMethod('jwt');
        } else {
          // Fallback to fetching from API
          await fetchUserProfile(token);
          setAuthMethod('jwt');
        }
      } catch (error) {
        console.error("❌ JWT validation failed:", error.message);
        localStorage.removeItem("token");
        localStorage.removeItem("jwtUserData");
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

      if (authMethod === 'jwt') {
        console.log("🚫 Ignoring Supabase event - using JWT auth");
        return;
      }
      
      if (loading && !user && !authMethod) {
        console.log("🚫 Ignoring auth event during logout");
        return;
      }
      
      if (event === "SIGNED_IN" && session?.user) {
        if (authMethod !== null || user === null) {
          try {
            const customToken = await exchangeToken(session.user);
            localStorage.setItem("token", customToken);
            setToken(customToken);
            setUser(session.user);
            setAuthMethod('supabase');

            if (window.location.pathname === "/login" || window.location.pathname === "/") {
              navigate("/home");
            }
          } catch (error) {
            console.error("Token exchange failed");
          }
        }
      } else if (event === "SIGNED_OUT") {
        console.log("🔄 Supabase signed out event");
        if (authMethod === 'supabase' && user) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
          setAuthMethod(null);
          if (window.location.pathname !== "/login") {
            navigate("/login");
          }
        }
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        console.log("🔄 Token refreshed");
        if (authMethod === 'supabase') {
          const refreshedToken = session.access_token;
          localStorage.setItem("token", refreshedToken);
          setToken(refreshedToken);
          setUser(session.user);
        }
      }
    }
  );

  return () => subscription.unsubscribe();
}, [navigate, token, authMethod, loading, user]);
  const isAuthenticated = !!user;
 const persistentSetUser = (userData) => {
  setUser(userData);

  if (authMethod === 'jwt' && userData) {
    localStorage.setItem('jwtUserData', JSON.stringify(userData));
  } else if (authMethod === 'jwt' && !userData) {
    localStorage.removeItem('jwtUserData');
  }
};

const value = {
  user,
  token,
  login,
  loginWithGoogle,
  logout,
  isAuthenticated,
  loading,
  authMethod,
  setUser: persistentSetUser
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