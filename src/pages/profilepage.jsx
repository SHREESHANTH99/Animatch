import {
  User,
  Mail,
  Calendar,
  LogOut,
  Settings,
  Eye,
  Star,
  Heart,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
const ProfilePage = () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen   bg-[linear-gradient(135deg,#0f172a_0%,#581c87_50%,_#0f172a_100%)]">
      
    </div>
  );
};

export default ProfilePage;
