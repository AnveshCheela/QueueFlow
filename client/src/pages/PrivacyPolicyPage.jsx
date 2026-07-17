import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col relative overflow-hidden">
      <Navbar />
      <main className="flex-grow max-w-[1000px] w-full mx-auto px-6 py-20 relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">Privacy Policy</h1>
        <p className="text-on-surface-variant text-sm uppercase tracking-widest mb-12 border-b border-outline-variant/30 pb-4">
          Last Updated: July 17, 2026
        </p>
        
        <div className="prose prose-invert max-w-none text-on-surface-variant text-lg leading-relaxed space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p>
              At QueueFlow, we take your privacy and the privacy of your patients incredibly seriously. This Privacy Policy outlines how we collect, use, and protect your information when you use our digital queue management SaaS platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Data We Collect</h2>
            <p className="mb-2">We collect information that you provide directly to us when you use the QueueFlow platform:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Clinic Information:</strong> Clinic name, address, contact details, and administrator account information.</li>
              <li><strong>Patient Queue Data:</strong> Names or identifiers entered into the queue system, token numbers, and service timestamps. (Note: We recommend clinics use first names or initials to maintain patient anonymity on public displays).</li>
              <li><strong>Usage Data:</strong> Analytics on system performance, wait times, and throughput to provide you with insights on your clinic's operational efficiency.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Data</h2>
            <p className="mb-2">We use the information we collect strictly to provide, maintain, and improve our services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To operate the real-time queue management system.</li>
              <li>To generate analytics and reports for your clinic's dashboard.</li>
              <li>To communicate with you regarding updates, security alerts, and support.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security & HIPAA Compliance</h2>
            <p>
              We implement state-of-the-art security measures to protect your data. While QueueFlow is designed as a workflow tool rather than an Electronic Health Record (EHR) system, we build our infrastructure to adhere to industry best practices for security and confidentiality in clinical settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@queueflow.com" className="text-white hover:underline">privacy@queueflow.com</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
