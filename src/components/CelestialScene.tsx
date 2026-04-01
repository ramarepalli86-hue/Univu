'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

interface CelestialSceneProps {
  sunSign?: string;
  moonSign?: string;
  rashi?: string;
  nakshatra?: string;
  isPlaying?: boolean;
}

const SIGN_COLORS: Record<string, number> = {
  Aries: 0xff4444, Taurus: 0x66bb6a, Gemini: 0xffeb3b, Cancer: 0x90caf9,
  Leo: 0xffa726, Virgo: 0xa5d6a7, Libra: 0xce93d8, Scorpio: 0xd32f2f,
  Sagittarius: 0x7e57c2, Capricorn: 0x795548, Aquarius: 0x29b6f6, Pisces: 0x80deea,
};

export default function CelestialScene({
  sunSign = 'Leo',
  moonSign = 'Cancer',
  rashi = 'Simha',
  nakshatra = 'Magha',
  isPlaying = true,
}: CelestialSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);

  const createScene = useCallback(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 2, 12);
    camera.lookAt(0, 0, 0);

    // ─── Ambient light ───
    scene.add(new THREE.AmbientLight(0xfff5e6, 0.4));

    // ─── Point light (Sun) ───
    const sunLight = new THREE.PointLight(0xffaa33, 2, 50);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // ─── Central Sun sphere ───
    const sunColor = SIGN_COLORS[sunSign] || 0xffa726;
    const sunGeo = new THREE.SphereGeometry(1, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      color: sunColor,
      transparent: true,
      opacity: 0.9,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);

    // Sun glow
    const glowGeo = new THREE.SphereGeometry(1.3, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: sunColor,
      transparent: true,
      opacity: 0.15,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowMesh);

    // ─── Moon ───
    const moonColor = SIGN_COLORS[moonSign] || 0x90caf9;
    const moonGeo = new THREE.SphereGeometry(0.35, 24, 24);
    const moonMat = new THREE.MeshStandardMaterial({
      color: moonColor,
      emissive: moonColor,
      emissiveIntensity: 0.3,
      metalness: 0.2,
      roughness: 0.7,
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    scene.add(moonMesh);

    // Moon orbit ring
    const moonOrbitGeo = new THREE.RingGeometry(3.0, 3.05, 64);
    const moonOrbitMat = new THREE.MeshBasicMaterial({
      color: 0xd4a853,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
    });
    const moonOrbitMesh = new THREE.Mesh(moonOrbitGeo, moonOrbitMat);
    moonOrbitMesh.rotation.x = Math.PI / 2;
    scene.add(moonOrbitMesh);

    // ─── Planets (representing navagrahas) ───
    const planets: { mesh: THREE.Mesh; orbit: number; speed: number; tilt: number; size: number }[] = [];
    const planetDefs = [
      { name: 'Mercury', color: 0x66bb6a, orbit: 1.8, speed: 3.2, size: 0.15 },
      { name: 'Venus', color: 0xce93d8, orbit: 2.3, speed: 2.4, size: 0.2 },
      { name: 'Mars', color: 0xff5252, orbit: 4.0, speed: 1.0, size: 0.22 },
      { name: 'Jupiter', color: 0xffb74d, orbit: 5.2, speed: 0.6, size: 0.4 },
      { name: 'Saturn', color: 0xbcaaa4, orbit: 6.5, speed: 0.35, size: 0.35 },
    ];

    for (const def of planetDefs) {
      const geo = new THREE.SphereGeometry(def.size, 20, 20);
      const mat = new THREE.MeshStandardMaterial({
        color: def.color,
        emissive: def.color,
        emissiveIntensity: 0.15,
        metalness: 0.3,
        roughness: 0.6,
      });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      planets.push({ mesh, orbit: def.orbit, speed: def.speed, tilt: Math.random() * 0.3, size: def.size });

      // Orbit ring
      const ringGeo = new THREE.RingGeometry(def.orbit - 0.02, def.orbit + 0.02, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xd4a853,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.08,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
    }

    // Saturn ring
    const saturnRingGeo = new THREE.RingGeometry(0.5, 0.75, 32);
    const saturnRingMat = new THREE.MeshBasicMaterial({
      color: 0xd7ccc8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const saturnRing = new THREE.Mesh(saturnRingGeo, saturnRingMat);
    saturnRing.rotation.x = Math.PI / 3;
    scene.add(saturnRing);

    // ─── Starfield particles ───
    const starCount = 600;
    const starsGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 25 + Math.random() * 50;
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);
      // Warm gold/white tones
      const warmth = 0.7 + Math.random() * 0.3;
      starColors[i * 3] = warmth;
      starColors[i * 3 + 1] = warmth * (0.85 + Math.random() * 0.15);
      starColors[i * 3 + 2] = warmth * (0.6 + Math.random() * 0.3);
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starsGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starsMat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });
    const starsPoints = new THREE.Points(starsGeo, starsMat);
    scene.add(starsPoints);

    // ─── Nakshatra constellation ring (27 points) ───
    const nakshatraGroup = new THREE.Group();
    for (let i = 0; i < 27; i++) {
      const angle = (i / 27) * Math.PI * 2;
      const r = 8;
      const geo = new THREE.SphereGeometry(0.06, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffd54f,
        transparent: true,
        opacity: 0.6,
      });
      const dot = new THREE.Mesh(geo, mat);
      dot.position.set(r * Math.cos(angle), 0, r * Math.sin(angle));
      nakshatraGroup.add(dot);
    }
    nakshatraGroup.rotation.x = Math.PI / 6;
    scene.add(nakshatraGroup);

    // ─── Zodiac glyph ring (12 sprite planes) ───
    const zodiacSymbols = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
    const zodiacGroup = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const r = 9.5;
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const c = canvas.getContext('2d')!;
      c.fillStyle = '#D4A853';
      c.font = '40px serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(zodiacSymbols[i], 32, 32);
      const tex = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.5 });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(r * Math.cos(angle), 0, r * Math.sin(angle));
      sprite.scale.set(0.8, 0.8, 1);
      zodiacGroup.add(sprite);
    }
    zodiacGroup.rotation.x = Math.PI / 6;
    scene.add(zodiacGroup);

    // ─── Animation loop ───
    let time = 0;
    function animate() {
      if (!isPlaying) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }
      time += 0.005;

      // Sun pulse
      const pulse = 1 + Math.sin(time * 2) * 0.05;
      sunMesh.scale.setScalar(pulse);
      glowMesh.scale.setScalar(pulse * 1.3);

      // Moon orbit
      const moonAngle = time * 1.5;
      moonMesh.position.set(
        3.0 * Math.cos(moonAngle),
        Math.sin(moonAngle * 0.5) * 0.3,
        3.0 * Math.sin(moonAngle)
      );

      // Planets orbit
      for (const p of planets) {
        const a = time * p.speed;
        p.mesh.position.set(
          p.orbit * Math.cos(a),
          Math.sin(a * 0.7) * p.tilt,
          p.orbit * Math.sin(a)
        );
      }

      // Saturn ring follows Saturn
      const saturnP = planets[4];
      saturnRing.position.copy(saturnP.mesh.position);

      // Slow rotation on groups
      nakshatraGroup.rotation.y = time * 0.1;
      zodiacGroup.rotation.y = -time * 0.08;
      starsPoints.rotation.y = time * 0.02;

      // Camera gentle sway
      camera.position.x = Math.sin(time * 0.3) * 1.5;
      camera.position.y = 2 + Math.sin(time * 0.2) * 0.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    }

    animate();

    // Resize handler
    function onResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [sunSign, moonSign, isPlaying]);

  useEffect(() => {
    const cleanup = createScene();
    return () => cleanup?.();
  }, [createScene]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border-2 border-vedic-200 bg-gradient-to-b from-[#1a0a2e] via-[#0d0820] to-[#0a0618]">
      <div ref={mountRef} className="w-full h-[350px] sm:h-[420px] md:h-[500px]" />
      {/* Overlay info badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
        <span className="inline-block bg-black/50 backdrop-blur-sm text-saffron-300 text-[11px] font-medium px-2.5 py-1 rounded-full">
          ☉ {sunSign}
        </span>
        <span className="inline-block bg-black/50 backdrop-blur-sm text-blue-300 text-[11px] font-medium px-2.5 py-1 rounded-full">
          ☽ {moonSign}
        </span>
      </div>
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 text-right">
        <span className="inline-block bg-black/50 backdrop-blur-sm text-vedic-200 text-[11px] font-medium px-2.5 py-1 rounded-full">
          🕉️ {rashi}
        </span>
        <span className="inline-block bg-black/50 backdrop-blur-sm text-yellow-200 text-[11px] font-medium px-2.5 py-1 rounded-full">
          ✦ {nakshatra}
        </span>
      </div>
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0618] to-transparent pointer-events-none" />
    </div>
  );
}
