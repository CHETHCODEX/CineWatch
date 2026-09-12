"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  CheckCircle2,
  X,
  ExternalLink,
  Copy,
  Check,
  Send,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieId: number;
  movieTitle: string;
}

const ISSUE_CATEGORIES = [
  {
    id: "Bad Recommendation",
    label: "Bad Recommendation",
    icon: "🎯",
    desc: "Does not match taste or prompt",
  },
  {
    id: "Broken Trailer",
    label: "Broken Trailer",
    icon: "🎬",
    desc: "Trailer video unavailable or wrong",
  },
  {
    id: "Metadata Error",
    label: "Metadata Error",
    icon: "🏷️",
    desc: "Incorrect cast, release year, or synopsis",
  },
  {
    id: "Wrong OTT Platform",
    label: "Wrong OTT Availability",
    icon: "📺",
    desc: "Listed streaming platform is wrong",
  },
  {
    id: "Content Request",
    label: "Content Request",
    icon: "💡",
    desc: "Request additional titles or seasons",
  },
  {
    id: "Other Issue",
    label: "Other Feedback",
    icon: "⚙️",
    desc: "General app or interface feedback",
  },
];

export default function ReportIssueModal({
  isOpen,
  onClose,
  movieId,
  movieTitle,
}: ReportIssueModalProps) {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(ISSUE_CATEGORIES[0].id);
  const [urgency, setUrgency] = useState<"1" | "2" | "3">("2");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  // Success result from ServiceNow API
  const [createdIncident, setCreatedIncident] = useState<{
    number: string;
    state: string;
    instance_url: string;
    source: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedCategory(ISSUE_CATEGORIES[0].id);
    setUrgency("2");
    setDescription("");
    setErrorMsg("");
    setCreatedIncident(null);
    setCopied(false);
    onClose();
  };

  const handleCopyTicket = (ticketNum: string) => {
    navigator.clipboard.writeText(ticketNum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg("Please provide a short description of the issue.");
      return;
    }

    setErrorMsg("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/servicenow/incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId,
          movieTitle,
          category: selectedCategory,
          urgency,
          description: description.trim(),
          userEmail: user?.email || "anonymous@cinewatch.ai",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to log incident");
      }

      setCreatedIncident({
        number: data.incident.number,
        state: data.incident.state,
        instance_url: data.incident.instance_url,
        source: data.source,
      });
    } catch (err: any) {
      console.error("Incident submission error:", err);
      setErrorMsg(err.message || "Failed to communicate with ServiceNow instance.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={handleReset}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl overflow-hidden p-6 sm:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleReset}
            className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top ServiceNow Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              ServiceNow ITSM Integration
            </span>
          </div>

          {!createdIncident ? (
            /* ---- Form View ---- */
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Report Issue / Feedback
              </h2>
              <p className="text-sm text-zinc-400 mt-1 mb-5">
                Regarding <span className="text-white font-medium">&quot;{movieTitle}&quot;</span>. A ticket will be created directly in ServiceNow.
              </p>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Issue Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ISSUE_CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`flex items-start gap-2.5 p-3 rounded-xl text-left transition-all border cursor-pointer ${
                            isSelected
                              ? "bg-cine-amber/15 border-cine-amber/50 text-white"
                              : "bg-zinc-900/60 border-white/5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                          }`}
                        >
                          <span className="text-lg leading-none">{cat.icon}</span>
                          <div>
                            <p className="text-xs font-semibold leading-tight text-zinc-200">
                              {cat.label}
                            </p>
                            <p className="text-[10px] text-zinc-500 leading-tight mt-0.5 line-clamp-1">
                              {cat.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Urgency
                  </label>
                  <div className="flex gap-2">
                    {[
                      { val: "3", label: "Low (P3)", color: "text-blue-400" },
                      { val: "2", label: "Medium (P2)", color: "text-amber-400" },
                      { val: "1", label: "High (P1)", color: "text-rose-400" },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setUrgency(item.val as "1" | "2" | "3")}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                          urgency === item.val
                            ? "bg-white/10 border-white/30 text-white"
                            : "bg-zinc-900/60 border-white/5 text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        <span className={urgency === item.val ? item.color : ""}>
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Description & Details
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about why the recommendation didn't fit, or describe the problem..."
                    className="w-full rounded-xl bg-zinc-900/80 border border-white/10 p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cine-amber/50 transition-colors resize-none"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-zinc-950 bg-cine-amber hover:bg-cine-amber/90 transition-all shadow-lg shadow-cine-amber/20 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Logging Incident...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit to ServiceNow
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ---- Success View ---- */
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Incident Successfully Logged!
              </h2>
              <p className="text-sm text-zinc-400 mt-1 max-w-sm mx-auto">
                Your feedback has been routed to the ServiceNow ITSM queue for triaging and resolution.
              </p>

              {/* Ticket Card */}
              <div className="mt-6 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-left">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                  <span className="text-xs uppercase font-mono tracking-wider text-zinc-400">
                    ServiceNow Incident Number
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    {createdIncident.state}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold text-cine-amber tracking-wider">
                    {createdIncident.number}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyTicket(createdIncident.number)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-zinc-500 mt-2">
                  Target: {movieTitle} | Category: {selectedCategory}
                </p>
              </div>

              {/* Action links */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                {createdIncident.instance_url && (
                  <a
                    href={createdIncident.instance_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-200 text-sm font-medium transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in ServiceNow PDI
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-xl bg-cine-amber text-zinc-950 hover:bg-cine-amber/90 text-sm font-semibold transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
