import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, Suspense, useState, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, Environment, OrbitControls, Stars, useGLTF } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Search, Newspaper, User, Mail } from "lucide-react";
import * as THREE from "three";
import { SEOHead } from "@/components/SEOHead";
import { GlobalSearch } from "@/components/GlobalSearch";

// Public-domain NASA astronaut model, served via jsDelivr CDN
const ASTRONAUT_GLB_URL =
  "https://cdn.jsdelivr.net/gh/nasa/NASA-3D-Resources@master/3D%20Models/Astronaut/Astronaut.glb";

const Astronaut = () => {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(ASTRONAUT_GLB_URL);

  // Clone so we don't mutate the cached scene, and enhance materials for realism
  const cloned = useMemo(() => {
    const s = scene.clone(true);
    s.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat && "roughness" in mat) {
          mat.envMapIntensity = 1.2;
          // Boost the visor / glass to look reflective if name hints
          const name = (mesh.name || "").toLowerCase();
          if (name.includes("visor") || name.includes("glass") || name.includes("helmet")) {
            mat.metalness = Math.max(mat.metalness ?? 0, 0.6);
            mat.roughness = Math.min(mat.roughness ?? 1, 0.15);
          }
        }
      }
    });
    return s;
  }, [scene]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.x = Math.sin(t * 0.4) * 0.18;
      group.current.rotation.y = t * 0.25;
      group.current.rotation.z = Math.cos(t * 0.35) * 0.12;
      group.current.position.y = Math.sin(t * 0.8) * 0.1;
      group.current.position.x = Math.cos(t * 0.5) * 0.06;
    }
  });

  return (
    <group ref={group} position={[0, -0.2, 0]} scale={1.6}>
      <primitive object={cloned} />
    </group>
  );
};

useGLTF.preload(ASTRONAUT_GLB_URL);


// Procedural Earth textures
const useEarthTextures = () => {
  return useMemo(() => {
    const size = 512;
    const colorCanvas = document.createElement("canvas");
    colorCanvas.width = size * 2;
    colorCanvas.height = size;
    const ctx = colorCanvas.getContext("2d")!;
    const grd = ctx.createLinearGradient(0, 0, 0, size);
    grd.addColorStop(0, "#0a3a6e");
    grd.addColorStop(0.5, "#1a5fa8");
    grd.addColorStop(1, "#0a3a6e");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, size * 2, size);

    const drawBlob = (cx: number, cy: number, r: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      const points = 24;
      for (let i = 0; i < points; i++) {
        const a = (i / points) * Math.PI * 2;
        const rr = r * (0.6 + Math.random() * 0.7);
        const x = cx + Math.cos(a) * rr;
        const y = cy + Math.sin(a) * rr * 0.7;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    };
    const continents = [
      { x: 200, y: 180, r: 120 },
      { x: 500, y: 220, r: 90 },
      { x: 750, y: 280, r: 150 },
      { x: 900, y: 150, r: 100 },
      { x: 100, y: 380, r: 70 },
      { x: 600, y: 380, r: 80 },
    ];
    continents.forEach((c) => {
      drawBlob(c.x, c.y, c.r, "#2f7a3a");
      for (let i = 0; i < 8; i++) {
        const ang = Math.random() * Math.PI * 2;
        const dx = c.x + Math.cos(ang) * c.r * 0.6;
        const dy = c.y + Math.sin(ang) * c.r * 0.5;
        drawBlob(dx, dy, c.r * 0.3, Math.random() > 0.5 ? "#3d8f4a" : "#876a3a");
      }
    });
    ctx.fillStyle = "#f5f8ff";
    ctx.fillRect(0, 0, size * 2, 30);
    ctx.fillRect(0, size - 30, size * 2, 30);

    const colorTex = new THREE.CanvasTexture(colorCanvas);
    colorTex.wrapS = THREE.RepeatWrapping;
    colorTex.anisotropy = 8;

    const cloudCanvas = document.createElement("canvas");
    cloudCanvas.width = size * 2;
    cloudCanvas.height = size;
    const cctx = cloudCanvas.getContext("2d")!;
    cctx.clearRect(0, 0, size * 2, size);
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * size * 2;
      const y = Math.random() * size;
      const r = 20 + Math.random() * 50;
      const g = cctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(255,255,255,0.85)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      cctx.fillStyle = g;
      cctx.beginPath();
      cctx.arc(x, y, r, 0, Math.PI * 2);
      cctx.fill();
    }
    const cloudTex = new THREE.CanvasTexture(cloudCanvas);
    cloudTex.wrapS = THREE.RepeatWrapping;
    cloudTex.anisotropy = 8;

    return { colorTex, cloudTex };
  }, []);
};

const Earth = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const { colorTex, cloudTex } = useEarthTextures();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (earthRef.current) earthRef.current.rotation.y = t * 0.08;
    if (cloudRef.current) cloudRef.current.rotation.y = t * 0.11;
  });

  return (
    <group position={[2.4, -1.5, -2.5]}>
      <mesh ref={earthRef} castShadow receiveShadow>
        <sphereGeometry args={[0.7, 96, 96]} />
        <meshStandardMaterial
          map={colorTex}
          roughness={0.9}
          metalness={0.05}
          emissive="#0a1a2a"
          emissiveIntensity={0.15}
        />
      </mesh>
      <mesh ref={cloudRef} scale={1.015}>
        <sphereGeometry args={[0.7, 64, 64]} />
        <meshStandardMaterial
          map={cloudTex}
          transparent
          opacity={0.7}
          depthWrite={false}
          roughness={1}
        />
      </mesh>
      <mesh scale={1.05}>
        <sphereGeometry args={[0.7, 48, 48]} />
        <meshBasicMaterial color="#6ab8ff" transparent opacity={0.18} side={THREE.BackSide} />
      </mesh>
      <mesh scale={1.18}>
        <sphereGeometry args={[0.7, 48, 48]} />
        <meshBasicMaterial color="#3a8fff" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
    </group>
  );
};

const QUICK_LINKS = [
  { to: "/news", label: "News", icon: Newspaper },
  { to: "/about", label: "About", icon: User },
  { to: "/contact", label: "Contact", icon: Mail },
];

// Pre-generate stars once so they don't reshuffle on every render
const STAR_LAYERS = [
  { count: 50, depth: 0.3, sizeMin: 0.5, sizeMax: 1.2 }, // far stars
  { count: 35, depth: 0.7, sizeMin: 1, sizeMax: 1.8 },   // mid
  { count: 20, depth: 1.4, sizeMin: 1.5, sizeMax: 2.5 }, // near
].map((layer) => ({
  ...layer,
  stars: Array.from({ length: layer.count }, () => ({
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: layer.sizeMin + Math.random() * (layer.sizeMax - layer.sizeMin),
    twinkleDuration: 2 + Math.random() * 3,
    twinkleDelay: Math.random() * 3,
  })),
}));

const StarLayer = ({
  stars,
  depth,
  mx,
  my,
}: {
  stars: { top: number; left: number; size: number; twinkleDuration: number; twinkleDelay: number }[];
  depth: number;
  mx: any;
  my: any;
}) => {
  const x = useTransform(mx, (v: number) => v * depth);
  const y = useTransform(my, (v: number) => v * depth);
  return (
    <motion.div className="absolute inset-0" style={{ x, y }}>
      {stars.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${s.size}px`,
            height: `${s.size}px`,
            top: `${s.top}%`,
            left: `${s.left}%`,
            boxShadow: s.size > 1.5 ? `0 0 ${s.size * 2}px rgba(255,255,255,0.6)` : undefined,
          }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            duration: s.twinkleDuration,
            repeat: Infinity,
            delay: s.twinkleDelay,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
};

const NotFound = () => {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    window.scrollTo(0, 0);
  }, [location.pathname]);

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

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      // Normalized -1..1, then scale to a small pixel offset (depth multiplier applied per layer)
      mouseX.set(((e.clientX - cx) / cx) * 20);
      mouseY.set(((e.clientY - cy) / cy) * 20);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  // Nebula parallax (subtle, opposite direction for depth)
  const nebulaX = useTransform(smoothX, (v) => v * -0.5);
  const nebulaY = useTransform(smoothY, (v) => v * -0.5);

  return (
    <>
      <SEOHead
        title="Page Not Found (404) — Ajmal Akhtar Azad"
        description="The page you're looking for doesn't exist. Explore our latest news, vision, gallery, or get in touch with the office of Mayor Ajmal Akhtar Azad."
        url="/404"
        noIndex
      />
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#02020a] via-[#0a0a2e] to-[#1a0b3d]">
        {/* Nebula glows (slow opposite-direction parallax) */}
        <motion.div className="pointer-events-none absolute inset-0" style={{ x: nebulaX, y: nebulaY }}>
          <div className="absolute -top-20 -left-20 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-3xl" />
          <div className="absolute top-1/3 -right-32 h-[600px] w-[600px] rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 h-[450px] w-[450px] rounded-full bg-fuchsia-600/15 blur-3xl" />
        </motion.div>

        {/* Parallax star layers */}
        {STAR_LAYERS.map((layer, i) => (
          <StarLayer
            key={i}
            stars={layer.stars}
            depth={layer.depth}
            mx={smoothX}
            my={smoothY}
          />
        ))}

        {/* Shooting stars */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px w-20 bg-gradient-to-r from-transparent via-white to-transparent"
              style={{ top: `${20 + i * 25}%`, left: "-10%" }}
              animate={{ x: ["0vw", "120vw"], opacity: [0, 1, 0] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 4 + 2,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20">
          <div className="relative w-full max-w-5xl">
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="pointer-events-none select-none text-center font-black tracking-tighter text-white/10"
              style={{
                fontSize: "clamp(180px, 32vw, 420px)",
                lineHeight: 1,
                textShadow: "0 8px 40px rgba(255,255,255,0.4)",
              }}
            >
              404
            </motion.h1>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-[55vh] w-[55vh] max-h-[480px] max-w-[480px]">
                <Canvas
                  camera={{ position: [0, 0.2, 4.2], fov: 45 }}
                  shadows
                  gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
                  dpr={[1, 2]}
                >
                  <Suspense fallback={null}>
                    <ambientLight intensity={0.3} />
                    {/* Sun-like key light */}
                    <directionalLight
                      position={[5, 4, 3]}
                      intensity={2.5}
                      color="#fff8e8"
                      castShadow
                      shadow-mapSize-width={1024}
                      shadow-mapSize-height={1024}
                    />
                    {/* Earth-shine fill */}
                    <directionalLight position={[-3, -1, -2]} intensity={0.5} color="#5fa8ff" />
                    {/* Rim light */}
                    <directionalLight position={[0, 2, -5]} intensity={0.6} color="#b88fff" />

                    <Stars radius={50} depth={30} count={2000} factor={3} saturation={0} fade speed={0.5} />

                    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.8}>
                      <Astronaut />
                    </Float>
                    <Earth />
                    <Sparkles count={80} scale={8} size={1.2} speed={0.2} color="#ffffff" />
                    <Environment preset="night" />
                    <OrbitControls
                      enableZoom={false}
                      enablePan={false}
                      autoRotate
                      autoRotateSpeed={0.5}
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
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Lost in space
            </h2>
            <p className="mt-3 text-base md:text-lg text-white/60 max-w-md mx-auto">
              This page drifted into the void. Let's get you back to safety...
            </p>

            <button
              onClick={() => setSearchOpen(true)}
              className="mt-6 mx-auto flex w-full max-w-md items-center gap-3 rounded-full border border-white/15 bg-white/5 backdrop-blur px-5 py-3 text-left text-white/60 shadow-lg transition hover:bg-white/10 hover:border-white/30"
              aria-label="Open search"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-sm">Search posts, podcasts, gallery...</span>
              <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-white/20 bg-white/5 px-1.5 text-[10px] font-medium">
                ⌘K
              </kbd>
            </button>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.history.back()}
                className="rounded-full backdrop-blur bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Go Back
              </Button>
              <Link to="/">
                <Button
                  size="lg"
                  className="rounded-full bg-white text-[#0a0a2e] hover:bg-white/90 shadow-lg"
                >
                  <Home className="mr-2 h-5 w-5" />
                  Back to Home
                </Button>
              </Link>
            </div>

            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-3">
                Popular pages
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to}>
                    <Button
                      variant="ghost"
                      className="rounded-full bg-white/5 backdrop-blur hover:bg-white/10 border border-white/10 text-white/80"
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
