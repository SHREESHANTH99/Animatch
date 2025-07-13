import {Navigate,Outlet} from "react-router-dom";
import {useAuth} from "../../context/AuthContext.jsx"

export const ProtectedLayout=()=>{
    const {isAuthenticated}=useAuth();
    if(!isAuthenticated){
        return <Navigate to="/login" />
    }
    return <Outlet/>
}

