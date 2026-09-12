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
import {
  Field,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldLabel,
  FieldDescription,
  FieldSeparator,
} from "@/components/ui/field-1";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieId: number;
  movieTitle: string;
}

export default function ReportIssueModal({
  isOpen,
  onClose,
  movieId,
  movieTitle,
}: ReportIssueModalProps) {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("Bad Recommendation");
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
    setSelectedCategory("Bad Recommendation");
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md"
        onClick={handleReset}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 sm:p-7"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleReset}
            className="absolute top-5 right-5 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer z-10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* ServiceNow ITSM Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              ServiceNow ITSM Integration
            </span>
          </div>

          {!createdIncident ? (
            /* ---- Form View using True shadcn Field Architecture ---- */
            <form onSubmit={handleSubmit} className="mt-3">
              <FieldGroup className="gap-5">
                <FieldSet>
                  <FieldLegend className="text-xl font-bold text-foreground">
                    Report Issue / Feedback
                  </FieldLegend>
                  <FieldDescription className="text-muted-foreground text-xs -mt-2">
                    Routing real-time feedback &amp; telemetry to ServiceNow ITSM
                  </FieldDescription>

                  {errorMsg && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <FieldGroup className="gap-4 mt-2">
                    {/* Target Movie Field */}
                    <Field>
                      <FieldLabel htmlFor="field-movie-title">
                        Target Title
                      </FieldLabel>
                      <Input
                        id="field-movie-title"
                        value={movieTitle}
                        readOnly
                        className="bg-zinc-900 border-zinc-800 text-zinc-300 font-medium cursor-not-allowed text-sm"
                      />
                    </Field>

                    {/* Category & Urgency in 2 cols */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="field-issue-category">
                          Issue Category
                        </FieldLabel>
                        <Select
                          value={selectedCategory}
                          onValueChange={setSelectedCategory}
                        >
                          <SelectTrigger id="field-issue-category" className="bg-zinc-900 border-zinc-800 text-foreground">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                            <SelectItem value="Bad Recommendation">
                              🎯 Bad Recommendation
                            </SelectItem>
                            <SelectItem value="Broken Trailer">
                              🎬 Broken Trailer
                            </SelectItem>
                            <SelectItem value="Metadata Error">
                              🏷️ Metadata Error
                            </SelectItem>
                            <SelectItem value="Wrong OTT Platform">
                              📺 Wrong OTT Availability
                            </SelectItem>
                            <SelectItem value="Content Request">
                              💡 Content Request
                            </SelectItem>
                            <SelectItem value="Other Issue">
                              ⚙️ Other Feedback
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FieldDescription>
                          Reason for ticket routing
                        </FieldDescription>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="field-issue-urgency">
                          Urgency / SLA
                        </FieldLabel>
                        <Select
                          value={urgency}
                          onValueChange={(val) => setUrgency(val as "1" | "2" | "3")}
                        >
                          <SelectTrigger id="field-issue-urgency" className="bg-zinc-900 border-zinc-800 text-foreground">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                            <SelectItem value="3">
                              Low (P3 - Standard)
                            </SelectItem>
                            <SelectItem value="2">
                              Medium (P2 - Elevated)
                            </SelectItem>
                            <SelectItem value="1">
                              High (P1 - Urgent)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FieldDescription>
                          ServiceNow queue priority
                        </FieldDescription>
                      </Field>
                    </div>

                    {/* Details Field */}
                    <Field>
                      <FieldLabel htmlFor="field-issue-desc">
                        Description &amp; Context
                      </FieldLabel>
                      <Textarea
                        id="field-issue-desc"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Recommended because of Interstellar, but felt too slow-paced and lacked sci-fi depth..."
                        className="bg-zinc-900 border-zinc-800 text-foreground placeholder:text-muted-foreground resize-none text-sm"
                        required
                      />
                      <FieldDescription>
                        Explain why this title missed the mark or describe the bug
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                </FieldSet>

                <FieldSeparator>ServiceNow Incident Metadata</FieldSeparator>

                <FieldSet>
                  <FieldGroup>
                    <Field orientation="horizontal">
                      <Checkbox
                        id="field-attach-telemetry"
                        defaultChecked
                      />
                      <FieldLabel
                        htmlFor="field-attach-telemetry"
                        className="font-normal text-xs text-muted-foreground"
                      >
                        Attach viewer telemetry &amp; caller email ({user?.email || "anonymous viewer"})
                      </FieldLabel>
                    </Field>
                  </FieldGroup>
                </FieldSet>

                <FieldSeparator />

                {/* Form Action Buttons */}
                <Field orientation="horizontal" className="justify-end gap-3 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="border-zinc-800 hover:bg-zinc-900 text-zinc-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-cine-amber text-zinc-950 hover:bg-cine-amber/90 font-semibold shadow-md shadow-cine-amber/20 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Logging Incident...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit to ServiceNow
                      </>
                    )}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
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
                Your report has been routed to the ServiceNow ITSM incident queue for triaging.
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
                <Button
                  type="button"
                  onClick={handleReset}
                  className="bg-cine-amber text-zinc-950 hover:bg-cine-amber/90 font-semibold"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
