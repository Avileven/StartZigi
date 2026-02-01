import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-white/10 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Logo - Back to Home */}
        <div className="mb-8">
          <Link href="/">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer">
              StartZig
            </span>
          </Link>
        </div>

        {/* Main Navigation Links */}
        <nav className="mb-6">
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-gray-400">
            <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
            <li><Link href="/why-startzig" className="hover:text-white transition-colors">Why StartZig</Link></li>
            <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
          </ul>
        </nav>

        {/* Legal Links */}
        <nav className="mb-8">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
            <li><Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacypolicy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/disclaimer" className="hover:text-gray-300 transition-colors">Disclaimer</Link></li>
          </ul>
        </nav>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/5">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} StartZig. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}