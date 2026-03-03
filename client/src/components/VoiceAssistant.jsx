import { useState, useRef, useCallback } from "react";
import { HiOutlineMicrophone, HiOutlineStopCircle } from "react-icons/hi2";
import api from "../services/api";
import {
  voiceOptions,
  voiceCategories,
  DEFAULT_VOICE,
} from "../config/vapiConfig";

export default function VoiceAssistant({ bookId, bookTitle }) {
  const [status, setStatus] = useState("idle"); // idle | listening | thinking | speaking
  const [selectedVoice, setSelectedVoice] = useState(DEFAULT_VOICE);
  const [transcript, setTranscript] = useState([]);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const transcriptEndRef = useRef(null);

  // Auto-scroll transcript
  const scrollToBottom = () => {
    setTimeout(() => {
      transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript((prev) => [
        ...prev,
        { role: "assistant", text: "Speech recognition is not supported in your browser. Please use Chrome or Edge." },
      ]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let final = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (recognitionRef.current) {
        recognitionRef.current._finalTranscript = final || interim;
      }
    };

    recognition.onend = async () => {
      const finalTranscript = recognitionRef.current?._finalTranscript || "";
      if (!finalTranscript.trim()) {
        setStatus("idle");
        return;
      }

      // Add user's message to transcript
      setTranscript((prev) => [...prev, { role: "user", text: finalTranscript }]);
      scrollToBottom();

      // Call our chat API (semantic search + Gemini)
      setStatus("thinking");
      try {
        const { data } = await api.post("/api/chat/query", {
          book_id: bookId,
          question: finalTranscript,
        });

        const answer = data.answer;

        // Add AI response to transcript
        setTranscript((prev) => [...prev, { role: "assistant", text: answer }]);
        scrollToBottom();

        // Speak the answer
        setStatus("speaking");
        synthRef.current.cancel(); // Cancel any previous speech
        const utterance = new SpeechSynthesisUtterance(answer);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Try to match a natural voice
        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(
          (v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("natural")
        ) || voices.find(
          (v) => v.lang.startsWith("en-US")
        );
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => setStatus("idle");
        utterance.onerror = () => setStatus("idle");
        synthRef.current.speak(utterance);
      } catch (err) {
        console.error("Chat API error:", err);
        setTranscript((prev) => [
          ...prev,
          { role: "assistant", text: "Sorry, something went wrong. Please try again." },
        ]);
        setStatus("idle");
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "aborted") {
        setStatus("idle");
      }
    };

    recognitionRef.current = recognition;
    recognitionRef.current._finalTranscript = "";
    recognition.start();
    setStatus("listening");
  }, [bookId]);

  const stopListening = () => {
    if (status === "listening" && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (status === "speaking") {
      synthRef.current.cancel();
      setStatus("idle");
    }
  };

  const isActive = status !== "idle";

  const statusConfig = {
    idle: { text: "Click the mic to start talking", color: "text-surface-500" },
    listening: { text: "Listening — speak your question...", color: "text-primary-600" },
    thinking: { text: "Searching the book & thinking...", color: "text-amber-600" },
    speaking: { text: "Speaking the answer...", color: "text-emerald-600" },
  };

  const allVoices = [...voiceCategories.female, ...voiceCategories.male];

  return (
    <div className="flex flex-col h-[60vh]">
      {/* Top section — voice selector + mic */}
      <div className="flex flex-col items-center text-center pt-2 pb-3 flex-shrink-0">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-surface-800 mb-1">🎙️ Voice Assistant</h2>
          <p className="text-surface-500 text-xs sm:text-sm max-w-md mx-auto">
            Talk about your book: "{bookTitle}" with AI. Tap the mic and ask anything about this book.
          </p>
        </div>

        {/* Voice Selector — visual only for now, ElevenLabs used when deployed */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-4 px-4">
          {allVoices.map((key) => {
            const voice = voiceOptions[key];
            const isSelected = selectedVoice === key;
            return (
              <button
                key={key}
                onClick={() => !isActive && setSelectedVoice(key)}
                disabled={isActive}
                title={voice.description}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${isSelected
                  ? "bg-primary-700 text-white shadow-md"
                  : "bg-surface-200 text-surface-600 hover:bg-surface-300"
                  } ${isActive ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {voice.name}
              </button>
            );
          })}
        </div>

        {/* Mic Button */}
        <button
          id="voice-toggle-btn"
          onClick={isActive ? stopListening : startListening}
          disabled={status === "thinking"}
          className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
            ? status === "speaking"
              ? "bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/30"
              : status === "thinking"
                ? "bg-amber-500 shadow-lg shadow-amber-500/30"
                : "bg-red-500 hover:bg-red-400 shadow-lg shadow-red-500/30"
            : "bg-primary-700 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-700/20"
            } disabled:opacity-50`}
        >
          {isActive ? (
            <HiOutlineStopCircle className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
          ) : (
            <HiOutlineMicrophone className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
          )}

          {status === "listening" && (
            <>
              <span className="absolute inset-0 rounded-full border-2 border-red-400/30 animate-ping" />
              <span className="absolute -inset-3 rounded-full border border-red-400/10 animate-ping" style={{ animationDelay: "0.5s" }} />
            </>
          )}

          {status === "thinking" && (
            <span className="absolute inset-0 rounded-full border-2 border-amber-300/30 border-t-amber-300 animate-spin" />
          )}
        </button>

        <p className={`mt-3 text-xs sm:text-sm ${statusConfig[status].color}`}>
          {statusConfig[status].text}
        </p>
      </div>

      {/* Scrollable transcript */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-2 space-y-2">
        {transcript.length === 0 && !isActive && (
          <p className="text-center text-surface-400 text-xs mt-4">
            Your conversation transcript will appear here.
          </p>
        )}

        {transcript.map((entry, i) => (
          <div
            key={i}
            className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm leading-relaxed ${entry.role === "user"
                ? "bg-primary-700 text-white rounded-br-md"
                : "bg-surface-200 text-surface-800 rounded-bl-md"
                }`}
            >
              {entry.text}
            </div>
          </div>
        ))}

        {status === "thinking" && (
          <div className="flex justify-start">
            <div className="bg-surface-200 rounded-2xl rounded-bl-md px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={transcriptEndRef} />
      </div>
    </div>
  );
}
