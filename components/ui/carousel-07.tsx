"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
  type MotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Sparkles, ExternalLink, Play } from "lucide-react";

export interface Slide {
  image: string;
  title: string;
  description: string;
  badge: string;
  movieId?: number;
  rank?: number;
  data?: any;
}

const defaultSlides: Slide[] = [
  {
    image: "https://cdn.21st.dev/assets/mirror/c1/c1e7bf149d430fd5bd5aa6dd3aaebb771fbc95b3a7cd303851ed585fd838a7b9.webp",
    title: "Mountain Trek",
    description: "Scale new heights and embrace the hiker's journey.",
    badge: "Adventure",
  },
  {
    image: "https://cdn.21st.dev/assets/mirror/fa/fac14e3cb2b67d40c5f3a2a0e212d0c60c1fd0aff588e59bc80883e4aceb4eee.webp",
    title: "River Rafting",
    description: "Feel the adrenaline rush as you navigate the wild rapids.",
    badge: "Extreme",
  },
  {
    image: "https://cdn.21st.dev/assets/mirror/c1/c1e7bf149d430fd5bd5aa6dd3aaebb771fbc95b3a7cd303851ed585fd838a7b9.webp",
    title: "Forest Walk",
    description: "Deep dive into the silence of the ancient woods.",
    badge: "Nature",
  },
  {
    image: "https://cdn.21st.dev/assets/mirror/b4/b49b413f935303df7e05362b3530028b05c913cc039b44e25e491f12f9ba0015.webp",
    title: "Azure Beach",
    description: "Unwind on the crystal clear shores of a tropical paradise.",
    badge: "Paradise",
  },
  {
    image: "https://cdn.21st.dev/assets/mirror/84/84c0ff283758085418b1cd942706a764ffa0bf5a06312b415fc441fec23d22d6.webp",
    title: "Spiritual Path",
    description: "Discover inner peace through ancient wisdom.",
    badge: "Serenity",
  },
];

interface CarouselConfig {
  distanceDivisor: number;
  velocityDivisor: number;
  sensitivity: number;
  xMultiplier: number;
  yMultiplier: number;
  rotationMultiplier: number;
  scaleReduction: number;
}

const getCarouselConfig = (width: number): CarouselConfig => {
  if (width < 640) {
    return {
      distanceDivisor: 120,
      velocityDivisor: 500,
      sensitivity: 180,
      xMultiplier: 90,
      yMultiplier: 20,
      rotationMultiplier: 8,
      scaleReduction: 0.06,
    };
  }
  if (width < 1024) {
    return {
      distanceDivisor: 160,
      velocityDivisor: 650,
      sensitivity: 220,
      xMultiplier: 130,
      yMultiplier: 30,
      rotationMultiplier: 10,
      scaleReduction: 0.09,
    };
  }
  return {
    distanceDivisor: 200,
    velocityDivisor: 800,
    sensitivity: 250,
    xMultiplier: 170,
    yMultiplier: 40,
    rotationMultiplier: 12,
    scaleReduction: 0.12,
  };
};

export interface CarouselStackedProps {
  slides?: Slide[];
  onSelect?: (slide: Slide, index: number) => void;
  className?: string;
}

export const CarouselStacked = ({
  slides = defaultSlides,
  onSelect,
  className,
}: CarouselStackedProps) => {
  const activeSlides = slides && slides.length > 0 ? slides : defaultSlides;
  const scrollProgress = useMotionValue(0);
  const startProgress = React.useRef(0);
  const isDragging = React.useRef(false);
  const [windowWidth, setWindowWidth] = React.useState(0);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const total = activeSlides.length;

  React.useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Synchronize activeIndex with continuous scroll progress
  React.useEffect(() => {
    const unsubscribe = scrollProgress.on("change", (latest) => {
      const rounded = Math.round(latest);
      const idx = ((rounded % total) + total) % total;
      setActiveIndex(idx);
    });
    return () => unsubscribe();
  }, [scrollProgress, total]);

  const config = React.useMemo(
    () => getCarouselConfig(windowWidth),
    [windowWidth],
  );

  const navigateBy = (shift: number) => {
    const current = Math.round(scrollProgress.get());
    const target = current + shift;
    animate(scrollProgress, target, {
      type: "spring",
      stiffness: 200,
      damping: 30,
      mass: 1,
    });
  };

  const handleDragStart = () => {
    isDragging.current = true;
    startProgress.current = scrollProgress.get();
  };

  const handleDrag = (_: any, info: PanInfo) => {
    const delta = -info.delta.x / config.sensitivity;
    scrollProgress.set(scrollProgress.get() + delta);
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const dragDistance = info.offset.x;
    const velocity = info.velocity.x;

    const distanceShift = -dragDistance / config.distanceDivisor;
    const velocityShift = -velocity / config.velocityDivisor;

    let totalShift = Math.round(distanceShift + velocityShift);
    totalShift = Math.max(-3, Math.min(3, totalShift));

    const target = Math.round(startProgress.current) + totalShift;

    animate(scrollProgress, target, {
      type: "spring",
      stiffness: 200,
      damping: 30,
      mass: 1,
    });

    // If very small movement, treat as tap/click on active card
    if (Math.abs(info.offset.x) < 8 && Math.abs(info.offset.y) < 8) {
      const rounded = Math.round(scrollProgress.get());
      const idx = ((rounded % total) + total) % total;
      onSelect?.(activeSlides[idx], idx);
    }

    setTimeout(() => {
      isDragging.current = false;
    }, 150);
  };

  const currentSlide = activeSlides[activeIndex] || activeSlides[0];

  return (
    <div className={cn("flex flex-col items-center justify-center w-full py-4 select-none", className)}>
      <div className="relative w-full max-w-7xl h-80 sm:h-112 lg:h-[450px] flex items-center justify-center">
        {/* Transparent Drag Surface */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing"
        />

        {activeSlides.map((slide, i) => (
          <Card
            key={`${slide.title}-${i}`}
            slide={slide}
            index={i}
            total={total}
            progress={scrollProgress}
            config={config}
            isActive={i === activeIndex}
            onCardClick={() => {
              if (!isDragging.current) {
                onSelect?.(slide, i);
              }
            }}
          />
        ))}
      </div>

      {/* Control Bar & Movie Inspector Trigger */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between w-full max-w-2xl px-4 gap-4 z-20">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => navigateBy(-1)}
          aria-label="Previous movie"
          className="w-10 h-10 rounded-full bg-zinc-900/90 border border-zinc-700/80 hover:border-cyan-500/50 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Selected Movie Action Button */}
        <div className="flex flex-col items-center text-center">
          <div className="text-xs text-zinc-400 mb-1.5 flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Card {activeIndex + 1} of {total}</span>
          </div>

          <button
            type="button"
            onClick={() => onSelect?.(currentSlide, activeIndex)}
            className="group flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs sm:text-sm tracking-wide shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Open "{currentSlide?.title}" (Watch Trailer & Cast)</span>
            <ExternalLink className="w-4 h-4 text-black group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => navigateBy(1)}
          aria-label="Next movie"
          className="w-10 h-10 rounded-full bg-zinc-900/90 border border-zinc-700/80 hover:border-cyan-500/50 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

interface CardProps {
  slide: Slide;
  index: number;
  total: number;
  progress: MotionValue<number>;
  config: CarouselConfig;
  isActive: boolean;
  onCardClick?: () => void;
}

const Card = ({ slide, index, total, progress, config, isActive, onCardClick }: CardProps) => {
  const offset = useTransform(progress, (p) => {
    let diff = (index - p) % total;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  });

  const x = useTransform(offset, (o) => o * config.xMultiplier);
  const rotate = useTransform(offset, (o) => {
    const absO = Math.abs(o);
    if (absO < 0.05) return 0;
    return o * config.rotationMultiplier;
  });
  const y = useTransform(offset, (o) => {
    const absO = Math.abs(o);
    if (absO < 0.05) return 0;
    return absO * config.yMultiplier;
  });
  const scale = useTransform(
    offset,
    (o) => 1 - Math.abs(o) * config.scaleReduction,
  );
  const opacity = useTransform(
    offset,
    [-total / 2, -total / 2 + 0.5, 0, total / 2 - 0.5, total / 2],
    [0, 1, 1, 1, 0],
  );
  const zIndex = useTransform(offset, (o) =>
    Math.round(100 - Math.abs(o) * 10),
  );

  return (
    <motion.div
      style={{
        x,
        rotate,
        y,
        scale,
        opacity,
        zIndex,
      }}
      className={cn(
        "absolute rounded-2xl overflow-hidden bg-muted group pointer-events-none shadow-2xl border transition-colors duration-300",
        isActive 
          ? "border-cyan-400/60 ring-2 ring-cyan-500/30 shadow-cyan-500/15" 
          : "border-white/10",
        "w-48 h-64 sm:w-60 sm:h-84 lg:w-72 lg:h-[420px]",
      )}
    >
      <img
        src={slide.image}
        alt={slide.title}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-110"
      />

      <motion.div
        style={{
          opacity: useTransform(
            offset,
            [-2, -0.5, 0, 0.5, 2],
            [0.5, 0.2, 0, 0.2, 0.5],
          ),
        }}
        className="absolute inset-0 bg-black pointer-events-none"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

      {/* Match Badge */}
      <Badge className="absolute top-3 right-3 sm:top-5 sm:right-5 lg:top-6 lg:right-6 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-cyan-500/90 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-black shadow-lg">
        {slide.badge}
      </Badge>

      {/* Rank Badge */}
      {slide.rank && (
        <div className="absolute top-3 left-3 sm:top-5 sm:left-5 lg:top-6 lg:left-6 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center font-extrabold text-xs text-white shadow-lg">
          #{slide.rank}
        </div>
      )}

      {/* Active "Watch Trailer & Details" badge on center card */}
      {isActive && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3.5 py-2 rounded-full bg-cyan-500/90 backdrop-blur-md border border-cyan-300 text-xs font-bold text-black pointer-events-none shadow-xl flex items-center gap-1.5 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all">
          <Play className="w-3.5 h-3.5 fill-black" />
          <span>Watch Trailer & Details</span>
        </div>
      )}

      {/* Bottom Info Banner */}
      <div className="absolute bottom-5 left-3 right-3 sm:bottom-8 sm:left-5 sm:right-5 lg:bottom-8 lg:left-6 lg:right-6 text-white text-center sm:text-left pointer-events-none">
        <motion.p
          style={{
            opacity: useTransform(offset, [-0.5, 0, 0.5], [0, 1, 0]),
          }}
          className="text-base sm:text-lg lg:text-xl font-extrabold leading-tight mb-1 drop-shadow-md text-white line-clamp-1"
        >
          {slide.title}
        </motion.p>
        <motion.p
          style={{
            opacity: useTransform(offset, [-0.5, 0, 0.5], [0, 1, 0]),
          }}
          className="text-xs text-zinc-300 line-clamp-2 font-medium drop-shadow"
        >
          {slide.description}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default CarouselStacked;
