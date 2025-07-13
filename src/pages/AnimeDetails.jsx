import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, AlertCircle, Star, Calendar, PlayCircle, Users } from "lucide-react";

const DetailPage = () => {
  const { id } = useParams();
  const [error, setError] = useState("");
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    const fetchAnime = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
        const res1 = await fetch(`https://api.jikan.moe/v4/anime/${id}/characters`);
        
        if (!res.ok) {
          throw new Error("Fetching failed");
        }
        
        const data = await res.json();
        const data1 = await res1.json();
        setAnime(data.data);
        setCharacters(data1.data);
      } catch (err) {
        setError("Failed to load anime details. Try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnime();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 text-white">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          <span className="ml-2 text-gray-300">Loading anime...</span>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 text-white">
        <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span className="text-red-200">Error: {error}</span>
        </div>
      </div>
    );  
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent z-10" />
        <div className="relative z-20 max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="lg:col-span-1">
              <div className="relative group">
                <img
                  src={anime.images.jpg.large_image_url}
                  alt={anime.title}
                  className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
              </div>
            </div>

            {/* Anime Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-4">
                  {anime.title}
                </h1>
                {anime.title_english && anime.title_english !== anime.title && (
                  <p className="text-xl text-gray-300 mb-4">{anime.title_english}</p>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <Star className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-yellow-400">{anime.score || 'N/A'}</p>
                  <p className="text-sm text-gray-300">Score</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <PlayCircle className="h-6 w-6 text-green-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-400">{anime.episodes || 'N/A'}</p>
                  <p className="text-sm text-gray-300">Episodes</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <Calendar className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                  <p className="text-sm font-bold text-blue-400">{anime.status}</p>
                  <p className="text-sm text-gray-300">Status</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <Users className="h-6 w-6 text-purple-400 mx-auto mb-1" />
                  <p className="text-sm font-bold text-purple-400">{anime.type}</p>
                  <p className="text-sm text-gray-300">Type</p>
                </div>
              </div>

              {/* Synopsis */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3 text-pink-400">Synopsis</h3>
                <p className="text-gray-200 leading-relaxed">{anime.synopsis}</p>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-semibold text-purple-300 mb-2">Aired</h4>
                  <p className="text-gray-200">{anime.aired?.string || 'N/A'}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-semibold text-purple-300 mb-2">Rating</h4>
                  <p className="text-gray-200">{anime.rating || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-semibold text-purple-300 mb-3">Genres</h4>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((genre) => (
                    <span
                      key={genre.mal_id}
                      className="px-3 py-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-full text-sm text-pink-200"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Back Link */}
              <div className="text-center">
                <Link
                  to="/discover"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                >
                  ← Back to Discover
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Characters Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Users className="h-8 w-8 text-pink-400" />
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            Characters & Voice Actors
          </h2>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="relative">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent pb-4">
            <div className="flex space-x-6 min-w-max">
              {characters.map((char) => (
                <div
                  key={char.character.mal_id}
                  className="flex-shrink-0 w-80 bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                >
                  {/* Character Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={char.character.images.jpg.image_url}
                      alt={char.character.name}
                      className="w-20 h-28 object-cover rounded-lg shadow-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-pink-300 mb-1">
                        {char.character.name}
                      </h3>
                      <p className="text-sm text-gray-300 bg-purple-500/20 px-2 py-1 rounded">
                        {char.role}
                      </p>
                    </div>
                  </div>

                  {/* Voice Actors */}
                  {char.voice_actors.length > 0 && (
                    <div className="border-t border-white/20 pt-4">
                      <p className="text-sm font-semibold text-purple-300 mb-3">
                        Voice Actors
                      </p>
                      <div className="space-y-3">
                        {char.voice_actors
                          .filter((va) => va.language === 'Japanese')
                          .slice(0, 2)
                          .map((va) => (
                            <div
                              key={va.person.mal_id}
                              className="flex items-center gap-3 bg-white/10 rounded-lg p-2"
                            >
                              <img
                                src={va.person.images.jpg.image_url}
                                alt={va.person.name}
                                className="w-12 h-12 object-cover rounded-full border-2 border-purple-400/30"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-200">
                                  {va.person.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {va.language}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gradient-to-r from-slate-900 to-transparent w-8 h-full pointer-events-none" />
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gradient-to-l from-slate-900 to-transparent w-8 h-full pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default DetailPage;