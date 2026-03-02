"use client";
import React from "react";
import { FaSlack, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

interface CTAButtonsProps {
  showCountMeIn: boolean;
  onCountMeIn: () => void;
}

export default function CTAButtons({ showCountMeIn, onCountMeIn }: CTAButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <a
        href="https://acquired.fm/slack"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:scale-105"
        style={{ background: "#4A154B", color: "#fff" }}
      >
        <FaSlack className="text-base" />
        Join the Slack
      </a>
      <a
        href="https://acquired.fm/newsletter"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm border transition-all hover:scale-105"
        style={{ borderColor: "rgba(251,191,36,0.5)", color: "rgb(251,191,36)", background: "rgba(251,191,36,0.08)" }}
      >
        <FaEnvelope className="text-base" />
        Get Email Updates
      </a>
      {showCountMeIn && (
        <button
          onClick={onCountMeIn}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:scale-105"
          style={{ background: "#39F9CD", color: "#000" }}
        >
          <FaMapMarkerAlt className="text-base" />
          Count Me In
        </button>
      )}
    </div>
  );
}
