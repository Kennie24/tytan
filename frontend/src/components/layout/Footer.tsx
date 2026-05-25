"use client";

import React, { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      alert("Please agree to the data collection consent.");
      return;
    }
    // Handle newsletter subscription
    console.log("Subscribed:", email);
    alert(`Thank you for signing up with: ${email}`);
    setEmail("");
    setConsent(false);
  };

  return (
    <footer className="w-full flex flex-col min-h-screen justify-between pt-20 bg-black text-white" data-purpose="footer-container">
      {/* Top Section (Newsletter & Links) */}
      <div className="max-w-[1600px] mx-auto w-full px-8 md:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 border-b border-gray-800/30 pb-20">
        
        {/* Newsletter Column */}
        <div className="lg:col-span-6" data-purpose="newsletter-block">
          <h2 className="text-4xl md:text-5xl font-medium mb-10 leading-tight">
            Sign up now and<br />stay inspired!
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
            <div className="relative group">
              {/* Icon */}
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                </svg>
              </div>
              {/* Input */}
              <input
                className="w-full bg-brand-dark/50 border border-gray-800 rounded-lg py-4 pl-12 pr-32 focus:ring-1 focus:ring-gray-600 focus:border-gray-600 transition-all text-sm placeholder-gray-600 text-white outline-none"
                placeholder="Your Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {/* Button */}
              <button className="absolute right-2 top-2 bottom-2 px-6 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-md text-xs transition-colors uppercase tracking-wider cursor-pointer" type="submit">
                Get Started
              </button>
            </div>
            {/* Consent Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                className="mt-1 rounded bg-black border-gray-800 text-zinc-700 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span className="text-xs text-gray-500 leading-normal">
                I agree that my submitted data is being <span className="text-[#1DB954] underline decoration-[#1DB954]/50">collected and stored</span>.
              </span>
            </label>
          </form>
        </div>
        
        {/* Contact Info Column */}
        <div className="lg:col-span-3 lg:border-l lg:border-gray-800/50 lg:pl-12" data-purpose="contact-block">
          <h3 className="text-lg font-medium mb-6">Let's work together</h3>
          <div className="space-y-2">
            <p className="text-gray-400 text-sm tracking-wide">+1 (555) 000-TYTAN</p>
            <a className="text-gray-400 text-sm hover:text-[#1DB954] transition-colors block" href="mailto:bookings@tytantakuba.com">bookings@tytantakuba.com</a>
          </div>
        </div>

        {/* Useful Links Column */}
        <div className="lg:col-span-3 lg:border-l lg:border-gray-800/50 lg:pl-12" data-purpose="links-block">
          <h3 className="text-lg font-medium mb-6">Useful links</h3>
          <ul className="flex flex-col gap-3">
            <li><a className="footer-link" href="#hero">Home</a></li>
            <li><a className="footer-link" href="#music">Music</a></li>
            <li><a className="footer-link" href="#albums">Albums</a></li>
            <li><a className="footer-link" href="#videos">Videos</a></li>
            <li><a className="footer-link" href="#contact">Contact</a></li>
          </ul>
        </div>
      </div>

      {/* Middle Section (Branding) */}
      <div className="w-full overflow-hidden select-none" data-purpose="branding-logo-section">
        {/* Huge "Moonlight" Title (branded as TYTAN) */}
        <h1 className="moonlight-text text-[22vw] md:text-[28vw] lg:text-[32vw] font-bold text-center w-full transform translate-y-8 lg:translate-y-16">
          TYTAN
        </h1>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black py-8 relative z-10" data-purpose="footer-bottom-bar">
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Copyright & Socials row */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <p className="text-xs text-gray-500">© {new Date().getFullYear()} Tytan Takuba. All Rights Reserved.</p>
          </div>
          {/* Social Media Pills */}
          <div className="flex flex-wrap justify-center gap-2" data-purpose="social-links">
            <a className="social-pill" href="#">Facebook</a>
            <a className="social-pill" href="#">Instagram</a>
            <a className="social-pill" href="#">Spotify</a>
            <a className="social-pill" href="#">X</a>
            <a className="social-pill" href="#">Youtube</a>
          </div>

        </div>
      </div>
    </footer>
  );
}
