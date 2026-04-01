'use client';

import { useEffect, useRef } from 'react';

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const dots: { x: number; y: number; r: number; opacity: number; drift: number }[] = [];
    const COUNT = 60;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function init() {
      resize();
      dots.length = 0;
      for (let i = 0; i < COUNT; i++) {
        dots.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          r: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.15 + 0.05,
          drift: Math.random() * 0.15 + 0.02,
        });
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const d of dots) {
        d.y -= d.drift;
        if (d.y < -5) { d.y = canvas!.height + 5; d.x = Math.random() * canvas!.width; }
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(196, 184, 168, ${d.opacity})`;
        ctx!.fill();
      }
      animationId = requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" aria-hidden="true" />
  );
}
