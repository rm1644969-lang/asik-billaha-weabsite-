"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface CyberCanvas3DProps {
  className?: string;
  variant?: "particles" | "cyber-rings" | "floating-geometry";
  interactive?: boolean;
}

export default function CyberCanvas3D({
  className = "absolute inset-0 pointer-events-none overflow-hidden",
  variant = "floating-geometry",
  interactive = true,
}: CyberCanvas3DProps) {
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

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 400;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // Root Group
    const root = new THREE.Group();
    scene.add(root);

    // 2. Geometries based on Variant
    // Group of floating polyhedra
    const shapesGroup = new THREE.Group();
    root.add(shapesGroup);

    // A. Yellow Wireframe Icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(1.2, 0);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    icoMesh.position.set(-3.2, 0.5, -1);
    shapesGroup.add(icoMesh);

    // B. Red Wireframe Octahedron
    const octGeo = new THREE.OctahedronGeometry(1.0, 0);
    const octMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const octMesh = new THREE.Mesh(octGeo, octMat);
    octMesh.position.set(3.4, -0.6, -1);
    shapesGroup.add(octMesh);

    // C. Gyro Ring Center / Cyber Torus
    const torusGeo = new THREE.TorusGeometry(1.8, 0.02, 16, 64);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.25,
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.rotation.x = Math.PI / 3;
    shapesGroup.add(torusMesh);

    const torus2Geo = new THREE.TorusGeometry(2.3, 0.015, 16, 64);
    const torus2Mat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.2,
    });
    const torus2Mesh = new THREE.Mesh(torus2Geo, torus2Mat);
    torus2Mesh.rotation.y = Math.PI / 4;
    shapesGroup.add(torus2Mesh);

    // D. Starfield Particles (160 lightweight points)
    const particleCount = 160;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 16;
      posArray[i + 1] = (Math.random() - 0.5) * 10;
      posArray[i + 2] = (Math.random() - 0.5) * 8;
    }
    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const partMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0xfacc15,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(partGeo, partMat);
    root.add(particles);

    // Mouse Tracking for subtle parallax
    let targetX = 0;
    let targetY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 0.8;
      targetY = (e.clientY / window.innerHeight - 0.5) * 0.8;
    };
    if (interactive && !prefersReducedMotion) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (!prefersReducedMotion) {
        // Slow continuous 3D rotation
        icoMesh.rotation.x += delta * 0.2;
        icoMesh.rotation.y += delta * 0.3;

        octMesh.rotation.x -= delta * 0.25;
        octMesh.rotation.y += delta * 0.35;

        torusMesh.rotation.z += delta * 0.15;
        torus2Mesh.rotation.x += delta * 0.12;

        particles.rotation.y += delta * 0.04;

        // Smooth cursor parallax
        root.rotation.y += (targetX - root.rotation.y) * 0.05;
        root.rotation.x += (targetY - root.rotation.x) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (interactive) window.removeEventListener("mousemove", handleMouseMove);
      renderer.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      octGeo.dispose();
      octMat.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      torus2Geo.dispose();
      torus2Mat.dispose();
      partGeo.dispose();
      partMat.dispose();
      if (container && renderer.domElement) {
        try {
          container.removeChild(renderer.domElement);
        } catch (_) {}
      }
    };
  }, [variant, interactive]);

  if (!hasWebGL) return null;

  return <div ref={containerRef} className={className} aria-hidden="true" />;
}
