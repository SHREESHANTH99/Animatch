import FeatureGrid from "../components/HomeComponents/FeatureGrid";
import Footer from "../components/HomeComponents/Footer";
// import Hero from "../components/HeroSection";
import Navbar from "../components/HomeComponents/Navbar";
import ThreeScene from "../components/HomeComponents/ThreeScene"

export default function Home() {
  return (

    <div className="min-h-screen  text-white font-sans bg-[linear-gradient(135deg,#0f172a_0%,#581c87_50%,_#0f172a_100%)]">
      <Navbar />
      <ThreeScene/>
      {/* <Hero/> */}
      <FeatureGrid />

      {/* <footer className="text-center text-sm text-purple-400 flex justify-center mt-2 overflow-hidden">
        © 2025 AniMatch. All rights reserved.
      </footer> */}
      <Footer/>
    </div>
  );
}
