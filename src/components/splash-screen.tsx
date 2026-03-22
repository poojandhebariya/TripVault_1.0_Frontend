import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SplashScreen } from "@capacitor/splash-screen";

interface AppSplashProps {
  visible: boolean;
  onFinish: () => void;
}

const AppSplash = ({ visible, onFinish }: AppSplashProps) => {
  const didHide = useRef(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  // Hide the native Capacitor splash as soon as this component mounts
  // (WebView is now interactive, our React animation takes over)
  useEffect(() => {
    SplashScreen.hide({ fadeOutDuration: 200 }).catch(() => {
      // Not running in Capacitor (browser dev) — safe to ignore
    });
  }, []);

  // Drive the exit: stay visible for 2.2 s then fade out, notify parent
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      if (!didHide.current) {
        didHide.current = true;
        onFinish();
      }
    }, 3000);
    return () => clearTimeout(t);
  }, [visible, onFinish]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white"
        >
          {/* Animated gradient dot pattern background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.15]"
            style={{
              // This is the magic: it makes the dots completely invisible in the center
              // and fades them in towards the edges. Because the center has no dots,
              // your video's white background touches pure white, making borders vanish perfectly!
              maskImage:
                "radial-gradient(ellipse 65% 55% at 50% 50%, transparent 35%, black 70%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 65% 55% at 50% 50%, transparent 35%, black 70%)",
            }}
          >
            <motion.div
              className="w-full h-full"
              style={{
                background: "linear-gradient(135deg, #1D4ED8, #6B21A8)",
                maskImage:
                  "radial-gradient(circle at center, black 1.5px, transparent 2.5px)",
                WebkitMaskImage:
                  "radial-gradient(circle at center, black 1.5px, transparent 2.5px)",
                maskSize: "20px 20px",
                WebkitMaskSize: "20px 20px",
              }}
              animate={{ backgroundPosition: ["0px 0px", "-20px -20px"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Logo Video */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 1.0,
              ease: "easeOut",
              delay: 0.1, // Wait very briefly for native splash hide
            }}
          >
            <video
              src="/splash_logo.mp4"
              autoPlay
              muted
              playsInline
              controls={false}
              disablePictureInPicture
              disableRemotePlayback
              onLoadedData={() => setLogoLoaded(true)}
              poster="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
              className="relative w-[320px] h-auto pointer-events-none outline-none"
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="relative mt-3 text-[11px] tracking-[0.3em] uppercase font-medium"
            style={{ color: "rgba(75,85,99,0.75)" }}
            initial={{ opacity: 0, y: 8 }}
            animate={logoLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
          >
            Your journey, preserved.
          </motion.p>

          {/* Loading dots */}
          <motion.div
            className="relative flex gap-[6px] mt-10"
            initial={{ opacity: 0 }}
            animate={logoLoaded ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.9, duration: 0.4 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="block w-[7px] h-[7px] rounded-full"
                style={{ background: "rgba(29,78,216,0.8)" }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.2 + i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppSplash;
