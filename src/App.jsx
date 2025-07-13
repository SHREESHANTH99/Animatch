import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import LandingPage from "./pages/landingPage";
import LoginPage from "./pages/login/loginPage";
import DetailPage from "./pages/AnimeDetails.jsx";
import SignUpPage from "./pages/login/signuppage.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ProtectedLayout } from "./components/protectedroutes/ProtectedRoutes.js";
import ProfilePage from "./pages/profilepage.jsx";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />}></Route>
          <Route path="/login" element={<LoginPage />}></Route>
          <Route path="/register" element={<SignUpPage />}></Route>
          <Route element={<ProtectedLayout />}>
            <Route path="/home" element={<Home />}></Route>
            <Route path="/discover" element={<Discover />}></Route>
            <Route path="/anime/:id" element={<DetailPage />}></Route>

            <Route path="/profile" element={<ProfilePage/>}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
