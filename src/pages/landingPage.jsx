import React, { useEffect, useState, useRef } from 'react';
import { Play, Sparkles, Search, Star, Heart, Zap, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dummyAnimeData } from '../assets/dummyAnime';

export default function LandingPage() {
  const [animeData, setAnimeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        setIsLoading(true);
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 8000);
        const response = await fetch('https://api.jikan.moe/v4/top/anime?limit=24&filter=bypopularity', { signal: controller.signal });
        clearTimeout(tid);
        if (!response.ok) throw new Error('bad');
        const data = await response.json();
        if (data.data?.length > 0) setAnimeData(data.data);
        else setAnimeData(dummyAnimeData);
      } catch {
        setAnimeData(dummyAnimeData);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnime();
  }, []);

  const handleGetStarted = () => { window.location.href = "/register"; };
  const handleMouseEnter = (ref) => { if (ref.current) ref.current.style.animationPlayState = 'paused'; };
  const handleMouseLeave = (ref) => { if (ref.current) ref.current.style.animationPlayState = 'running'; };

  const extendedAnime = [...animeData, ...animeData, ...animeData];

  return (
    <div className="relative min-h-screen overflow-hidden bg-site">
      {/* Subtle red radial glow */}
      <div className="absolute inset-0 bg-radial-crimson pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12 sm:pb-16">

        {/* ── Hero ── */}
        <div className="text-center max-w-5xl mx-auto mb-16 sm:mb-24">
          <div className="flex justify-center items-center gap-3 sm:gap-6 mb-6">
            <Sparkles className="text-anicrimson-500 opacity-80" size={20} />
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-anicrimson-400">
              The Anime Discovery Platform
            </span>
            <Sparkles className="text-anicrimson-500 opacity-80" size={20} />
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tight text-white mb-6 leading-none">
            ANI<span className="text-anicrimson-500">MATCH</span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-white/60 mb-4 font-light">
            Discover Your Next Obsession
          </p>
          <div className="w-16 h-0.5 bg-anicrimson-500 mx-auto mb-8 sm:mb-10 rounded-full" />

          <p className="text-base sm:text-lg text-white/50 mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-2">
            The most advanced anime discovery platform powered by AI recommendations and passionate community insights
          </p>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-12">
            {[
              { icon: Zap, label: "AI-Powered", color: "text-anigold-400" },
              { icon: Users, label: "Community Driven", color: "text-aniteal-400" },
              { icon: TrendingUp, label: "Real-time Updates", color: "text-anicrimson-400" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-white/[0.04] backdrop-blur-sm rounded-full border border-white/[0.08] hover:border-white/20 transition-colors">
                <Icon className={color} size={15} />
                <span className="text-white/70 font-medium text-xs sm:text-sm">{label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleGetStarted}
            className="group inline-flex items-center gap-2 sm:gap-3 px-7 py-4 sm:px-10 sm:py-5 bg-anicrimson-500 hover:bg-anicrimson-400 rounded-2xl text-white font-bold text-base sm:text-xl transition-all duration-300 shadow-crimson hover:shadow-crimson-lg hover:scale-105 active:scale-95"
          >
            <Search size={18} />
            Start Discovering
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
          </button>
        </div>

        {/* ── Scrolling Carousel ── */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Trending This Week</h2>
          <div className="w-10 h-0.5 bg-anicrimson-500 mx-auto rounded-full" />
        </div>

        <div className="relative overflow-hidden mb-16 sm:mb-24 rounded-2xl">
          {isLoading ? (
            <div className="flex gap-4 justify-center p-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-32 sm:w-44 h-48 sm:h-60 bg-white/[0.05] rounded-2xl animate-pulse border border-white/[0.06]" />
              ))}
            </div>
          ) : (
            <div className="py-4 sm:py-6">
              {/* Row 1 — scrolls right */}
              <div
                ref={scrollRef1}
                className="flex gap-3 sm:gap-5 mb-3 sm:mb-5 animate-scroll-right hover-pause"
                onMouseEnter={() => handleMouseEnter(scrollRef1)}
                onMouseLeave={() => handleMouseLeave(scrollRef1)}
              >
                {extendedAnime.map((anime, index) => (
                  <Link to={`/anime/${anime.mal_id}`} key={`r1-${anime.mal_id}-${index}`}>
                    <div className="group relative flex-shrink-0 w-32 sm:w-44 h-44 sm:h-60 overflow-hidden rounded-xl sm:rounded-2xl shadow-xl transform hover:scale-105 hover:shadow-crimson transition-all duration-300 cursor-pointer border border-white/[0.06]">
                      <img
                        src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
                        alt={anime.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h4 className="text-white font-semibold text-xs sm:text-sm truncate mb-1">{anime.title}</h4>
                        {anime.score && (
                          <div className="flex items-center gap-1">
                            <Star className="text-anigold-400 fill-anigold-400" size={10} />
                            <span className="text-white/80 text-xs">{anime.score}</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-7 h-7 bg-anicrimson-500 rounded-full flex items-center justify-center shadow-lg">
                          <Play className="text-white ml-0.5" size={12} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Row 2 — scrolls left */}
              <div
                ref={scrollRef2}
                className="flex gap-3 sm:gap-5 animate-scroll-left hover-pause"
                onMouseEnter={() => handleMouseEnter(scrollRef2)}
                onMouseLeave={() => handleMouseLeave(scrollRef2)}
              >
                {extendedAnime.slice().reverse().map((anime, index) => (
                  <div
                    key={`r2-${anime.mal_id}-${index}`}
                    className="group relative flex-shrink-0 w-28 sm:w-40 h-40 sm:h-52 overflow-hidden rounded-xl sm:rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer border border-white/[0.06]"
                  >
                    <img
                      src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
                      alt={anime.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-6 h-6 bg-anicrimson-500 rounded-full flex items-center justify-center shadow-lg">
                        <Heart className="text-white fill-white" size={10} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edge fade masks */}
              <div className="absolute top-0 left-0 w-16 sm:w-32 h-full bg-gradient-to-r from-[#080810] to-transparent pointer-events-none z-10" />
              <div className="absolute top-0 right-0 w-16 sm:w-32 h-full bg-gradient-to-l from-[#080810] to-transparent pointer-events-none z-10" />
            </div>
          )}
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mb-16 sm:mb-24">
          {[
            { value: "50K+", label: "Anime Titles", sub: "And growing daily", accent: "text-anicrimson-400" },
            { value: "1M+", label: "Active Users", sub: "Passionate fans worldwide", accent: "text-aniteal-400" },
            { value: "99%", label: "Match Accuracy", sub: "AI-powered precision", accent: "text-anigold-400" },
          ].map(({ value, label, sub, accent }) => (
            <div key={label} className="text-center group p-6 sm:p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-anicrimson-600/30 hover:bg-white/[0.04] transition-all duration-300">
              <div className={`text-5xl sm:text-6xl md:text-7xl font-black mb-3 ${accent} group-hover:scale-110 transition-transform duration-300 inline-block`}>
                {value}
              </div>
              <p className="text-base sm:text-lg text-white/80 font-semibold">{label}</p>
              <p className="text-white/40 text-xs sm:text-sm mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="relative mb-12 sm:mb-16">
          <div className="bg-[#13131f] border border-white/[0.08] rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-5 leading-tight">
              Ready to Find Your<br className="hidden sm:block" /> Perfect Anime?
            </h2>
            <p className="text-base sm:text-xl text-white/50 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              Join millions of anime fans discovering their next favorite series with our AI-powered recommendation engine
            </p>
            <button
              onClick={handleGetStarted}
              className="group inline-flex items-center gap-2 sm:gap-3 px-7 py-4 sm:px-10 sm:py-5 bg-anicrimson-500 hover:bg-anicrimson-400 rounded-2xl text-white font-bold text-base sm:text-xl transition-all duration-300 shadow-crimson hover:shadow-crimson-lg hover:scale-105 active:scale-95"
            >
              <Search size={18} />
              Start Discovering
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}