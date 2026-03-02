"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import citiesData from "../data/cities.json";

type City = { name: string; lat: number; lng: number };
const allCities = citiesData as City[];

function getMonthYearOptions(): string[] {
  const now = new Date();
  const arr: string[] = [];
  for (let y = now.getFullYear(); y >= 2015; y--) {
    for (let m = 12; m >= 1; m--) {
      if (y === now.getFullYear() && m > now.getMonth() + 1) continue;
      arr.push(`${y}-${String(m).padStart(2, "0")}`);
    }
  }
  return arr;
}

const MONTH_OPTIONS = getMonthYearOptions();

export default function AddYourselfModal({
  open,
  onClose,
  onSubmit,
  initialCity,
  initialDate,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { city: string; entry_date: string }) => void;
  initialCity?: string;
  initialDate?: string;
}) {
  const [query, setQuery] = useState(initialCity ?? "");
  const [selectedCity, setSelectedCity] = useState<City | null>(
    initialCity ? (allCities.find(c => c.name === initialCity) ?? null) : null
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [entryDate, setEntryDate] = useState(initialDate ?? MONTH_OPTIONS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync autofill when props change (e.g. localStorage loads after first render)
  useEffect(() => {
    if (initialCity) {
      setQuery(initialCity);
      setSelectedCity(allCities.find(c => c.name === initialCity) ?? null);
    }
    if (initialDate) setEntryDate(initialDate);
  }, [initialCity, initialDate]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered =
    query.trim().length >= 1
      ? allCities
          .filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 8)
      : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectCity(city: City) {
    setSelectedCity(city);
    setQuery(city.name);
    setShowDropdown(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity) return;
    setSubmitting(true);
    await onSubmit({ city: selectedCity.name, entry_date: entryDate });
    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setQuery("");
      setSelectedCity(null);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.form
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white/80 dark:bg-zinc-900/90 rounded-xl shadow-2xl p-8 flex flex-col gap-4 backdrop-blur-lg"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onSubmit={handleSubmit}
          >
            <h2 className="text-xl font-bold mb-1">Count Me In</h2>
            <p className="text-xs text-zinc-400 mb-1">
              Add yourself to the Acquired Listener Universe. Your submission is anonymous — only your city and start
              date are recorded.
            </p>

            {/* Searchable city combobox */}
            <label className="text-sm font-medium">City</label>
            <p className="text-xs text-zinc-500 -mt-2">
              The list covers the top ~1,000 cities worldwide. If your hometown isn’t listed, pick the
              nearest large city.
            </p>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                className="w-full p-2 rounded bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white outline-none border border-transparent focus:border-blue-500 transition"
                placeholder="Search for a city…"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setSelectedCity(null);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                autoComplete="off"
                spellCheck={false}
              />
              <AnimatePresence>
                {showDropdown && filtered.length > 0 && (
                  <motion.div
                    ref={dropdownRef}
                    className="absolute left-0 right-0 top-full mt-1 z-60 rounded-lg bg-zinc-900 border border-white/10 shadow-xl overflow-hidden"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.12 }}
                  >
                    {filtered.map(city => (
                      <button
                        key={`${city.name}-${city.lat}`}
                        type="button"
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-700 transition"
                        onMouseDown={() => selectCity(city)}
                      >
                        {city.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Month-Year */}
            <label className="text-sm font-medium">Month-Year Started Listening</label>
            <select
              className="p-2 rounded bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white"
              value={entryDate}
              onChange={e => setEntryDate(e.target.value)}
              required
            >
              {MONTH_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <button
              type="submit"
              className="mt-4 px-4 py-2 rounded font-semibold transition disabled:opacity-60 text-black"
              style={{ backgroundColor: "#39F9CD" }}
              disabled={submitting || !selectedCity}
            >
              {submitting ? "Submitting…" : initialCity ? "Update My Pin" : "Count Me In"}
            </button>
            {success && <div className="text-green-500 text-center">Thank you!</div>}
          </motion.form>
        </>
      )}
    </AnimatePresence>
  );
}