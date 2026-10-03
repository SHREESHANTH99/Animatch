import React, { useState, useEffect } from "react";

const features = [
  {
    title: "Track Your Watchlist",
    desc: "Organize anime by Watching, Completed, Dropped and Planned with smart progress tracking",
    href: "/library",
    icon: "📺",
    gradient: "from-anicrimson-500 to-aniteal-500",
    particles: ["⭐", "🎬", "📖"],
    stats: "2.4K+ tracked",
  },
  {
    title: "AI Recommendations",
    desc: "Get personalized anime suggestions using advanced machine learning algorithms",
    href: "/ai-recommendations",
    icon: "🧠",
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    particles: ["🤖", "✨", "🔮"],
    stats: "95% accuracy",
  },
  {
    title: "Community Hub",
    desc: "Connect with fellow otaku, share reviews, and discover hidden gems together",
    href: "/Community",
    icon: "💬",
    gradient: "from-anigold-500 to-anicrimson-500",
    particles: ["👥", "💭", "🌟"],
    stats: "50K+ members",
  },
];

export default function FeatureGrid() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative py-14 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="text-center mb-10 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-4">
          Unlock Your Anime Universe
        </h2>
        <div className="w-14 h-0.5 bg-anicrimson-500 mx-auto rounded-full mb-4" />
        <p className="text-base sm:text-xl text-white/50 max-w-2xl mx-auto px-2">
          Discover powerful features designed to enhance your anime journey
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 max-w-7xl mx-auto">
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
        delay: Math.random() * 2,
      }));
      setParticles(newParticles);
    }
  }, [isHovered, feature.particles]);

  return (
    <a href={feature.href} className="block group">
      <div
        className={`relative overflow-hidden p-6 sm:p-8 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl transform transition-all duration-500 ease-out hover:scale-[1.03] hover:-translate-y-1 ${isHovered ? "ring-2 ring-white/30" : ""}`}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateX(${(mousePosition.y - window.innerHeight / 2) * 0.008}deg) rotateY(${(mousePosition.x - window.innerWidth / 2) * 0.008}deg) scale(1.04) translateY(-6px)`
            : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0px)",
        }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-70 transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-60"}`} />

        {isHovered && particles.map((p) => (
          <div
            key={p.id}
            className="absolute text-xl pointer-events-none animate-bounce"
            style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${p.delay}s`, animationDuration: "2s" }}
          >
            {p.emoji}
          </div>
        ))}

        <div className="relative z-10">
          <div className="mb-5 sm:mb-6 relative">
            <div className={`text-5xl sm:text-6xl mb-3 sm:mb-4 transition-transform duration-500 ${isHovered ? "scale-110 rotate-12" : "scale-100"}`}>
              {feature.icon}
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 group-hover:text-yellow-200 transition-colors duration-300">
            {feature.title}
          </h3>
          <p className="text-white/90 text-sm leading-relaxed mb-4 group-hover:text-white transition-colors duration-300">
            {feature.desc}
          </p>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
            {feature.stats}
          </div>
          <div className={`absolute bottom-5 right-5 transform transition-all duration-300 ${isHovered ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}`}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </a>
  );
}
