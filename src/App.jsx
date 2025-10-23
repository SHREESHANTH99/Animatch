import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ProtectedLayout } from "./components/protectedroutes/ProtectedRoutes.js";
import { PublicOnlyRoute } from "./components/protectedroutes/PublicOnlyRoute.jsx";
import PageLoader from "./components/Preloader/loader.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home"));
const Discover = lazy(() => import("./pages/Discover"));
const LandingPage = lazy(() => import("./pages/landingPage"));
const DetailPage = lazy(() => import("./pages/AnimeDetails.jsx"));
const SignUpPage = lazy(() => import("./pages/login/signuppage.jsx"));
const ProfilePage2 = lazy(() => import("./pages/ProfilePage2.jsx"));
const TopAnime = lazy(() => import("./pages/TopAnime.jsx"));
const Trending = lazy(() => import("./pages/Trending.jsx"));
const Library = lazy(() => import("./pages/Library.jsx"));
const Login = lazy(() => import("./pages/login/loginPage.jsx"));
const Community = lazy(() => import("./pages/Community.jsx"));
const ResetPassword = lazy(() => import("./pages/login/ResetPassword.jsx"));

function App() {
  return (
    <>
      <SocketProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />}></Route>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            ></Route>
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
              <Route path="/Community" element={<Community />}></Route>
            </Route>
          </Routes>
        </Suspense>
      </SocketProvider>
    </>
  );
}

export default App;
