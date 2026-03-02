"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CTAButtons from "./CTAButtons";
import SurveyForm from "./survey/SurveyForm";
import StatsDashboard from "./stats/StatsDashboard";
import { useSurveyState } from "./hooks/useSurveyState";
import { useCommunityStats } from "./hooks/useCommunityStats";
import type { SurveyAnswers } from "./survey/questions";

interface CommunitySectionProps {
  /** called when user clicks "Count Me In" CTA */
  onCountMeIn?: () => void;
}

export default function CommunitySection({ onCountMeIn }: CommunitySectionProps) {
  const { surveyRecord, hasSubmitted, loading: surveyLoading, saveSubmission } = useSurveyState();
  const { stats, loading: statsLoading, error: statsError, refetch } = useCommunityStats();
  const [showSurvey, setShowSurvey] = useState(false);

  const handleSubmit = async (answers: SurveyAnswers) => {
    // Save to IndexedDB (client-side)
    await saveSubmission(answers);
    // POST to API (server-side aggregation)
    try {
      await fetch("/api/community-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age_group: answers.age_group,
          gender: answers.gender || null,
          industry: answers.industry || null,
          platforms: answers.platforms,
          frequency: answers.frequency || null,
          discovery: answers.discovery || null,
          favorite_episode: answers.favorite_episode || null,
          message: answers.message || null,
          city: surveyRecord?.answers?.nickname ? undefined : (() => { try { const r = localStorage.getItem("acquired_lp_v1"); return r ? JSON.parse(r).city : null; } catch { return null; } })(),
          listener_since: (() => { try { const r = localStorage.getItem("acquired_lp_v1"); return r ? JSON.parse(r).entry_date : null; } catch { return null; } })(),
        }),
      });
      // Refresh stats after submission
      await refetch();
    } catch {
      // Silently fail — local data is saved regardless
    }
    setShowSurvey(false);
  };

  return (
    <section
      className="w-full px-4 py-16 md:py-20"
      style={{ background: "linear-gradient(180deg, transparent 0%, rgba(17,17,17,0.8) 100%)" }}
    >
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="h-px w-16" style={{ background: "rgba(251,191,36,0.35)" }} />
            <span className="text-xs tracking-[0.22em] uppercase font-semibold" style={{ color: "#fbbf24" }}>The Acquired Community</span>
            <span className="h-px w-16" style={{ background: "rgba(251,191,36,0.35)" }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            Engage in the Community
          </h2>
          {stats && stats.total > 0 && (
            <p className="text-zinc-400 text-base mb-6">
              <span className="font-semibold text-white">{stats.total.toLocaleString()}</span> listeners have shared their story
            </p>
          )}
          <CTAButtons
            showCountMeIn={!hasSubmitted && !surveyLoading}
            onCountMeIn={() => {
              if (onCountMeIn) {
                onCountMeIn();
              } else {
                setShowSurvey(true);
              }
            }}
          />
        </div>

        {/* Body: Survey Form OR Stats Dashboard */}
        <AnimatePresence mode="wait">
          {!hasSubmitted && showSurvey ? (
            <motion.div
              key="survey"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl p-6 md:p-10"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <SurveyForm onSubmit={handleSubmit} />
            </motion.div>
          ) : !hasSubmitted && !surveyLoading ? (
            <motion.div
              key="cta-prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Teaser preview */}
              <div className="rounded-2xl p-8 mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex flex-col items-center gap-3 mb-6">
                  <div className="flex gap-1 items-end h-7">
                    {[3, 5, 4, 7, 6, 4, 5].map((h, i) => (
                      <span key={i} className="w-2 rounded-sm" style={{ height: `${h * 4}px`, background: i === 3 ? "#39F9CD" : "rgba(57,249,205,0.3)" }} />
                    ))}
                  </div>
                  <h3 className="text-lg font-semibold text-white tracking-tight">Community Statistics Await</h3>
                  <p className="text-zinc-400 text-sm text-center max-w-sm">
                    Fill in the 2-minute survey to unlock community-driven statistics — see age breakdowns, top platforms, most-loved episodes, and how you compare with thousands of fellow listeners.
                  </p>
                </div>
                {/* Blurred stat cards as a teaser */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 select-none pointer-events-none">
                  {["Age Distribution", "Industry Breakdown", "Top Platforms", "Most Loved Episodes"].map(label => (
                    <div
                      key={label}
                      className="rounded-xl p-4 text-center blur-sm"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <div className="h-8 w-12 rounded mx-auto mb-2" style={{ background: "rgba(57,249,205,0.2)" }} />
                      <div className="text-xs text-zinc-500">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <button
                    onClick={() => setShowSurvey(true)}
                    title="Fill in the survey to unlock statistics"
                    className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-105 cursor-pointer"
                    style={{ background: "#39F9CD", color: "#000" }}
                  >
                    Unlock the Stats
                  </button>
                </div>
              </div>
            </motion.div>
          ) : hasSubmitted ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* "Your answers highlighted" banner */}
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3 mb-8 text-sm"
                style={{ background: "rgba(57,249,205,0.08)", border: "1px solid rgba(57,249,205,0.2)", color: "#39F9CD" }}
              >
                <span className="w-1 h-4 rounded-full shrink-0" style={{ background: "#39F9CD" }} />
                <span>Your answers are highlighted in the charts below.</span>
                <span className="ml-auto text-xs text-zinc-500">
                  Submitted {new Date(surveyRecord!.submittedAt).toLocaleDateString()}
                </span>
              </div>

              {statsLoading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin w-8 h-8 rounded-full border-2 border-zinc-700 border-t-teal-400" />
                </div>
              ) : statsError ? (
                <div className="text-center py-8">
                  <p className="text-zinc-500 text-sm">
                    Couldn't load community stats. <button onClick={refetch} className="underline hover:text-zinc-300">Retry</button>
                  </p>
                </div>
              ) : stats ? (
                <StatsDashboard stats={stats} userAnswers={surveyRecord?.answers} />
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>

      </div>
    </section>
  );
}
