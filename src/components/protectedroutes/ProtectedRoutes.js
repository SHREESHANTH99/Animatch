import {Navigate,Outlet} from "react-router-dom";
import {useAuth} from "../../context/AuthContext.jsx"
import { Loader2 } from "lucide-react";

export const ProtectedLayout=()=>{
    const {isAuthenticated,loading}=useAuth();
      if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 text-white">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          <span className="ml-2 text-gray-300">Loading anime...</span>
        </div>
      </div>
    );
  }
    if(!isAuthenticated){
        return <Navigate to="/login" />
    }

    return <Outlet/>
}
