import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  poster?: string;
}

export const VideoPlayerModal = ({
  isOpen,
  onClose,
  videoUrl,
  title,
  poster,
}: VideoPlayerModalProps) => {
  const isMobile = useIsMobile();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const getYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/
    );
    return match ? match[1] : null;
  };

  const isYouTube = getYouTubeId(videoUrl);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [isOpen]);

  // Track fullscreen state from the browser
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) videoRef.current.currentTime += seconds;
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
        // Lock orientation to landscape on mobile when supported.
        const orientation = (screen as unknown as {
          orientation?: { lock?: (o: string) => Promise<void> };
        }).orientation;
        if (isMobile && orientation?.lock) {
          orientation.lock("landscape").catch(() => {});
        }
      }
    } catch {
      /* ignore */
    }
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "p-0 bg-black overflow-hidden border-0 gap-0",
          // Mobile: edge-to-edge sheet with safe-area padding
          "max-sm:w-screen max-sm:h-[100dvh] max-sm:max-w-none max-sm:rounded-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:top-0 max-sm:left-0 max-sm:flex max-sm:flex-col",
          // Desktop: centered rounded modal
          "sm:max-w-5xl sm:w-full sm:rounded-2xl"
        )}
        style={{
          // Honor iOS notch / Android cutouts on mobile
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <DialogHeader className="absolute top-0 left-0 right-0 z-30 p-2 sm:p-4 bg-gradient-to-b from-black/85 to-transparent"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.5rem)" }}
        >
          <DialogTitle className="text-white pr-12 text-sm sm:text-lg line-clamp-1 sm:line-clamp-2 text-left">
            {title}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-2 top-2 sm:right-4 sm:top-4 text-white hover:bg-white/20 h-9 w-9 sm:h-10 sm:w-10 rounded-full"
            style={{ top: "calc(env(safe-area-inset-top) + 0.5rem)" }}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div
          ref={containerRef}
          className={cn(
            "video-player-container relative w-full bg-black",
            "max-sm:flex-1 max-sm:flex max-sm:items-center max-sm:justify-center",
            "sm:aspect-video"
          )}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
          onClick={isMobile ? handleMouseMove : undefined}
        >
          {isYouTube ? (
            <iframe
              src={`https://www.youtube.com/embed/${isYouTube}?autoplay=1&rel=0&playsinline=1`}
              className="w-full h-full max-sm:aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                poster={poster}
                playsInline
                className="w-full h-full object-contain bg-black max-sm:max-h-full"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onClick={togglePlay}
              />

              {/* Play/Pause Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                  <button
                    onClick={togglePlay}
                    className="pointer-events-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/90 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-2xl"
                    aria-label="Play"
                  >
                    <Play
                      className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground ml-1"
                      fill="currentColor"
                    />
                  </button>
                </div>
              )}

              {/* Controls */}
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300",
                  "px-3 pt-6 pb-3 sm:p-4",
                  showControls ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                style={{
                  paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)",
                  paddingLeft: "calc(env(safe-area-inset-left) + 0.75rem)",
                  paddingRight: "calc(env(safe-area-inset-right) + 0.75rem)",
                }}
              >
                {/* Progress Bar — full width */}
                <div className="mb-2 sm:mb-4 w-full">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="cursor-pointer w-full"
                  />
                  <div className="flex justify-between text-[10px] sm:text-xs text-white/80 mt-1 tabular-nums">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Control Buttons — full-width row on mobile */}
                <div className="flex items-center justify-between gap-1 sm:gap-2 w-full">
                  <div className="flex items-center gap-0.5 sm:gap-2 flex-1 min-w-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => skipTime(-10)}
                      className="text-white hover:bg-white/20 h-10 w-10 sm:h-10 sm:w-10 rounded-full"
                      aria-label="Back 10 seconds"
                    >
                      <SkipBack className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={togglePlay}
                      className="text-white hover:bg-white/20 h-11 w-11 sm:h-10 sm:w-10 rounded-full"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6" fill="currentColor" />
                      ) : (
                        <Play className="h-6 w-6" fill="currentColor" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => skipTime(10)}
                      className="text-white hover:bg-white/20 h-10 w-10 sm:h-10 sm:w-10 rounded-full"
                      aria-label="Forward 10 seconds"
                    >
                      <SkipForward className="h-5 w-5" />
                    </Button>

                    <div className="flex items-center gap-1 sm:gap-2 sm:ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMute}
                        className="text-white hover:bg-white/20 h-10 w-10 sm:h-10 sm:w-10 rounded-full"
                        aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? (
                          <VolumeX className="h-5 w-5" />
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </Button>
                      {/* Volume slider hidden on mobile (use device buttons) */}
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        max={1}
                        step={0.1}
                        onValueChange={handleVolumeChange}
                        className="w-24 cursor-pointer hidden sm:flex"
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20 h-10 w-10 sm:h-10 sm:w-10 rounded-full"
                    aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-5 w-5" />
                    ) : (
                      <Maximize2 className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
