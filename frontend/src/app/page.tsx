import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-black relative overflow-hidden px-4">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/30 rounded-full mix-blend-screen filter blur-[128px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/30 rounded-full mix-blend-screen filter blur-[128px] animate-blob"></div>

      <div className="z-10 text-center max-w-4xl mx-auto space-y-8">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 pb-4">
          Intelligent <br /> Shopping Reimagined.
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
          Discover products tailored perfectly to your intent, budget, and lifestyle with our advanced AI recommendation engine.
        </p>
        
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/shop" className="px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Start Exploring
          </Link>
          <Link href="/register" className="px-8 py-4 rounded-full border border-white/20 text-white font-bold text-lg hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm">
            Join the Future
          </Link>
        </div>
      </div>
    </div>
  );
}
