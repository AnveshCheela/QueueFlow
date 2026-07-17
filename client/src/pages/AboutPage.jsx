import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col relative overflow-hidden">
      <Navbar />
      <main className="flex-grow max-w-[1000px] w-full mx-auto px-6 py-20 relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-8">About Us</h1>
        <div className="prose prose-invert max-w-none text-on-surface-variant text-lg leading-relaxed">
          <p className="mb-6">
            Welcome to QueueFlow. We are on a mission to eradicate waiting room chaos and bring clinical patient flow into the modern digital era.
          </p>
          <p className="mb-6">
            We solve the problem of stressed receptionists, confused patients repeatedly asking "when is it my turn?", and clinic managers lacking data on operational efficiency. Our vision is to provide a seamless, real-time queue management platform that elevates the patient experience, organizes clinical staff, and provides powerful analytics to reduce wait times and improve healthcare delivery.
          </p>
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Our Vision</h2>
          <p className="mb-6">
            To create a world where waiting for healthcare is as seamless and stress-free as the care itself. We believe that by empowering clinics with intelligent, digital-first tools, we can restore dignity to the waiting room and give medical professionals the peace of mind they need to focus on what matters most: patient care.
          </p>
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Our Commitment</h2>
          <p className="mb-6">
            QueueFlow is built on the principles of reliability, simplicity, and premium design. We understand that clinical environments are high-pressure, which is why our software is designed to be instantly intuitive, requiring zero technical training for staff, while providing world-class analytics for administrators.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
