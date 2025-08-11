import React, { useEffect, useState, useRef } from 'react';
import { Play, Sparkles, Search, Star, Heart, Zap, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function LandingPage() {
  const [animeData, setAnimeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);

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

  const handleMouseEnter = (ref, speed) => {
    if (ref.current) {
      ref.current.style.animationPlayState = 'paused';
    }
  };

  const handleMouseLeave = (ref) => {
    if (ref.current) {
      ref.current.style.animationPlayState = 'running';
    }
  };

  const extendedAnime = [...animeData, ...animeData, ...animeData];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/40 to-pink-900/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(120,119,198,0.4),transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(255,75,178,0.3),transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)]"></div>
      <div className="absolute top-10 left-10 w-2 h-2 bg-pink-400 rounded-full opacity-60 animate-bounce"></div>
      <div className="absolute top-32 right-20 w-3 h-3 bg-cyan-400 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-60 left-1/4 w-1 h-1 bg-purple-400 rounded-full opacity-80 animate-ping" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-40 right-1/3 w-4 h-4 bg-pink-400 rounded-full opacity-40 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-20 left-1/5 w-2 h-2 bg-cyan-400 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1.5s' }}></div>

      <div className="relative z-10 container mx-auto px-4 pt-16 pb-16">
        <div className="text-center max-w-7xl mx-auto mb-20">
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="relative">
              <Sparkles className="text-pink-400 animate-spin" size={36} />
              <div className="absolute inset-0 bg-pink-400/20 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-black bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl">
              ANIMATCH
            </h1>
            <div className="relative">
              <Sparkles className="text-cyan-400 animate-spin" style={{ animationDelay: '0.5s', animationDirection: 'reverse' }} size={36} />
              <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
          
          <div className="relative mb-8">
            <p className="text-3xl md:text-4xl text-white/95 font-light mb-4 animate-pulse">
              Discover Your Next Obsession
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 mx-auto rounded-full"></div>
          </div>
          
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            The most advanced anime discovery platform powered by AI recommendations and passionate community insights
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Zap className="text-yellow-400" size={20} />
              <span className="text-white/90 font-medium">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Users className="text-green-400" size={20} />
              <span className="text-white/90 font-medium">Community Driven</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <TrendingUp className="text-blue-400" size={20} />
              <span className="text-white/90 font-medium">Real-time Updates</span>
            </div>
          </div>
        </div>
        <div className="text-center mb-16">
          <div className="relative inline-block">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10">
              Trending This Week
            </h2>
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-400/20 via-purple-400/20 to-cyan-400/20 blur-xl rounded-lg"></div>
          </div>
          <div className="w-32 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto rounded-full mb-8"></div>
        </div>
        <div className="relative overflow-hidden mb-20 rounded-3xl">
          {isLoading ? (
            <div className="flex gap-6 justify-center p-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-52 h-72 bg-white/10 rounded-3xl animate-pulse backdrop-blur-sm">
                  <div className="w-full h-full bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-3xl"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8">
              <div 
                ref={scrollRef1}
                className="flex gap-8 mb-8 animate-scroll-right hover-pause"
                onMouseEnter={() => handleMouseEnter(scrollRef1)}
                onMouseLeave={() => handleMouseLeave(scrollRef1)}
              >
                {extendedAnime.map((anime, index) => (
                  <Link to={`/anime/${anime.mal_id}`} className="block">
                  <div
                    key={`row1-${anime.mal_id}-${index}`}
                    className="group relative flex-shrink-0 w-52 h-72 overflow-hidden rounded-3xl shadow-2xl transform hover:scale-110 hover:rotate-2 transition-all duration-500 cursor-pointer"
                  >
                    <img
                      src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
                      alt={anime.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <h4 className="text-white font-bold text-lg mb-2 truncate">{anime.title}</h4>
                      {anime.score && (
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="text-yellow-400" size={16} />
                          <span className="text-white/90 text-sm font-medium">{anime.score}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-pink-400 text-sm font-medium">
                        <Heart className="text-pink-400" size={16} />
                        <span>{anime.members ? anime.members.toLocaleString() : 'N/A'} Members</span>
                      </div>
                    </div>
                    
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-0 group-hover:scale-100">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                        <Play className="text-white ml-1" size={20} />
                      </div>
                    </div>

                    <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-0 group-hover:scale-100">
                      <div className="px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                        #{anime.rank || 'Top'}
                      </div>
                    </div>
                  </div></Link>
                ))}
              </div>
              <div 
                ref={scrollRef2}
                className="flex gap-8 animate-scroll-left hover-pause"
                onMouseEnter={() => handleMouseEnter(scrollRef2)}
                onMouseLeave={() => handleMouseLeave(scrollRef2)}
              >
                {extendedAnime.slice().reverse().map((anime, index) => (
                  <div
                    key={`row2-${anime.mal_id}-${index}`}
                    className="group relative flex-shrink-0 w-48 h-64 overflow-hidden rounded-3xl shadow-2xl transform hover:scale-110 hover:-rotate-2 transition-all duration-500 cursor-pointer"
                  >
                    <img
                      src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
                      alt={anime.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <h4 className="text-white font-bold text-sm mb-2 truncate">{anime.title}</h4>
                      {anime.score && (
                        <div className="flex items-center gap-2">
                          <Star className="text-yellow-400" size={14} />
                          <span className="text-white/90 text-xs">{anime.score}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-0 group-hover:scale-100">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <Heart className="text-white" size={14} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute top-0 left-0 w-40 h-full bg-gradient-to-r from-slate-900 via-purple-900/70 to-transparent pointer-events-none z-10"></div>
              <div className="absolute top-0 right-0 w-40 h-full bg-gradient-to-l from-slate-900 via-purple-900/70 to-transparent pointer-events-none z-10"></div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
          <div className="text-center group">
            <div className="relative mb-6">
              <div className="text-5xl md:text-7xl font-black bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
                50K+
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-400/20 to-purple-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
            </div>
            <p className="text-xl md:text-2xl text-white/90 font-medium">Anime Titles</p>
            <p className="text-white/60 mt-2">And growing daily</p>
          </div>
          <div className="text-center group">
            <div className="relative mb-6">
              <div className="text-5xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
                1M+
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
            </div>
            <p className="text-xl md:text-2xl text-white/90 font-medium">Active Users</p>
            <p className="text-white/60 mt-2">Passionate fans worldwide</p>
          </div>
          <div className="text-center group">
            <div className="relative mb-6">
              <div className="text-5xl md:text-7xl font-black bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
                99%
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-green-400/20 to-teal-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
            </div>
            <p className="text-xl md:text-2xl text-white/90 font-medium">Match Accuracy</p>
            <p className="text-white/60 mt-2">AI-powered precision</p>
          </div>
        </div>
        <div className="text-center relative flex flex-col items-center justify-center gap-8 mb-24">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-12 border border-white/10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Find Your Perfect Anime?
            </h2>
            <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join millions of anime fans discovering their next favorite series with our AI-powered recommendation engine
            </p>
            <button
              onClick={handleGetStarted}
              className="group relative px-16 md:px-20 py-6 md:py-8 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 rounded-full text-white font-bold text-2xl md:text-3xl transform hover:scale-105 transition-all duration-500 shadow-2xl hover:shadow-pink-500/50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center gap-4 justify-center">
                <Search className="group-hover:rotate-12 transition-transform duration-500" size={28} />
                <span className='text-2xl md:text-4xl'>Start Discovering</span>
                <ArrowRight className="group-hover:translate-x-2 transition-transform duration-500" size={28} />
              </div>
            </button>
          </div>
        </div>
      </div>

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
          animation: scroll-right 80s linear infinite;
        }
        
        .animate-scroll-left {
          animation: scroll-left 100s linear infinite;
        }

        .hover-pause:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}