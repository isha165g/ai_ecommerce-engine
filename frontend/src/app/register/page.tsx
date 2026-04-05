"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://127.0.0.1:8000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name: fullName })
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } else {
      const data = await res.json();
      setError(data.detail || "Registration failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-gray-900 to-black px-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>
      <div className="absolute top-[20%] right-[-10%] w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>
      
      <div className="max-w-md w-full space-y-8 p-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl xl:shadow-2xl z-10 transition-all hover:border-white/20">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">Create Account</h2>
          <p className="mt-2 text-sm text-gray-400">Join the future of intelligent shopping.</p>
        </div>
        {success ? (
          <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 font-medium my-4 backdrop-blur-sm">
             Registration successful! Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleRegister} className="mt-8 space-y-6">
            <div className="space-y-4">
              <input name="fullName" type="text" className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all" placeholder="Full Name (Optional)" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <input name="email" type="email" required className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input name="password" type="password" required className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-red-400 text-sm font-medium text-center bg-red-900/20 border border-red-500/20 py-2 rounded-lg">{error}</p>}
            <button type="submit" className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:shadow-[0_0_25px_rgba(99,102,241,0.7)] focus:outline-none">Sign Up</button>
          </form>
        )}
        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account? <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold underline-offset-4 hover:underline transition-all">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
