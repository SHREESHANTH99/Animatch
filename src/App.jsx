import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import LandingPage from "./pages/landingPage";
import DetailPage from "./pages/AnimeDetails.jsx";
import SignUpPage from "./pages/login/signuppage.jsx";
import { ProtectedLayout } from "./components/protectedroutes/ProtectedRoutes.js";
import ProfilePage2 from "./pages/ProfilePage2.jsx";
import { PublicOnlyRoute } from "./components/protectedroutes/PublicOnlyRoute.jsx";
import { TopAnime } from "./pages/TopAnime.jsx";
import { Trending } from "./pages/Trending.jsx";
import Library from "./pages/Library.jsx";
import Login from "./pages/login/loginPage.jsx";
import PageLoader from "./components/Preloader/loader.jsx";
import { usePageLoader } from "./context/PageLoader.jsx";
import Community from "./pages/Community.jsx";
import ResetPassword from "./pages/login/ResetPassword.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
function App() {
  const isLoading = usePageLoader();
  if (isLoading) {
    return <PageLoader />;
  }
  return (
    <>
      <SocketProvider>
          <Routes>
            <Route path="/" element={<LandingPage />}></Route>
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>}></Route>
            <Route path="/login/:token" element={<ResetPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <SignUpPage />
                </PublicOnlyRoute>
              }
            ></Route>
            <Route element={<ProtectedLayout />}>
              <Route path="/home" element={<Home />}></Route>
              <Route path="/discover" element={<Discover />}></Route>
              <Route path="/anime/:id" element={<DetailPage />}></Route>
              <Route path="/profile" element={<ProfilePage2 />}></Route>
              <Route path="/top" element={<TopAnime />}></Route>
              <Route path="/trending" element={<Trending />}></Route>
              <Route path="/library" element={<Library />}></Route>
              <Route path="/Community" element={<Community/>}></Route>
            </Route>
          </Routes>
      </SocketProvider>
    </>
  );
}

export default App;
