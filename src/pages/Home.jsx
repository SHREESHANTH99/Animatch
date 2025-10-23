import { lazy, Suspense } from "react";
import FeatureGrid from "../components/HomeComponents/FeatureGrid";
import Footer from "../components/HomeComponents/Footer";
import Navbar from "../components/HomeComponents/Navbar";

// Lazy load the heavy 3D scene component
const ThreeScene = lazy(() =>
  import("../components/HomeComponents/ThreeScene")
);

export default function Home() {
  return (
    <div className="min-h-screen  text-white font-sans bg-[linear-gradient(135deg,#0f172a_0%,#581c87_50%,_#0f172a_100%)]">
      <Navbar />
      <Suspense
        fallback={
          <div className="w-full h-[500px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
          </div>
        }
      >
        <ThreeScene />
      </Suspense>
      <FeatureGrid />
      <Footer />
    </div>
  );
}
