import React, { useState, useEffect, useRef, useCallback } from "react";

const ThreeDImageCarousel = ({
  slides = [],
  itemCount = 5,
  autoplay = false,
  delay = 3,
  pauseOnHover = true,
  className = "",
}) => {
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const progressRef = useRef(null);
  const total = slides.length;

  // Responsive item count
  const visibleCount = windowWidth < 640 ? 1 : windowWidth < 1024 ? 3 : itemCount;

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
    setProgress(0);
  }, [total]);
  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + total) % total);
    setProgress(0);
  }, [total]);

  // Autoplay + progress bar
  useEffect(() => {
    if (!autoplay) return;
    clearInterval(progressRef.current);

    if (isPaused) return;

    const tickMs = 50; // update every 50ms
    const totalTicks = (delay * 1000) / tickMs;
    let tick = 0;

    progressRef.current = setInterval(() => {
      tick++;
      setProgress((tick / totalTicks) * 100);
      if (tick >= totalTicks) {
        tick = 0;
        setProgress(0);
        setCurrent((c) => (c + 1) % total);
      }
    }, tickMs);

    return () => clearInterval(progressRef.current);
  }, [autoplay, delay, isPaused, total]);

  const handleDragStart = (e) => {
    setIsDragging(true);
    setDragStart(e.touches ? e.touches[0].clientX : e.clientX);
  };
  const handleDragEnd = (e) => {
    if (!isDragging) return;
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    if (dragStart - endX > 40) next();
    else if (endX - dragStart > 40) prev();
    setIsDragging(false);
  };

  // Card dimensions by breakpoint
  const cardW = windowWidth < 640 ? Math.min(windowWidth - 80, 280) : windowWidth < 1024 ? 260 : 320;
  const cardH = windowWidth < 640 ? Math.round(cardW * 1.45) : windowWidth < 1024 ? 360 : 460;
  const trackH = cardH + 60;

  const getSlideStyle = (index) => {
    const half = Math.floor(visibleCount / 2);
    let offset = (index - current + total) % total;
    if (offset > total / 2) offset -= total;

    const visible = Math.abs(offset) <= half;
    if (!visible) return { display: "none" };

    const spread = windowWidth < 640 ? 0 : windowWidth < 1024 ? 200 : 280;
    const zIndex = half - Math.abs(offset) + 1;
    const scale = visibleCount === 1 ? 1 : 1 - Math.abs(offset) * 0.12;
    const translateX = offset * spread;
    const translateZ = -Math.abs(offset) * 80;
    const rotateY = offset * (visibleCount === 1 ? 0 : -14); // Softer, cleaner tilt
    const opacity = visibleCount === 1 ? 1 : 1 - Math.abs(offset) * 0.15;
    const brightness = visibleCount === 1 ? 1 : 1 - Math.abs(offset) * 0.25;

    return {
      zIndex,
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      filter: `brightness(${brightness})`,
      transition: "all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)", // Smoother, elegant snap
    };
  };

  if (!slides.length) return null;

  return (
    <div
      className={`relative w-full overflow-hidden select-none ${className}`}
      style={{ perspective: "1200px" }}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      onMouseDown={handleDragStart}
      onMouseUp={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchEnd={handleDragEnd}
    >
      {/* Track */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: `${trackH}px`, transformStyle: "preserve-3d" }}
      >
        {slides.map((slide, index) => {
          const style = getSlideStyle(index);
          if (style.display === "none") return null;
          
          let offset = (index - current + total) % total;
          if (offset > total / 2) offset -= total;
          const isCenter = offset === 0;

          return (
            <div
              key={slide.id}
              className="absolute cursor-pointer"
              style={{ ...style, width: `${cardW}px`, height: `${cardH}px` }}
              onClick={() => {
                if (offset === 0) return;
                if (offset <= total / 2 && offset > 0) { for (let i = 0; i < offset; i++) next(); }
                else { const back = total - offset; for (let i = 0; i < back; i++) prev(); }
              }}
            >
              <div className={`w-full h-full rounded-2xl overflow-hidden transition-all duration-700 relative border
                ${isCenter
                  ? "border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(230,57,70,0.3)] ring-1 ring-white/10"
                  : "border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                }`}>
                <img
                  src={slide.src}
                  alt={slide.title || `Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />

                {/* Subtle glass reflection on side cards */}
                {!isCenter && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.05] via-transparent to-black/40 pointer-events-none rounded-2xl" />
                )}

                {/* Center card elegant title gradient */}
                {isCenter && (
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080810]/95 via-[#080810]/40 to-transparent pointer-events-none opacity-90" />
                )}
                {isCenter && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 pb-5 sm:pb-8">
                    {slide.title && (
                      <h3 className="text-white font-black text-lg sm:text-2xl leading-tight line-clamp-2 drop-shadow-md mb-1.5">
                        {slide.title}
                      </h3>
                    )}
                    {slide.score && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-anigold-400 text-sm sm:text-base drop-shadow-md">★</span>
                        <span className="text-anigold-400 text-sm sm:text-base font-bold drop-shadow-md">{slide.score}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Prev / Next buttons */}
      <button
        onClick={prev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 w-9 h-9 sm:w-11 sm:h-11 bg-black/70 hover:bg-anicrimson-500 border border-white/20 hover:border-anicrimson-500 text-white rounded-full flex items-center justify-center text-lg sm:text-xl transition-all duration-200 backdrop-blur-sm"
        aria-label="Previous"
      >‹</button>
      <button
        onClick={next}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 w-9 h-9 sm:w-11 sm:h-11 bg-black/70 hover:bg-anicrimson-500 border border-white/20 hover:border-anicrimson-500 text-white rounded-full flex items-center justify-center text-lg sm:text-xl transition-all duration-200 backdrop-blur-sm"
        aria-label="Next"
      >›</button>

      {/* Progress Timer Bar */}
      {autoplay && (
        <div className="mx-auto mt-5 sm:mt-6 w-48 sm:w-64 h-[3px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-anicrimson-500 rounded-full transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-3 flex-wrap px-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-5 sm:w-6 h-2 bg-anicrimson-500"
                : "w-2 h-2 bg-white/25 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ThreeDImageCarousel;
