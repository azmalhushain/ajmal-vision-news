import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background pt-20">
      <div className="text-center space-y-8 px-4">
        <h1 className="text-9xl font-black text-accent">404</h1>
        <h2 className="text-4xl font-bold text-foreground">Page Not Found</h2>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground transform hover:scale-105 transition-transform">
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
