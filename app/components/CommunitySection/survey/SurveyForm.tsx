"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SURVEY_QUESTIONS, EMPTY_ANSWERS, type SurveyAnswers } from "./questions";
import QuestionRenderer from "./QuestionRenderer";

interface SurveyFormProps {
  onSubmit: (answers: SurveyAnswers) => Promise<void>;
}

export default function SurveyForm({ onSubmit }: SurveyFormProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>({ ...EMPTY_ANSWERS });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [direction, setDirection] = useState(1);

  const total = SURVEY_QUESTIONS.length;
  const q = SURVEY_QUESTIONS[step];
  const progress = ((step + 1) / total) * 100;

  const currentValue = answers[q.id];

  const setAnswer = (val: string | string[]) => {
    setAnswers(prev => ({ ...prev, [q.id]: val }));
  };

  const canProceed = !q.required || (
    q.id === "platforms"
      ? (answers.platforms.length > 0)
      : !!answers[q.id]
  );

  const handleNext = () => {
    if (step < total - 1) {
      setDirection(1);
      setStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(answers);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16 gap-4 text-center"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 24 }}
      >
        <div className="flex items-center gap-4 mb-4">
          <span className="h-px w-14" style={{ background: "rgba(251,191,36,0.4)" }} />
          <span className="text-xs tracking-[0.2em] uppercase font-semibold" style={{ color: "#fbbf24" }}>On the Record</span>
          <span className="h-px w-14" style={{ background: "rgba(251,191,36,0.4)" }} />
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">You're in the community.</h3>
        <p className="text-zinc-400 text-sm max-w-xs">
          Your answers are saved. Scroll down to see how you compare with fellow listeners.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-zinc-500">
            Question {step + 1} of {total}
          </span>
          {!q.required && (
            <span className="text-xs text-zinc-600 italic">Optional</span>
          )}
        </div>
        <div className="h-1 rounded-full w-full" style={{ background: "rgba(255,255,255,0.08)" }}>
          <motion.div
            className="h-1 rounded-full"
            style={{ background: "#39F9CD" }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 28 }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="relative overflow-hidden min-h-[220px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: d * 60, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d * -60, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="w-full"
          >
            <h3 className="text-lg font-semibold text-white mb-1">{q.label}</h3>
            {q.hint && (
              <p className="text-xs text-zinc-500 mb-4">{q.hint}</p>
            )}
            <div className="mt-4">
              <QuestionRenderer
                question={q}
                value={currentValue}
                onChange={setAnswer}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 0}
          className="text-sm text-zinc-500 hover:text-zinc-300 transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ‹ Back
        </button>

        <div className="flex gap-2">
          {step < total - 1 ? (
            <>
              {!q.required && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="text-sm text-zinc-500 hover:text-zinc-400 transition px-3 py-1.5"
                >
                  Skip
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ background: "#39F9CD", color: "#000" }}
              >
                Next ›
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 disabled:opacity-60"
              style={{ background: "#39F9CD", color: "#000" }}
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
