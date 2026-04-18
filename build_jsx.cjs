const fs = require('fs');

let svg = fs.readFileSync('./src/assets/herobannersection1.svg', 'utf8');

// Convert attributes to camelCase for JSX
const camelCaseAttrs = [
  'clip-path', 'clip-rule', 'fill-opacity', 'fill-rule', 'color-interpolation-filters',
  'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-dasharray',
  'stroke-dashoffset', 'stroke-opacity', 'font-family', 'font-size', 'font-weight', 'text-anchor',
  'preserveAspectRatio', 'xmlns:xlink'
];

camelCaseAttrs.forEach(attr => {
  const camel = attr.replace(/-([a-z])/g, g => g[1].toUpperCase()).replace(':', '');
  svg = svg.replace(new RegExp(attr, 'g'), camel);
});

// React specific class -> className
svg = svg.replace(/class=/g, 'className=');

// Remove width and height from main SVG tag
svg = svg.replace(/<svg([^>]*)width="[^"]*"([^>]*)>/, '<svg$1$2>');
svg = svg.replace(/<svg([^>]*)height="[^"]*"([^>]*)>/, '<svg$1$2>');

// Strip the large background JPEG to save space
let jpegIndex = svg.indexOf('data:image/jpeg;base64');
if (jpegIndex !== -1) {
    let imgStart = svg.lastIndexOf('<image', jpegIndex);
    let imgEnd = svg.indexOf('/>', imgStart) + 2;
    if (imgEnd < imgStart + 5) imgEnd = svg.indexOf('</image>', imgStart) + 8;
    svg = svg.substring(0, imgStart) + '{/* background jpeg removed */}' + svg.substring(imgEnd);
}

const component = `
import React, { useEffect, useRef } from "react";
import "./AccordHero.css";

const ParticleNetwork = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 1.5 + 0.5;
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
        ctx.fillStyle = 'rgba(255, 117, 31, 0.4)';
        ctx.fill();
      }
    }

    for (let i = 0; i < 80; i++) {
        particles.push(new Particle());
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      
      // Connect
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = \`rgba(255, 117, 31, \${0.2 - dist/500})\`;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  );
};

export default function AccordHero() {
  return (
    <div className="accord-hero-wrapper" style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden", backgroundColor: "#0a0a0a", borderRadius: "16px", marginBottom: "16px" }}>
      <ParticleNetwork />
      <div className="hero-svg-container" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1 }}>
        ${svg}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('./src/components/AccordHero.jsx', component);
