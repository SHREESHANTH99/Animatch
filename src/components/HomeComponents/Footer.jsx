import React, { useState, useEffect } from 'react';
import { Github, Linkedin, Instagram, Heart, ArrowUp, Mail, MapPin, Phone } from 'lucide-react';

const socialLinks = [
  {
    name: 'LinkedIn',
    icon: Linkedin,
    href: 'https://linkedin.com/in/',
    color: 'from-blue-400 to-blue-600',
    hoverColor: 'hover:shadow-blue-500/25',
    description: 'Professional Network'
  },
  {
    name: 'GitHub',
    icon: Github,
    href: 'https://github.com/SHREESHANTH99',
    color: 'from-gray-400 to-gray-600',
    hoverColor: 'hover:shadow-gray-500/25',
    description: 'Code Repository'
  },
  {
    name: 'Instagram',
    icon: Instagram,
    href: 'https://instagram.com/SHREESHANTH_99/',
    color: 'from-pink-400 to-purple-600',
    hoverColor: 'hover:shadow-pink-500/25',
    description: 'Visual Stories'
  }
];

const quickLinks = [
  { name: 'About'  },
  { name: 'Features'  },
  {name:'Pricing' },
  { name: 'Contact'}
];

const legalLinks = [
  { name: 'Privacy Policy'  },
  { name: 'Terms of Service' },
  { name: 'Cookie Policy' }
];

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="relative h-auto bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                AniMatch
              </div>
              <div className="ml-3 px-3 py-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full text-sm border border-pink-500/30">
                Beta
              </div>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-md">
              Your personalized anime hub powered by AI. Discover, track, and connect with fellow anime enthusiasts in a whole new way.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-gray-400">
                <Mail className="w-4 h-4 mr-3 text-pink-400" />
                <span>contact@animatch.com</span>
              </div>
              <div className="flex items-center text-gray-400">
                <MapPin className="w-4 h-4 mr-3 text-purple-400" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Phone className="w-4 h-4 mr-3 text-cyan-400" />
                <span>+91 (0) 123-456-7890</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-6 text-transparent bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-6 text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
              Legal
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700/50 flex flex-col justify-center items-center">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4 text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text">
              Connect With Us
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Follow our journey and stay updated with the latest anime recommendations, features, and community highlights.
            </p>
          </div>
          <div className="flex justify-center items-center space-x-8">
            {socialLinks.map((social, index) => (
              <SocialLink key={index} social={social} index={index} />
            ))}
          </div>
        </div>
        <div className="border-t border-gray-700/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center text-gray-400 mb-4 md:mb-0">
              <span>Made with</span>
              <Heart className="w-4 h-4 mx-2 text-red-400 animate-pulse" />
              <span>for the anime community</span>
            </div>
            
            <div className="text-gray-400 text-sm">
              © {currentYear} AniMatch. All rights reserved.
            </div>
          </div>
        </div>
      </div>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3 rounded-full shadow-2xl hover:shadow-pink-500/25 hover:scale-110 transition-all duration-300 z-50"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </footer>
  );
}

function SocialLink({ social, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = social.icon;

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a
        href={social.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`
          relative flex items-center justify-center w-16 h-16 rounded-2xl
          bg-gradient-to-r ${social.color} backdrop-blur-sm
          shadow-lg ${social.hoverColor} hover:shadow-2xl
          transform hover:scale-110 hover:-translate-y-2
          transition-all duration-500 ease-out
          border border-white/10 hover:border-white/20
        `}
        style={{
          animationDelay: `${index * 0.1}s`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Icon className="w-7 h-7 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" />
        {isHovered && (
          <div className="absolute inset-0 rounded-2xl bg-white/20 animate-ping" />
        )}
      </a>
      <div className={`
        absolute -top-12 left-1/2 transform -translate-x-1/2
        bg-gray-800 text-white px-3 py-2 rounded-lg text-sm
        opacity-0 group-hover:opacity-100 transition-opacity duration-300
        pointer-events-none whitespace-nowrap
      `}>
        <div className="text-center">
          <div className="font-medium">{social.name}</div>
          <div className="text-xs text-gray-400">{social.description}</div>
        </div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
      </div>
    </div>
  );
}