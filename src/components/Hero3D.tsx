"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * TOOLSBD.COM — 3D CUTE CYBER ROBOT COMPANION
 * 
 * Specifically designed to match the user's uploaded reference:
 * - Pearlescent white rounded robot head with glossy helmet highlight
 * - Side ear muff cylinders with glowing cyan LED rings
 * - Dark glossy visor face screen
 * - Glowing digital cyan eyes that track the cursor & blink!
 * - Glowing digital cyan smiling mouth
 * - Floating white body & arms that bob up and down with gentle levitation
 * - Gyroscopic orbital cyber rings & starfield dust
 * - Zero lag WebGL 60 FPS
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

    const camera = new THREE.PerspectiveCamera(
      48,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 9.2;

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true, 
      powerPreference: "high-performance" 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // 2. LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // Key front light
    const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.2);
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);

    // Cyan Neon Rim Light
    const cyanRimLight = new THREE.DirectionalLight(0x00f2fe, 3.0);
    cyanRimLight.position.set(-5, -3, 3);
    scene.add(cyanRimLight);

    // Gold Fill Light
    const goldFillLight = new THREE.PointLight(0xfacc15, 1.8, 15);
    goldFillLight.position.set(4, -2, 2);
    scene.add(goldFillLight);

    // 3. ROBOT WORLD ROOT
    const robotRoot = new THREE.Group();
    const isMobile = container.clientWidth < 1024;
    robotRoot.position.set(isMobile ? 0 : 3.8, isMobile ? 0.3 : 0, 0);
    scene.add(robotRoot);

    // The whole robot (head + body) that turns towards mouse
    const robotAssembly = new THREE.Group();
    robotRoot.add(robotAssembly);

    // -----------------------------------------------------------------
    // A. ROBOT HEAD ASSEMBLY
    // -----------------------------------------------------------------
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.5, 0);
    robotAssembly.add(headGroup);

    // White Pearlescent Helmet / Dome
    const helmetGeo = new THREE.SphereGeometry(1.6, 64, 48);
    // Scale slightly to make it a cute rounded oval
    helmetGeo.scale(1.15, 1.0, 0.95);
    const helmetMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    headGroup.add(helmet);

    // Side Ear Muffs (Left & Right Cylinders)
    const earGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.35, 32);
    earGeo.rotateZ(Math.PI / 2);
    const earMat = new THREE.MeshPhysicalMaterial({
      color: 0xf1f5f9,
      roughness: 0.2,
      metalness: 0.15,
      clearcoat: 0.8,
    });
    const leftEar = new THREE.Mesh(earGeo, earMat);
    leftEar.position.set(-1.82, 0.05, 0);
    headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, earMat);
    rightEar.position.set(1.82, 0.05, 0);
    headGroup.add(rightEar);

    // Ear Glowing Cyan Accent Rings
    const earRingGeo = new THREE.TorusGeometry(0.34, 0.04, 16, 32);
    earRingGeo.rotateY(Math.PI / 2);
    const cyanLedMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
    });
    const leftEarRing = new THREE.Mesh(earRingGeo, cyanLedMat);
    leftEarRing.position.set(-1.98, 0.05, 0);
    headGroup.add(leftEarRing);

    const rightEarRing = new THREE.Mesh(earRingGeo, cyanLedMat);
    rightEarRing.position.set(1.98, 0.05, 0);
    headGroup.add(rightEarRing);

    // Front Glossy Dark Visor Screen
    const visorGeo = new THREE.SphereGeometry(1.42, 48, 36, 0, Math.PI * 2, 0, Math.PI * 0.38);
    visorGeo.scale(1.08, 0.9, 0.9);
    visorGeo.rotateX(Math.PI / 2);
    const visorMat = new THREE.MeshPhysicalMaterial({
      color: 0x061122, // Dark blue screen
      roughness: 0.08,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.05, 0.65);
    headGroup.add(visor);

    // Digital Cyan Eyes (Left & Right)
    const eyeShapeGeo = new THREE.RingGeometry(0.12, 0.26, 32, 1, 0, Math.PI * 1.8);
    // Left Eye
    const leftEye = new THREE.Mesh(eyeShapeGeo, cyanLedMat);
    leftEye.position.set(-0.48, 0.15, 1.55);
    leftEye.rotation.z = 0.1;
    headGroup.add(leftEye);

    // Right Eye
    const rightEye = new THREE.Mesh(eyeShapeGeo, cyanLedMat);
    rightEye.position.set(0.48, 0.15, 1.55);
    rightEye.rotation.z = -0.1;
    headGroup.add(rightEye);

    // Cute Eye Center Highlight Dots
    const dotGeo = new THREE.CircleGeometry(0.08, 24);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftDot = new THREE.Mesh(dotGeo, dotMat);
    leftDot.position.set(-0.48, 0.15, 1.56);
    headGroup.add(leftDot);

    const rightDot = new THREE.Mesh(dotGeo, dotMat);
    rightDot.position.set(0.48, 0.15, 1.56);
    headGroup.add(rightDot);

    // Cute Cyan Smile Mouth
    const mouthGeo = new THREE.RingGeometry(0.14, 0.22, 32, 1, Math.PI * 1.1, Math.PI * 0.8);
    const mouth = new THREE.Mesh(mouthGeo, cyanLedMat);
    mouth.position.set(0, -0.22, 1.54);
    headGroup.add(mouth);

    // -----------------------------------------------------------------
    // B. FLOATING TORSO & FLOATING ARMS
    // -----------------------------------------------------------------
    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, -1.35, 0);
    robotAssembly.add(bodyGroup);

    // Rounded White Body / Torso
    const torsoGeo = new THREE.SphereGeometry(1.0, 36, 36);
    torsoGeo.scale(0.9, 1.05, 0.8);
    const torso = new THREE.Mesh(torsoGeo, helmetMat);
    bodyGroup.add(torso);

    // Torso Chest Cyan LED
    const chestLedGeo = new THREE.CapsuleGeometry(0.08, 0.25, 8, 16);
    chestLedGeo.rotateZ(Math.PI / 2);
    const chestLed = new THREE.Mesh(chestLedGeo, cyanLedMat);
    chestLed.position.set(0, 0.35, 0.76);
    bodyGroup.add(chestLed);

    // Floating Left Arm
    const armGeo = new THREE.CapsuleGeometry(0.2, 0.65, 16, 24);
    const leftArm = new THREE.Mesh(armGeo, helmetMat);
    leftArm.position.set(-1.25, 0.1, 0);
    leftArm.rotation.z = 0.35;
    bodyGroup.add(leftArm);

    // Floating Right Arm (Waving angle)
    const rightArm = new THREE.Mesh(armGeo, helmetMat);
    rightArm.position.set(1.25, 0.15, 0);
    rightArm.rotation.z = -0.45;
    bodyGroup.add(rightArm);

    // -----------------------------------------------------------------
    // C. GYROSCOPIC CYBER ORBIT RINGS
    // -----------------------------------------------------------------
    // Ring 1: Neon Gold Outer Ring
    const ring1Geo = new THREE.TorusGeometry(2.4, 0.025, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.6,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    robotRoot.add(ring1);

    // Ring 2: Neon Cyan Ring
    const ring2Geo = new THREE.TorusGeometry(2.8, 0.02, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.5,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    robotRoot.add(ring2);

    // -----------------------------------------------------------------
    // D. 3D PARTICLE STARFIELD
    // -----------------------------------------------------------------
    const particleCount = 180;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 16;
      particlePositions[i + 1] = (Math.random() - 0.5) * 12;
      particlePositions[i + 2] = (Math.random() - 0.5) * 10;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xfacc15,
      size: 0.045,
      transparent: true,
      opacity: 0.75,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // -----------------------------------------------------------------
    // E. MOUSE TRACKING & INTERACTION
    // -----------------------------------------------------------------
    let mouseNormX = 0;
    let mouseNormY = 0;
    let targetLookX = 0;
    let targetLookY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseNormX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseNormY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      if (width < 1024) {
        robotRoot.position.set(0, 0.3, 0);
        robotRoot.scale.set(0.75, 0.75, 0.75);
      } else {
        robotRoot.position.set(3.8, 0, 0);
        robotRoot.scale.set(1.0, 1.0, 1.0);
      }

      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // -----------------------------------------------------------------
    // F. ANIMATION LOOP (60 FPS)
    // -----------------------------------------------------------------
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Smooth head looking interpolation towards cursor
        targetLookX += (mouseNormX * 0.55 - targetLookX) * 0.07;
        targetLookY += (mouseNormY * 0.4 - targetLookY) * 0.07;

        robotAssembly.rotation.y = targetLookX;
        robotAssembly.rotation.x = -targetLookY;

        // Gentle levitation floating motion
        robotAssembly.position.y = Math.sin(elapsedTime * 2.2) * 0.14;

        // Subtle arm waving / bobbing
        rightArm.rotation.z = -0.45 + Math.sin(elapsedTime * 3) * 0.12;
        leftArm.rotation.z = 0.35 - Math.sin(elapsedTime * 3) * 0.08;

        // Periodic eye blinking animation
        const blinkCycle = elapsedTime % 4.5;
        if (blinkCycle < 0.15) {
          const blinkScale = Math.sin((blinkCycle / 0.15) * Math.PI);
          leftEye.scale.y = Math.max(0.08, 1 - blinkScale * 0.92);
          rightEye.scale.y = Math.max(0.08, 1 - blinkScale * 0.92);
          leftDot.scale.y = leftEye.scale.y;
          rightDot.scale.y = rightEye.scale.y;
        } else {
          leftEye.scale.y = 1;
          rightEye.scale.y = 1;
          leftDot.scale.y = 1;
          rightDot.scale.y = 1;
        }

        // Orbit rings rotation
        ring1.rotation.z = elapsedTime * 0.35;
        ring1.rotation.x = Math.PI / 3 + Math.sin(elapsedTime * 0.5) * 0.15;

        ring2.rotation.z = -elapsedTime * 0.28;
        ring2.rotation.y = Math.PI / 4 + Math.cos(elapsedTime * 0.4) * 0.15;

        // Ambient particles rotation
        particleSystem.rotation.y = elapsedTime * 0.05;
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
      helmetGeo.dispose();
      helmetMat.dispose();
      earGeo.dispose();
      earMat.dispose();
      earRingGeo.dispose();
      cyanLedMat.dispose();
      visorGeo.dispose();
      visorMat.dispose();
      eyeShapeGeo.dispose();
      dotGeo.dispose();
      dotMat.dispose();
      mouthGeo.dispose();
      torsoGeo.dispose();
      armGeo.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div ref={containerRef} className="w-full h-full relative" />
      {!hasWebGL && (
        <div className="absolute inset-0 flex items-center justify-center bg-radial-gradient">
          <div className="w-80 h-80 rounded-full bg-gradient-to-tr from-cyan-400/20 via-yellow-400/20 to-red-600/20 blur-3xl animate-pulse" />
        </div>
      )}
    </div>
  );
}
