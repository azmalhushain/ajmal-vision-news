import { motion } from "framer-motion";

export const PageLoader = () => {
  const letters = "AJMAL AKHTAR AZAD".split("");
  
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden"
    >
      {/* Background animated circles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-primary/10"
            style={{
              width: `${(i + 1) * 200}px`,
              height: `${(i + 1) * 200}px`,
              left: "50%",
              top: "50%",
              x: "-50%",
              y: "-50%",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center gap-8 z-10">
        {/* Logo Container with glow effect */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="relative"
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/40 to-accent/40 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Logo circle */}
          <motion.div
            className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <motion.span
              className="text-3xl font-black text-primary-foreground"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              AAA
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Animated Logo Text */}
        <div className="flex flex-wrap justify-center gap-1 max-w-xs sm:max-w-none">
          {letters.map((letter, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: i * 0.05,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 2,
              }}
              className={`text-2xl sm:text-3xl font-black tracking-wider ${
                letter === " " ? "w-2" : "text-foreground"
              }`}
            >
              {letter}
            </motion.span>
          ))}
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-accent text-sm font-semibold tracking-[0.3em] uppercase"
        >
          Mayor • Bhokraha Narsingh
        </motion.p>

        {/* Modern wave loading bar */}
        <div className="relative w-64 h-1 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-accent to-primary"
            style={{ width: "40%" }}
            animate={{
              x: ["-100%", "300%"],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        </div>

        {/* Bouncing dots */}
        <div className="flex gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-gradient-to-br from-primary to-accent"
              animate={{
                y: [-8, 8, -8],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Loading text */}
        <motion.p
          className="text-xs text-muted-foreground tracking-widest"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          LOADING...
        </motion.p>
      </div>
    </motion.div>
  );
};