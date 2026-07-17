import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-outline-variant/30 py-12 mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <Link to="/home" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
            <span className="material-symbols-outlined text-white text-3xl">all_inclusive</span>
            <span className="text-2xl font-bold tracking-tight text-white">QueueFlow</span>
          </Link>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Revolutionizing queue management and clinic flow with real-time tracking, seamless displays, and powerful analytics.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white font-semibold mb-2">Company</h4>
          <Link to="/about" className="text-on-surface-variant hover:text-white transition-colors text-sm">About Us</Link>
          <Link to="/contact" className="text-on-surface-variant hover:text-white transition-colors text-sm">Contact</Link>
          <a href="mailto:support@queueflow.com" className="text-on-surface-variant hover:text-primary transition-colors text-sm">
            Email Support
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-white font-semibold mb-2">Legal</h4>
          <Link to="/privacy" className="text-on-surface-variant hover:text-white transition-colors text-sm">Privacy Policy</Link>
          <Link to="#" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Terms of Service</Link>
          <Link to="#" className="text-on-surface-variant hover:text-primary transition-colors text-sm">Disclaimer</Link>
        </div>

        {/* Contact/Social */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white font-semibold mb-2">Connect</h4>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-primary/20 hover:text-primary transition-all">
              <span className="material-symbols-outlined text-[20px]">language</span>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-primary/20 hover:text-primary transition-all">
              <span className="material-symbols-outlined text-[20px]">share</span>
            </a>
          </div>
        </div>
      </div>
      
      <div className="max-w-[1440px] mx-auto px-6 mt-12 pt-8 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-on-surface-variant/60">
          © {new Date().getFullYear()} QueueFlow. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
