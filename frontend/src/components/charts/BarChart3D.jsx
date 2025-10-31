// src/components/charts/BarChart3D.jsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const BarChart3D = ({ data, xKey, yKey }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f9fafb");

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 20, 30);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambient);

    // Bars
    const barWidth = 1;
    const gap = 0.5;

    data.forEach((row, index) => {
      const height = Number(row[yKey]) || 1;
      const geometry = new THREE.BoxGeometry(barWidth, height, barWidth);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(`hsl(${(index * 40) % 360},70%,50%)`),
      });
      const bar = new THREE.Mesh(geometry, material);

      bar.position.set(index * (barWidth + gap), height / 2, 0);
      scene.add(bar);
    });

    // Grid Helper
    const grid = new THREE.GridHelper(50, 50);
    scene.add(grid);

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [data, xKey, yKey]);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "400px", borderRadius: "8px" }}
    />
  );
};

export default BarChart3D;
