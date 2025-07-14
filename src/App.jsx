import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import LandingPage from "./pages/landingPage";
import LoginPage from "./pages/login/loginPage";
import DetailPage from "./pages/AnimeDetails.jsx";
import SignUpPage from "./pages/login/signuppage.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ProtectedLayout } from "./components/protectedroutes/ProtectedRoutes.js";
import ProfilePage2 from "./pages/ProfilePage2.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />}></Route>
          <Route path="/login" element={<LoginPage />}></Route>
          <Route path="/register" element={<SignUpPage />}></Route>
          <Route element={<ProtectedLayout />}>
            <Route path="/home" element={<Home />}></Route>
            <Route path="/discover" element={<Discover />}></Route>
            <Route path="/anime/:id" element={<DetailPage />}></Route>
            <Route path="/profile" element={<ProfilePage2 />}></Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
