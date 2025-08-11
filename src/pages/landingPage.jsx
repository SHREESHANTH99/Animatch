import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Play, Sparkles, Search, Star, Heart, Zap, Users, TrendingUp, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const [animeData, setAnimeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  
  const heroInView = useInView(heroRef, { once: true });
  const statsInView = useInView(statsRef, { once: true });

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const logoVariants = {
    hidden: { scale: 0, rotate: -180, opacity: 0 },
    visible: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.2
      }
    }
  };

  const titleVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.5
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const skeletonVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const animeCardVariants = {
    hidden: { scale: 0, opacity: 0, rotateY: 90 },
    visible: (i) => ({
      scale: 1,
      opacity: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: i * 0.1
      }
    }),
    hover: {
      scale: 1.1,
      rotateY: 10,
      z: 50,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  const statsVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  const counterVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-purple-950 to-black">
      <motion.div 
        className="absolute inset-0 bg-[conic-gradient(at_50%_50%,rgba(255,0,150,0.1),rgba(139,92,246,0.2),rgba(0,255,255,0.1),rgba(255,0,150,0.1))]"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,0,150,0.4),transparent_50%)]"
        variants={pulseVariants}
        animate="animate"
      />
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(0,255,255,0.3),transparent_50%)]"
        variants={pulseVariants}
        animate="animate"
        style={{ animationDelay: '1s' }}
      />
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.4),transparent_50%)]"
        variants={pulseVariants}
        animate="animate"
        style={{ animationDelay: '2s' }}
      />
      {[...Array(7)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-${i % 3 + 1} h-${i % 3 + 1} rounded-full`}
          style={{
            background: `linear-gradient(45deg, ${['#ff006e', '#8b5cf6', '#00ffff', '#ff4bcd'][i % 4]}, ${['#8b5cf6', '#00ffff', '#ff4bcd', '#ff006e'][i % 4]})`,
            top: `${(i * 123) % 100}%`,
            left: `${(i * 456) % 100}%`,
             animationDelay: `${i * 0.5}s`
          }}
          variants={floatingVariants}
          animate="animate"
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-900/10 to-transparent"></div>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-16">
        <motion.div 
          ref={heroRef}
          className="text-center max-w-7xl mx-auto mb-16 sm:mb-24"
          variants={containerVariants}
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
        >
          <motion.div 
            className="flex justify-center items-center gap-4 sm:gap-8 mb-8 sm:mb-12"
            variants={itemVariants}
          >
            <motion.div className="relative" variants={logoVariants}>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-xl opacity-60"
                variants={pulseVariants}
                animate="animate"
              />
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="text-white" size={24} />
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div className="relative" variants={titleVariants}>
              <motion.h1 
                className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-black bg-gradient-to-r from-pink-400 via-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                ANIMATCH
              </motion.h1>
              <motion.div 
                className="absolute -inset-4 bg-gradient-to-r from-pink-400/20 via-purple-400/20 to-cyan-400/20 blur-3xl"
                variants={pulseVariants}
                animate="animate"
              />
            </motion.div>
            
            <motion.div className="relative" variants={logoVariants}>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-xl opacity-60"
                variants={pulseVariants}
                animate="animate"
                style={{ animationDelay: '0.5s' }}
              />
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="text-white" size={24} />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div className="relative mb-8 sm:mb-12" variants={itemVariants}>
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/20 to-cyan-500/10 rounded-3xl blur-2xl"
              variants={pulseVariants}
              animate="animate"
            />
            <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
              <motion.p 
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-light mb-4"
                variants={itemVariants}
              >
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Discover Your Next
                </span>
                <br />
                <span className="font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Obsession
                </span>
              </motion.p>
              <motion.div 
                className="w-24 sm:w-32 h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 mx-auto rounded-full"
                variants={pulseVariants}
                animate="animate"
              />
            </div>
          </motion.div>

          <motion.p 
            className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed font-light"
            variants={itemVariants}
          >
            The most <span className="font-bold text-transparent bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text">advanced anime discovery platform</span> powered by AI recommendations and passionate community insights
          </motion.p>
          <motion.div 
            className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12 sm:mb-16"
            variants={containerVariants}
          >
            {[
              { icon: Zap, text: "AI-Powered", color: "from-yellow-400 to-orange-400" },
              { icon: Users, text: "Community Driven", color: "from-green-400 to-teal-400" },
              { icon: TrendingUp, text: "Real-time Updates", color: "from-blue-400 to-cyan-400" }
            ].map((feature, i) => (
              <motion.div key={i} className="group relative overflow-hidden" variants={itemVariants}>
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full blur-sm`}
                  whileHover={{ scale: 1.1 }}
                />
                <motion.div 
                  className="relative flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:border-yellow-400/50 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <feature.icon className={`text-${feature.color.split('-')[1]}-400`} size={18} />
                  <span className="text-white/90 font-medium text-sm sm:text-base">{feature.text}</span>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="relative inline-block mb-6 sm:mb-8">
            <motion.div 
              className="absolute -inset-6 bg-gradient-to-r from-pink-400/30 via-purple-400/40 to-cyan-400/30 blur-2xl rounded-lg"
              variants={pulseVariants}
              animate="animate"
            />
            <h2 className="relative text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Trending This Week
            </h2>
          </div>
          <motion.div 
            className="w-24 sm:w-32 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto rounded-full mb-8"
            variants={pulseVariants}
            animate="animate"
          />
        </motion.div>
        <div className="relative overflow-hidden mb-16 sm:mb-24 rounded-3xl">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                className="flex gap-4 sm:gap-6 justify-center p-6 sm:p-8"
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="flex-shrink-0 w-40 sm:w-52 h-56 sm:h-72 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl backdrop-blur-sm border border-white/10"
                    variants={skeletonVariants}
                    animate="animate"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-pink-400/20 via-purple-400/20 to-cyan-400/20 rounded-3xl"></div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                className="py-6 sm:py-8"
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div 
                  ref={scrollRef1}
                  className="flex gap-6 sm:gap-8 mb-6 sm:mb-8 animate-scroll-right hover-pause"
                  onMouseEnter={() => handleMouseEnter(scrollRef1)}
                  onMouseLeave={() => handleMouseLeave(scrollRef1)}
                >
                  {extendedAnime.map((anime, index) => (
                    <motion.div 
                      key={`row1-${anime.mal_id}-${index}`}
                      className="block"
                      custom={index}
                      variants={animeCardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                    >
                      <div className="group relative flex-shrink-0 w-44 sm:w-52 h-60 sm:h-72 overflow-hidden rounded-3xl shadow-2xl cursor-pointer">
                        <motion.div 
                          className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 z-10"
                          whileHover={{ scale: 1.05 }}
                        />
                        
                        <motion.img
                          src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
                          alt={anime.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.25 }}
                          transition={{ duration: 0.7 }}
                        />
                        
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        />
                        
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-purple-500/20 to-cyan-500/30 opacity-0 group-hover:opacity-100"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        />
                        
                        <motion.div 
                          className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 to-transparent"
                          initial={{ y: "100%" }}
                          whileHover={{ y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <h4 className="text-white font-bold text-sm sm:text-lg mb-2 truncate">{anime.title}</h4>
                          {anime.score && (
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="text-yellow-400" size={14} />
                              <span className="text-white/90 text-xs sm:text-sm font-medium">{anime.score}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-pink-400 text-xs sm:text-sm font-medium">
                            <Heart className="text-pink-400" size={14} />
                            <span>{anime.members ? anime.members.toLocaleString() : 'N/A'} Members</span>
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          className="absolute top-4 right-4"
                          initial={{ opacity: 0, scale: 0 }}
                          whileHover={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <motion.div 
                            className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border border-white/20"
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Play className="text-white ml-1" size={16} />
                          </motion.div>
                        </motion.div>

                        <motion.div 
                          className="absolute top-4 left-4"
                          initial={{ opacity: 0, scale: 0 }}
                          whileHover={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="px-2 sm:px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-xs font-bold border border-white/20">
                            #{anime.rank || 'Top'}
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div 
                  ref={scrollRef2}
                  className="flex gap-6 sm:gap-8 animate-scroll-left hover-pause"
                  onMouseEnter={() => handleMouseEnter(scrollRef2)}
                  onMouseLeave={() => handleMouseLeave(scrollRef2)}
                >
                  {extendedAnime.slice().reverse().map((anime, index) => (
                    <motion.div
                      key={`row2-${anime.mal_id}-${index}`}
                      className="group relative flex-shrink-0 w-40 sm:w-48 h-52 sm:h-64 overflow-hidden rounded-3xl shadow-2xl cursor-pointer"
                      custom={index}
                      variants={animeCardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                    >
                      <motion.div 
                        className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 z-10"
                        whileHover={{ scale: 1.05 }}
                      />
                      
                      <motion.img
                        src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
                        alt={anime.title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.25 }}
                        transition={{ duration: 0.7 }}
                      />
                      
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      />
                      
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 to-transparent"
                        initial={{ y: "100%" }}
                        whileHover={{ y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <h4 className="text-white font-bold text-xs sm:text-sm mb-2 truncate">{anime.title}</h4>
                        {anime.score && (
                          <div className="flex items-center gap-2">
                            <Star className="text-yellow-400" size={12} />
                            <span className="text-white/90 text-xs">{anime.score}</span>
                          </div>
                        )}
                      </motion.div>
                      
                      <motion.div 
                        className="absolute top-3 right-3"
                        initial={{ opacity: 0, scale: 0 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.div 
                          className="w-7 sm:w-8 h-7 sm:h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg border border-white/20"
                          whileHover={{ rotate: 180 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Heart className="text-white" size={12} />
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
                

                <div className="absolute top-0 left-0 w-20 sm:w-40 h-full bg-gradient-to-r from-black via-purple-950/90 to-transparent pointer-events-none z-10"></div>
                <div className="absolute top-0 right-0 w-20 sm:w-40 h-full bg-gradient-to-l from-black via-purple-950/90 to-transparent pointer-events-none z-10"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        <motion.div 
          ref={statsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 mb-16 sm:mb-24"
          variants={containerVariants}
          initial="hidden"
          animate={statsInView ? "visible" : "hidden"}
        >
          {[
            { number: "50K+", title: "Anime Titles", subtitle: "And growing daily", color: "from-pink-400 to-purple-400", hoverColor: "from-pink-500/10 to-purple-500/10" },
            { number: "1M+", title: "Active Users", subtitle: "Passionate fans worldwide", color: "from-cyan-400 to-blue-400", hoverColor: "from-cyan-500/10 to-blue-500/10" },
            { number: "99%", title: "Match Accuracy", subtitle: "AI-powered precision", color: "from-green-400 to-teal-400", hoverColor: "from-green-500/10 to-teal-500/10" }
          ].map((stat, i) => (
            <motion.div key={i} className="text-center group relative" variants={statsVariants}>
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-r ${stat.hoverColor} rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}
                whileHover={{ scale: 1.1 }}
              />
              <motion.div 
                className="relative bg-white/5 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-pink-400/30 transition-all duration-500"
                whileHover={{ y: -10, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className={`text-4xl sm:text-5xl md:text-7xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-4`}
                  variants={counterVariants}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {stat.number}
                </motion.div>
                <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-bold mb-2">{stat.title}</p>
                     <p className="text-white/60 text-sm sm:text-base">{stat.subtitle}</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="text-center relative flex flex-col items-center justify-center gap-6 sm:gap-8 mb-16 sm:mb-24"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/20 to-cyan-500/10 rounded-3xl blur-2xl animate-pulse"
            variants={pulseVariants}
            animate="animate"
          />
          <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl max-w-5xl">
            <motion.h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.7 }}
            >
              Ready to Find Your Perfect Anime?
            </motion.h2>
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.7 }}
            >
              Join millions of anime fans discovering their next favorite series with our 
              <span className="font-bold text-transparent bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text"> AI-powered recommendation engine</span>
            </motion.p>
            <div className="relative inline-block">
              <motion.div 
                className="absolute -inset-4 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 rounded-full blur-2xl opacity-70 animate-pulse"
                variants={pulseVariants}
                animate="animate"
              />
              <button
                onClick={handleGetStarted}
                className="group relative px-8 sm:px-12 md:px-16 lg:px-20 py-4 sm:py-6 md:py-8 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 rounded-full text-white font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl transform hover:scale-105 transition-all duration-700 shadow-2xl hover:shadow-pink-500/50 overflow-hidden border-2 border-white/20 hover:border-white/40"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"></div>
                <div className="relative flex items-center gap-3 sm:gap-4 justify-center">
                  <Search className="group-hover:rotate-12 transition-transform duration-700" size={24} />
                  <span>Start Discovering</span>
                  <ArrowRight className="group-hover:translate-x-2 transition-transform duration-700" size={24} />
                </div>
              </button>
            </div>
          </div>
        </motion.div>
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
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }
        
        .animate-scroll-right {
          animation: scroll-right 80s linear infinite;
        }
        
        .animate-scroll-left {
          animation: scroll-left 100s linear infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }

         .hover-pause:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
      );
}