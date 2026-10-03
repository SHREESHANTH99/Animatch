import {Navigate,Outlet} from "react-router-dom";
import {useAuth} from "../../context/AuthContext.jsx"
import { Loader2 } from "lucide-react";

export const ProtectedLayout=()=>{
    const {isAuthenticated,loading}=useAuth();
      if (loading) {
    return (
      <div className="min-h-screen bg-site p-6 text-white flex items-center justify-center">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-anicrimson-500" />
          <span className="ml-2 text-white/70">Loading anime...</span>
        </div>
      </div>
    );
  }
    if(!isAuthenticated){
        return <Navigate to="/login" />
    }

    return <Outlet/>
}
