import FeatureGrid from "../components/HomeComponents/FeatureGrid";
import Footer from "../components/HomeComponents/Footer";
import Navbar from "../components/HomeComponents/Navbar";
import ThreeScene from "../components/HomeComponents/ThreeScene";

export default function Home() {
  return (
    <div className="min-h-screen  text-white font-sans bg-[linear-gradient(135deg,#0f172a_0%,#581c87_50%,_#0f172a_100%)]">
      <Navbar />
      <ThreeScene />
      <FeatureGrid />
      <Footer />
    </div>
  );
}
