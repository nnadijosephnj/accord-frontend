import React, { useEffect, useRef } from "react";
import "./AccordHero.css";

/* ─── Particle canvas background ─── */
const ParticleNetwork = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animId;
    let particles = [];

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };

    window.addEventListener("resize", resize);
    resize();

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 1.2 + 0.4;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 117, 31, 0.35)";
        ctx.fill();
      }
    }

    for (let i = 0; i < 72; i++) particles.push(new Particle());

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      ctx.lineWidth = 0.4;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 117, 31, ${0.18 - dist / 550})`;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" />;
};

/* ─── Mock agreement card (right side) ─── */
const AgreementCard = () => (
  <div className="hero-card">
    <div className="hero-card-header">
      <span className="hero-card-badge">Active</span>
      <span className="hero-card-label">Escrow Agreement</span>
    </div>
    <div className="hero-card-body">
      <div className="hero-card-row">
        <span className="hero-card-field">Client</span>
        <span className="hero-card-value hero-address">0x4f3a…c81d</span>
      </div>
      <div className="hero-card-row">
        <span className="hero-card-field">Freelancer</span>
        <span className="hero-card-value hero-address">0x9b2c…a37e</span>
      </div>
      <div className="hero-card-row">
        <span className="hero-card-field">Amount</span>
        <span className="hero-card-value hero-amount">1,200 USDT</span>
      </div>
      <div className="hero-card-row">
        <span className="hero-card-field">Status</span>
        <span className="hero-card-status">Funded · Awaiting delivery</span>
      </div>
    </div>
    <div className="hero-card-actions">
      <button className="hero-card-btn-primary" disabled>Release Funds</button>
      <button className="hero-card-btn-ghost" disabled>Raise Dispute</button>
    </div>
  </div>
);

/* ─── Stat pill (left side) ─── */
const StatPill = ({ label, value }) => (
  <div className="hero-stat-pill">
    <span className="hero-stat-value">{value}</span>
    <span className="hero-stat-label">{label}</span>
  </div>
);

/* ─── Main hero ─── */
export default function AccordHero() {
  return (
    <div className="hero-root">
      {/* animated particle background */}
      <ParticleNetwork />

      {/* radial glow accents */}
      <div className="hero-glow hero-glow-left" />
      <div className="hero-glow hero-glow-right" />

      {/* grid overlay */}
      <div className="hero-grid" />

      {/* content layer */}
      <div className="hero-content">
        {/* left: headline + stats */}
        <div className="hero-left">
          <p className="hero-eyebrow">Onchain Escrow</p>
          <h1 className="hero-headline">
            Agreements that settle themselves.
          </h1>
          <p className="hero-subtext">
            Fund, deliver, and release — all inside a shared contract room
            with no platform in the middle.
          </p>
          <div className="hero-stats">
            <StatPill value="100%" label="Non-custodial" />
            <StatPill value="INJ" label="EVM network" />
            <StatPill value="Link" label="Share to onboard" />
          </div>
        </div>

        {/* right: mock agreement card */}
        <div className="hero-right">
          <AgreementCard />
        </div>
      </div>

      {/* bottom fade */}
      <div className="hero-fade-bottom" />
    </div>
  );
}
