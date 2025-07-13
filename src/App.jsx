import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import LandingPage from "./pages/landingPage";
import LoginPage from "./pages/login/loginPage";
import DetailPage from "./pages/AnimeDetails.jsx"
import SignUpPage from "./pages/login/signuppage.jsx";
function App() { 
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<LandingPage />}></Route>
        <Route path="/home" element={<Home />}></Route>
        <Route path="/discover" element={<Discover />}></Route>
        <Route path="/anime/:id" element={<DetailPage/>}></Route>
        <Route path="/login" element={<LoginPage/>}></Route>
        <Route path="/register" element={<SignUpPage/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
