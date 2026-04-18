import { motion } from "framer-motion";

export const PageLoader = () => {
  const letters = "AJMAL AKHTAR AZAD".split("");

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden"
    >
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 opacity-60">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/30 blur-[120px]"
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -80, 60, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-accent/30 blur-[120px]"
          animate={{
            x: [0, -120, 60, 0],
            y: [0, 80, -60, 0],
            scale: [1, 0.8, 1.3, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Concentric orbital rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-accent/20"
            style={{
              width: `${180 + i * 120}px`,
              height: `${180 + i * 120}px`,
            }}
            animate={{
              rotate: i % 2 === 0 ? 360 : -360,
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              rotate: { duration: 15 + i * 5, repeat: Infinity, ease: "linear" },
              opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <motion.div
              className="absolute w-2 h-2 rounded-full bg-accent shadow-[0_0_12px_hsl(var(--accent))]"
              style={{ top: -4, left: "50%", marginLeft: -4 }}
            />
          </motion.div>
        ))}
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-accent/60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center gap-8 z-10">
        {/* Logo container */}
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -180 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="relative"
        >
          {/* Outer pulse glow */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-accent to-primary blur-2xl"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Rotating gradient ring */}
          <motion.div
            className="absolute -inset-2 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          {/* Logo disc */}
          <div className="relative w-28 h-28 rounded-full bg-background flex items-center justify-center shadow-2xl border border-border">
            <motion.span
              className="text-4xl font-black bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              AAA
            </motion.span>
          </div>
        </motion.div>

        {/* Animated letters with staggered reveal */}
        <div className="flex flex-wrap justify-center gap-1 max-w-xs sm:max-w-none px-4">
          {letters.map((letter, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 30, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.3 + i * 0.04,
                type: "spring",
                stiffness: 120,
              }}
              className={`text-xl sm:text-2xl md:text-3xl font-black tracking-wider ${
                letter === " " ? "w-2" : "text-foreground"
              }`}
            >
              {letter}
            </motion.span>
          ))}
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-accent text-xs sm:text-sm font-semibold tracking-[0.4em] uppercase"
        >
          Mayor • Bhokraha Narsingh
        </motion.p>

        {/* Modern progress bar with shimmer */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="relative w-72 h-[3px] overflow-hidden rounded-full bg-muted"
        >
          <motion.div
            className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-accent to-transparent"
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
          />
        </motion.div>

        {/* Loading text with typing effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="flex items-center gap-2 text-xs text-muted-foreground tracking-[0.3em] uppercase"
        >
          <span>Loading</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                •
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
