import React, { useEffect, useState, useRef } from "react";
import { cn } from "../../lib/cn-merge";

interface ShimmeringGridProps {
  className?: string;
}

const ShimmeringGrid: React.FC<ShimmeringGridProps> = ({ className }) => {
  // We track the container dimensions to accurately exclude the center text area
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: 600,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const gridSize = dimensions.width <= 768 ? 30 : 60;
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  // Define an exclusion area based on the center text background (max-w-2xl + some buffer)
  const excludeWidth = dimensions.width <= 768 ? 320 : 720;
  // On mobile, text wraps and is significantly taller!
  const excludeHeight = dimensions.width <= 768 ? 280 : 350;

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none bg-white shimmering-container",
        className,
      )}
    >
      <style>{`
        .shimmering-container {
          --grid-size: 60px;
          --box-size: 58px;
          --line-thick: 2px;
        }

        @media (max-width: 768px) {
          .shimmering-container {
            --grid-size: 30px;
            --box-size: 29px;
            --line-thick: 1px;
          }
        }

        .shimmer-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(29, 78, 216, 0.08) var(--line-thick), transparent var(--line-thick)),
            linear-gradient(90deg, rgba(29, 78, 216, 0.08) var(--line-thick), transparent var(--line-thick));
          background-size: var(--grid-size) var(--grid-size);
        }
        
        @keyframes shimmer-pop-3d {
          0%, 100% { 
            opacity: 0; 
            transform: scale(0.95); 
          }
          45%, 55% { 
            opacity: 1; 
            transform: scale(1.05); 
          }
        }

        .accents {
          position: absolute;
          inset: 0;
        }

        .accent-box {
          position: absolute;
          width: var(--box-size);
          height: var(--box-size);
          background: #4f46e5;
          opacity: 0;
          border-radius: 0;
          transform-style: preserve-3d;
          animation: shimmer-pop-3d 6s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }

        .accent-box::before, .accent-box::after {
          content: "";
          position: absolute;
          z-index: -1;
        }

        .accent-box::before {
          top: 2px;
          right: -5px;
          width: 5px;
          height: 100%;
          background: linear-gradient(to right, #6366f1, transparent);
          transform: skewY(45deg);
        }

        .accent-box::after {
          bottom: -5px;
          left: 2px;
          width: 100%;
          height: 5px;
          background: linear-gradient(to bottom, #7c3aed, transparent);
          transform: skewX(45deg);
        }

        @media (max-width: 768px) {
          .accent-box::before {
            top: 1px;
            right: -3px;
            width: 3px;
          }
          .accent-box::after {
            bottom: -3px;
            left: 1px;
            height: 3px;
          }
        }
      `}</style>

      <div className="shimmer-grid" />

      <div className="accents relative w-full h-full">
        {Array.from({ length: 2500 }).map((_, i) => {
          const row = Math.floor(i / 50);
          const col = i % 50;

          // Density (increase it slightly for mobile since the screen is so much smaller)
          const isMobile = dimensions.width <= 768;
          const densityThreshold = isMobile ? 7 : 3;
          const shouldShow = (i * 19) % 83 < densityThreshold;
          if (!shouldShow) return null;

          const boxSize = gridSize;
          const boxLeft = col * gridSize;
          const boxTop = row * gridSize;

          // 1. Edge protection: Stop boxes from rendering if they touch or cross the container edges!
          // This fixes the issue where the final box looks "cutted due to height" (overflow hidden)
          if (
            boxLeft < 0 ||
            boxLeft + boxSize >= dimensions.width ||
            boxTop < 0 ||
            boxTop + boxSize >= dimensions.height
          ) {
            return null;
          }

          // Compute raw pixel center for this specific box
          const boxCX = boxLeft + boxSize / 2;
          const boxCY = boxTop + boxSize / 2;

          // If box center is inside the exclusion rectangle, don't render it
          const dx = Math.abs(boxCX - centerX);
          const dy = Math.abs(boxCY - centerY);

          if (dx < excludeWidth / 2 && dy < excludeHeight / 2) {
            return null;
          }

          return (
            <div
              key={i}
              className="accent-box"
              style={{
                top: `calc(${row} * var(--grid-size))`,
                left: `calc(${col} * var(--grid-size))`,
                animationDelay: `${(i % 15) * 0.4}s`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ShimmeringGrid;
