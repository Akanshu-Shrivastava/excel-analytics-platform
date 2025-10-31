// src/components/charts/PieChart3D.jsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const PieChart3D = ({ data, xKey, yKey }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f9fafb");

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 20, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambient);

    // Pie slices
    const total = data.reduce((sum, row) => sum + Number(row[yKey] || 0), 0);
    let startAngle = 0;

    data.forEach((row, index) => {
      const value = Number(row[yKey]) || 0;
      const sliceAngle = (value / total) * Math.PI * 2;

      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.absarc(0, 0, 10, startAngle, startAngle + sliceAngle, false);
      shape.lineTo(0, 0);

      const extrudeSettings = { depth: 2, bevelEnabled: false };
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(`hsl(${(index * 60) % 360},70%,50%)`),
      });
      const slice = new THREE.Mesh(geometry, material);

      scene.add(slice);
      startAngle += sliceAngle;
    });

    const animate = () => {
      requestAnimationFrame(animate);
      scene.rotation.y += 0.01;
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

export default PieChart3D;
