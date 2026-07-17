import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col relative overflow-hidden">
      <Navbar />
      <main className="flex-grow max-w-[1000px] w-full mx-auto px-6 py-20 relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">Contact Us</h1>
        <p className="text-on-surface-variant text-lg mb-12">
          Have questions about QueueFlow? Want to schedule a demo for your clinic? We're here to help.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="flex flex-col gap-8">
            <div className="glass-panel p-8 rounded-xl border border-outline-variant/30">
              <h3 className="text-xl font-semibold text-white mb-6 uppercase tracking-wider">Get in Touch</h3>
              
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-white text-[24px]">mail</span>
                  <div>
                    <div className="text-sm text-on-surface-variant uppercase tracking-wider mb-1">Email Support</div>
                    <a href="mailto:support@queueflow.com" className="text-white hover:underline">support@queueflow.com</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-white text-[24px]">call</span>
                  <div>
                    <div className="text-sm text-on-surface-variant uppercase tracking-wider mb-1">Sales Inquiries</div>
                    <a href="tel:+919876543210" className="text-white hover:underline">+91 98765 43210</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-white text-[24px]">location_on</span>
                  <div>
                    <div className="text-sm text-on-surface-variant uppercase tracking-wider mb-1">Headquarters</div>
                    <span className="text-white">Tech Park, Outer Ring Road,<br/>Bengaluru, Karnataka 560103</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-panel p-8 rounded-xl border border-outline-variant/30">
            <h3 className="text-xl font-semibold text-white mb-6 uppercase tracking-wider">Send a Message</h3>
            
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-white text-[64px] mb-4">check_circle</span>
                <h4 className="text-2xl font-bold text-white mb-2">Message Sent!</h4>
                <p className="text-on-surface-variant">We will get back to you within 24 hours.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-8 gradient-btn px-6 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Full Name</label>
                  <input type="text" required className="input-field w-full rounded-lg px-4 py-3 text-base" placeholder="Dr. Jane Doe" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Work Email</label>
                  <input type="email" required className="input-field w-full rounded-lg px-4 py-3 text-base" placeholder="jane@clinic.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Clinic Size</label>
                  <select className="input-field w-full rounded-lg px-4 py-3 text-base appearance-none">
                    <option value="">Select size...</option>
                    <option value="1-5">1-5 Doctors</option>
                    <option value="6-20">6-20 Doctors</option>
                    <option value="21+">21+ Doctors / Hospital</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Message</label>
                  <textarea required rows="4" className="input-field w-full rounded-lg px-4 py-3 text-base resize-none" placeholder="How can we help you?"></textarea>
                </div>
                <button type="submit" className="btn-gradient w-full py-4 mt-2 rounded-lg text-sm font-semibold uppercase tracking-wider text-center cursor-pointer">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
