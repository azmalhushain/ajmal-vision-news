import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, Suspense, useState } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, Environment, OrbitControls } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Search, Newspaper, User, Mail } from "lucide-react";
import * as THREE from "three";
import { SEOHead } from "@/components/SEOHead";
import { GlobalSearch } from "@/components/GlobalSearch";

const Astronaut = () => {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      // Gentle zero-gravity tumble
      group.current.rotation.x = Math.sin(t * 0.4) * 0.2;
      group.current.rotation.y = t * 0.3;
      group.current.rotation.z = Math.cos(t * 0.35) * 0.15;
      group.current.position.y = Math.sin(t * 0.8) * 0.12;
      group.current.position.x = Math.cos(t * 0.5) * 0.08;
    }
  });

  return (
    <group ref={group} position={[0, -0.2, 0]}>
      {/* Helmet — glass visor */}
      <mesh castShadow position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.55, 48, 48]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.05}
          metalness={0.1}
          transmission={0.6}
          thickness={0.4}
          clearcoat={1}
          clearcoatRoughness={0}
          envMapIntensity={1.5}
        />
      </mesh>
      {/* Visor tint — front */}
      <mesh position={[0, 0.85, 0.18]}>
        <sphereGeometry args={[0.42, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.6]} />
        <meshPhysicalMaterial
          color="#0a2540"
          roughness={0.1}
          metalness={0.8}
          clearcoat={1}
          envMapIntensity={2}
        />
      </mesh>
      {/* Helmet ring */}
      <mesh position={[0, 0.42, 0]}>
        <torusGeometry args={[0.42, 0.06, 16, 48]} />
        <meshStandardMaterial color="#d8d8e0" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Torso — suit */}
      <mesh castShadow position={[0, -0.05, 0]}>
        <capsuleGeometry args={[0.55, 0.5, 16, 32]} />
        <meshStandardMaterial color="#f2f3f7" roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Chest control panel */}
      <mesh position={[0, 0.05, 0.52]}>
        <boxGeometry args={[0.35, 0.22, 0.05]} />
        <meshStandardMaterial color="#1a2540" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[-0.08, 0.05, 0.56]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial emissive="#ff4a4a" emissiveIntensity={2} color="#ff4a4a" />
      </mesh>
      <mesh position={[0.08, 0.05, 0.56]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial emissive="#4aff7a" emissiveIntensity={2} color="#4aff7a" />
      </mesh>

      {/* Backpack */}
      <mesh position={[0, -0.05, -0.5]}>
        <boxGeometry args={[0.65, 0.7, 0.3]} />
        <meshStandardMaterial color="#e0e1e6" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.7, 0.05, 0.1]} rotation={[0.2, 0, 0.7]}>
        <capsuleGeometry args={[0.16, 0.55, 8, 16]} />
        <meshStandardMaterial color="#f2f3f7" roughness={0.7} />
      </mesh>
      <mesh position={[0.7, 0.05, -0.1]} rotation={[-0.3, 0, -0.5]}>
        <capsuleGeometry args={[0.16, 0.55, 8, 16]} />
        <meshStandardMaterial color="#f2f3f7" roughness={0.7} />
      </mesh>
      {/* Gloves */}
      <mesh position={[-0.95, -0.3, 0.25]}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial color="#c83a3a" roughness={0.6} />
      </mesh>
      <mesh position={[0.95, -0.25, -0.3]}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial color="#c83a3a" roughness={0.6} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.25, -0.75, 0]} rotation={[0.3, 0, 0.1]}>
        <capsuleGeometry args={[0.18, 0.55, 8, 16]} />
        <meshStandardMaterial color="#f2f3f7" roughness={0.7} />
      </mesh>
      <mesh position={[0.25, -0.75, 0]} rotation={[-0.2, 0, -0.1]}>
        <capsuleGeometry args={[0.18, 0.55, 8, 16]} />
        <meshStandardMaterial color="#f2f3f7" roughness={0.7} />
      </mesh>
      {/* Boots */}
      <mesh position={[-0.32, -1.15, 0.1]}>
        <boxGeometry args={[0.28, 0.18, 0.38]} />
        <meshStandardMaterial color="#2a3550" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0.32, -1.15, 0.05]}>
        <boxGeometry args={[0.28, 0.18, 0.38]} />
        <meshStandardMaterial color="#2a3550" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Flag patch on arm */}
      <mesh position={[-0.78, 0.15, 0.25]} rotation={[0, 0, 0.7]}>
        <planeGeometry args={[0.14, 0.1]} />
        <meshStandardMaterial color="#c83a3a" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const Earth = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.getElapsedTime() * 0.15;
  });
  return (
    <group position={[2.2, -1.4, -2]}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.55, 48, 48]} />
        <meshStandardMaterial
          color="#2a6fb8"
          roughness={0.7}
          emissive="#0a2540"
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* Continents — rough patches */}
      <mesh rotation={[0.3, 0.5, 0]}>
        <sphereGeometry args={[0.553, 32, 32]} />
        <meshStandardMaterial color="#3aa05a" transparent opacity={0.5} roughness={1} />
      </mesh>
      {/* Atmosphere glow */}
      <mesh scale={1.12}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshBasicMaterial color="#6ab8ff" transparent opacity={0.15} />
      </mesh>
    </group>
  );
};

const QUICK_LINKS = [
  { to: "/news", label: "News", icon: Newspaper },
  { to: "/about", label: "About", icon: User },
  { to: "/contact", label: "Contact", icon: Mail },
];

const NotFound = () => {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Open search with ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <SEOHead
        title="404 — Page Not Found | Ajmal Akhtar Azad"
        description="Oops, this page doesn't exist. Let's get you back somewhere familiar."
      />
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#bfe1ff] via-[#dcefff] to-[#f3f9ff] dark:from-[#0a1628] dark:via-[#0f2440] dark:to-[#1a3258]">
        {/* Soft cloud blobs */}
        <div className="pointer-events-none absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/40 dark:bg-white/5 blur-3xl"
              style={{
                width: `${180 + i * 40}px`,
                height: `${180 + i * 40}px`,
                top: `${(i * 17) % 80}%`,
                left: `${(i * 23) % 90}%`,
              }}
              animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 12 + i * 2, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20">
          {/* Giant 404 behind the 3D model */}
          <div className="relative w-full max-w-5xl">
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="pointer-events-none select-none text-center font-black tracking-tighter text-white/70 dark:text-white/10"
              style={{
                fontSize: "clamp(180px, 32vw, 420px)",
                lineHeight: 1,
                textShadow: "0 8px 40px rgba(255,255,255,0.4)",
              }}
            >
              404
            </motion.h1>

            {/* 3D Canvas overlaid */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-[55vh] w-[55vh] max-h-[480px] max-w-[480px]">
                <Canvas camera={{ position: [0, 0.2, 4.2], fov: 45 }} shadows>
                  <Suspense fallback={null}>
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[3, 5, 4]} intensity={1.2} castShadow />
                    <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#a5d8ff" />
                    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={1}>
                      <Astronaut />
                    </Float>
                    <Earth />
                    <Sparkles count={120} scale={10} size={1.5} speed={0.2} color="#ffffff" />
                    <Environment preset="night" />
                    <OrbitControls
                      enableZoom={false}
                      enablePan={false}
                      autoRotate
                      autoRotateSpeed={0.6}
                      minPolarAngle={Math.PI / 2.4}
                      maxPolarAngle={Math.PI / 1.8}
                    />
                  </Suspense>
                </Canvas>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-8 text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
              Oops, I think we're lost
            </h2>
            <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-md mx-auto">
              Let's get you back somewhere familiar...
            </p>

            {/* Search trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="mt-6 mx-auto flex w-full max-w-md items-center gap-3 rounded-full border border-foreground/15 bg-background/60 backdrop-blur px-5 py-3 text-left text-muted-foreground shadow-lg transition hover:bg-background/80 hover:border-foreground/30"
              aria-label="Open search"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-sm">Search posts, podcasts, gallery...</span>
              <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-foreground/20 bg-background/60 px-1.5 text-[10px] font-medium">
                ⌘K
              </kbd>
            </button>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.history.back()}
                className="rounded-full backdrop-blur bg-background/60 border-foreground/20 hover:bg-background/80"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Go Back
              </Button>
              <Link to="/">
                <Button
                  size="lg"
                  className="rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-lg"
                >
                  <Home className="mr-2 h-5 w-5" />
                  Back to Home
                </Button>
              </Link>
            </div>

            {/* Quick links */}
            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                Popular pages
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to}>
                    <Button
                      variant="ghost"
                      className="rounded-full bg-background/40 backdrop-blur hover:bg-background/70 border border-foreground/10"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default NotFound;
