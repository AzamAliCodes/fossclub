"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const SHARD_COUNT = 36;

interface ShardItem {
  mesh: THREE.Mesh;
  initialPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  initialRot: THREE.Euler;
  targetRot: THREE.Euler;
}

export default function TechSceneCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      48,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 10);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const greenSpot = new THREE.SpotLight(0x00ea64, 3, 30, 0.35, 1);
    greenSpot.position.set(9, 8, 8);
    scene.add(greenSpot);

    const cyanSpot = new THREE.SpotLight(0x38bdf8, 2, 30, 0.35, 1);
    cyanSpot.position.set(-9, -8, -6);
    scene.add(cyanSpot);

    // Root cluster group
    const clusterGroup = new THREE.Group();
    clusterGroup.position.set(3.2, 0, 0);
    scene.add(clusterGroup);

    // Center floating icosahedron wireframe orb
    const orbGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x00ea64,
      emissive: 0x004722,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
      roughness: 0.2,
      metalness: 0.9,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    clusterGroup.add(orb);

    // Inner glowing core sphere
    const coreGeo = new THREE.SphereGeometry(1.1, 24, 24);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00ea64,
      transparent: true,
      opacity: 0.05,
    });
    const coreSphere = new THREE.Mesh(coreGeo, coreMat);
    clusterGroup.add(coreSphere);

    // Build Shards
    const shardsGroup = new THREE.Group();
    clusterGroup.add(shardsGroup);

    const shards: ShardItem[] = [];
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x00ea64,
      transmission: 0.85,
      roughness: 0.1,
      metalness: 0.15,
      transparent: true,
      opacity: 0.7,
      ior: 1.45,
    });
    const metallicMat = new THREE.MeshStandardMaterial({
      color: 0xe2fbf0,
      metalness: 0.95,
      roughness: 0.18,
    });

    for (let i = 0; i < SHARD_COUNT; i++) {
      let x = 0, y = 0, z = (Math.random() - 0.5) * 0.9;
      const s = i / SHARD_COUNT;
      if (s < 0.33) {
        x = THREE.MathUtils.lerp(-1.8, 1.8, s / 0.33);
        y = 1.6;
      } else if (s < 0.66) {
        const t = (s - 0.33) / 0.33;
        x = THREE.MathUtils.lerp(1.8, -1.8, t);
        y = THREE.MathUtils.lerp(1.6, -1.6, t);
      } else {
        x = THREE.MathUtils.lerp(-1.8, 1.8, (s - 0.66) / 0.34);
        y = -1.6;
      }
      x += (Math.random() - 0.5) * 0.4;
      y += (Math.random() - 0.5) * 0.4;
      z += (Math.random() - 0.5) * 0.4;

      const dir = new THREE.Vector3(x, y, z).normalize();
      const size = 0.16 + Math.random() * 0.3;

      let geo: THREE.BufferGeometry;
      const shapeType = i % 3;
      if (shapeType === 0) geo = new THREE.BoxGeometry(size, size, size);
      else if (shapeType === 1) geo = new THREE.TetrahedronGeometry(size);
      else geo = new THREE.OctahedronGeometry(size);

      const isGlass = i % 2 === 0;
      const mesh = new THREE.Mesh(geo, isGlass ? glassMat : metallicMat);

      const initialPos = new THREE.Vector3(x, y, z);
      const targetPos = new THREE.Vector3(
        x + dir.x * 10 + (Math.random() - 0.5) * 3,
        y + dir.y * 10 + (Math.random() - 0.5) * 3,
        z + dir.z * 10 + (Math.random() - 0.5) * 3
      );
      const initialRot = new THREE.Euler(0, 0, 0);
      const targetRot = new THREE.Euler(
        (Math.random() - 0.5) * Math.PI * 4,
        (Math.random() - 0.5) * Math.PI * 4,
        (Math.random() - 0.5) * Math.PI * 4
      );

      mesh.position.copy(initialPos);
      shardsGroup.add(mesh);

      shards.push({
        mesh,
        initialPos,
        targetPos,
        initialRot,
        targetRot,
      });
    }

    // Mouse tracking for parallax tilt
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      const hw = window.innerWidth / 2;
      const hh = window.innerHeight / 2;
      mouseX = (e.clientX - hw) / hw;
      mouseY = (e.clientY - hh) / hh;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // Handle resize
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // Animation loop
    let raf = 0;
    let running = true;
    const clock = new THREE.Clock();

    const animate = () => {
      if (!running) return;
      const elapsed = clock.getElapsedTime();

      // Scroll progress
      const scrollY = window.scrollY || 0;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const off = Math.min(1, Math.max(0, scrollY / maxScroll));

      // Horizontal arc movement
      const curve = Math.sin(off * Math.PI);
      const targetX = THREE.MathUtils.lerp(3.2, -3.2, curve) + mouseX * 0.4;
      const targetY = (prefersReduced ? 0 : Math.sin(elapsed * 0.6) * 0.25) - mouseY * 0.3;

      clusterGroup.position.x = THREE.MathUtils.lerp(clusterGroup.position.x, targetX, 0.05);
      clusterGroup.position.y = THREE.MathUtils.lerp(clusterGroup.position.y, targetY, 0.05);

      clusterGroup.rotation.y = THREE.MathUtils.lerp(
        clusterGroup.rotation.y,
        prefersReduced ? 0 : elapsed * 0.18 + mouseX * 0.2,
        0.05
      );
      clusterGroup.rotation.x = THREE.MathUtils.lerp(
        clusterGroup.rotation.x,
        prefersReduced ? 0 : Math.sin(elapsed * 0.4) * 0.12 - mouseY * 0.2,
        0.05
      );

      // Orb independent gentle pulse
      orb.rotation.x = elapsed * 0.22;
      orb.rotation.y = elapsed * 0.15;
      const pulse = 1 + Math.sin(elapsed * 1.5) * 0.04;
      orb.scale.set(pulse, pulse, pulse);

      // Eased explosion for shards
      const eased = 1 - Math.pow(1 - Math.min(1, Math.max(0, (off - 0.03) * 1.4)), 3);

      for (let i = 0; i < shards.length; i++) {
        const item = shards[i];
        item.mesh.position.lerpVectors(item.initialPos, item.targetPos, eased);
        item.mesh.rotation.x = THREE.MathUtils.lerp(
          item.initialRot.x,
          item.targetRot.x + (prefersReduced ? 0 : elapsed * 0.12),
          eased
        );
        item.mesh.rotation.y = THREE.MathUtils.lerp(
          item.initialRot.y,
          item.targetRot.y + (prefersReduced ? 0 : elapsed * 0.12),
          eased
        );
        item.mesh.rotation.z = THREE.MathUtils.lerp(
          item.initialRot.z,
          item.targetRot.z + (prefersReduced ? 0 : elapsed * 0.12),
          eased
        );
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    // Pause when hidden
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else {
        running = true;
        clock.start();
        raf = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.dispose();
      orbGeo.dispose();
      orbMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      glassMat.dispose();
      metallicMat.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-screen fixed top-0 left-0 -z-10 pointer-events-none overflow-hidden"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
