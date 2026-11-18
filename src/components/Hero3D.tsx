"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    if (!containerRef.current) return;
    const container = containerRef.current;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scene setup with Deep Obsidian Black fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070707, 0.035);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 1. Central Core Torus Knot in Cyber Gold/Yellow
    const knotGeometry = new THREE.TorusKnotGeometry(1.8, 0.45, 128, 32, 2, 3);
    const knotMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xfacc15, // Cyber Yellow
      emissive: 0x78350f,
      emissiveIntensity: 0.5,
      roughness: 0.15,
      metalness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const knot = new THREE.Mesh(knotGeometry, knotMaterial);
    knot.position.set(3.5, 0, 0);
    worldGroup.add(knot);

    // 2. Wireframe outer cage in Crimson Red
    const wireframeKnotGeo = new THREE.TorusKnotGeometry(1.86, 0.46, 64, 16, 2, 3);
    const wireframeKnotMat = new THREE.MeshBasicMaterial({
      color: 0xef4444, // Neon Red
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireKnot = new THREE.Mesh(wireframeKnotGeo, wireframeKnotMat);
    knot.add(wireKnot);

    // 3. Orbiting Geometric Floating Objects (Yellow, White, Red)
    const floaters: { mesh: THREE.Mesh; speedX: number; speedY: number; speedZ: number; orbitRadius: number; orbitSpeed: number; baseAngle: number }[] = [];
    const colors = [0xfacc15, 0xef4444, 0xffffff, 0xdc2626];

    for (let i = 0; i < 7; i++) {
      const geo = i % 2 === 0 
        ? new THREE.IcosahedronGeometry(0.35 + Math.random() * 0.3, 0)
        : new THREE.OctahedronGeometry(0.4 + Math.random() * 0.25, 0);
      
      const mat = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        roughness: 0.2,
        metalness: 0.85,
        wireframe: i % 3 === 0,
      });

      const mesh = new THREE.Mesh(geo, mat);
      const orbitRadius = 4 + Math.random() * 2.5;
      const angle = (i / 7) * Math.PI * 2;
      mesh.position.set(
        3.5 + Math.cos(angle) * orbitRadius,
        (Math.random() - 0.5) * 4,
        Math.sin(angle) * orbitRadius * 0.7
      );

      worldGroup.add(mesh);
      floaters.push({
        mesh,
        speedX: (Math.random() - 0.5) * 0.02,
        speedY: (Math.random() - 0.5) * 0.02,
        speedZ: (Math.random() - 0.5) * 0.02,
        orbitRadius,
        orbitSpeed: 0.005 + Math.random() * 0.005,
        baseAngle: angle
      });
    }

    // 4. Glowing Rings (Yellow & Red)
    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(3.6, 0.03, 16, 100),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.5 })
    );
    ring1.position.set(3.5, 0, 0);
    ring1.rotation.x = Math.PI / 3;
    worldGroup.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(4.2, 0.025, 16, 100),
      new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.45 })
    );
    ring2.position.set(3.5, 0, 0);
    ring2.rotation.y = Math.PI / 4;
    worldGroup.add(ring2);

    // 5. Starfield Particles (Yellow, White, Red)
    const particlesCount = 380;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particlesCount * 3);
    const particleColors = new Float32Array(particlesCount * 3);

    const pColorYellow = new THREE.Color(0xfacc15);
    const pColorRed = new THREE.Color(0xef4444);
    const pColorWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < particlesCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 25;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 14;

      const chosenColor = i % 3 === 0 ? pColorYellow : i % 3 === 1 ? pColorRed : pColorWhite;
      particleColors[i * 3] = chosenColor.r;
      particleColors[i * 3 + 1] = chosenColor.g;
      particleColors[i * 3 + 2] = chosenColor.b;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    worldGroup.add(particleSystem);

    // Lighting (Yellow + Red + White)
    const ambientLight = new THREE.AmbientLight(0x181818, 2.5);
    scene.add(ambientLight);

    const pointLightYellow = new THREE.PointLight(0xfacc15, 5.0, 20);
    pointLightYellow.position.set(4, 3, 4);
    scene.add(pointLightYellow);

    const pointLightRed = new THREE.PointLight(0xef4444, 4.5, 18);
    pointLightRed.position.set(0, -3, 3);
    scene.add(pointLightRed);

    const pointLightWhite = new THREE.PointLight(0xffffff, 3.5, 15);
    pointLightWhite.position.set(6, -2, -2);
    scene.add(pointLightWhite);

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (event.clientX - windowHalfX) * 0.0006;
      mouseY = (event.clientY - windowHalfY) * 0.0006;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;

      if (width < 768) {
        knot.position.set(0, 1.2, 0);
        ring1.position.set(0, 1.2, 0);
        ring2.position.set(0, 1.2, 0);
      } else {
        knot.position.set(3.5, 0, 0);
        ring1.position.set(3.5, 0, 0);
        ring2.position.set(3.5, 0, 0);
      }

      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        knot.rotation.x = elapsedTime * 0.35;
        knot.rotation.y = elapsedTime * 0.45;

        ring1.rotation.z = elapsedTime * 0.2;
        ring2.rotation.x = -elapsedTime * 0.25;

        floaters.forEach((item) => {
          item.mesh.rotation.x += item.speedX;
          item.mesh.rotation.y += item.speedY;
          item.mesh.rotation.z += item.speedZ;
          
          const curAngle = item.baseAngle + elapsedTime * item.orbitSpeed * 8;
          const baseX = window.innerWidth < 768 ? 0 : 3.5;
          const baseY = window.innerWidth < 768 ? 1.2 : 0;
          item.mesh.position.x = baseX + Math.cos(curAngle) * item.orbitRadius;
          item.mesh.position.z = Math.sin(curAngle) * item.orbitRadius * 0.7;
          item.mesh.position.y = baseY + Math.sin(elapsedTime * 2 + item.baseAngle) * 0.7;
        });

        particleSystem.rotation.y = elapsedTime * 0.02;
        particleSystem.rotation.x = elapsedTime * 0.01;

        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        worldGroup.rotation.y = targetX;
        worldGroup.rotation.x = targetY;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      knotGeometry.dispose();
      knotMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div ref={containerRef} className="w-full h-full relative" />
      {!hasWebGL && (
        <div className="absolute inset-0 flex items-center justify-center bg-radial-gradient">
          <div className="w-96 h-96 rounded-full bg-gradient-to-tr from-yellow-500/30 to-red-600/20 blur-3xl animate-pulse" />
        </div>
      )}
    </div>
  );
}
