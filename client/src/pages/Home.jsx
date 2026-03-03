import { Link } from "react-router-dom";
import { useRef, useEffect } from "react";
import useAuthStore from "../store/authStore";
import gsap from "gsap";
import {
  HiOutlineBookOpen,
  HiOutlineMicrophone,
  HiOutlineChatBubbleLeftRight,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineClock,
} from "react-icons/hi2";

const features = [
  { icon: HiOutlineBookOpen, title: "Upload Any Book", description: "Support for PDF, EPUB, and TXT formats. Simply drag and drop.", color: "bg-orange-50 text-orange-600" },
  { icon: HiOutlineChatBubbleLeftRight, title: "Chat with Your Books", description: "Ask questions and get answers with exact page references.", color: "bg-amber-50 text-amber-600" },
  { icon: HiOutlineMicrophone, title: "Voice Interaction", description: "Talk to your books using voice. Hands-free learning.", color: "bg-rose-50 text-rose-500" },
  { icon: HiOutlineSparkles, title: "Semantic Search", description: "AI-powered search finds the most relevant sections instantly.", color: "bg-emerald-50 text-emerald-600" },
];

const steps = [
  { number: "01", title: "Upload Your Book", description: "Upload any PDF, EPUB, or TXT file. We'll process and index every page for you." },
  { number: "02", title: "AI Processes Content", description: "Our AI breaks down the book into smart chunks and creates semantic embeddings." },
  { number: "03", title: "Ask Anything", description: "Chat or talk to your book. Get precise answers with page & chapter references." },
];

const bookCovers = [
  { src: "/books/cover1.png", title: "Magic of Stars", rotate: -12, y: 20 },
  { src: "/books/cover2.png", title: "The Specter", rotate: -6, y: -10 },
  { src: "/books/cover3.png", title: "Unseen Pathways", rotate: 4, y: -10 },
  { src: "/books/cover4.png", title: "Reach for Stars", rotate: 12, y: 20 },
  { src: "/books/cover5.png", title: "Storm of Legends", rotate: 18, y: 40, hideOnMobile: true },
];

const exploreBooks = [
  { src: "/books/cover2.png", title: "The Final Revelation", author: "John Doe", duration: "3h 17m", parts: 8 },
  { src: "/books/cover1.png", title: "Rewriting the Future", author: "Jane Smith", duration: "2h 45m", parts: 6 },
  { src: "/books/cover3.png", title: "Temporal Anomalies", author: "Sarah Lee", duration: "4h 02m", parts: 10 },
  { src: "/books/cover5.png", title: "Into the Green", author: "Alex Chen", duration: "1h 58m", parts: 4 },
  { src: "/books/cover4.png", title: "The Silent Hours", author: "Maya Patel", duration: "3h 30m", parts: 7 },
  { src: "/books/cover6.png", title: "Kingdom of Ashes", author: "Nova Sterling", duration: "5h 12m", parts: 12 },
  { src: "/books/cover7.png", title: "Beyond the Void", author: "Marcus Wells", duration: "2h 38m", parts: 5 },
  { src: "/books/cover8.png", title: "Whispers in the Dark", author: "Elena Cross", duration: "3h 55m", parts: 9 },
  { src: "/books/cover1.png", title: "Midnight Cipher", author: "Kai Nakamura", duration: "4h 20m", parts: 8 },
  { src: "/books/cover3.png", title: "The Infinite Library", author: "Rose Harper", duration: "2h 10m", parts: 5 },
];

const newReleases = [
  { src: "/books/cover6.png", title: "Kingdom of Ashes", author: "Nova Sterling", duration: "5h 12m", parts: 12 },
  { src: "/books/cover7.png", title: "Beyond the Void", author: "Marcus Wells", duration: "2h 38m", parts: 5 },
  { src: "/books/cover8.png", title: "Whispers in the Dark", author: "Elena Cross", duration: "3h 55m", parts: 9 },
  { src: "/books/cover1.png", title: "The Silent Hours", author: "John Doe", duration: "25m 39s", parts: 4 },
  { src: "/books/cover5.png", title: "Whispers of the Wind", author: "Emma Smith", duration: "25m 35s", parts: 4 },
  { src: "/books/cover3.png", title: "La Ciudad Perdida", author: "John Doe", duration: "25m 36s", parts: 4 },
  { src: "/books/cover4.png", title: "Le Vent du Nord", author: "Liam Brown", duration: "25m 36s", parts: 4 },
  { src: "/books/cover2.png", title: "Echoes of Tomorrow", author: "John Doe", duration: "25m 36s", parts: 4 },
  { src: "/books/cover1.png", title: "Das Letzte Licht", author: "Sophia Williams", duration: "25m 36s", parts: 4 },
  { src: "/books/cover6.png", title: "Rising Embers", author: "Kai Nakamura", duration: "3h 48m", parts: 7 },
  { src: "/books/cover8.png", title: "The Last Frontier", author: "Rose Harper", duration: "4h 15m", parts: 9 },
  { src: "/books/cover7.png", title: "Starfall Chronicles", author: "Leo Rivera", duration: "2h 52m", parts: 6 },
];

export default function Home() {
  const scrollRef = useRef(null);
  const newReleasesRef = useRef(null);
  const heroRef = useRef(null);
  const booksRef = useRef([]);
  const { user } = useAuthStore();

  const scroll = (ref, dir) => {
    if (ref.current) {
      ref.current.scrollBy({ left: dir * 300, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-badge", { opacity: 0, y: 20, duration: 0.6 });

      tl.from(".hero-badge", { opacity: 0, y: 20, duration: 0.8 });

      tl.from(".hero-title", {
        opacity: 0, y: 30, scale: 0.95, duration: 1.2, ease: "power3.out"
      }, "-=0.4");

      tl.from(".hero-subtitle", { opacity: 0, y: 20, duration: 0.8 }, "-=0.6");

      tl.from(".hero-desc", { opacity: 0, y: 15, duration: 0.8 }, "-=0.5");

      tl.from(".hero-btn", {
        opacity: 0, y: 15, scale: 0.95,
        stagger: 0.12, duration: 0.5,
      }, "-=0.4");

      // Books — opacity only to avoid transform conflicts
      booksRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { opacity: 0 });
        tl.to(el, {
          opacity: 1, duration: 0.4, ease: "power2.out",
        }, i === 0 ? "-=0.3" : "-=0.25");
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="overflow-hidden">
      {/* ============ HERO ============ */}
      <section ref={heroRef} className="relative min-h-[85vh] sm:min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 pt-20 sm:pt-24 pb-10 sm:pb-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] sm:w-[700px] h-[400px] sm:h-[500px] bg-primary-200/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto mb-10 sm:mb-20">
          <p className="hero-badge text-[10px] sm:text-xs md:text-sm font-medium text-surface-500 tracking-[0.15em] sm:tracking-[0.3em] uppercase mb-4 sm:mb-8 font-sans">
            Your Personal Book Companion
          </p>

          <h1 className="hero-title font-script text-[3.5rem] sm:text-[6rem] md:text-[9.5rem] lg:text-[13rem] leading-[0.75] text-primary-800 mb-6 sm:mb-10 drop-shadow-sm -rotate-2 px-2 sm:px-4">
            BookAudio
          </h1>

          <p className="hero-subtitle text-xs sm:text-lg md:text-2xl lg:text-3xl text-surface-700 tracking-[0.1em] sm:tracking-[0.2em] md:tracking-[0.3em] uppercase font-light mb-6 sm:mb-10 font-sans px-2 sm:px-4">
            AI Voice Platform
          </p>

          <p className="hero-desc text-[10px] sm:text-xs md:text-sm text-surface-500 tracking-wider sm:tracking-widest uppercase mb-10 sm:mb-14 max-w-2xl mx-auto font-medium px-4 sm:px-6 leading-relaxed">
            An elegant platform to listen, chat, and interact with any book using conversational AI
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-6 sm:px-0">
            <Link
              to={user ? "/dashboard" : "/auth"}
              className="hero-btn group flex items-center justify-center gap-2 px-7 sm:px-8 py-3 sm:py-3.5 bg-primary-700 text-white font-medium rounded-full shadow-md hover:bg-primary-600 hover:shadow-lg transition-all duration-300 w-full sm:w-auto text-sm sm:text-base"
            >
              Get Started
              <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#explore"
              className="hero-btn flex items-center justify-center gap-2 px-7 sm:px-8 py-3 sm:py-3.5 bg-white border border-surface-300 text-surface-700 font-medium rounded-full hover:bg-surface-100 transition-all duration-300 shadow-sm w-full sm:w-auto text-sm sm:text-base"
            >
              Explore Books
            </a>
          </div>
        </div>

        {/* Book Covers */}
        <div className="relative z-10 w-full max-w-3xl mx-auto px-2">
          <div className="flex items-end justify-center gap-2 sm:gap-4 md:gap-5">
            {bookCovers.map((book, i) => (
              <div
                key={i}
                ref={(el) => (booksRef.current[i] = el)}
                className={`relative group cursor-pointer transition-all duration-500 hover:scale-110 hover:z-10 ${book.hideOnMobile ? "hidden sm:block" : ""}`}
                style={{ transform: `rotate(${book.rotate}deg) translateY(${book.y}px)` }}
              >
                <div className="w-[60px] sm:w-[90px] md:w-[130px] lg:w-[150px] aspect-[3/4] rounded-md sm:rounded-xl overflow-hidden shadow-xl border border-surface-300/30 group-hover:shadow-2xl transition-all duration-500">
                  <img src={book.src} alt={book.title} className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BOOK COLLECTION CAROUSEL ============ */}
      <section id="explore" className="py-14 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-surface-800 mb-2 sm:mb-3">
              Book Audio{" "}
              <span className="font-script font-normal text-primary-600 text-[1.15em]">Collection</span>
            </h2>
            <p className="text-surface-500 max-w-lg mx-auto text-sm sm:text-base px-4 sm:px-0">
              Discover captivating books — from thrilling fiction to educational insights.
            </p>
          </div>

          <div className="relative">
            <button onClick={() => scroll(scrollRef, -1)} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 sm:-translate-x-2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-surface-300 flex items-center justify-center text-surface-600 hover:bg-surface-100 transition-colors shadow-sm">
              <HiOutlineChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div ref={scrollRef} className="flex gap-3 sm:gap-5 overflow-x-auto pb-4 px-6 sm:px-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}>
              {exploreBooks.map((book, i) => (
                <div key={i} className="flex-shrink-0 w-[150px] sm:w-[200px] group cursor-pointer">
                  <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden mb-2 sm:mb-3 border border-surface-300/30 group-hover:border-primary-400 transition-all duration-300 shadow-md group-hover:shadow-lg">
                    <img src={book.src} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg bg-primary-700 text-white text-[9px] sm:text-[10px] font-bold">
                      {book.parts} Parts
                    </div>
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm text-surface-800 truncate group-hover:text-primary-700 transition-colors">{book.title}</h3>
                  <div className="flex items-center gap-2 sm:gap-3 mt-1 text-[10px] sm:text-xs text-surface-500">
                    <span>{book.author}</span>
                    <span className="flex items-center gap-1"><HiOutlineClock className="w-3 h-3" />{book.duration}</span>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => scroll(scrollRef, 1)} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 sm:translate-x-2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-surface-300 flex items-center justify-center text-surface-600 hover:bg-surface-100 transition-colors shadow-sm">
              <HiOutlineChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ============ NEW RELEASES GRID ============ */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-surface-800 mb-2 sm:mb-3">
              Explore New{" "}
              <span className="font-script font-normal text-primary-600 text-[1.15em]">Releases</span>
            </h2>
            <p className="text-surface-500 max-w-lg mx-auto text-sm sm:text-base">
              The latest AI-powered audiobooks — from inspiring stories to educational listens.
            </p>
          </div>

          <div className="relative">
            <button onClick={() => scroll(newReleasesRef, -1)} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 sm:-translate-x-2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-surface-300 flex items-center justify-center text-surface-600 hover:bg-surface-100 transition-colors shadow-sm">
              <HiOutlineChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div ref={newReleasesRef} className="flex gap-3 sm:gap-5 overflow-x-auto pb-4 px-6 sm:px-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}>
              {newReleases.map((book, i) => (
                <div key={i} className="flex-shrink-0 w-[150px] sm:w-[200px] group cursor-pointer">
                  <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden mb-2 sm:mb-3 border border-surface-300/30 group-hover:border-primary-400 transition-all duration-300 shadow-md group-hover:shadow-lg">
                    <img src={book.src} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg bg-primary-700 text-white text-[9px] sm:text-[10px] font-bold">
                      {book.parts} Parts
                    </div>
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm text-surface-800 truncate group-hover:text-primary-700 transition-colors">{book.title}</h3>
                  <div className="flex items-center gap-2 sm:gap-3 mt-1 text-[10px] sm:text-xs text-surface-500">
                    <span>{book.author}</span>
                    <span className="flex items-center gap-1"><HiOutlineClock className="w-3 h-3" />{book.duration}</span>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => scroll(newReleasesRef, 1)} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 sm:translate-x-2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-surface-300 flex items-center justify-center text-surface-600 hover:bg-surface-100 transition-colors shadow-sm">
              <HiOutlineChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-surface-800 mb-2 sm:mb-3">
              How It{" "}
              <span className="font-script font-normal text-primary-600 text-[1.15em]">Works</span>
            </h2>
            <p className="text-surface-500 max-w-lg mx-auto text-sm sm:text-base">Three simple steps to transform your reading experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative group text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t border-dashed border-surface-300" />
                )}
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-primary-50 border border-primary-200 mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
                  <span className="text-primary-700 font-display font-bold text-lg sm:text-xl">{step.number}</span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-surface-800 mb-2">{step.title}</h3>
                <p className="text-surface-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-center text-surface-800 mb-8 sm:mb-12">
            Everything you need to{" "}
            <span className="font-script font-normal text-primary-600 text-[1.1em]">understand any book</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {features.map((feature, i) => (
              <div key={i} className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/60 border border-surface-300 hover:border-primary-300 hover:bg-white transition-all duration-300 group shadow-sm hover:shadow-md">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${feature.color} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-surface-800 mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-surface-500 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-surface-800 mb-4 sm:mb-5">
            Ready to explore{" "}
            <span className="font-script font-normal text-primary-600 text-[1.15em]">your books</span>?
          </h2>
          <p className="text-surface-500 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
            Start your journey today. Upload a book and let AI do the rest.
          </p>
          <Link
            to={user ? "/dashboard" : "/auth"}
            className="group inline-flex items-center gap-2 px-8 sm:px-10 py-3.5 sm:py-4 bg-primary-700 text-white font-medium text-base sm:text-lg rounded-full shadow-md hover:bg-primary-600 hover:shadow-lg transition-all duration-300"
          >
            Start for Free
            <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <div className="h-8 sm:h-12" />
    </div>
  );
}
