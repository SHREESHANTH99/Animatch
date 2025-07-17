import { Routes, Route} from "react-router-dom";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import LandingPage from "./pages/landingPage";
import LoginPage from "./pages/login/loginPage";
import DetailPage from "./pages/AnimeDetails.jsx";
import SignUpPage from "./pages/login/signuppage.jsx";
import { ProtectedLayout } from "./components/protectedroutes/ProtectedRoutes.js";
import ProfilePage2 from "./pages/ProfilePage2.jsx";
import { PublicOnlyRoute } from "./components/protectedroutes/PublicOnlyRoute.jsx";
function App() {
  return (
        <Routes>
          <Route path="/" element={<LandingPage />}></Route>
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>}></Route>
          <Route path="/register" element={<PublicOnlyRoute><SignUpPage /></PublicOnlyRoute>}></Route>
          <Route element={<ProtectedLayout />}>
            <Route path="/home" element={<Home />}></Route>
            <Route path="/discover" element={<Discover />}></Route>
            <Route path="/anime/:id" element={<DetailPage />}></Route>
            <Route path="/profile" element={<ProfilePage2 />}></Route>
          </Route>
        </Routes>
  );
}

export default App;
