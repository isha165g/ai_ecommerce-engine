import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AuraShop - AI E-Commerce",
  description: "Intelligent shopping platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white antialiased selection:bg-purple-500/30`}>
        <nav className="fixed w-full z-50 top-0 border-b border-white/10 bg-black/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  AuraShop
                </Link>
              </div>
              <div className="flex space-x-6 items-center">
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">Dashboard</Link>
                <Link href="/login" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">Login</Link>
                <Link href="/register" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10">Sign Up</Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="pt-16 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
