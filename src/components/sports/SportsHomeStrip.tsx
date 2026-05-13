import { Link } from "react-router-dom";
import { LiveMatchBanner } from "./LiveMatchBanner";
import { NextMatchCountdown } from "./NextMatchCountdown";
import { Trophy, ArrowRight } from "lucide-react";

export const SportsHomeStrip = () => {
  return (
    <section className="container mx-auto px-4 py-10 sm:py-16">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent font-bold">Sports</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black flex items-center gap-2 mt-1">
            <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-accent" /> KPL3 Tournament
          </h2>
        </div>
        <Link to="/sports" className="text-sm font-semibold text-accent hover:underline flex items-center gap-1">
          Open portal <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <LiveMatchBanner />
        <NextMatchCountdown />
      </div>
    </section>
  );
};
