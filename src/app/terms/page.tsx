import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Rep500",
  description: "Rep500 terms of service and conditions of use.",
};

export default function TermsOfService() {
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
        <h1 className="text-3xl font-bold text-[#0d1b2a] mb-2" style={{ fontFamily: "'Newsreader', serif" }}>Terms of Service</h1>
        <p className="text-sm text-[#74777d] mb-10" style={{ fontFamily: "'Manrope', sans-serif" }}>Last updated: March 2026</p>

        <div className="space-y-8 text-[#44474c] text-sm leading-relaxed" style={{ fontFamily: "'Manrope', sans-serif" }}>
          <section>
            <h2 className="text-lg font-bold text-[#0d1b2a] mb-3" style={{ fontFamily: "'Newsreader', serif" }}>1. Acceptance of Terms</h2>
            <p>By accessing and using Rep500 (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0d1b2a] mb-3" style={{ fontFamily: "'Newsreader', serif" }}>2. Description of Service</h2>
            <p>Rep500 provides online reputation analysis and intelligence services. The Service aggregates publicly available information to generate reputation reports for individuals, brands, and companies. Reports include analysis of search engine results, media coverage, social media presence, review platforms, and AI/LLM references.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0d1b2a] mb-3" style={{ fontFamily: "'Newsreader', serif" }}>3. Use of the Service</h2>
            <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Use the Service to harass, defame, or harm any individual or organization.</li>
              <li>Attempt to reverse-engineer, decompile, or disassemble any part of the Service.</li>
              <li>Use automated systems or bots to access the Service in a manner that exceeds reasonable use.</li>
              <li>Resell, redistribute, or commercially exploit the reports without prior written consent from Rep500.</li>
              <li>Use the Service in violation of any applicable laws or regulations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0d1b2a] mb-3" style={{ fontFamily: "'Newsreader', serif" }}>4. Accuracy of Information</h2>
            <p>Rep500 reports are generated using AI-powered analysis of publicly available data. While we strive for accuracy, we cannot guarantee that all information in a report is complete, current, or error-free. Reports are intended for informational and strategic purposes and should not be used as the sole basis for legal, financial, or employment decisions.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0d1b2a] mb-3" style={{ fontFamily: "'Newsreader', serif" }}>5. Reputation Management Services</h2>
            <p>Rep500 offers reputation management packages through Reputation500. When you engage with our reputation management services:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Service terms, pricing, and deliverables will be outlined in a separate agreement.</li>
              <li>Results may vary based on the complexity of the reputation situation.</li>
              <li>Money-back guarantees, where applicable, are subject to the specific terms of each package.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0d1b2a] mb-3" style={{ fontFamily: "'Newsreader', serif" }}>6. Intellectual Property</h2>
            <p>All content, design, branding, reports, and analysis methodologies on Rep500 are the intellectual property of Reputation500. You may download reports for personal or internal business use but may not reproduce, distribute, or publicly display them without written permission.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0d1b2a] mb-3" style={{ fontFamily: "'Newsreader', serif" }}>7. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Rep500 and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability shall not exceed the amount paid by you, if any, for accessing the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0d1b2a] mb-3" style={{ fontFamily: "'Newsreader', serif" }}>8. Confidentiality</h2>
            <p>We treat all reputation reports and client information as confidential. Reports generated through our platform are intended solely for the requesting party and will not be shared with third parties unless required by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0d1b2a] mb-3" style={{ fontFamily: "'Newsreader', serif" }}>9. Modifications</h2>
            <p>We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the Service constitutes acceptance of the modified Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0d1b2a] mb-3" style={{ fontFamily: "'Newsreader', serif" }}>10. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with applicable international laws. Any disputes arising from these Terms or the use of the Service shall be resolved through good-faith negotiation before pursuing formal legal proceedings.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0d1b2a] mb-3" style={{ fontFamily: "'Newsreader', serif" }}>11. Contact</h2>
            <p>For questions about these Terms of Service, please contact us at:</p>
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
