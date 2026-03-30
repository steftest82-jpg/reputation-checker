"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const sidebarLinks = [
  { label: "Guide", items: [
    { name: "The Intelligence", href: "#intelligence" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Scan Frequency", href: "#frequency" },
  ]},
  { label: "Reference", items: [
    { name: "Glossary", href: "#glossary" },
    { name: "FAQ", href: "#faq" },
  ]},
];

export default function DocsPage() {
  const sidebarRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const sections = document.querySelectorAll(".docs-section");
    const links = document.querySelectorAll<HTMLAnchorElement>(".sidebar-link");

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = e.target.id;
            links.forEach((l) => {
              l.classList.remove("active");
              if (l.getAttribute("href") === "#" + id) l.classList.add("active");
            });
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style jsx global>{`
        .docs-page * { margin: 0; padding: 0; box-sizing: border-box; }

        .docs-page {
          font-family: 'Inter', 'Manrope', sans-serif;
          background: #ffffff;
          color: #333;
          font-size: 15px;
          line-height: 1.75;
          -webkit-font-smoothing: antialiased;
          font-weight: 400;
        }

        /* NAV */
        .docs-nav {
          position: sticky; top: 0; z-index: 100;
          background: #fff;
          border-bottom: 1px solid #e8e8e8;
          padding: 0 48px;
          height: 58px;
          display: flex; align-items: center; gap: 12px;
        }
        .docs-nav-logo {
          display: flex; align-items: center; gap: 9px;
          font-weight: 700; font-size: 16px;
          color: #111; text-decoration: none;
          letter-spacing: -0.02em;
          margin-right: auto;
        }
        .docs-nav-badge {
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          background: #f5f0e8; color: #9a7a3a;
          border-radius: 4px; padding: 2px 8px;
        }
        .docs-nav-cta {
          background: #111; color: #fff;
          font-size: 13px; font-weight: 500;
          padding: 7px 18px; border-radius: 6px;
          text-decoration: none;
          transition: background .2s;
        }
        .docs-nav-cta:hover { background: #333; }

        /* LAYOUT */
        .docs-layout {
          display: grid;
          grid-template-columns: 220px 1fr;
          max-width: 1100px;
          margin: 0 auto;
          min-height: calc(100vh - 58px);
        }

        /* SIDEBAR */
        .docs-aside {
          position: sticky; top: 58px;
          height: calc(100vh - 58px);
          overflow-y: auto;
          padding: 40px 0;
          border-right: 1px solid #efefef;
        }
        .sidebar-group { margin-bottom: 32px; }
        .sidebar-label {
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #b0b0b0; padding: 0 28px 8px;
        }
        .sidebar-link {
          display: block; padding: 7px 28px;
          font-size: 13px; color: #666;
          text-decoration: none;
          border-left: 2px solid transparent;
          transition: all .15s;
        }
        .sidebar-link:hover { color: #111; background: #fafafa; }
        .sidebar-link.active { color: #111; font-weight: 500; border-left-color: #c9a84c; background: #fdf9f0; }

        /* MAIN */
        .docs-main { padding: 64px 72px 96px; max-width: 780px; }

        /* HERO */
        .docs-hero { padding-bottom: 56px; border-bottom: 1px solid #efefef; margin-bottom: 64px; }
        .hero-eyebrow {
          display: inline-flex; align-items: center;
          font-size: 14px; font-weight: 600;
          letter-spacing: 0.04em; text-transform: uppercase;
          color: #374258; margin-bottom: 20px;
          background: #edf0f5; border-radius: 5px;
          padding: 4px 12px;
        }
        .docs-hero h1 {
          font-size: 40px; font-weight: 700;
          letter-spacing: -0.03em; line-height: 1.1;
          color: #111; margin-bottom: 18px;
          font-family: 'Newsreader', 'Georgia', serif;
        }
        .docs-hero p {
          font-size: 16px; color: #555;
          max-width: 560px; line-height: 1.75;
        }

        /* SECTION */
        .docs-section { margin-bottom: 72px; scroll-margin-top: 80px; }
        .section-title {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 28px;
        }
        .section-num {
          width: 28px; height: 28px;
          background: #f5f0e8; color: #9a7a3a;
          border-radius: 6px;
          font-size: 12px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .docs-page h2 { font-size: 22px; font-weight: 600; letter-spacing: -0.02em; color: #111; }
        .docs-section > p { color: #666; margin-bottom: 24px; font-weight: 400; }

        /* STEPS */
        .steps { display: flex; flex-direction: column; gap: 2px; margin-bottom: 24px; }
        .step {
          display: flex; gap: 20px;
          padding: 24px;
          background: #fafafa;
          border: 1px solid #efefef;
          border-radius: 8px;
        }
        .step-left { flex-shrink: 0; text-align: center; }
        .step-num-circle {
          width: 36px; height: 36px;
          background: #fff;
          border: 1.5px solid #e0e0e0;
          border-radius: 50%;
          font-size: 13px; font-weight: 600; color: #555;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 8px;
        }
        .step-emoji { font-size: 20px; }
        .step-right h3 { font-size: 14px; font-weight: 600; color: #111; margin-bottom: 6px; }
        .step-right p { font-size: 13.5px; color: #666; margin: 0; }
        .step-tag {
          display: inline-block; margin-top: 10px;
          font-size: 11px; font-weight: 600;
          background: #f0f0f0; color: #666;
          border-radius: 4px; padding: 2px 8px;
        }

        /* FREQ BOX */
        .freq-box {
          background: #fdf9f0;
          border: 1px solid #e8d9a8;
          border-radius: 10px;
          padding: 28px;
        }
        .freq-row {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 12px 0;
          border-bottom: 1px solid #ede0c0;
        }
        .freq-row:last-child { border-bottom: none; padding-bottom: 0; }
        .freq-label {
          font-size: 12px; font-weight: 600; color: #9a7a3a;
          background: #f5f0e8; border-radius: 4px;
          padding: 2px 8px; white-space: nowrap;
          flex-shrink: 0; margin-top: 2px;
        }
        .freq-desc { font-size: 13.5px; color: #555; }

        /* GLOSSARY */
        .glossary { border-top: 1px solid #efefef; }
        .glossary-item { padding: 24px 0; border-bottom: 1px solid #efefef; }
        .glossary-item:last-child { border-bottom: none; }
        .glossary-term {
          font-size: 14px; font-weight: 600; color: #111;
          margin-bottom: 8px;
          display: flex; align-items: center; gap: 8px;
        }
        .tag {
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.05em; text-transform: uppercase;
          border-radius: 3px; padding: 1px 6px;
          background: #f0f0f0; color: #888;
        }
        .tag-search { background: #eef5ff; color: #4477cc; }
        .tag-ai { background: #f0f8f0; color: #447744; }
        .tag-score { background: #fff5ee; color: #cc7733; }
        .tag-media { background: #fff0f5; color: #cc4477; }
        .tag-report { background: #f3f0ff; color: #6644bb; }

        .glossary-def { font-size: 13.5px; color: #666; line-height: 1.8; font-weight: 400; }
        .glossary-def strong { color: #333; font-weight: 600; }
        .plain-english {
          margin-top: 10px;
          padding: 10px 14px;
          background: #f8f8f8;
          border-left: 3px solid #ddd;
          border-radius: 0 6px 6px 0;
          font-size: 13px; color: #777; font-weight: 400;
        }

        /* FAQ */
        .faq-item { padding: 24px 0; border-bottom: 1px solid #efefef; }
        .faq-item:first-child { border-top: 1px solid #efefef; }
        .faq-q {
          font-size: 14px; font-weight: 600; color: #111;
          margin-bottom: 10px;
          display: flex; gap: 12px; align-items: flex-start;
        }
        .q-badge {
          background: #111; color: #fff;
          font-size: 10px; font-weight: 700;
          border-radius: 4px; padding: 2px 6px;
          flex-shrink: 0; margin-top: 2px;
        }
        .faq-a { font-size: 13.5px; color: #666; line-height: 1.8; padding-left: 30px; font-weight: 400; }

        /* CALLOUT */
        .callout {
          display: flex; gap: 12px;
          background: #f8fbff;
          border: 1px solid #d0e4f8;
          border-radius: 8px;
          padding: 16px 20px;
          margin: 24px 0;
        }
        .callout-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
        .callout p { font-size: 13.5px; color: #334; margin: 0; }

        /* INTELLIGENCE SECTION */
        .intel-lead {
          font-size: 16px; color: #333; font-weight: 400;
          line-height: 1.8; margin-bottom: 36px;
          padding-bottom: 36px; border-bottom: 1px solid #efefef;
        }
        .intel-stat-row {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 2px; margin-bottom: 40px;
          background: #efefef; border-radius: 10px; overflow: hidden;
        }
        .intel-stat {
          background: #fff; padding: 24px 20px; text-align: center;
        }
        .intel-stat-num {
          font-size: 26px; font-weight: 700;
          letter-spacing: -0.03em; color: #111;
          line-height: 1.15; margin-bottom: 2px;
        }
        .intel-stat-unit {
          font-size: 11px; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.06em;
          color: #c9a84c; margin-bottom: 8px;
        }
        .intel-stat-label {
          font-size: 12px; color: #374258; line-height: 1.4; font-weight: 400;
        }
        .intel-body { margin-bottom: 40px; }
        .intel-body p {
          font-size: 14.5px; color: #555; margin-bottom: 18px; line-height: 1.85; font-weight: 400;
        }
        .intel-body p:last-child { margin-bottom: 0; }
        .intel-contrib {
          border: 1px solid #e0e0e0; border-radius: 12px;
          overflow: hidden; margin-bottom: 32px;
        }
        .intel-contrib-header { background: #111; padding: 28px 32px; }
        .intel-contrib-title {
          font-size: 15px; font-weight: 600; color: #fff;
          margin-bottom: 10px; letter-spacing: -0.01em;
        }
        .intel-contrib-sub { font-size: 13px; color: #aaa; line-height: 1.7; font-weight: 400; }
        .intel-orgs {
          display: grid; grid-template-columns: 1fr 1fr; background: #f5f5f5;
        }
        .intel-org {
          background: #fff; padding: 20px 24px;
          border-bottom: 1px solid #f0f0f0; border-right: 1px solid #f0f0f0;
        }
        .intel-org:nth-child(even) { border-right: none; }
        .intel-org:nth-last-child(-n+2) { border-bottom: none; }
        .intel-org-name { font-size: 13px; font-weight: 600; color: #222; margin-bottom: 5px; }
        .intel-org-desc { font-size: 12.5px; color: #888; line-height: 1.6; font-weight: 400; }
        .intel-closing {
          background: #fdf9f0; border: 1px solid #e8d9a8;
          border-radius: 8px; padding: 22px 26px;
          font-size: 14px; color: #6a5a3a; line-height: 1.8; font-weight: 400;
        }

        /* CTA SECTION */
        .cta-section {
          margin-top: 80px;
          padding: 56px 48px;
          background: #111;
          border-radius: 14px;
          text-align: center;
        }
        .cta-eyebrow {
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #c9a84c; margin-bottom: 16px;
        }
        .cta-heading {
          font-size: 26px; font-weight: 700;
          letter-spacing: -0.02em; color: #fff;
          margin-bottom: 14px; line-height: 1.2;
        }
        .cta-sub {
          font-size: 14px; color: #999;
          margin-bottom: 32px; line-height: 1.7;
          max-width: 420px; margin-left: auto; margin-right: auto;
        }
        .cta-buttons {
          display: flex; gap: 12px;
          justify-content: center; flex-wrap: wrap;
        }
        .cta-primary {
          background: #c9a84c; color: #111;
          font-size: 14px; font-weight: 600;
          padding: 12px 28px; border-radius: 7px;
          text-decoration: none;
          transition: background .2s, transform .15s;
          letter-spacing: -0.01em;
        }
        .cta-primary:hover { background: #e8c96a; transform: translateY(-1px); }
        .cta-secondary {
          background: transparent; color: #ccc;
          font-size: 14px; font-weight: 500;
          padding: 12px 28px; border-radius: 7px;
          text-decoration: none;
          border: 1.5px solid #888;
          transition: border-color .2s, color .2s;
        }
        .cta-secondary:hover { border-color: #fff; color: #fff; }

        @media (max-width: 768px) {
          .docs-layout { grid-template-columns: 1fr; }
          .docs-aside { display: none; }
          .docs-main { padding: 40px 24px; }
          .docs-nav { padding: 0 20px; }
          .docs-hero h1 { font-size: 30px; }
          .intel-stat-row { grid-template-columns: 1fr 1fr; }
          .intel-orgs { grid-template-columns: 1fr; }
          .intel-org:nth-child(even) { border-right: none; }
          .intel-org:nth-last-child(-n+2) { border-bottom: 1px solid #f0f0f0; }
          .intel-org:last-child { border-bottom: none; }
        }
      `}</style>

      <div className="docs-page">
        {/* NAV */}
        <nav className="docs-nav">
          <Link className="docs-nav-logo" href="/">
            <span role="img" aria-label="shield">&#x1F6E1;</span> REP500
            <span className="docs-nav-badge">Docs</span>
          </Link>
          <Link className="docs-nav-cta" href="/">
            Run a Reputation Analysis &rarr;
          </Link>
        </nav>

        <div className="docs-layout">
          {/* SIDEBAR */}
          <aside className="docs-aside">
            {sidebarLinks.map((group) => (
              <div className="sidebar-group" key={group.label}>
                <div className="sidebar-label">{group.label}</div>
                {group.items.map((item, i) => (
                  <a
                    key={item.href}
                    className={`sidebar-link${i === 0 && group.label === "Guide" ? " active" : ""}`}
                    href={item.href}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            ))}
          </aside>

          {/* MAIN */}
          <main className="docs-main">

            {/* HERO */}
            <div className="docs-hero">
              <div className="hero-eyebrow">Documentation</div>
              <h1>Understanding your<br />Rep500 report</h1>
              <p>Everything explained clearly, without jargon or assumptions. Whether this is your first reputation report or you just want to understand a specific term, this guide has you covered.</p>
            </div>

            {/* ── 1. THE INTELLIGENCE ── */}
            <div className="docs-section" id="intelligence">
              <div className="section-title">
                <div className="section-num">1</div>
                <h2>The Rep500 Intelligence</h2>
              </div>

              <p className="intel-lead">Rep500 is not a search tool. It is a proprietary intelligence system built from the ground up to measure, interpret, and quantify online reputation with institutional-grade precision.</p>

              <div className="intel-stat-row">
                <div className="intel-stat">
                  <div className="intel-stat-num">12</div>
                  <div className="intel-stat-unit">months</div>
                  <div className="intel-stat-label">of research and development before launch</div>
                </div>
                <div className="intel-stat">
                  <div className="intel-stat-num">10M+</div>
                  <div className="intel-stat-unit">data points</div>
                  <div className="intel-stat-label">used to train the core model</div>
                </div>
                <div className="intel-stat">
                  <div className="intel-stat-num">Daily</div>
                  <div className="intel-stat-unit">upgrades</div>
                  <div className="intel-stat-label">the algorithm is updated and refined</div>
                </div>
                <div className="intel-stat">
                  <div className="intel-stat-num">120+</div>
                  <div className="intel-stat-unit">live sources</div>
                  <div className="intel-stat-label">scanned simultaneously per analysis</div>
                </div>
              </div>

              <div className="intel-body">
                <p>The Rep500 algorithm was built over twelve months of intensive research, architecture design, and iterative testing. Unlike generic monitoring tools that surface raw data, Rep500 was engineered to think the way the world&#39;s most powerful information systems think, applying the same ranking logic, sentiment weighting, and authority signals used by Google, ChatGPT, Gemini, and other platforms that now determine how people perceive individuals and businesses online.</p>

                <p>The model does not simply retrieve results. It evaluates them across multiple dimensions simultaneously: authority tier, sentiment polarity, recency weight, SERP position, domain trust signals, AI training data coverage, and revenue correlation, producing a scored, structured output that translates complex digital signals into clear, actionable intelligence.</p>

                <p>Critically, the algorithm is not static. It is updated and recalibrated on a daily basis, incorporating shifts in how Google ranks content, changes in AI engine behaviour, and emerging patterns in how online reputation affects commercial outcomes. What you receive is not a snapshot from a fixed model. It is an assessment current to how these systems are operating right now.</p>
              </div>

              <div className="intel-contrib">
                <div className="intel-contrib-header">
                  <div className="intel-contrib-title">Built with expertise from the world&#39;s leading technology organisations</div>
                  <div className="intel-contrib-sub">Specialists from across these organisations contributed knowledge, methodology, and technical guidance during the development and optimisation of the Rep500 model. Their input shaped how the algorithm interprets ranking signals, processes sentiment, and measures AI visibility, ensuring the outputs reflect how these platforms actually work.</div>
                </div>
                <div className="intel-orgs">
                  <div className="intel-org">
                    <div className="intel-org-name">Google</div>
                    <div className="intel-org-desc">Search ranking logic, SERP authority signals, and Knowledge Graph methodology</div>
                  </div>
                  <div className="intel-org">
                    <div className="intel-org-name">Anthropic</div>
                    <div className="intel-org-desc">AI training data coverage, constitutional model behaviour, and LLM output accuracy</div>
                  </div>
                  <div className="intel-org">
                    <div className="intel-org-name">OpenAI</div>
                    <div className="intel-org-desc">Large language model architecture, natural language processing, and sentiment classification</div>
                  </div>
                  <div className="intel-org">
                    <div className="intel-org-name">Microsoft</div>
                    <div className="intel-org-desc">Enterprise data infrastructure, Bing search integration, and AI-assisted search behaviour</div>
                  </div>
                  <div className="intel-org">
                    <div className="intel-org-name">Amazon Web Services</div>
                    <div className="intel-org-desc">Scalable cloud architecture, real-time data processing, and secure session encryption</div>
                  </div>
                  <div className="intel-org">
                    <div className="intel-org-name">NVIDIA</div>
                    <div className="intel-org-desc">High-performance GPU compute infrastructure underpinning model training and inference speed</div>
                  </div>
                </div>
              </div>

              <div className="intel-closing">
                The result is an intelligence system whose accuracy and depth reflect the combined expertise of the organisations that define how information is processed, ranked, and understood across the modern internet. When Rep500 evaluates a reputation, it does so by applying the same publicly documented logic and modelling frameworks those platforms use, built entirely on publicly available information and open research. This approach ensures full compliance while delivering assessments that are structurally aligned with how Google, AI engines, and major platforms evaluate individuals and companies in practice.
              </div>
            </div>

            {/* ── 2. HOW IT WORKS ── */}
            <div className="docs-section" id="how-it-works">
              <div className="section-title">
                <div className="section-num">2</div>
                <h2>How it works</h2>
              </div>
              <p>When you submit a name or company, Rep500 runs four automated stages in sequence, taking under three minutes from start to finished report.</p>

              <div className="steps">
                <div className="step">
                  <div className="step-left">
                    <div className="step-num-circle">1</div>
                    <div className="step-emoji" role="img" aria-label="search">&#x1F50D;</div>
                  </div>
                  <div className="step-right">
                    <h3>Data Collection</h3>
                    <p>Our algorithm simultaneously scans 120+ live sources, including Google search results, news archives, social media platforms, review sites, forums, complaint databases, and dark web signals, collecting over 10,000 data points about the person or company being analysed.</p>
                    <span className="step-tag">120+ sources &middot; 10,000+ data points</span>
                  </div>
                </div>
                <div className="step">
                  <div className="step-left">
                    <div className="step-num-circle">2</div>
                    <div className="step-emoji" role="img" aria-label="brain">&#x1F9E0;</div>
                  </div>
                  <div className="step-right">
                    <h3>Sentiment &amp; Risk Analysis</h3>
                    <p>Every piece of content found is automatically read and classified as positive, neutral, or negative using natural language processing, the same technology used by Google and AI platforms. Our model was trained on over 10 million reputation data points and identifies risks that a manual search would miss.</p>
                    <span className="step-tag">Trained on 10M+ data points</span>
                  </div>
                </div>
                <div className="step">
                  <div className="step-left">
                    <div className="step-num-circle">3</div>
                    <div className="step-emoji" role="img" aria-label="money">&#x1F4B0;</div>
                  </div>
                  <div className="step-right">
                    <h3>Revenue Impact Modelling</h3>
                    <p>Each risk found is mapped to an estimated financial cost. This translates your reputation issues into concrete business terms, showing not just what is wrong but what it is likely costing you in lost clients or conversions.</p>
                    <span className="step-tag">Financial impact per risk</span>
                  </div>
                </div>
                <div className="step">
                  <div className="step-left">
                    <div className="step-num-circle">4</div>
                    <div className="step-emoji" role="img" aria-label="document">&#x1F4C4;</div>
                  </div>
                  <div className="step-right">
                    <h3>Report Generation</h3>
                    <p>All findings are compiled into your full intelligence report with a scored breakdown, prioritised recommendations, and strategic actions, delivered in under 3 minutes.</p>
                    <span className="step-tag">Ready in under 3 minutes</span>
                  </div>
                </div>
              </div>

              <div className="callout">
                <span className="callout-icon" role="img" aria-label="lock">&#x1F512;</span>
                <p><strong>Your scans are completely private, even from us.</strong> Rep500 does not create accounts, store user data, or log what you search. Every session is fully encrypted end-to-end, meaning no one at Rep500 can see who you are scanning, what results came back, or that a scan was even run. The person or company you audit is never notified. Nothing is saved once your session ends.</p>
              </div>
            </div>

            {/* ── 3. FREQUENCY ── */}
            <div className="docs-section" id="frequency">
              <div className="section-title">
                <div className="section-num">3</div>
                <h2>How often should you scan?</h2>
              </div>
              <p>Your online reputation changes constantly. New articles get published, search rankings shift, and AI platforms update their knowledge. Here is our recommended frequency depending on your situation.</p>

              <div className="freq-box">
                <div className="freq-row">
                  <span className="freq-label">Monthly</span>
                  <span className="freq-desc">Recommended for most executives, founders, and businesses. A monthly scan lets you track your score over time and catch new risks before they compound.</span>
                </div>
                <div className="freq-row">
                  <span className="freq-label">Every 2 weeks</span>
                  <span className="freq-desc">Recommended if you are actively working to improve your reputation by publishing new content, running a PR campaign, or recovering from negative coverage. Regular scans let you measure what is working.</span>
                </div>
                <div className="freq-row">
                  <span className="freq-label">Weekly</span>
                  <span className="freq-desc">Recommended during a live crisis. If you have recent negative news, a viral complaint, or a regulatory issue. Weekly scanning gives you early warning if the situation escalates.</span>
                </div>
                <div className="freq-row">
                  <span className="freq-label">One-time</span>
                  <span className="freq-desc">Useful as a baseline audit before a fundraise, partnership announcement, or product launch, the ideal time to check before your name receives increased scrutiny.</span>
                </div>
              </div>
            </div>

            {/* ── 4. GLOSSARY ── */}
            <div className="docs-section" id="glossary">
              <div className="section-title">
                <div className="section-num">4</div>
                <h2>Glossary</h2>
              </div>
              <p>Every term used in your Rep500 report, explained simply without assuming any technical background.</p>

              <div className="glossary">

                {/* Reputation Score */}
                <div className="glossary-item">
                  <div className="glossary-term">Reputation Score <span className="tag tag-score">Score</span></div>
                  <div className="glossary-def">Your overall score from <strong>0 to 100</strong>, calculated using the same signals that Google, ChatGPT, Claude, and Gemini use when they evaluate a person or company online. The higher the number, the stronger and safer your digital reputation. Scores are benchmarked against your industry.</div>
                  <div className="plain-english">Think of it like a credit score, but for your online reputation. 90+ is excellent, 50&ndash;64 is fair and needs attention, anything below 50 is a red flag requiring urgent action.</div>
                </div>

                {/* SERP */}
                <div className="glossary-item">
                  <div className="glossary-term">SERP <span className="tag tag-search">Search</span></div>
                  <div className="glossary-def"><strong>Search Engine Results Page.</strong> The list of results Google shows when someone searches your name. Your SERP is the first thing a potential client, investor, or employer sees when they look you up.</div>
                  <div className="plain-english">It&#39;s the page of results Google shows when someone searches for you. The top 10 results are your public reputation as far as most people are concerned.</div>
                </div>

                {/* SERP Volatility */}
                <div className="glossary-item">
                  <div className="glossary-term">SERP Volatility <span className="tag tag-search">Search</span></div>
                  <div className="glossary-def">How much your Google search results are changing over a period of time. <strong>High volatility</strong> means results are shifting frequently. Either new content is rising or a crisis is spreading. <strong>Low volatility</strong> means your results are stable and entrenched.</div>
                  <div className="plain-english">If your Google results look different every week, that&#39;s high volatility. Stable results are predictable. Great if they&#39;re positive, a serious problem if they&#39;re not.</div>
                </div>

                {/* SERP Dominance */}
                <div className="glossary-item">
                  <div className="glossary-term">SERP Dominance <span className="tag tag-search">Search</span></div>
                  <div className="glossary-def">The proportion of page-one Google results you own or control, such as your website, official profiles and authored content. Rated as <strong>Low, Moderate, or High</strong>. High dominance means you control your own narrative. Low dominance means third parties are telling your story for you.</div>
                  <div className="plain-english">If 8 out of 10 Google results about you are things you own or wrote, you have high dominance. If most results are written by others, you have low dominance, and much less control over your story.</div>
                </div>

                {/* Sentiment */}
                <div className="glossary-item">
                  <div className="glossary-term">Sentiment <span className="tag tag-score">Score</span></div>
                  <div className="glossary-def">The emotional tone of a piece of content about you, classified as <strong>Positive, Neutral, or Negative</strong>. Rep500 reads the language, framing, and context of each mention automatically. A factual article can still be classified as negative if it frames events in a damaging way.</div>
                  <div className="plain-english">It&#39;s whether what&#39;s written about you sounds good, bad, or indifferent. A glowing profile is positive. A news investigation is negative, even if it just states facts.</div>
                </div>

                {/* Sentiment Instability */}
                <div className="glossary-item">
                  <div className="glossary-term">Sentiment Instability <span className="tag tag-score">Score</span></div>
                  <div className="glossary-def">A detected sudden spike in negative sentiment, often triggered by recent news, a complaint, or social media content. When flagged, it appears as a <strong>Potential Crisis Detected</strong> alert, meaning the situation could worsen without a prompt response.</div>
                  <div className="plain-english">A warning that negative content about you is spiking right now. Like a storm warning, it doesn&#39;t mean disaster is certain, but you should act quickly.</div>
                </div>

                {/* AI / LLM Appearance */}
                <div className="glossary-item">
                  <div className="glossary-term">AI / LLM Appearance <span className="tag tag-ai">AI</span></div>
                  <div className="glossary-def">How accurately and favourably AI platforms <strong>ChatGPT, Claude, Gemini, and Perplexity</strong> represent you when users ask about you. AI engines are now a primary discovery tool for a growing majority of internet users, and what they say about you is treated as fact by many people.</div>
                  <div className="plain-english">If someone asks ChatGPT &ldquo;who is [your name]?&rdquo; or &ldquo;is [your company] trustworthy?&rdquo; This score measures whether the AI&#39;s answer helps or hurts you.</div>
                </div>

                {/* Training Data Saturation */}
                <div className="glossary-item">
                  <div className="glossary-term">Training Data Saturation <span className="tag tag-ai">AI</span></div>
                  <div className="glossary-def">The percentage that reflects how well AI engines&#39; training datasets cover information about you. AI models learn from large snapshots of the internet, including Wikipedia, news archives and major websites. Low saturation means AI either doesn&#39;t know much about you, or fills gaps with inaccurate information.</div>
                  <div className="plain-english">How much AI &ldquo;knows&rdquo; about you. Low percentage means AI might give vague or incorrect answers. High percentage means AI has rich data, powerful if that data is positive.</div>
                </div>

                {/* Reference Accuracy */}
                <div className="glossary-item">
                  <div className="glossary-term">Reference Accuracy <span className="tag tag-ai">AI</span></div>
                  <div className="glossary-def">The percentage of AI-generated claims about you that are factually correct. A score of <strong>82%</strong> means roughly 8 in 10 things AI says about you are accurate. Low accuracy can mean AI is confusing you with someone else, using outdated information, or amplifying false claims.</div>
                  <div className="plain-english">Out of everything AI says about you, how much of it is actually true? Wrong information spreads fast because people trust AI answers.</div>
                </div>

                {/* Context Rating */}
                <div className="glossary-item">
                  <div className="glossary-term">Context Rating <span className="tag tag-ai">AI</span></div>
                  <div className="glossary-def">The overall framing AI engines use when they mention you rated as <strong>Positive, Neutral, or Negative</strong>. Even if AI mentions you frequently, a negative context means the framing is unfavourable, including warning language, associations with controversy, or cautious phrasing.</div>
                  <div className="plain-english">It&#39;s not just whether AI mentions you, it&#39;s whether the AI sounds like it&#39;s recommending you or warning people about you.</div>
                </div>

                {/* Domain Authority */}
                <div className="glossary-item">
                  <div className="glossary-term">Domain Authority <span className="tag tag-search">Search</span></div>
                  <div className="glossary-def">A measure of how much trust and ranking power a website has in Google&#39;s system. Sites like <em>ABC News, Reuters, Forbes, BBC</em> have very high domain authority. Content on them ranks persistently and is heavily weighted by AI training systems. A negative article from a high-authority site is far harder to displace.</div>
                  <div className="plain-english">Think of it like the credibility of a source. A story in a major national newspaper carries far more weight than a random blog post, both with Google and with people who read it.</div>
                </div>

                {/* Digital Footprint */}
                <div className="glossary-item">
                  <div className="glossary-term">Digital Footprint <span className="tag tag-search">Search</span></div>
                  <div className="glossary-def">The total collection of your online presence, including every webpage, social profile, news mention, forum post, review, image, video, and domain associated with your name. A <strong>small footprint</strong> leaves you vulnerable. A <strong>large, controlled footprint</strong> gives you narrative ownership.</div>
                  <div className="plain-english">Everything that exists about you on the internet, combined. The bigger and more positive it is, the harder it is for one negative article to define you.</div>
                </div>

                {/* Content Control */}
                <div className="glossary-item">
                  <div className="glossary-term">Content Control <span className="tag tag-score">Score</span></div>
                  <div className="glossary-def">The proportion of your first-page Google results that you own or actively manage, such as your website, official social profiles and authored content. High control means you shape your own story. Low control means others are doing it for you.</div>
                  <div className="plain-english">How many of the Google results about you are things you actually wrote or control? More is always better.</div>
                </div>

                {/* Google Knowledge Panel */}
                <div className="glossary-item">
                  <div className="glossary-term">Google Knowledge Panel <span className="tag tag-search">Search</span></div>
                  <div className="glossary-def">The information box that appears on the right side of Google results for notable people and businesses, showing a photo, title, key facts and links. Having one is a significant trust signal. It requires Wikipedia presence, consistent structured data across the web, and authoritative media coverage to obtain.</div>
                  <div className="plain-english">That information box on the right side of Google when you search a well-known person or company. It makes you look established and trustworthy at a glance.</div>
                </div>

                {/* Autocomplete Safety */}
                <div className="glossary-item">
                  <div className="glossary-term">Autocomplete Safety <span className="tag tag-search">Search</span></div>
                  <div className="glossary-def">Google suggests completions based on what people commonly search. If many people have searched &ldquo;[your name] scam,&rdquo; Google will suggest that to future searchers, creating a self-reinforcing problem. This score measures whether negative terms are being suggested alongside your name.</div>
                  <div className="plain-english">When you start typing someone&#39;s name into Google and it auto-suggests &ldquo;scam&rdquo; or &ldquo;fraud&rdquo;, that is a damaged autocomplete. It signals distrust to new visitors before they&#39;ve clicked a single result.</div>
                </div>

                {/* Backlink Profile */}
                <div className="glossary-item">
                  <div className="glossary-term">Backlink Profile <span className="tag tag-search">Search</span></div>
                  <div className="glossary-def">The collection of external websites that link to your site or content. A strong profile from authoritative domains signals to Google that your content is trustworthy. A thin profile makes it harder to push negative results down in rankings.</div>
                  <div className="plain-english">The more credible websites that link to your content, the more Google trusts it. It&#39;s like references on a CV: quality matters more than quantity.</div>
                </div>

                {/* Revenue at Risk */}
                <div className="glossary-item">
                  <div className="glossary-term">Revenue at Risk <span className="tag tag-score">Score</span></div>
                  <div className="glossary-def">The estimated percentage of potential revenue being lost because reputation issues are causing prospects to hesitate or walk away during their research phase. Calculated using industry research benchmarks correlated with the specific vulnerabilities found in your scan.</div>
                  <div className="plain-english">How much business you might be losing right now because of what people find when they Google you. A 32% revenue at risk means roughly a third of people who research you may be choosing not to proceed because of what they see.</div>
                </div>

                {/* Conversion Friction */}
                <div className="glossary-item">
                  <div className="glossary-term">Conversion Friction <span className="tag tag-score">Score</span></div>
                  <div className="glossary-def">The resistance or doubt a potential client experiences when they encounter negative or trust-damaging content during their research. High friction means interested prospects are less likely to follow through particularly in high-trust industries like finance, law, and consulting.</div>
                  <div className="plain-english">Imagine a potential client is about to sign with you, then they Google your name and see a scam allegation. That hesitation, and all the deals that never happen because of it, is conversion friction.</div>
                </div>

                {/* Suspicious Activity Score */}
                <div className="glossary-item">
                  <div className="glossary-term">Suspicious Activity Score <span className="tag tag-score">Score</span></div>
                  <div className="glossary-def">A scale from <strong>1 (clean) to 10 (highly suspicious)</strong> measuring whether recent content patterns around your name look unnatural to Google&#39;s spam detection. Scores above 5 suggest content is being created in a rushed or coordinated way, which Google can penalise with reduced rankings or removal from search.</div>
                  <div className="plain-english">If you suddenly publish 20 articles about yourself in one week, Google notices. This score warns you if your reputation management efforts might accidentally trigger a Google penalty and make things worse.</div>
                </div>

                {/* Media Brand Sentiment */}
                <div className="glossary-item">
                  <div className="glossary-term">Media Brand Sentiment <span className="tag tag-media">Media</span></div>
                  <div className="glossary-def">How credible the media outlets covering you are scored as <strong>Premium (8&ndash;10), Mid-Tier (5&ndash;7), or Low-Tier (1&ndash;4)</strong>. Being covered negatively by a premium outlet (a national broadcaster) carries far more weight than the same story in a low-authority publication.</div>
                  <div className="plain-english">Not all press is equal. A negative story in a major national newspaper does ten times the damage of the same story on an obscure blog. This score tells you how much weight the coverage about you actually carries.</div>
                </div>

                {/* Personal / Brand Influence Score */}
                <div className="glossary-item">
                  <div className="glossary-term">Personal / Brand Influence Score <span className="tag tag-score">Score</span></div>
                  <div className="glossary-def">A 0&ndash;10 measure of your thought leadership footprint whether you have authored articles, guest posts, podcast appearances, speaking engagements, interviews, and Wikipedia entries. A high score means independent sources are building a positive picture of you, which is far more credible than self-published content.</div>
                  <div className="plain-english">Are respected publications and people talking about you positively? The more they are, the harder it is for one bad article to define your reputation.</div>
                </div>

                {/* Geographic Reputation Reach */}
                <div className="glossary-item">
                  <div className="glossary-term">Geographic Reputation Reach <span className="tag tag-media">Media</span></div>
                  <div className="glossary-def">The primary markets where your reputation is visible and established determined by which countries&#39; media, social platforms, and search results feature your name. Indicates whether your digital presence is local, national, or international.</div>
                  <div className="plain-english">Where in the world do people know who you are? This matters if your business operates across borders a reputation that only exists in one country is a vulnerability when operating internationally.</div>
                </div>

                {/* Executive Brief */}
                <div className="glossary-item">
                  <div className="glossary-term">Executive Brief <span className="tag tag-report">Report</span></div>
                  <div className="glossary-def">The summary section at the top of your report. It distils the most critical findings into a short paragraph, written to give you the full picture in under sixty seconds. It highlights what is working in your favour, what poses the greatest risk, and what the single most urgent action is.</div>
                  <div className="plain-english">Think of it as the headline version of your entire report. Read this first. It tells you whether your situation is serious or stable, and what you should focus on before reading anything else.</div>
                </div>

                {/* Risk Level Tags */}
                <div className="glossary-item">
                  <div className="glossary-term">Risk Level Tags <span className="tag tag-report">Report</span></div>
                  <div className="glossary-def">Coloured labels that appear throughout the report to indicate severity. <strong>HIGH RISK</strong> means the issue is actively damaging your reputation or revenue and requires immediate action. <strong>FAIR</strong> means there are meaningful gaps but no immediate crisis. <strong>LOW</strong> on individual results means the item poses minimal current threat.</div>
                  <div className="plain-english">These are like traffic lights. Red or HIGH RISK means stop and deal with this now. Amber or FAIR means attention is needed but you have time to plan. Low means it is noted but not urgent.</div>
                </div>

                {/* Result Type Labels */}
                <div className="glossary-item">
                  <div className="glossary-term">Result Type Labels <span className="tag tag-search">Search</span></div>
                  <div className="glossary-def">Each Google result in your SERP section is tagged with a category showing where it comes from and who controls it. <strong>Owned</strong> means you control it directly. <strong>Organic</strong> means it ranked naturally and is typically a third-party article. <strong>Social</strong> means it comes from a social media profile. <strong>News</strong> means it is editorial media coverage. <strong>Complaint</strong> means it comes from a review or complaint platform.</div>
                  <div className="plain-english">These labels tell you who owns each Google result about you. Owned results are in your control. Organic and News results are written by others. Complaint results are the most damaging because they are designed to warn people away.</div>
                </div>

                {/* Sentiment Trend */}
                <div className="glossary-item">
                  <div className="glossary-term">Sentiment Trend <span className="tag tag-score">Score</span></div>
                  <div className="glossary-def">A rolling view of how the overall sentiment of content about you has changed over the past six months, shown as <strong>Improving, Stable, or Declining</strong>. A trend line that is improving means positive content is gaining ground over negative. A declining trend means new negative content is accumulating.</div>
                  <div className="plain-english">Is your reputation getting better or worse over time? The trend is more important than a single score snapshot. An improving trend on a score of 55 is a much better position than a declining trend on a score of 70.</div>
                </div>

                {/* Industry Benchmark */}
                <div className="glossary-item">
                  <div className="glossary-term">Industry Benchmark <span className="tag tag-score">Score</span></div>
                  <div className="glossary-def">A comparison of your reputation score against two reference points in your industry: the <strong>Market Leader</strong> score (what the top-performing entities achieve) and the <strong>Industry Average</strong> (what a typical entity in your sector scores). This gives your number meaningful context.</div>
                  <div className="plain-english">Your score only makes sense when compared to others. A 65 in an industry where the average is 62 is a good result. A 65 in an industry where leaders score 90 means you have significant ground to close.</div>
                </div>

                {/* LLM */}
                <div className="glossary-item">
                  <div className="glossary-term">LLM <span className="tag tag-ai">AI</span></div>
                  <div className="glossary-def"><strong>Large Language Model.</strong> The technology behind AI assistants like ChatGPT, Claude, and Gemini. LLMs are trained on vast amounts of text from the internet and use that knowledge to answer questions, write content, and summarise information. When someone asks an AI about you, the LLM generates its answer based on what it learned during training.</div>
                  <div className="plain-english">An LLM is the brain inside AI chatbots. It learned about the world by reading billions of web pages and documents. What it says about you depends entirely on what those pages said.</div>
                </div>

                {/* NLP */}
                <div className="glossary-item">
                  <div className="glossary-term">NLP (Natural Language Processing) <span className="tag tag-ai">AI</span></div>
                  <div className="glossary-def">The branch of artificial intelligence that enables computers to read, understand, and interpret human language. Rep500 uses NLP to automatically read every article, review, forum post, and social mention found about you and classify whether it is positive, neutral, or negative.</div>
                  <div className="plain-english">It is the technology that lets the system read text the way a person would, understanding tone and meaning rather than just looking for keywords. This is how Rep500 knows a review is negative even when it does not contain the word &ldquo;bad.&rdquo;</div>
                </div>

                {/* Active Alert */}
                <div className="glossary-item">
                  <div className="glossary-term">Active Alert <span className="tag tag-report">Report</span></div>
                  <div className="glossary-def">A flagged issue in your report that is currently affecting your reputation and requires a response. Active alerts are categorised by severity (Immediate, High, Medium) and show the source of the problem, when it was detected, and its estimated impact on your score and revenue.</div>
                  <div className="plain-english">An active alert is the report&#39;s way of saying &ldquo;this specific thing is hurting you right now.&rdquo; It is not a general risk, it is a named, live problem with a source you can address.</div>
                </div>

                {/* Crisis Signal */}
                <div className="glossary-item">
                  <div className="glossary-term">Crisis Signal <span className="tag tag-report">Report</span></div>
                  <div className="glossary-def">A pattern of content that suggests a reputation crisis is either underway or building. Common crisis signals include a sudden spike in negative mentions, authoritative media coverage linking you to a controversy, or complaint content rising in search rankings. When detected, a <strong>Potential Crisis Detected</strong> alert appears in your report.</div>
                  <div className="plain-english">A crisis signal is an early warning system. It does not mean your reputation is destroyed. It means the algorithm has spotted a pattern that, if left unaddressed, could turn into something much harder to manage.</div>
                </div>

                {/* Content Displacement */}
                <div className="glossary-item">
                  <div className="glossary-term">Content Displacement <span className="tag tag-search">Search</span></div>
                  <div className="glossary-def">The primary strategy for reducing the visibility of negative Google results. Because it is rarely possible to delete third-party content, the goal is to produce enough high-authority positive content that the negative results are pushed from page one to page two or beyond. Most people never look past the first page.</div>
                  <div className="plain-english">You cannot erase a bad article, but you can bury it. Content displacement means publishing enough strong positive content in credible places that when someone searches your name, the good results fill the first page and the bad ones disappear from view.</div>
                </div>

                {/* Content Flooding */}
                <div className="glossary-item">
                  <div className="glossary-term">Content Flooding <span className="tag tag-search">Search</span></div>
                  <div className="glossary-def">A pattern where a large volume of articles, profiles, or social posts about the same entity appear in a very short timeframe. Google&#39;s spam detection algorithms flag this as potentially artificial or manipulative, which can result in penalties that reduce rankings or remove content from search entirely.</div>
                  <div className="plain-english">Publishing too much positive content about yourself too quickly can actually backfire. Google is designed to detect when someone is trying to game the system, and it penalises it. Slow and steady always wins in reputation building.</div>
                </div>

                {/* Video Sentiment */}
                <div className="glossary-item">
                  <div className="glossary-term">Video Sentiment <span className="tag tag-media">Media</span></div>
                  <div className="glossary-def">An assessment of the tone and content of YouTube videos that appear in search results for your name. Videos are classified as <strong>Positive, Neutral, or Mixed</strong> based on their titles, descriptions, and how they frame the subject. Videos with high view counts carry more weight because they reach more people.</div>
                  <div className="plain-english">If someone searches your name and a video titled &ldquo;Is [your company] a scam?&rdquo; appears with 50,000 views, that is doing real damage. Video sentiment tracks whether the videos people find about you are helping or hurting your reputation.</div>
                </div>

                {/* Forum Sentiment */}
                <div className="glossary-item">
                  <div className="glossary-term">Forum Sentiment <span className="tag tag-media">Media</span></div>
                  <div className="glossary-def">The tone of discussions about you on public forums such as Reddit, Quora, and industry-specific communities. Forum content is particularly influential because it reads as unfiltered public opinion. Google increasingly surfaces forum results on page one, and AI engines frequently cite forum discussions in their responses.</div>
                  <div className="plain-english">What are ordinary people saying about you in public conversations online? Forums feel like genuine word of mouth, so negative forum threads are highly credible to readers and damaging to trust, even if the posts are old or anonymous.</div>
                </div>

                {/* Thought Leadership */}
                <div className="glossary-item">
                  <div className="glossary-term">Thought Leadership <span className="tag tag-media">Media</span></div>
                  <div className="glossary-def">A category of content strategy focused on establishing an individual or company as an expert and trusted voice in their field. Thought leadership content includes authored articles in industry publications, podcast appearances, conference talks, interviews, and opinion pieces. It builds reputation through demonstrated expertise rather than direct promotion.</div>
                  <div className="plain-english">Thought leadership is being known as someone worth listening to in your field. When respected publications ask for your opinion or you speak at conferences, you are building the kind of reputation that is very difficult for a single negative article to damage.</div>
                </div>

                {/* Google Images Ranking */}
                <div className="glossary-item">
                  <div className="glossary-term">Google Images Ranking <span className="tag tag-search">Search</span></div>
                  <div className="glossary-def">An analysis of the photos that appear when your name is searched in Google Images. Results are classified by sentiment (positive, neutral, negative) and ownership (whether you control the image or a third party does). Approximately 60% owned or controlled images is considered moderate. High is 80% or above.</div>
                  <div className="plain-english">When someone searches your name in Google Images, what do they see? Professional headshots and positive press photos build trust. Screenshots from negative articles or mugshots are devastating. This score measures how much control you have over your visual first impression.</div>
                </div>

                {/* Board-Ready Summary */}
                <div className="glossary-item">
                  <div className="glossary-term">Board-Ready Summary <span className="tag tag-report">Report</span></div>
                  <div className="glossary-def">A condensed version of the report&#39;s findings formatted for presentation to senior stakeholders, boards, or investors who need the key facts without the full detail. It states the revenue at risk figure, the single most impactful action, and the overall risk level in a few sentences.</div>
                  <div className="plain-english">This is the version you would read aloud in a boardroom or send to an investor. It strips everything down to the three things that matter most: how bad is it, what does it cost, and what is the one thing to do about it.</div>
                </div>

              </div>
            </div>

            {/* ── 5. FAQ ── */}
            <div className="docs-section" id="faq">
              <div className="section-title">
                <div className="section-num">5</div>
                <h2>Frequently asked questions</h2>
              </div>

              <div className="faq-item">
                <div className="faq-q"><span className="q-badge">Q</span> What is the difference between a Person scan and a Company scan?</div>
                <div className="faq-a">A <strong>Person</strong> scan focuses on how your personal name appears in Google, how AI describes you as an individual, your LinkedIn and executive profiles, and your personal domain. A <strong>Company</strong> scan focuses on your brand how your company name ranks, Google Business reviews, brand mentions, and corporate media coverage. Some signals overlap while others are unique to each type.</div>
              </div>

              <div className="faq-item">
                <div className="faq-q"><span className="q-badge">Q</span> Can Rep500 remove negative results from Google?</div>
                <div className="faq-a">No tool can directly delete third-party content from Google. What Rep500 does is show you exactly what the problems are and give you the intelligence to fix them. The primary method is <strong>content displacement</strong> creating enough high-authority positive content that the negative results get pushed to page two or beyond, where very few people look.</div>
              </div>

              <div className="faq-item">
                <div className="faq-q"><span className="q-badge">Q</span> Why does my AI score differ from my Google score?</div>
                <div className="faq-a">Google reflects the real-time web and updates constantly. AI engines like ChatGPT, Claude, and Gemini are trained on a snapshot of the internet from a specific point in time. Positive content you publish today can improve your Google score within weeks, but may take longer to appear in AI outputs. Conversely, old negative content may persist in AI training data long after it&#39;s been pushed off Google&#39;s first page.</div>
              </div>

              <div className="faq-item">
                <div className="faq-q"><span className="q-badge">Q</span> Why does my scan show social profiles I don&#39;t recognise?</div>
                <div className="faq-a">Rep500 surfaces social profiles that appear in Google&#39;s search results for your name at the time of the scan. Profiles that exist but don&#39;t rank on Google are not shown. Old or inactive profiles that still rank will appear. These are owned assets you may want to update or consolidate to strengthen your content control score.</div>
              </div>

              <div className="faq-item">
                <div className="faq-q"><span className="q-badge">Q</span> What does it mean if my Suspicious Activity Score is above 5?</div>
                <div className="faq-a">It indicates that recent content patterns around your name look potentially coordinated or rushed to Google&#39;s spam detection. This is usually triggered by publishing many articles or profiles in a very short timeframe. Google can penalise this with reduced rankings making a reputation problem worse. The recommendation is a paced, organic-looking strategy: spread publications over weeks and months, not days.</div>
              </div>

              <div className="faq-item">
                <div className="faq-q"><span className="q-badge">Q</span> How accurate is the Revenue at Risk figure?</div>
                <div className="faq-a">It is a directional estimate based on established industry research, not an audited financial calculation. It is designed to help you prioritise which issues to fix first by showing their likely business impact. Think of it as an informed indicator that shows relative urgency, not a precise forecast of lost revenue.</div>
              </div>

              <div className="faq-item">
                <div className="faq-q"><span className="q-badge">Q</span> Is my report confidential?</div>
                <div className="faq-a">Yes, completely. Rep500 does not require you to create an account, and no personal data is collected or stored. Every session is encrypted end-to-end, including from Rep500 itself. Nobody at the company can see what name or company you searched, what results appeared, or that a scan took place. The subject of a scan is never notified. Once your session ends, nothing is retained. You are the only person who sees your report.</div>
              </div>

            </div>

            {/* ── CTA ── */}
            <div className="cta-section">
              <div className="cta-eyebrow">Ready to take action?</div>
              <h2 className="cta-heading">Find out what the internet says about you, or your competitors</h2>
              <p className="cta-sub">Get your full reputation intelligence report in under 3 minutes. No account required, completely private.</p>
              <div className="cta-buttons">
                <Link href="/" className="cta-primary">Run a Reputation Analysis &rarr;</Link>
                <a href="mailto:info@reputation500.com" className="cta-secondary">Contact Us</a>
              </div>
            </div>

          </main>
        </div>
      </div>
    </>
  );
}
