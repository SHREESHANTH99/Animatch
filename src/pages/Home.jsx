import Footer from "../components/HomeComponents/Footer";
import Navbar from "../components/HomeComponents/Navbar";
import ThreeDImageCarousel from "../components/HomeComponents/ThreeDImageCarousel";

const animeSlides = [
  {
    id: 1,
    title: "Fullmetal Alchemist: Brotherhood",
    score: 9.09,
    src: "https://cdn.myanimelist.net/images/anime/1208/94745l.jpg",
    href: "/anime/5114",
  },
  {
    id: 2,
    title: "Steins;Gate",
    score: 9.07,
    src: "https://cdn.myanimelist.net/images/anime/5/73199l.jpg",
    href: "/anime/9253",
  },
  {
    id: 3,
    title: "Attack on Titan",
    score: 9.05,
    src: "https://cdn.myanimelist.net/images/anime/1517/100633l.jpg",
    href: "/anime/38524",
  },
  {
    id: 4,
    title: "Jujutsu Kaisen",
    score: 8.65,
    src: "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg",
    href: "/anime/40748",
  },
  {
    id: 5,
    title: "Hunter x Hunter",
    score: 9.02,
    src: "https://cdn.myanimelist.net/images/anime/1337/99013l.jpg",
    href: "/anime/11061",
  },
  {
    id: 6,
    title: "Death Note",
    score: 8.62,
    src: "https://cdn.myanimelist.net/images/anime/9/9453l.jpg",
    href: "/anime/1535",
  },
  {
    id: 7,
    title: "One Piece",
    score: 8.70,
    src: "https://cdn.myanimelist.net/images/anime/1244/138851l.jpg",
    href: "/anime/21",
  },
  {
    id: 8,
    title: "Demon Slayer",
    score: 8.59,
    src: "https://cdn.myanimelist.net/images/anime/1704/106947l.jpg",
    href: "/anime/44511",
  },
  {
    id: 9,
    title: "Cowboy Bebop",
    score: 8.75,
    src: "https://cdn.myanimelist.net/images/anime/4/19644l.jpg",
    href: "/anime/1",
  },
  {
    id: 10,
    title: "Frieren: Beyond Journey's End",
    score: 9.08,
    src: "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg",
    href: "/anime/52991",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen text-white font-sans bg-site">
      <Navbar />

      {/* 3D Carousel Hero Section */}
      <section className="pt-20 pb-12 px-2">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-white mb-3">
            Top Picks For You
          </h2>
          <div className="w-16 h-0.5 bg-anicrimson-500 mx-auto rounded-full" />
          <p className="text-white/50 mt-4 text-sm tracking-wider uppercase">
            Swipe or drag to explore
          </p>
        </div>
        <ThreeDImageCarousel
          slides={animeSlides}
          itemCount={5}
          autoplay={true}
          delay={1}
          pauseOnHover={true}
          className="w-full"
        />
      </section>

      <Footer />
    </div>
  );
}
