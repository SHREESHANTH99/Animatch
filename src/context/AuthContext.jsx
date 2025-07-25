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

  // ✅ normal login with backend
  const login = async (newToken) => {
    try {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setAuthMethod("jwt");
      await fetchUserProfile(newToken);
      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
      localStorage.removeItem("token");
      setToken(null);
      setAuthMethod(null);
      throw error;
    }
  };

  // ✅ Google login via Supabase
  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/home",
        },
      });
      if (error) throw error;
      // supabase.onAuthStateChange will handle the rest
    } catch (error) {
      console.error("Google login error:", error);
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

      await supabase.auth.signOut({ scope: "global" }).catch(() => {});
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  // ✅ fetch user profile with backend JWT
  const fetchUserProfile = async (authToken) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType?.includes("application/json")) {
      throw new Error("Invalid or expired token");
    }
    const data = await res.json();
    setUser(data);
  };

  // ✅ on mount, restore session
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) console.error("Supabase session error:", error.message);

        if (session?.user && mounted) {
          console.log("✅ Supabase session found:", session.user.email);
          // exchange supabase token with backend JWT
          await exchangeSupabaseToken(session.access_token);
          return;
        }

        if (token && mounted) {
          console.log("📦 JWT token found, validating...");
          try {
            await fetchUserProfile(token);
            setAuthMethod("jwt");
          } catch (error) {
            console.error("JWT validation failed:", error.message);
            localStorage.removeItem("token");
            setToken(null);
          }
        }
      } catch (err) {
        console.error("Auth init error:", err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ listen for Supabase auth events
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Supabase auth event:", event);
        if (event === "SIGNED_IN" && session?.user) {
          console.log("✅ Google login successful, exchanging token...");
          await exchangeSupabaseToken(session.access_token);
        }
        if (event === "SIGNED_OUT") {
          console.log("👋 Signed out");
          setUser(null);
          setAuthMethod(null);
          setToken(null);
          navigate("/login");
        }
      }
    );
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ exchange supabase token for backend JWT
  const exchangeSupabaseToken = async (supabaseToken) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/supabase-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supabaseToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Supabase token exchange failed:", data);
        return;
      }
      console.log("✅ Supabase token exchanged for backend JWT");
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      setAuthMethod("jwt");
      navigate("/home");
    } catch (err) {
      console.error("Supabase exchange error:", err);
    }
  };

  const isAuthenticated = !!user;
  const getAuthMethod = () => authMethod;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        loginWithGoogle,
        logout,
        isAuthenticated,
        loading,
        authMethod,
        getAuthMethod,
      }}
    >
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
