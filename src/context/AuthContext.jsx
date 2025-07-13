import {  createContext,useContext,useEffect,useState } from "react";
const AuthContext=createContext();

export const AuthProvider=({children})=>{
    const [token,setToken]=useState(()=> localStorage.getItem("token"))
    const [user,setUser]=useState(null)
    const [loading,setLoading]=useState(true);
    
    const login = async(newToken)=>{
        localStorage.setItem("token",newToken)
        setToken(newToken);
        await fetchUserProfile(newToken);
   }
    const logout=()=>{
        localStorage.removeItem("token");
        setToken(null)
        setUser(null)
    }
    const fetchUserProfile=async(authToken)=>{
        try{
            const res=await fetch("http://localhost:5000/api/user/profile",{
                headers:{
                    Authorization:`Bearer ${authToken}`,
                },
            });
            const contentType=res.headers.get("content-type");
            if(!res.ok || !contentType?.includes("application/json")){
                throw new Error("Invalid or expired token");
            }
            const data = await res.json();
            setUser(data);
        }catch(err){
            console.log("failed to fetch profile:",err.message);
            logout();
        }finally{
            setLoading(false)
        }
    };
    useEffect(()=>{
        
        if(token){
            fetchUserProfile(token)
        }
        else{
            setLoading(false)
        }
    },[token])

    const isAuthenticated =!!token;
    return(
        <AuthContext.Provider value={{token,login,logout,isAuthenticated,user,loading}}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth=()=>useContext(AuthContext);