export interface Particle {
  angle: number;
  dist: number;
  size: number;
  color: string;
  delay: number;
}

export const LIKE_PARTICLES: readonly Particle[] = [
  { angle: 0, dist: 24, size: 3.5, color: "#f43f5e", delay: 0 },
  { angle: 45, dist: 28, size: 2.5, color: "#fb923c", delay: 20 },
  { angle: 90, dist: 24, size: 3, color: "#f43f5e", delay: 10 },
  { angle: 135, dist: 28, size: 2.5, color: "#e11d48", delay: 30 },
  { angle: 180, dist: 24, size: 3.5, color: "#fb7185", delay: 0 },
  { angle: 225, dist: 28, size: 2.5, color: "#fb923c", delay: 20 },
  { angle: 270, dist: 24, size: 3, color: "#f43f5e", delay: 10 },
  { angle: 315, dist: 28, size: 2.5, color: "#e11d48", delay: 30 },
  { angle: 22, dist: 32, size: 2, color: "#fda4af", delay: 40 },
  { angle: 112, dist: 32, size: 2, color: "#fda4af", delay: 40 },
  { angle: 202, dist: 32, size: 2, color: "#fda4af", delay: 40 },
  { angle: 292, dist: 32, size: 2, color: "#fda4af", delay: 40 },
];

export const SAVE_PARTICLES: readonly Particle[] = [
  { angle: 0, dist: 24, size: 3.5, color: "#3b82f6", delay: 0 },
  { angle: 45, dist: 28, size: 2.5, color: "#60a5fa", delay: 20 },
  { angle: 90, dist: 24, size: 3, color: "#2563eb", delay: 10 },
  { angle: 135, dist: 28, size: 2.5, color: "#93c5fd", delay: 30 },
  { angle: 180, dist: 24, size: 3.5, color: "#3b82f6", delay: 0 },
  { angle: 225, dist: 28, size: 2.5, color: "#60a5fa", delay: 20 },
  { angle: 270, dist: 24, size: 3, color: "#2563eb", delay: 10 },
  { angle: 315, dist: 28, size: 2.5, color: "#93c5fd", delay: 30 },
  { angle: 22, dist: 32, size: 2, color: "#bfdbfe", delay: 40 },
  { angle: 112, dist: 32, size: 2, color: "#bfdbfe", delay: 40 },
  { angle: 202, dist: 32, size: 2, color: "#bfdbfe", delay: 40 },
  { angle: 292, dist: 32, size: 2, color: "#bfdbfe", delay: 40 },
];
