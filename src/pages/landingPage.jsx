import React, { useEffect, useState } from 'react';
import { Play, Sparkles, Search, Star, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function LandingPage() {
  const [animeData, setAnimeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=24&filter=bypopularity');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.data && Array.isArray(data.data)) {
          setAnimeData(data.data);
        } else {
           throw new Error("Error in loading anime data");
        }
      } catch (error) {
        console.error('Error fetching anime:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnime();
  }, []);

  const handleGetStarted = () => {
    window.location.href="/register"
  };

  const extendedAnime = [...animeData, ...animeData, ...animeData];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/30 to-pink-900/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,75,178,0.2),transparent_50%)]"></div>

      <div className="relative z-10 container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-6xl mx-auto mb-16">
          <div className="flex justify-center items-center gap-8 mb-8">
            <Sparkles className="text-pink-400 animate-bounce" size={32} />
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              ANIMATCH
            </h1>
            <Sparkles className="text-cyan-400 animate-bounce" style={{ animationDelay: '0.5s' }} size={32} />
          </div>
          
          <p className="text-2xl md:text-3xl text-white/90 font-light mb-6">
            Discover Your Next Obsession
          </p>
          
          <p className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl mx-auto">
            The most advanced anime discovery platform powered by AI recommendations and passionate community
          </p>
        </div>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trending This Week
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto rounded-full"></div>
        </div>
        <div className="relative overflow-hidden mb-16">
          {isLoading ? (
            <div className="flex gap-6 justify-center">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-48 h-64 bg-white/10 rounded-2xl animate-pulse">
                  <div className="w-full h-full bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-2xl"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex gap-6 mb-6 animate-scroll-right">
                {extendedAnime.map((anime, index) => (
                  <Link to={`/anime/${anime.mal_id}`} className="block">
                  <div
                    key={`row1-${anime.mal_id}-${index}`}
                    className="group relative flex-shrink-0 w-48 h-64 overflow-hidden rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <img
                      src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
                      alt={anime.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h4 className="text-white font-bold text-sm mb-1 truncate">{anime.title}</h4>
                      {anime.score && (
                        <div className="flex items-center gap-1">
                          <Star className="text-yellow-400" size={14} />
                          <span className="text-white/90 text-xs">{anime.score}</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                        <Play className="text-white" size={16} />
                      </div>
                    </div>
                  </div></Link>
                ))}
              </div>
              <div className="flex gap-6 animate-scroll-left">
                {extendedAnime.slice().reverse().map((anime, index) => (
                  <Link to={`/anime/${anime.mal_id}`} className="block">
                  <div
                    key={`row2-${anime.mal_id}-${index}`}
                    className="group relative flex-shrink-0 w-44 h-56 overflow-hidden rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <img
                      src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
                      alt={anime.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h4 className="text-white font-bold text-xs mb-1 truncate">{anime.title}</h4>
                      {anime.score && (
                        <div className="flex items-center gap-1">
                          <Star className="text-yellow-400" size={12} />
                          <span className="text-white/90 text-xs">{anime.score}</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <Heart className="text-white" size={12} />
                      </div>
                    </div>
                  </div></Link>
                ))}
              </div>
              <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-slate-900 via-purple-900/50 to-transparent pointer-events-none z-10"></div>
              <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-slate-900 via-purple-900/50 to-transparent pointer-events-none z-10"></div>
            </>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="text-center">
            <div className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
              50K+
            </div>
            <p className="text-xl text-white/80">Anime Titles</p>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
              1M+
            </div>
            <p className="text-xl text-white/80">Active Users</p>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent mb-4">
              99%
            </div>
            <p className="text-xl text-white/80">Match Accuracy</p>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Find Your Perfect Anime?
          </h2>
          <p className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Join thousands of anime fans discovering their next favorite series
          </p>
          <button
            onClick={handleGetStarted}
            className="group relative px-12 md:px-16 py-4 md:py-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white font-bold text-xl md:text-2xl transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-pink-500/50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-4">
              <Search className="group-hover:rotate-12 transition-transform duration-300" size={24} />
              <span>Start Discovering</span>
            </div>
          </button>
        </div>
      </div>
      <div className="absolute top-20 left-20 w-4 h-4 bg-pink-400 rounded-full opacity-60 animate-pulse"></div>
      <div className="absolute top-40 right-32 w-3 h-3 bg-cyan-400 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-32 left-32 w-5 h-5 bg-purple-400 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 right-20 w-4 h-4 bg-pink-400 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      <style jsx>{`
        @keyframes scroll-right {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0%);
          }
        }
        
        @keyframes scroll-left {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-scroll-right {
          animation: scroll-right 60s linear infinite;
        }
        
        .animate-scroll-left {
          animation: scroll-left 80s linear infinite;
        }
      `}</style>
    </div>
  );
}