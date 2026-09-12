"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  Tv,
  Film,
  ShoppingBag,
  ExternalLink,
  Globe,
  ShieldAlert,
  Info,
} from "lucide-react";
import type { WatchProvidersResponse, WatchProvider, CountryWatchProviders } from "@/types/movie";
import { getProviderLogoUrl } from "@/types/movie";

interface WhereToWatchProps {
  watchProviders?: WatchProvidersResponse;
  movieTitle: string;
  onReportWrongOtt?: () => void;
}

// Region names and display labels
const REGION_NAMES: Record<string, string> = {
  IN: "India",
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  JP: "Japan",
  BR: "Brazil",
};

export default function WhereToWatch({
  watchProviders,
  movieTitle,
  onReportWrongOtt,
}: WhereToWatchProps) {
  const results = watchProviders?.results ?? {};
  const availableCountries = useMemo(() => Object.keys(results), [results]);

  // Determine initial region: default to India (IN) if available, then US, then first available
  const initialRegion = useMemo(() => {
    if (results["IN"]) return "IN";
    if (results["US"]) return "US";
    return availableCountries[0] || "IN";
  }, [results, availableCountries]);

  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
  const [activeTab, setActiveTab] = useState<"flatrate" | "rent" | "buy">("flatrate");

  // Keep selectedRegion synced if results change
  const currentCountryData: CountryWatchProviders | undefined = results[selectedRegion];

  const streamProviders = currentCountryData?.flatrate ?? [];
  const rentProviders = currentCountryData?.rent ?? [];
  const buyProviders = currentCountryData?.buy ?? [];
  const freeProviders = currentCountryData?.free ?? [];
  const adsProviders = currentCountryData?.ads ?? [];

  // Combine flatrate + free + ads under "Stream"
  const allStreamProviders = useMemo(() => {
    const combined: WatchProvider[] = [...streamProviders, ...freeProviders, ...adsProviders];
    // deduplicate by provider_id
    const seen = new Set<number>();
    return combined.filter((p) => {
      if (seen.has(p.provider_id)) return false;
      seen.add(p.provider_id);
      return true;
    });
  }, [streamProviders, freeProviders, adsProviders]);

  // Determine counts for tabs
  const tabCounts = {
    flatrate: allStreamProviders.length,
    rent: rentProviders.length,
    buy: buyProviders.length,
  };

  // If currently active tab is empty but another has options, auto-select the one with options
  const displayedProviders = useMemo(() => {
    if (activeTab === "flatrate" && allStreamProviders.length > 0) return allStreamProviders;
    if (activeTab === "rent" && rentProviders.length > 0) return rentProviders;
    if (activeTab === "buy" && buyProviders.length > 0) return buyProviders;

    // Fallback to whichever has items
    if (allStreamProviders.length > 0) return allStreamProviders;
    if (rentProviders.length > 0) return rentProviders;
    if (buyProviders.length > 0) return buyProviders;
    return [];
  }, [activeTab, allStreamProviders, rentProviders, buyProviders]);

  const tmdbWatchLink = currentCountryData?.link;

  return (
    <motion.section
      id="where-to-watch"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.38, duration: 0.5 }}
      className="mt-12 scroll-mt-24 rounded-3xl bg-linear-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="absolute -top-16 -left-16 w-72 h-72 bg-cine-amber/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-cine-blue/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cine-amber/15 border border-cine-amber/30 flex items-center justify-center">
            <Tv className="w-5 h-5 text-cine-amber" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <span>Where to Watch</span>
              <span className="text-[11px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                OTT Availability
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified legal streaming, rental, and purchase platforms
            </p>
          </div>
        </div>

        {/* Region Selector */}
        {availableCountries.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Globe className="w-4 h-4 text-zinc-400 shrink-0" />
            <div className="relative">
              <select
                value={selectedRegion}
                aria-label="Select country for OTT availability"
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="appearance-none bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-700/80 hover:border-zinc-600 text-zinc-200 text-xs font-semibold py-2 pl-3 pr-8 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-cine-amber/40 transition-colors"
              >
                {/* Ensure IN and US appear at the top if present */}
                {["IN", "US", "GB", "CA", "AU"]
                  .filter((c) => availableCountries.includes(c))
                  .map((code) => (
                    <option key={code} value={code} className="bg-zinc-900 text-zinc-200">
                      {REGION_NAMES[code] || code} ({code})
                    </option>
                  ))}

                {/* Other countries */}
                {availableCountries
                  .filter((c) => !["IN", "US", "GB", "CA", "AU"].includes(c))
                  .sort()
                  .map((code) => (
                    <option key={code} value={code} className="bg-zinc-900 text-zinc-200">
                      {REGION_NAMES[code] || code} ({code})
                    </option>
                  ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-400 text-xs">
                ▾
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs: Stream / Rent / Buy */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-6 mb-6">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab("flatrate")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "flatrate"
                ? "bg-cine-amber text-zinc-950 shadow-md font-bold"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Stream</span>
            {tabCounts.flatrate > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeTab === "flatrate"
                    ? "bg-zinc-950/20 text-zinc-950"
                    : "bg-zinc-800 text-zinc-300"
                }`}
              >
                {tabCounts.flatrate}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rent")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "rent"
                ? "bg-cine-amber text-zinc-950 shadow-md font-bold"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Rent</span>
            {tabCounts.rent > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeTab === "rent"
                    ? "bg-zinc-950/20 text-zinc-950"
                    : "bg-zinc-800 text-zinc-300"
                }`}
              >
                {tabCounts.rent}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("buy")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "buy"
                ? "bg-cine-amber text-zinc-950 shadow-md font-bold"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Buy</span>
            {tabCounts.buy > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeTab === "buy"
                    ? "bg-zinc-950/20 text-zinc-950"
                    : "bg-zinc-800 text-zinc-300"
                }`}
              >
                {tabCounts.buy}
              </span>
            )}
          </button>
        </div>

        {/* Report Wrong OTT / ServiceNow Shortcut */}
        {onReportWrongOtt && (
          <button
            type="button"
            onClick={onReportWrongOtt}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
            title="Report inaccurate OTT platform data directly to ServiceNow ITSM"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Report Wrong OTT</span>
          </button>
        )}
      </div>

      {/* Provider List Grid */}
      <AnimatePresence mode="wait">
        {displayedProviders.length > 0 ? (
          <motion.div
            key={`${selectedRegion}-${activeTab}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5"
          >
            {displayedProviders.map((provider) => (
              <a
                key={provider.provider_id}
                href={tmdbWatchLink || `https://www.google.com/search?q=watch+${encodeURIComponent(movieTitle)}+on+${encodeURIComponent(provider.provider_name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-3 p-3 rounded-2xl bg-zinc-950/70 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-cine-amber/40 transition-all duration-300 shadow-md hover:shadow-cine-amber/5 hover:scale-[1.02] cursor-pointer"
              >
                {/* Logo */}
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 shrink-0 group-hover:border-cine-amber/50 transition-colors shadow-inner">
                  <Image
                    src={getProviderLogoUrl(provider.logo_path, "w92")}
                    alt={provider.provider_name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                {/* Name & Badge */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-zinc-200 group-hover:text-white truncate">
                    {provider.provider_name}
                  </p>
                  <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                    <span>
                      {activeTab === "flatrate" ? "Subscription" : activeTab === "rent" ? "Rent" : "Purchase"}
                    </span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-cine-amber transition-opacity shrink-0" />
                  </p>
                </div>
              </a>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={`empty-${selectedRegion}-${activeTab}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 text-center"
          >
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-3 text-zinc-500">
              <Info className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-zinc-300">
              No {activeTab === "flatrate" ? "streaming subscription" : activeTab === "rent" ? "rental" : "purchase"} options currently listed in {REGION_NAMES[selectedRegion] || selectedRegion}.
            </p>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              Check other tabs above, switch countries using the dropdown, or report missing availability to our ITSM queue.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Attribution & Verified Badge */}
      <div className="mt-6 pt-4 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400">
        <div className="flex items-center gap-2">
          <span>Streaming data powered by <strong>JustWatch</strong> via TMDB.</span>
          {tmdbWatchLink && (
            <a
              href={tmdbWatchLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cine-amber hover:underline inline-flex items-center gap-1"
            >
              <span>View all options</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <span className="text-zinc-400">
          Availability refreshed periodically &bull; Subject to OTT library changes
        </span>
      </div>
    </motion.section>
  );
}
