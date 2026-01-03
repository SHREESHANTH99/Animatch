import { AlertCircle, Loader2, Star, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AniMatchNavbar from "../components/HomeComponents/Navbar";

const Trending = () => {
  const [anime, setAnime] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const fetchAnime = async (pageNO) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `https://api.jikan.moe/v4/seasons/now?page=${pageNO}`
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      const newAnime = data.data;
      if (pageNO === 1) {
        setAnime(newAnime);
      } else {
        setAnime((prev) => {
          const existingIds = new Set(prev.map((item) => item.mal_id));
          const filtered = newAnime.filter(
            (item) => !existingIds.has(item.mal_id)
          );
          return [...prev, ...filtered];
        });
      }
    } catch (err) {
      console.log("Error in loading anime");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAnime(page);
  }, [page]);
  const loadMore = () => {
    if (!loading) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AniMatchNavbar />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/30 to-pink-900/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,75,178,0.2),transparent_50%)]"></div>

      <div className="relative z-10 px-6 py-20">
        <h1 className="text-4xl pb-8 bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-400 bg-clip-text text-transparent text-center font-semibold font-serif">
          Trending Anime
        </h1>

        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-900/80 border border-red-500 rounded-lg flex items-center gap-2 backdrop-blur-sm">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-white">Error: {error}</span>
          </div>
        )}

        {loading && anime.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
            <span className="ml-2 text-gray-300">Loading top anime...</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {anime.map((item, index) => (
            <Link
              key={`${item.mal_id}-${index}`}
              to={`/anime/${item.mal_id}`}
              className="block"
            >
              <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/25">
                <div className="relative h-96 overflow-hidden">
                  <img
                    src={
                      item.images?.webp?.large_image_url ||
                      item.images?.jpg?.large_image_url ||
                      ""
                    }
                    alt={item.title || "Anime"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  {item.score && (
                    <div className="absolute top-3 right-3 bg-yellow-400/90 text-gray-800 px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-sm font-medium">{item.score}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-pink-300 transition-colors">
                    {item.title}
                  </h3>

                  {item.genres && item.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.genres.slice(0, 3).map((genre) => (
                        <span
                          key={genre.mal_id}
                          className="px-2 py-1 bg-purple-500/30 text-purple-200 text-xs rounded-full"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm text-gray-300">
                    <span>Episodes: {item.episodes || "N/A"}</span>
                    <span>{item.year || "N/A"}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {anime.length > 0 && !loading && (
          <div className="flex justify-center mt-12">
            <button
              onClick={loadMore}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Load More Anime
            </button>
          </div>
        )}

        {loading && anime.length > 0 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center gap-2 text-gray-300">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading more anime...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trending;
