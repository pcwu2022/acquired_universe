"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cities = [
  { name: "Taipei", lat: 25.0330, lng: 121.5654 },
  { name: "San Francisco", lat: 37.7749, lng: -122.4194 },
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "New York", lat: 40.7128, lng: -74.0060 },
  { name: "Tokyo", lat: 35.6895, lng: 139.6917 },
  // ...add more as needed
];

function getMonthYearOptions() {
  const now = new Date();
  const arr = [];
  for (let y = now.getFullYear(); y >= 2015; y--) {
    for (let m = 12; m >= 1; m--) {
      if (y === now.getFullYear() && m > now.getMonth() + 1) continue;
      arr.push(`${y}-${String(m).padStart(2, "0")}`);
    }
  }
  return arr;
}

export default function AddYourselfModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (data: { city: string; lat: number; lng: number; entry_date: string }) => void; }) {
  const [city, setCity] = useState(cities[0]);
  const [entryDate, setEntryDate] = useState(getMonthYearOptions()[0]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ city: city.name, lat: city.lat, lng: city.lng, entry_date: entryDate });
    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
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
            <h2 className="text-xl font-bold mb-2">Add Yourself</h2>
            <label className="text-sm font-medium">City</label>
            <select
              className="p-2 rounded bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white"
              value={city.name}
              onChange={e => setCity(cities.find(c => c.name === e.target.value) || cities[0])}
              required
            >
              {cities.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            <label className="text-sm font-medium">Month-Year Started Listening</label>
            <select
              className="p-2 rounded bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white"
              value={entryDate}
              onChange={e => setEntryDate(e.target.value)}
              required
            >
              {getMonthYearOptions().map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <button
              type="submit"
              className="mt-4 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
            {success && <div className="text-green-500 text-center">Thank you!</div>}
          </motion.form>
        </>
      )}
    </AnimatePresence>
  );
}
