import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Rep500",
  description: "Rep500 privacy policy. How we collect, use, and protect your data.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#f9faf5]">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-[#0d1b2a]/95 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-between h-16 px-4 md:px-8 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="text-base font-extrabold tracking-tight" style={{ fontFamily: "'Public Sans', sans-serif" }}>Rep<span className="text-[#D4AF37]">500</span></span>
          </Link>
          <Link href="/" className="text-xs text-white/60 hover:text-white transition-colors uppercase tracking-widest" style={{ fontFamily: "'Public Sans', sans-serif" }}>
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-16">
        <h1 className="text-3xl font-bold text-[#0d1b2a] mb-2" style={{ fontFamily: "'Newsreader', serif" }}>Privacy Policy</h1>
        <p className="text-sm text-[#74777d] mb-10" style={{ fontFamily: "'Manrope', sans-serif" }}>Last updated: March 2026</p>

        <div className="space-y-8 text-[#44474c] text-sm leading-relaxed" style={{ fontFamily: "'Manrope', sans-serif" }}>
          <section>
            <h2 className="text-lg font-bold text-[#0d1b2a] mb-3" style={{ fontFamily: "'Newsreader', serif" }}>1. Information We Collect</h2>
            <p>When you use Rep500, we collect the following information:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Search Queries:</strong> The names, brands, or domains you enter for reputation analysis.</li>
              <li><strong>Contact Information:</strong> Name and email address when you submit a contact form or request a package consultation.</li>
              <li><strong>Usage Data:</strong> Anonymous analytics including pages visited, features used, and session duration to improve our service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0d1b2a] mb-3" style={{ fontFamily: "'Newsreader', serif" }}>2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To perform reputation analysis and generate reports based on your queries.</li>
              <li>To respond to your inquiries and provide customer support.</li>
              <li>To improve and optimize our platform and user experience.</li>
              <li>To send you information about our services if you have opted in.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0d1b2a] mb-3" style={{ fontFamily: "'Newsreader', serif" }}>3. Data Sources</h2>
            <p>Rep500 aggregates publicly available information from the following sources to generate reputation reports:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Search engine results (Google, Bing)</li>
              <li>News publications and media outlets</li>
              <li>Social media platforms (publicly accessible content)</li>
              <li>Review platforms and business directories</li>
              <li>AI and LLM platform outputs</li>
            </ul>
            <p className="mt-2">We only analyze publicly available information. We do not access private accounts, protected content, or restricted databases.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0d1b2a] mb-3" style={{ fontFamily: "'Newsreader', serif" }}>4. Data Storage &amp; Security</h2>
            <p>Your data is processed securely and we implement industry-standard security measures including:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>SSL/TLS encryption for all data transmissions.</li>
              <li>Reports are generated in real-time and are not permanently stored on our servers unless you explicitly request it.</li>
              <li>Contact form submissions are stored securely and only accessible to authorized Rep500 team members.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0d1b2a] mb-3" style={{ fontFamily: "'Newsreader', serif" }}>5. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Vercel:</strong> Hosting and deployment.</li>
              <li><strong>OpenAI / Anthropic:</strong> AI-powered analysis for reputation scoring.</li>
              <li><strong>Resend:</strong> Email delivery for report distribution.</li>
            </ul>
            <p className="mt-2">We do not sell, trade, or rent your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0d1b2a] mb-3" style={{ fontFamily: "'Newsreader', serif" }}>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Request access to the personal data we hold about you.</li>
              <li>Request correction or deletion of your personal data.</li>
              <li>Opt out of marketing communications at any time.</li>
              <li>Request that we stop processing your data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0d1b2a] mb-3" style={{ fontFamily: "'Newsreader', serif" }}>7. Cookies</h2>
            <p>Rep500 uses minimal cookies necessary for the basic functionality of the platform. We do not use advertising or third-party tracking cookies. Essential cookies may be used for session management and security purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0d1b2a] mb-3" style={{ fontFamily: "'Newsreader', serif" }}>8. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us at:</p>
            <p className="mt-2 font-medium text-[#0d1b2a]">info@reputation500.com</p>
          </section>
        </div>
      </main>

      <footer className="bg-[#f9faf5] border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-4 md:px-8 py-12 max-w-7xl mx-auto gap-4">
          <div className="text-xs tracking-widest uppercase text-slate-400" style={{ fontFamily: "'Public Sans', sans-serif" }}>
            &copy; 2025 Rep500. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-4 md:gap-8">
            <Link className="text-xs tracking-widest uppercase text-slate-400 hover:text-[#0d1b2a] transition-colors" href="/privacy" style={{ fontFamily: "'Public Sans', sans-serif" }}>Privacy Policy</Link>
            <Link className="text-xs tracking-widest uppercase text-slate-400 hover:text-[#0d1b2a] transition-colors" href="/terms" style={{ fontFamily: "'Public Sans', sans-serif" }}>Terms of Service</Link>
            <Link className="text-xs tracking-widest uppercase text-slate-400 hover:text-[#0d1b2a] transition-colors" href="/" style={{ fontFamily: "'Public Sans', sans-serif" }}>Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
