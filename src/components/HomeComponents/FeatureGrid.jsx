import React, { useState, useEffect } from 'react';

const features = [
  { 
    title: 'Track Your Watchlist', 
    desc: 'Organize anime by Watching, Completed, Dropped with smart progress tracking',
    href: '/watchlist',
    icon: '📺',
    gradient: 'from-purple-500 via-pink-500 to-red-500',
    particles: ['⭐', '🎬', '📖'],
    stats: '2.4K+ tracked'
  },
  { 
    title: 'AI Recommendations', 
    desc: 'Get personalized anime suggestions using advanced machine learning algorithms',
    href: '/AI',
    icon: '🧠',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    particles: ['🤖', '✨', '🔮'],
    stats: '95% accuracy'
  },
  { 
    title: 'Community Hub', 
    desc: 'Connect with fellow otaku, share reviews, and discover hidden gems together',
    href: '/Community',
    icon: '💬',
    gradient: 'from-orange-500 via-red-500 to-pink-500',
    particles: ['👥', '💭', '🌟'],
    stats: '50K+ members'
  },
];

export default function FeatureGrid() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative py-20 px-6 overflow-hidden">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Unlock Your Anime Universe
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Discover powerful features designed to enhance your anime journey
        </p>
      </div>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            feature={feature}
            index={index}
            isHovered={hoveredCard === index}
            onHover={() => setHoveredCard(index)}
            onLeave={() => setHoveredCard(null)}
            mousePosition={mousePosition}
          />
        ))}
      </div>

      
    </div>
  );
}

function FeatureCard({ feature, index, isHovered, onHover, onLeave, mousePosition }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (isHovered) {
      const newParticles = [...Array(6)].map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        emoji: feature.particles[Math.floor(Math.random() * feature.particles.length)],
        delay: Math.random() * 2
      }));
      setParticles(newParticles);
    }
  }, [isHovered, feature.particles]);

  return (
    <a href={feature.href} className="block group">
      <div
        className={`
          relative overflow-hidden p-8 rounded-2xl 
          backdrop-blur-md bg-white/10 border border-white/20
          shadow-2xl hover:shadow-3xl
          transform transition-all duration-700 ease-out
          hover:scale-105 hover:-translate-y-2
          ${isHovered ? 'ring-2 ring-white/30' : ''}
        `}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        style={{
          transform: isHovered ? 
            `perspective(1000px) rotateX(${(mousePosition.y - window.innerHeight/2) * 0.01}deg) rotateY(${(mousePosition.x - window.innerWidth/2) * 0.01}deg) scale(1.05) translateY(-8px)` :
            'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0px)'
        }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-80 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-60'}`} />
        
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
             style={{
               background: `conic-gradient(from ${index * 120}deg, transparent, rgba(255,255,255,0.2), transparent)`
             }} />

        {isHovered && particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute text-2xl pointer-events-none animate-bounce"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: '2s'
            }}
          >
            {particle.emoji}
          </div>
        ))}
        <div className="relative z-10">
          <div className="mb-6 relative">
            <div className={`text-6xl mb-4 transition-transform duration-500 ${isHovered ? 'scale-110 rotate-12' : 'scale-100'}`}>
              {feature.icon}
            </div>
            {isHovered && (
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
            )}
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-200 transition-colors duration-300">
            {feature.title}
          </h3>
          <p className="text-white/90 text-sm leading-relaxed mb-4 group-hover:text-white transition-colors duration-300">
            {feature.desc}
          </p>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
            {feature.stats}
          </div>
          <div className={`absolute bottom-6 right-6 transform transition-all duration-300 ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 ${isHovered ? 'translate-x-full' : '-translate-x-full'}`} 
             style={{ transitionDelay: '200ms' }} />
      </div>
    </a>
  );
}