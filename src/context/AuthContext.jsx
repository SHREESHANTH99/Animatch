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

  const authOperationRef = useRef(false);
  const mountedRef = useRef(true);

  const login = async (newToken) => {
    try {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setAuthMethod("jwt");

      // Navigate immediately and load profile in background
      navigate("/home");

      // Fetch profile async without blocking navigation
      fetchUserProfile(newToken).catch((error) => {
        console.error("Profile fetch error:", error);
        localStorage.removeItem("token");
        setToken(null);
        setAuthMethod(null);
        navigate("/login");
      });
    } catch (error) {
      localStorage.removeItem("token");
      setToken(null);
      setAuthMethod(null);
      throw error;
    } finally {
      setLoading(false);
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
    } catch (error) {
      setLoading(false);
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
      await supabase.auth.signOut({ scope: "global" });

      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (authToken) => {
    try {
      // Add timeout to prevent indefinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

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
      if (err.name === "AbortError") {
        console.error("Profile fetch timeout - check your internet connection");
      }
      localStorage.removeItem("token");
      setToken(null);
      setAuthMethod(null);
      if (mountedRef.current) {
        setLoading(false);
      }
      throw err;
    }
  };

  const exchangeToken = async (supabaseUser) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/exchange-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            supabaseToken: "placeholder",
            userData: supabaseUser,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Token exchange failed");
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Token exchange error:", error);
      throw error;
    }
  };

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
        setAuthMethod("supabase");
        if (window.location.pathname === "/login") {
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

  useEffect(() => {
    let mounted = true;
    mountedRef.current = true;

    const initializeAuth = async () => {
      try {
        console.log("🚀 Initializing auth...");

        // Check JWT token first (faster)
        const existingToken = localStorage.getItem("token");
        if (existingToken && mounted) {
          console.log("📦 JWT token found, validating...");
          setToken(existingToken);
          try {
            await fetchUserProfile(existingToken);
            if (mounted) {
              setAuthMethod("jwt");
              setLoading(false);
            }
            return; // Exit early on success
          } catch (error) {
            console.error("❌ JWT validation failed:", error.message);
            localStorage.removeItem("token");
            if (mounted) {
              setToken(null);
            }
          }
        }

        // Only check Supabase if JWT not found or failed
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ Supabase session error:", error.message);
        }

        if (session?.user && mounted) {
          console.log("🧠 Supabase session found:", session.user.email);
          await handleSupabaseAuth(session);
          return;
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
  }, []);
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Supabase auth event:", event, session?.user?.email);

      if (authOperationRef.current || !mountedRef.current) {
        console.log("🚫 Ignoring auth event - operation in progress");
        return;
      }

      if (event === "SIGNED_IN" && session?.user) {
        if (!user || user.id !== session.user.id) {
          await handleSupabaseAuth(session);
        }
      } else if (event === "SIGNED_OUT") {
        console.log("🔄 Supabase signed out event");
        if (mountedRef.current && authMethod === "supabase") {
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
        if (mountedRef.current && authMethod === "supabase") {
          setUser(session.user);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, authMethod, user]);

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
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
