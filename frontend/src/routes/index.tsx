import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
// import { authenticate } from "#/services/auth";

export const Route = createFileRoute("/")({
  // beforeLoad: async () => {
  //   const isAuthenticated = await authenticate();
  //   if (isAuthenticated) {
  //     throw redirect({
  //       to: "/dashboard",
  //       replace: true,
  //       search: {},
  //     });
  //   }
  // },
  component: LandingPage,
});

export default function LandingPage() {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const voteCounterRef = useRef<HTMLSpanElement>(null);
  const miniBarsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    document
      .querySelectorAll(".reveal, .reveal-stagger")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Hero poll bars animation
  useEffect(() => {
    const targets = [52, 28, 12, 8];
    const labels = ["52%", "28%", "12%", "8%"];
    const timer = setTimeout(() => {
      targets.forEach((t, i) => {
        const bar = barsRef.current[i];
        if (bar) bar.style.width = `${t}%`;
        setTimeout(() => {
          const pctSpan = document.getElementById(`pct-${i}`);
          if (pctSpan) pctSpan.textContent = labels[i];
        }, 800);
      });
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Simulated live vote counter
  useEffect(() => {
    let votes = 247;
    const interval = setInterval(() => {
      votes += Math.floor(Math.random() * 3);
      if (voteCounterRef.current) {
        voteCounterRef.current.textContent = `${votes.toLocaleString()} responses`;
      }
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  // Mini bars animation on scroll
  useEffect(() => {
    if (!miniBarsRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bars = entry.target.querySelectorAll(".mini-bar-fill");
            bars.forEach((bar: any) => {
              const height = bar.dataset.h;
              if (height) bar.style.height = `${height}%`;
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(miniBarsRef.current);
    return () => observer.disconnect();
  }, []);

  // Hamburger menu (original JS)
  useEffect(() => {
    const ham = document.getElementById("hamburger");
    const mob = document.getElementById("mobile-menu");
    if (!ham || !mob) return;
    const handleClick = () => {
      ham.classList.toggle("open");
      mob.classList.toggle("open");
    };
    ham.addEventListener("click", handleClick);
    mob.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        ham.classList.remove("open");
        mob.classList.remove("open");
      }),
    );
    return () => ham.removeEventListener("click", handleClick);
  }, []);

  return (
    <>
      {/* Original styles – unchanged */}
      <style>{`
        *,
        *::before,
        *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :root {
          --bg-0: #0a0a0a;
          --bg-1: #111111;
          --bg-2: #181818;
          --bg-3: #222222;
          --ink-1: #efefed;
          --ink-2: #888884;
          --ink-3: #444440;
          --green-acc: #4ade80;
          --green-bar: #22c55e;
          --green-dim: rgba(74, 222, 128, 0.1);
          --green-glow: rgba(34, 197, 94, 0.18);
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          background: var(--bg-0);
          color: var(--ink-1);
          font-family: "Syne", system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
          margin: 0;
        }

        ::-webkit-scrollbar {
          width: 3px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 2px;
        }

        body::before {
          content: "";
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.022;
          pointer-events: none;
          z-index: 1000;
        }

        .grid-bg {
          position: fixed;
          inset: 0;
          background-image: linear-gradient(rgba(74, 222, 128, 0.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(74, 222, 128, 0.028) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(1.25rem, 5vw, 3rem);
          height: 56px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(10, 10, 10, 0.82);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--ink-1);
          text-decoration: none;
        }

        .logo-icon {
          width: 26px;
          height: 26px;
          background: var(--green-dim);
          border: 1px solid rgba(74, 222, 128, 0.25);
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: clamp(1rem, 3vw, 2rem);
          list-style: none;
        }

        .nav-links a {
          font-size: 13px;
          color: var(--ink-2);
          text-decoration: none;
          letter-spacing: 0.01em;
          transition: color 0.15s;
        }
        .nav-links a:hover {
          color: var(--ink-1);
        }

        .nav-cta {
          font-family: "DM Mono", monospace;
          font-size: 12px;
          font-weight: 500;
          color: var(--green-acc) !important;
          border: 1px solid rgba(74, 222, 128, 0.3);
          padding: 6px 14px;
          border-radius: 6px;
          background: var(--green-dim);
          transition: background 0.15s, border-color 0.15s !important;
        }
        .nav-cta:hover {
          background: rgba(74, 222, 128, 0.16) !important;
          border-color: rgba(74, 222, 128, 0.5) !important;
          color: var(--green-acc) !important;
        }

        .hamburger {
          display: none;
          flex-direction: column;
          gap: 4px;
          cursor: pointer;
          padding: 4px;
          background: none;
          border: none;
        }
        .hamburger span {
          display: block;
          width: 20px;
          height: 1.5px;
          background: var(--ink-2);
          border-radius: 2px;
          transition: transform 0.2s, opacity 0.2s;
        }
        .hamburger.open span:nth-child(1) {
          transform: translateY(5.5px) rotate(45deg);
        }
        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }
        .hamburger.open span:nth-child(3) {
          transform: translateY(-5.5px) rotate(-45deg);
        }

        .mobile-menu {
          display: none;
          position: fixed;
          top: 56px;
          left: 0;
          right: 0;
          background: rgba(10, 10, 10, 0.97);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 1.5rem clamp(1.25rem, 5vw, 3rem);
          flex-direction: column;
          gap: 1.25rem;
          z-index: 99;
          backdrop-filter: blur(16px);
        }
        .mobile-menu.open {
          display: flex;
        }
        .mobile-menu a {
          font-size: 14px;
          color: var(--ink-2);
          text-decoration: none;
          transition: color 0.15s;
        }
        .mobile-menu a:hover {
          color: var(--ink-1);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 120px clamp(1.25rem, 6vw, 4rem) 80px;
          position: relative;
        }

        .hero-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -55%);
          width: min(700px, 110vw);
          height: min(700px, 110vw);
          background: radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 65%);
          pointer-events: none;
        }

        .hero-eyebrow {
          font-family: "DM Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--green-acc);
          background: var(--green-dim);
          border: 1px solid rgba(74, 222, 128, 0.2);
          padding: 5px 14px;
          border-radius: 100px;
          margin-bottom: 28px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          animation: fadeUp 0.7s ease-out both;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--green-acc);
          animation: pulse-dot 1.6s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.5);
          }
          50% {
            opacity: 0.7;
            transform: scale(0.9);
            box-shadow: 0 0 0 5px rgba(74, 222, 128, 0);
          }
        }

        .hero-title {
          font-size: clamp(2.8rem, 8vw, 6.5rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 0.95;
          color: var(--ink-1);
          margin-bottom: 24px;
          animation: fadeUp 0.7s 0.1s ease-out both;
        }

        .hero-title em {
          font-style: normal;
          color: var(--green-acc);
        }

        .hero-sub {
          font-size: clamp(14px, 2vw, 17px);
          color: var(--ink-2);
          max-width: 480px;
          line-height: 1.65;
          margin-bottom: 40px;
          animation: fadeUp 0.7s 0.2s ease-out both;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
          animation: fadeUp 0.7s 0.3s ease-out both;
        }

        .btn-primary {
          font-family: "DM Mono", monospace;
          font-size: 13px;
          font-weight: 500;
          color: #0a0a0a;
          background: var(--green-acc);
          padding: 12px 26px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background 0.15s, transform 0.1s;
        }
        .btn-primary:hover {
          background: #6ee79b;
          transform: translateY(-1px);
        }
        .btn-primary:active {
          transform: scale(0.98);
        }

        .btn-ghost {
          font-family: "DM Mono", monospace;
          font-size: 13px;
          color: var(--ink-2);
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: border-color 0.15s, color 0.15s;
        }
        .btn-ghost:hover {
          border-color: rgba(255, 255, 255, 0.22);
          color: var(--ink-1);
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-widget-wrap {
          margin-top: 72px;
          position: relative;
          animation: fadeUp 0.8s 0.45s ease-out both;
          width: 100%;
          max-width: 440px;
        }

        .widget-glow {
          position: absolute;
          inset: -30px;
          background: radial-gradient(ellipse, rgba(34, 197, 94, 0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .poll-widget {
          position: relative;
          background: var(--bg-1);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 24px;
          text-align: left;
        }

        .poll-widget-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .pw-badge {
          font-family: "DM Mono", monospace;
          font-size: 10px;
          color: var(--green-acc);
          background: var(--green-dim);
          border: 1px solid rgba(74, 222, 128, 0.2);
          padding: 3px 9px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .pw-votes {
          font-family: "DM Mono", monospace;
          font-size: 11px;
          color: var(--ink-3);
        }

        .poll-widget-q {
          font-size: 14px;
          font-weight: 600;
          color: var(--ink-1);
          margin-bottom: 16px;
          line-height: 1.4;
        }

        .poll-option {
          margin-bottom: 10px;
        }

        .poll-option-label {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--ink-2);
          margin-bottom: 5px;
        }

        .poll-option-label span:last-child {
          font-family: "DM Mono", monospace;
          color: var(--ink-3);
        }

        .poll-bar-bg {
          height: 6px;
          border-radius: 3px;
          background: var(--bg-3);
          overflow: hidden;
        }

        .poll-bar-fill {
          height: 100%;
          border-radius: 3px;
          background: var(--green-bar);
          width: 0%;
          transition: width 1.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .poll-bar-fill.leading {
          background: var(--green-acc);
        }

        .stats-strip {
          display: flex;
          justify-content: center;
          gap: clamp(1.5rem, 4vw, 4rem);
          flex-wrap: wrap;
          padding: 48px clamp(1.25rem, 5vw, 3rem);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          background: var(--bg-1);
        }

        .stat-item {
          text-align: center;
          animation: fadeUp 0.6s ease-out both;
        }

        .stat-num {
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          color: var(--ink-1);
        }

        .stat-num span {
          color: var(--green-acc);
        }

        .stat-label {
          font-family: "DM Mono", monospace;
          font-size: 11px;
          color: var(--ink-3);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-top: 4px;
        }

        section {
          padding: clamp(64px, 10vw, 112px) clamp(1.25rem, 6vw, 4rem);
          max-width: 1080px;
          margin: 0 auto;
        }

        .section-label {
          font-family: "DM Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--green-acc);
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-label::before {
          content: "";
          display: block;
          width: 20px;
          height: 1px;
          background: var(--green-acc);
          opacity: 0.6;
        }

        .section-title {
          font-size: clamp(1.6rem, 4vw, 3rem);
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 1.05;
          color: var(--ink-1);
          margin-bottom: 16px;
        }

        .section-body {
          font-size: 15px;
          color: var(--ink-2);
          line-height: 1.7;
          max-width: 520px;
        }

        .features-header {
          margin-bottom: clamp(40px, 6vw, 64px);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 14px;
          overflow: hidden;
        }

        .feature-card {
          background: var(--bg-0);
          padding: clamp(24px, 4vw, 36px);
          position: relative;
          overflow: hidden;
          transition: background 0.2s;
        }

        .feature-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: var(--green-dim);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .feature-card:hover {
          background: var(--bg-1);
        }
        .feature-card:hover::after {
          opacity: 1;
        }

        .feature-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: var(--bg-2);
          border: 1px solid rgba(255, 255, 255, 0.07);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          position: relative;
          z-index: 1;
        }

        .feature-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--ink-1);
          margin-bottom: 8px;
          position: relative;
          z-index: 1;
        }

        .feature-desc {
          font-size: 13px;
          color: var(--ink-2);
          line-height: 1.65;
          position: relative;
          z-index: 1;
        }

        .hiw-section {
          display: flex;
          flex-direction: column;
          gap: clamp(40px, 6vw, 64px);
        }

        .hiw-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 2px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          overflow: hidden;
        }

        .hiw-step {
          background: var(--bg-0);
          padding: clamp(24px, 4vw, 32px);
          position: relative;
        }

        .step-num {
          font-family: "DM Mono", monospace;
          font-size: 10px;
          color: var(--ink-3);
          letter-spacing: 0.1em;
          margin-bottom: 12px;
        }

        .step-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--ink-1);
          margin-bottom: 8px;
        }

        .step-desc {
          font-size: 13px;
          color: var(--ink-2);
          line-height: 1.6;
        }

        .step-line {
          position: absolute;
          top: 50%;
          right: 0;
          width: 2px;
          height: 28px;
          background: rgba(74, 222, 128, 0.2);
          transform: translateY(-50%);
        }

        .bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 1.5px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 14px;
          overflow: hidden;
        }

        .bento-cell {
          background: var(--bg-0);
          padding: clamp(20px, 3.5vw, 32px);
          transition: background 0.2s;
        }
        .bento-cell:hover {
          background: var(--bg-1);
        }

        .bento-cell.col-8 {
          grid-column: span 8;
        }
        .bento-cell.col-4 {
          grid-column: span 4;
        }
        .bento-cell.col-6 {
          grid-column: span 6;
        }
        .bento-cell.col-12 {
          grid-column: span 12;
        }

        @media (max-width: 720px) {
          .bento-cell.col-8,
          .bento-cell.col-4,
          .bento-cell.col-6 {
            grid-column: span 12;
          }
        }

        .bento-tag {
          font-family: "DM Mono", monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink-3);
          margin-bottom: 10px;
        }

        .bento-title {
          font-size: clamp(14px, 2vw, 18px);
          font-weight: 700;
          color: var(--ink-1);
          margin-bottom: 8px;
          line-height: 1.2;
        }

        .bento-desc {
          font-size: 13px;
          color: var(--ink-2);
          line-height: 1.6;
        }

        .bento-visual {
          margin-top: 20px;
        }

        .mini-bars {
          display: flex;
          align-items: flex-end;
          gap: 5px;
          height: 52px;
        }

        .mini-bar {
          flex: 1;
          background: var(--bg-3);
          border-radius: 3px 3px 0 0;
          position: relative;
          overflow: hidden;
        }

        .mini-bar-fill {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--green-bar);
          border-radius: 3px 3px 0 0;
          transition: height 1.2s cubic-bezier(0.4, 0, 0.2, 1);
          height: 0%;
        }

        .mini-bar-fill.accent {
          background: var(--green-acc);
        }

        .cta-section {
          text-align: center;
          max-width: 600px !important;
          padding-top: clamp(64px, 10vw, 120px);
          padding-bottom: clamp(80px, 12vw, 140px);
        }

        .cta-title {
          font-size: clamp(2rem, 5vw, 4rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
          color: var(--ink-1);
          margin-bottom: 20px;
        }

        .cta-sub {
          font-size: 15px;
          color: var(--ink-2);
          line-height: 1.7;
          margin-bottom: 36px;
        }

        .cta-glow {
          position: relative;
          display: inline-block;
        }

        .cta-glow::before {
          content: "";
          position: absolute;
          inset: -40px;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        footer {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding: 28px clamp(1.25rem, 5vw, 3rem);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .footer-logo {
          font-size: 14px;
          font-weight: 700;
          color: var(--ink-2);
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .footer-copy {
          font-family: "DM Mono", monospace;
          font-size: 11px;
          color: var(--ink-3);
        }

        .footer-links {
          display: flex;
          gap: 20px;
          list-style: none;
        }

        .footer-links a {
          font-family: "DM Mono", monospace;
          font-size: 11px;
          color: var(--ink-3);
          text-decoration: none;
          transition: color 0.15s;
        }
        .footer-links a:hover {
          color: var(--ink-2);
        }

        .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.65s ease-out, transform 0.65s ease-out;
        }
        .reveal.visible {
          opacity: 1;
          transform: none;
        }

        .reveal-stagger > * {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.55s ease-out, transform 0.55s ease-out;
        }
        .reveal-stagger.visible > *:nth-child(1) {
          opacity: 1;
          transform: none;
          transition-delay: 0s;
        }
        .reveal-stagger.visible > *:nth-child(2) {
          opacity: 1;
          transform: none;
          transition-delay: 0.07s;
        }
        .reveal-stagger.visible > *:nth-child(3) {
          opacity: 1;
          transform: none;
          transition-delay: 0.14s;
        }
        .reveal-stagger.visible > *:nth-child(4) {
          opacity: 1;
          transform: none;
          transition-delay: 0.21s;
        }
        .reveal-stagger.visible > *:nth-child(5) {
          opacity: 1;
          transform: none;
          transition-delay: 0.28s;
        }
        .reveal-stagger.visible > *:nth-child(6) {
          opacity: 1;
          transform: none;
          transition-delay: 0.35s;
        }

        .ticker-wrap {
          overflow: hidden;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding: 13px 0;
          background: var(--bg-1);
        }

        .ticker-track {
          display: flex;
          gap: 64px;
          width: max-content;
          animation: ticker 28s linear infinite;
        }

        .ticker-item {
          font-family: "DM Mono", monospace;
          font-size: 11px;
          color: var(--ink-3);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ticker-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--green-acc);
          opacity: 0.5;
        }

        @keyframes ticker {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 640px) {
          .nav-links {
            display: none;
          }
          .hamburger {
            display: flex;
          }
          .step-line {
            display: none;
          }
          footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
        }
      `}</style>

      {/* Load Google Fonts exactly as in original HTML */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div className="grid-bg"></div>

      {/* Navigation */}
      <nav>
        <a href="#" className="nav-logo">
          <div className="logo-icon">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle
                cx="8"
                cy="8"
                r="6.5"
                stroke="#4ade80"
                strokeWidth="1.3"
              />
              <circle cx="8" cy="8" r="3" fill="#4ade80" fillOpacity="0.35" />
              <circle cx="8" cy="8" r="1.3" fill="#4ade80" />
            </svg>
          </div>
          Pulse
        </a>
        <ul className="nav-links">
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="#how">How it works</a>
          </li>
          <li>
            <a href="#usecases">Use cases</a>
          </li>
          <li>
            <Link to="/login" className="nav-cta">
              Sign in →
            </Link>
          </li>
        </ul>
        <button className="hamburger" id="hamburger" aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      <div className="mobile-menu" id="mobile-menu">
        <a href="#features">Features</a>
        <a href="#how">How it works</a>
        <a href="#usecases">Use cases</a>
        <Link to="/login" style={{ color: "var(--green-acc)" }}>
          Sign in →
        </Link>
      </div>

      {/* Hero */}
      <div className="hero">
        <div className="hero-glow"></div>
        <span className="hero-eyebrow">
          <span className="live-dot"></span>
          Real-time polling platform
        </span>
        <h1 className="hero-title">
          Ask anything.
          <br />
          <em>Know instantly.</em>
        </h1>
        <p className="hero-sub">
          Create polls in seconds, share a link, and watch responses stream in
          live. Beautiful analytics, anonymous or authenticated, no setup
          required.
        </p>
        <div className="hero-actions">
          <Link to="/signup" className="btn-primary">
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 1v10M1 6h10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            Create a poll
          </Link>
          <a href="#how" className="btn-ghost">
            {" "}
            See how it works{" "}
          </a>
        </div>

        <div className="hero-widget-wrap">
          <div className="widget-glow"></div>
          <div className="poll-widget">
            <div className="poll-widget-header">
              <span className="pw-badge">
                {" "}
                <span className="live-dot"></span> Live{" "}
              </span>
              <span className="pw-votes" ref={voteCounterRef}>
                247 responses
              </span>
            </div>
            <p className="poll-widget-q">
              Which feature would you prioritize for Q3?
            </p>
            {[
              "Mobile app",
              "API access",
              "Integrations",
              "Analytics dashboard",
            ].map((label, idx) => (
              <div key={idx} className="poll-option">
                <div className="poll-option-label">
                  <span>{label}</span>
                  <span id={`pct-${idx}`}>0%</span>
                </div>
                <div className="poll-bar-bg">
                  <div
                    ref={(el) => {
                      barsRef.current[idx] = el;
                    }}
                    className={`poll-bar-fill ${idx === 0 ? "leading" : ""}`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div className="ticker-wrap">
        <div className="ticker-track" id="ticker">
          <span className="ticker-item">
            <span className="ticker-dot"></span> Real-time results
          </span>
          <span className="ticker-item">
            <span className="ticker-dot"></span> Anonymous voting
          </span>
          <span className="ticker-item">
            <span className="ticker-dot"></span> Live WebSocket updates
          </span>
          <span className="ticker-item">
            <span className="ticker-dot"></span> One-click sharing
          </span>
          <span className="ticker-item">
            <span className="ticker-dot"></span> Response velocity charts
          </span>
          <span className="ticker-item">
            <span className="ticker-dot"></span> Auto-expiry polls
          </span>
          <span className="ticker-item">
            <span className="ticker-dot"></span> Publish final results
          </span>
          <span className="ticker-item">
            <span className="ticker-dot"></span> Draft mode
          </span>
          {/* duplicate for seamless loop */}
          <span className="ticker-item">
            <span className="ticker-dot"></span> Real-time results
          </span>
          <span className="ticker-item">
            <span className="ticker-dot"></span> Anonymous voting
          </span>
          <span className="ticker-item">
            <span className="ticker-dot"></span> Live WebSocket updates
          </span>
          <span className="ticker-item">
            <span className="ticker-dot"></span> One-click sharing
          </span>
          <span className="ticker-item">
            <span className="ticker-dot"></span> Response velocity charts
          </span>
          <span className="ticker-item">
            <span className="ticker-dot"></span> Auto-expiry polls
          </span>
          <span className="ticker-item">
            <span className="ticker-dot"></span> Publish final results
          </span>
          <span className="ticker-item">
            <span className="ticker-dot"></span> Draft mode
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-strip reveal-stagger">
        <div className="stat-item">
          <div className="stat-num">
            10<span>k+</span>
          </div>
          <div className="stat-label">Polls created</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">
            2<span>ms</span>
          </div>
          <div className="stat-label">Avg. update latency</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">
            99<span>%</span>
          </div>
          <div className="stat-label">Uptime</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">∞</div>
          <div className="stat-label">Respondents per poll</div>
        </div>
      </div>

      {/* Features */}
      <section id="features">
        <div className="features-header reveal">
          <div className="section-label">Features</div>
          <h2 className="section-title">
            Everything you need.
            <br />
            Nothing you don't.
          </h2>
          <p className="section-body">
            Pulse is engineered for speed and clarity — from creation to
            insight, every step is stripped of friction.
          </p>
        </div>
        <div className="features-grid reveal-stagger">
          {/* Feature 1 */}
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <circle
                  cx="8.5"
                  cy="8.5"
                  r="6.5"
                  stroke="#4ade80"
                  strokeWidth="1.3"
                />
                <circle
                  cx="8.5"
                  cy="8.5"
                  r="2.5"
                  fill="#4ade80"
                  fillOpacity="0.4"
                />
                <circle cx="8.5" cy="8.5" r="1" fill="#4ade80" />
              </svg>
            </div>
            <div className="feature-title">Live result streaming</div>
            <div className="feature-desc">
              WebSocket-powered updates push vote counts to every connected
              viewer the instant they happen. No polling. No refresh.
            </div>
          </div>
          {/* Feature 2 */}
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect
                  x="2"
                  y="9"
                  width="3"
                  height="5"
                  rx="1"
                  fill="#4ade80"
                  fillOpacity="0.6"
                />
                <rect
                  x="6.5"
                  y="6"
                  width="3"
                  height="8"
                  rx="1"
                  fill="#4ade80"
                  fillOpacity="0.8"
                />
                <rect
                  x="11"
                  y="3"
                  width="3"
                  height="11"
                  rx="1"
                  fill="#4ade80"
                />
              </svg>
            </div>
            <div className="feature-title">Response velocity</div>
            <div className="feature-desc">
              Sparkline charts show how engagement evolves over the life of a
              poll — see your peak moments and quiet spells at a glance.
            </div>
          </div>
          {/* Feature 3 */}
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8a5 5 0 1 1 10 0A5 5 0 0 1 3 8Z"
                  stroke="#4ade80"
                  strokeWidth="1.3"
                />
                <path
                  d="M8 5v3l2 2"
                  stroke="#4ade80"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="feature-title">Auto-expiry</div>
            <div className="feature-desc">
              Set polls to close automatically after 1 hour, 1 day, or 1 week.
              They switch to ENDED status without any manual intervention.
            </div>
          </div>
          {/* Feature 4 */}
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle
                  cx="8"
                  cy="5"
                  r="2.5"
                  stroke="#4ade80"
                  strokeWidth="1.3"
                />
                <path
                  d="M3 13c0-2.76 2.24-5 5-5s5 2.24 5 5"
                  stroke="#4ade80"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
                <path
                  d="M11 7l1.5 1.5L15 6"
                  stroke="#4ade80"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="feature-title">Flexible authentication</div>
            <div className="feature-desc">
              Toggle between sign-in required (authenticated) and anonymous mode
              — soft dedup via cookie + IP keeps anonymous polls clean.
            </div>
          </div>
          {/* Feature 5 */}
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9M10 2h4m0 0v4m0-4L7 9"
                  stroke="#4ade80"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="feature-title">One-link sharing</div>
            <div className="feature-desc">
              Every poll gets a clean shareable URL. Copy and send — respondents
              need nothing more than the link to participate.
            </div>
          </div>
          {/* Feature 6 */}
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect
                  x="2"
                  y="2"
                  width="12"
                  height="12"
                  rx="2"
                  stroke="#4ade80"
                  strokeWidth="1.3"
                />
                <path
                  d="M5 8h6M5 5.5h4M5 10.5h3"
                  stroke="#4ade80"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="feature-title">Draft & publish flow</div>
            <div className="feature-desc">
              Build your poll privately, save as draft, then activate when
              ready. When it's over, publish results for everyone to see.
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how">
        <div className="features-header reveal">
          <div className="section-label">How it works</div>
          <h2 className="section-title">
            Live in under
            <br />
            60 seconds.
          </h2>
          <p className="section-body">
            From idea to insight in four simple steps — Pulse handles everything
            in between.
          </p>
        </div>
        <div className="hiw-steps reveal-stagger">
          <div className="hiw-step">
            <div className="step-num">01 / create</div>
            <div className="step-title">Write your question</div>
            <div className="step-desc">
              Type your question, add up to 10 options, configure expiry and
              anonymity settings.
            </div>
            <div className="step-line"></div>
          </div>
          <div className="hiw-step">
            <div className="step-num">02 / activate</div>
            <div className="step-title">Go live instantly</div>
            <div className="step-desc">
              Hit "Activate poll" and your question is live immediately. No
              waiting, no approval queue.
            </div>
            <div className="step-line"></div>
          </div>
          <div className="hiw-step">
            <div className="step-num">03 / share</div>
            <div className="step-title">Send the link</div>
            <div className="step-desc">
              Copy the URL from your analytics dashboard and send it anywhere —
              Slack, email, socials.
            </div>
            <div className="step-line"></div>
          </div>
          <div className="hiw-step">
            <div className="step-num">04 / analyze</div>
            <div className="step-title">Watch it unfold</div>
            <div className="step-desc">
              Track live counts, velocity charts, and leading options in your
              dashboard. Publish results when you're done.
            </div>
          </div>
        </div>
      </section>

      {/* Use cases bento */}
      <section id="usecases">
        <div className="features-header reveal">
          <div className="section-label">Use cases</div>
          <h2 className="section-title">Built for every team.</h2>
        </div>
        <div className="bento-grid reveal">
          <div className="bento-cell col-8">
            <div className="bento-tag">Product teams</div>
            <div className="bento-title">Validate ideas before you build</div>
            <div className="bento-desc">
              Run quick feature prioritization polls across your team or
              customer base. Make data-driven roadmap decisions in hours, not
              weeks.
            </div>
            <div className="bento-visual">
              <div className="mini-bars" ref={miniBarsRef}>
                <div className="mini-bar">
                  <div className="mini-bar-fill accent" data-h="72"></div>
                </div>
                <div className="mini-bar">
                  <div className="mini-bar-fill" data-h="45"></div>
                </div>
                <div className="mini-bar">
                  <div className="mini-bar-fill" data-h="61"></div>
                </div>
                <div className="mini-bar">
                  <div className="mini-bar-fill" data-h="30"></div>
                </div>
                <div className="mini-bar">
                  <div className="mini-bar-fill" data-h="55"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="bento-cell col-4">
            <div className="bento-tag">Events & meetups</div>
            <div className="bento-title">Engage your audience live</div>
            <div className="bento-desc">
              Project results in real-time during talks. Drive participation. No
              app download required.
            </div>
          </div>
          <div className="bento-cell col-4">
            <div className="bento-tag">Recruiting</div>
            <div className="bento-title">Candidate preference polls</div>
            <div className="bento-desc">
              Gather team alignment on hiring decisions anonymously — no bias
              from seniority.
            </div>
          </div>
          <div className="bento-cell col-8">
            <div className="bento-tag">Community managers</div>
            <div className="bento-title">
              Pulse your community's temperature
            </div>
            <div className="bento-desc">
              Deploy anonymous polls to get honest feedback from your community
              on any topic. Results update live so conversations form around
              real data.
            </div>
          </div>
          <div className="bento-cell col-6">
            <div className="bento-tag">Educators</div>
            <div className="bento-title">Classroom check-ins</div>
            <div className="bento-desc">
              Quick comprehension polls during lectures. Students vote on their
              devices; results animate on the projector.
            </div>
          </div>
          <div className="bento-cell col-6">
            <div className="bento-tag">Retrospectives</div>
            <div className="bento-title">Team mood & health checks</div>
            <div className="bento-desc">
              Anonymous sprint retros and team health polls — surface issues
              before they compound.
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="reveal">
          <div className="section-label" style={{ justifyContent: "center" }}>
            Get started
          </div>
          <h2 className="cta-title">
            Your audience is
            <br />
            <em style={{ fontStyle: "normal", color: "var(--green-acc)" }}>
              waiting to answer.
            </em>
          </h2>
          <p className="cta-sub">
            Create your first poll free. No credit card, no setup. Just a
            question and a link.
          </p>
          <div className="cta-glow">
            <Link
              to="/signup"
              className="btn-primary"
              style={{ fontSize: "14px", padding: "14px 32px" }}
            >
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 1v10M1 6h10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              Create your first poll
            </Link>
          </div>
          <p
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: "11px",
              color: "var(--ink-3)",
              marginTop: "20px",
            }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "var(--ink-2)",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-logo">
          <div className="logo-icon">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle
                cx="8"
                cy="8"
                r="6.5"
                stroke="#4ade80"
                strokeWidth="1.3"
              />
              <circle cx="8" cy="8" r="3" fill="#4ade80" fillOpacity="0.3" />
              <circle cx="8" cy="8" r="1.3" fill="#4ade80" />
            </svg>
          </div>
          Pulse
        </div>
        <ul className="footer-links">
          <li>
            <a href="#">Privacy</a>
          </li>
          <li>
            <a href="#">Terms</a>
          </li>
          <li>
            <a href="#">Status</a>
          </li>
        </ul>
        <span className="footer-copy">© 2025 Pulse. All rights reserved.</span>
      </footer>
    </>
  );
}
