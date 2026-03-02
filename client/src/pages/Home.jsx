import { Link } from "react-router-dom";
import { HiOutlineBookOpen, HiOutlineMicrophone, HiOutlineChatBubbleLeftRight, HiOutlineSparkles } from "react-icons/hi2";

const features = [
  {
    icon: HiOutlineBookOpen,
    title: "Upload Any Book",
    description: "Support for PDF, EPUB, and TXT formats. Drag and drop to get started.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: HiOutlineChatBubbleLeftRight,
    title: "Chat with Your Books",
    description: "Ask questions and get answers with exact page numbers and chapter references.",
    color: "from-primary-500 to-purple-500",
  },
  {
    icon: HiOutlineMicrophone,
    title: "Voice Interaction",
    description: "Talk to your book using Vapi AI voice assistant. Hands-free learning.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: HiOutlineSparkles,
    title: "Semantic Search",
    description: "AI-powered vector search finds the most relevant sections instantly.",
    color: "from-amber-500 to-orange-500",
  },
];

export default function Home() {
  return (
    <div className="page-container">
      {/* Hero */}
      <section className="text-center py-16 sm:py-24 fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-600/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-6">
          <HiOutlineSparkles className="w-4 h-4" />
          AI-Powered Book Intelligence
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
          <span className="bg-gradient-to-r from-white via-surface-50 to-surface-200 bg-clip-text text-transparent">
            Talk to Your Books
          </span>
          <br />
          <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
            Like Never Before
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-surface-200/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload any book and instantly interact through chat or voice.
          Get answers with precise page references and chapter citations, powered by AI.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/auth" className="btn-primary text-base px-8 py-3">
            Start for Free
          </Link>
          <a href="#features" className="btn-secondary text-base px-8 py-3">
            See How It Works
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
          Everything you need to{" "}
          <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
            understand any book
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="glass-card p-6 hover:border-white/10 transition-all duration-300 group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-surface-200/60 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
