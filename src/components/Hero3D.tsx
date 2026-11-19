"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * TOOLSBD.COM — 3D CYBERNETIC AI ROBOTIC SENTINEL EYE
 * 
 * Specifically designed for Automation Tools, Software Licensing & Security Guard.
 * - Interactive mouse/cursor tracking (the robotic eye looks at user's cursor)
 * - Gyroscopic cybernetic HUD gimbal rings (Cyber Yellow & Neon Red)
 * - Glowing optical pupil with aperture blades and laser core
 * - Sweeping cyber scanner radar beam
 * - Lightweight, zero-lag pure WebGL (60 FPS)
 */
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

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070707, 0.04);

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 9.5;

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true, 
      powerPreference: "high-performance" 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // Root World Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 2. THE CYBER EYE APPARATUS (Positioned on the right side for desktop)
    const eyeAnchor = new THREE.Group();
    // Default position: right side on desktop, center on mobile
    const isMobile = container.clientWidth < 1024;
    eyeAnchor.position.set(isMobile ? 0 : 3.8, isMobile ? 0.3 : 0, 0);
    rootGroup.add(eyeAnchor);

    // Inner Tracking Eyeball (looks at cursor)
    const trackingEyeball = new THREE.Group();
    eyeAnchor.add(trackingEyeball);

    // --- A. Eyeball Sclera (Dark Metallic Obsidian Sphere) ---
    const eyeballGeo = new THREE.SphereGeometry(1.65, 64, 64);
    const eyeballMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a0a0a,
      roughness: 0.15,
      metalness: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const eyeballMesh = new THREE.Mesh(eyeballGeo, eyeballMat);
    trackingEyeball.add(eyeballMesh);

    // --- B. Glowing Cybernetic Iris (Golden Yellow Aperture) ---
    const irisOuterGeo = new THREE.RingGeometry(0.38, 1.05, 48);
    const irisOuterMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15, // Cyber Yellow
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });
    const irisOuter = new THREE.Mesh(irisOuterGeo, irisOuterMat);
    irisOuter.position.z = 1.58;
    trackingEyeball.add(irisOuter);

    // Inner Crimson Red Accent Iris Ring
    const irisInnerGeo = new THREE.RingGeometry(0.38, 0.65, 36);
    const irisInnerMat = new THREE.MeshBasicMaterial({
      color: 0xef4444, // Crimson Red
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const irisInner = new THREE.Mesh(irisInnerGeo, irisInnerMat);
    irisInner.position.z = 1.60;
    trackingEyeball.add(irisInner);

    // --- C. Center Optical Pupil (Dark Camera Lens Core) ---
    const pupilGeo = new THREE.CircleGeometry(0.36, 32);
    const pupilMat = new THREE.MeshPhysicalMaterial({
      color: 0x000000,
      roughness: 0.05,
      metalness: 0.9,
      clearcoat: 1.0,
    });
    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    pupil.position.z = 1.62;
    trackingEyeball.add(pupil);

    // Central Glowing Laser Dot (Red Security Point)
    const laserDotGeo = new THREE.CircleGeometry(0.12, 24);
    const laserDotMat = new THREE.MeshBasicMaterial({
      color: 0xff0033,
    });
    const laserDot = new THREE.Mesh(laserDotGeo, laserDotMat);
    laserDot.position.z = 1.63;
    trackingEyeball.add(laserDot);

    // Cornea Glass Dome (High Gloss Reflection)
    const corneaGeo = new THREE.SphereGeometry(1.72, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.45);
    const corneaMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.85,
      opacity: 0.35,
      transparent: true,
      roughness: 0.05,
      metalness: 0.1,
      clearcoat: 1.0,
    });
    const cornea = new THREE.Mesh(corneaGeo, corneaMat);
    cornea.rotation.x = Math.PI / 2;
    cornea.position.z = 0.2;
    trackingEyeball.add(cornea);

    // --- D. Gyroscopic Outer Gimbal Rings (Automation Radar Housing) ---
    // Ring 1: Yellow Neon Gimbal Ring
    const gimbalRing1Geo = new THREE.TorusGeometry(2.35, 0.035, 16, 100);
    const gimbalRing1Mat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.65,
    });
    const gimbalRing1 = new THREE.Mesh(gimbalRing1Geo, gimbalRing1Mat);
    eyeAnchor.add(gimbalRing1);

    // Ring 2: Crimson Red Gimbal Ring (Tilted)
    const gimbalRing2Geo = new THREE.TorusGeometry(2.75, 0.03, 16, 100);
    const gimbalRing2Mat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.55,
    });
    const gimbalRing2 = new THREE.Mesh(gimbalRing2Geo, gimbalRing2Mat);
    gimbalRing2.rotation.x = Math.PI / 3;
    eyeAnchor.add(gimbalRing2);

    // Ring 3: Segmented Outer HUD Ring (White/Gold)
    const gimbalRing3Geo = new THREE.TorusGeometry(3.15, 0.02, 16, 120);
    const gimbalRing3Mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });
    const gimbalRing3 = new THREE.Mesh(gimbalRing3Geo, gimbalRing3Mat);
    gimbalRing3.rotation.y = Math.PI / 4;
    eyeAnchor.add(gimbalRing3);

    // --- E. Sweeping Automation Radar Scanner Beam ---
    const scanBeamGeo = new THREE.PlaneGeometry(0.04, 4.8);
    const scanBeamMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const scanBeam = new THREE.Mesh(scanBeamGeo, scanBeamMat);
    scanBeam.position.z = 1.7;
    eyeAnchor.add(scanBeam);

    // --- F. Orbiting Cyber Telemetry Points ---
    const particlesCount = 260;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particlesCount * 3);
    const particleColors = new Float32Array(particlesCount * 3);

    const cYellow = new THREE.Color(0xfacc15);
    const cRed = new THREE.Color(0xef4444);
    const cWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < particlesCount; i++) {
      // Cylindrical cluster orbiting the eye
      const r = 2.2 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 5.0;

      particlePositions[i * 3] = Math.cos(theta) * r;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = Math.sin(theta) * r;

      const col = i % 3 === 0 ? cYellow : i % 3 === 1 ? cRed : cWhite;
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    eyeAnchor.add(particleSystem);

    // 3. LIGHTING (Cyber Yellow & Crimson Red & White Highlights)
    const ambientLight = new THREE.AmbientLight(0x1a1a1a, 2.5);
    scene.add(ambientLight);

    const yellowLight = new THREE.PointLight(0xfacc15, 6, 20);
    yellowLight.position.set(5, 3, 5);
    scene.add(yellowLight);

    const redLight = new THREE.PointLight(0xef4444, 5, 18);
    redLight.position.set(-2, -3, 4);
    scene.add(redLight);

    const whiteHighlight = new THREE.PointLight(0xffffff, 4, 15);
    whiteHighlight.position.set(4, 0, 6);
    scene.add(whiteHighlight);

    // 4. INTERACTIVE MOUSE TRACKING
    let mouseNormX = 0;
    let mouseNormY = 0;
    let targetLookX = 0;
    let targetLookY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      // Normalized between -1 and 1 relative to container
      mouseNormX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNormY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    };

    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;

      if (width < 1024) {
        eyeAnchor.position.set(0, 0.4, 0);
        eyeAnchor.scale.set(0.78, 0.78, 0.78);
      } else {
        eyeAnchor.position.set(3.8, 0, 0);
        eyeAnchor.scale.set(1.0, 1.0, 1.0);
      }

      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // 5. ANIMATION LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Smooth eye looking interpolation towards mouse cursor
        targetLookX += (mouseNormX * 0.7 - targetLookX) * 0.08;
        targetLookY += (mouseNormY * 0.5 - targetLookY) * 0.08;

        // Eyeball tracks the cursor smoothly
        trackingEyeball.rotation.y = targetLookX;
        trackingEyeball.rotation.x = -targetLookY;

        // Pupil subtle dilation/breathing effect
        const pulse = 1 + Math.sin(elapsedTime * 2.5) * 0.04;
        pupil.scale.set(pulse, pulse, 1);
        laserDot.scale.set(pulse, pulse, 1);

        // Gyroscopic gimbal rings rotate around the eye
        gimbalRing1.rotation.z = elapsedTime * 0.4;
        gimbalRing1.rotation.x = Math.sin(elapsedTime * 0.3) * 0.2;

        gimbalRing2.rotation.z = -elapsedTime * 0.35;
        gimbalRing2.rotation.y = elapsedTime * 0.25;

        gimbalRing3.rotation.x = elapsedTime * 0.2;
        gimbalRing3.rotation.y = -elapsedTime * 0.15;

        // Sweeping scanner beam
        scanBeam.rotation.z = elapsedTime * 1.5;

        // Telemetry orbit
        particleSystem.rotation.y = elapsedTime * 0.08;
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
      eyeballGeo.dispose();
      eyeballMat.dispose();
      irisOuterGeo.dispose();
      irisOuterMat.dispose();
      irisInnerGeo.dispose();
      irisInnerMat.dispose();
      gimbalRing1Geo.dispose();
      gimbalRing1Mat.dispose();
      gimbalRing2Geo.dispose();
      gimbalRing2Mat.dispose();
      gimbalRing3Geo.dispose();
      gimbalRing3Mat.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div ref={containerRef} className="w-full h-full relative" />
      {!hasWebGL && (
        <div className="absolute inset-0 flex items-center justify-center bg-radial-gradient">
          <div className="w-80 h-80 rounded-full bg-gradient-to-tr from-yellow-500/25 to-red-600/20 blur-3xl animate-pulse" />
        </div>
      )}
    </div>
  );
}
