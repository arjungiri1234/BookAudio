import { useState } from "react";
import { HiOutlineMicrophone, HiOutlineStopCircle } from "react-icons/hi2";
import { startBookSession, stopSession, useVapiEvents } from "../services/vapiService";

export default function VoiceAssistant({ bookId, bookTitle }) {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | connecting | active | ended

  const handleStart = async () => {
    try {
      setStatus("connecting");
      await startBookSession(bookId, bookTitle);
      setIsActive(true);
      setStatus("active");
    } catch (err) {
      console.error("Failed to start voice session:", err);
      setStatus("idle");
    }
  };

  const handleStop = () => {
    stopSession();
    setIsActive(false);
    setStatus("ended");
    setTimeout(() => setStatus("idle"), 2000);
  };

  const statusText = {
    idle: "Click to start a voice conversation",
    connecting: "Connecting...",
    active: "Listening — ask your question",
    ended: "Session ended",
  };

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">🎙️ Voice Assistant</h2>
        <p className="text-surface-200/60 text-sm max-w-md">
          Have a natural conversation about "{bookTitle}". The AI will search the
          book and respond with precise references.
        </p>
      </div>

      {/* Mic Button */}
      <button
        id="voice-toggle-btn"
        onClick={isActive ? handleStop : handleStart}
        disabled={status === "connecting"}
        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
            ? "bg-red-500 hover:bg-red-400 animate-pulse-glow shadow-lg shadow-red-500/30"
            : "bg-primary-600 hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-600/30"
          } disabled:opacity-50`}
      >
        {isActive ? (
          <HiOutlineStopCircle className="w-10 h-10 text-white" />
        ) : (
          <HiOutlineMicrophone className="w-10 h-10 text-white" />
        )}

        {/* Pulse rings when active */}
        {isActive && (
          <>
            <span className="absolute inset-0 rounded-full border-2 border-red-400/30 animate-ping" />
            <span className="absolute -inset-3 rounded-full border border-red-400/10 animate-ping" style={{ animationDelay: "0.5s" }} />
          </>
        )}
      </button>

      <p className="mt-6 text-sm text-surface-200/50">{statusText[status]}</p>

      {status === "connecting" && (
        <div className="mt-4 w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      )}
    </div>
  );
}
