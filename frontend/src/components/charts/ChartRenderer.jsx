import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Box } from "@react-three/drei";
import * as THREE from "three";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { FaDownload, FaFilePdf } from "react-icons/fa";

// Custom 3D Pie Slice Component
const PieSlice = ({ radius, height, startAngle, endAngle, color, position }) => {
  const meshRef = useRef();
  
  useEffect(() => {
    if (meshRef.current) {
      const geometry = new THREE.CylinderGeometry(
        radius, 
        radius, 
        height, 
        32, 
        1, 
        false, 
        startAngle, 
        endAngle - startAngle
      );
      meshRef.current.geometry = geometry;
    }
  }, [radius, height, startAngle, endAngle]);

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Canvas capture component for 3D charts
const CanvasCapture = ({ onRendererReady }) => {
  const { gl, scene, camera } = useThree();
  
  useEffect(() => {
    if (gl && onRendererReady) {
      onRendererReady(gl, scene, camera);
    }
  }, [gl, scene, camera, onRendererReady]);
  
  return null;
};

// ✅ ChartRenderer Component
const ChartRenderer = ({ fileId }) => {
  const [data, setData] = useState([]);
  const [chartType, setChartType] = useState("bar");
  const [xAxis, setXAxis] = useState("Email");
  const [yAxis, setYAxis] = useState("Score");
  const token = localStorage.getItem("token");
  const chartRef = useRef();
  const [threeJsContext, setThreeJsContext] = useState(null);

  useEffect(() => {
    const fetchParsedData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/files/parsed/${fileId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setData(res.data.data || []);
      } catch (err) {
        console.error("Error fetching parsed data:", err);
      }
    };
    if (fileId) fetchParsedData();
  }, [fileId, token]);

  if (!data || data.length === 0) {
    return (
      <p className="text-gray-500 text-center py-10">
        No data available for this file.
      </p>
    );
  }

  // ✅ Helper function to capture chart as image
  const captureChartAsImage = async () => {
    if (chartType.includes("3d")) {
      if (!threeJsContext) {
        throw new Error("3D chart is still loading. Please wait a moment and try again.");
      }
      
      try {
        const { gl, scene, camera } = threeJsContext;
        
        // Create a higher resolution render target
        const renderTarget = new THREE.WebGLRenderTarget(1920, 1080, {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat,
          type: THREE.UnsignedByteType
        });
        
        // Render to the target
        gl.setRenderTarget(renderTarget);
        gl.render(scene, camera);
        
        // Read pixels
        const pixels = new Uint8Array(1920 * 1080 * 4);
        gl.readPixels(0, 0, 1920, 1080, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        
        // Reset render target
        gl.setRenderTarget(null);
        
        // Create canvas and flip image (WebGL renders upside down)
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        
        // Create ImageData and flip vertically
        const imageData = ctx.createImageData(1920, 1080);
        for (let y = 0; y < 1080; y++) {
          for (let x = 0; x < 1920; x++) {
            const srcIndex = (y * 1920 + x) * 4;
            const dstIndex = ((1080 - y - 1) * 1920 + x) * 4;
            imageData.data[dstIndex] = pixels[srcIndex];     // R
            imageData.data[dstIndex + 1] = pixels[srcIndex + 1]; // G
            imageData.data[dstIndex + 2] = pixels[srcIndex + 2]; // B
            imageData.data[dstIndex + 3] = pixels[srcIndex + 3]; // A
          }
        }
        
        // Fill with white background first
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1920, 1080);
        ctx.putImageData(imageData, 0, 0);
        
        // Cleanup
        renderTarget.dispose();
        
        return canvas.toDataURL('image/png');
        
      } catch (error) {
        console.error('Error capturing 3D chart:', error);
        // Fallback method
        const canvas = threeJsContext.gl.domElement;
        return canvas.toDataURL('image/png');
      }
    } else {
      const container = chartRef.current;
      if (!container) throw new Error("Chart container not found");
      
      return await toPng(container, {
        backgroundColor: "#ffffff",
        cacheBust: true,
        pixelRatio: 2,
        filter: (node) => {
          if (node.tagName === "LINK" && node.href?.includes("font-awesome")) {
            return false;
          }
          return true;
        },
      });
    }
  };

  // ✅ PNG Download Function
  const handlePNGDownload = async () => {
    try {
      const dataUrl = await captureChartAsImage();
      const link = document.createElement("a");
      link.download = `${chartType}-chart.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading PNG:", err);
      alert("Error downloading PNG: " + err.message);
    }
  };

  // ✅ PDF Download Function
  const handlePDFDownload = async () => {
    try {
      const dataUrl = await captureChartAsImage();
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(40, 40, 40);
      pdf.text(`${chartType.toUpperCase()} CHART REPORT`, 20, 20);
      
      // Add chart details
      pdf.setFontSize(12);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`X-Axis: ${xAxis}`, 20, 35);
      pdf.text(`Y-Axis: ${yAxis}`, 20, 45);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 55);
      
      // Calculate image dimensions to fit in PDF
      const imgWidth = 250; // A4 landscape width minus margins
      const imgHeight = 140; // Maintain aspect ratio
      
      // Add chart image
      pdf.addImage(dataUrl, 'PNG', 20, 70, imgWidth, imgHeight);
      
      // Add legend data for pie charts
      if (chartType === "pie" || chartType === "3d-pie") {
        const legendData = createLegendData();
        let yPos = 220;
        
        pdf.setFontSize(14);
        pdf.setTextColor(40, 40, 40);
        pdf.text('Chart Legend:', 20, yPos);
        
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        yPos += 10;
        
        legendData.forEach((item, index) => {
          if (yPos > 280) { // Add new page if needed
            pdf.addPage();
            yPos = 20;
          }
          pdf.text(`• ${item.name}: ${item.value} (${item.percentage}%)`, 25, yPos);
          yPos += 8;
        });
      }
      
      // Save PDF
      pdf.save(`${chartType}-chart.pdf`);
      
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert("Error downloading PDF: " + err.message);
    }
  };

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#87ceeb", "#da70d6", "#32cd32", "#ff6347"];

  // Helper function to get numeric value
  const getNumericValue = (item, key) => {
    const value = item[key];
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Normalize data for 3D visualization
  const normalizeData = (data, key) => {
    const values = data.map(item => getNumericValue(item, key));
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    
    return data.map((item, index) => ({
      ...item,
      normalizedValue: ((getNumericValue(item, key) - min) / range) * 8 + 1, // Scale to 1-9
      originalValue: getNumericValue(item, key)
    }));
  };

  // ✅ Create legend data for pie charts
  const createLegendData = () => {
    const total = data.reduce((sum, item) => sum + getNumericValue(item, yAxis), 0);
    
    return data.map((item, index) => ({
      name: String(item[xAxis]),
      value: getNumericValue(item, yAxis),
      percentage: ((getNumericValue(item, yAxis) / total) * 100).toFixed(1),
      color: COLORS[index % COLORS.length]
    }));
  };

  return (
    <div className="mt-6 p-6 bg-white shadow-xl rounded-lg border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        Data Visualization
      </h3>

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="3d-bar">3D Bar Chart</option>
            <option value="3d-pie">3D Pie Chart</option>
          </select>

          <select
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value)}
            className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {Object.keys(data[0] || {}).map((key) => (
              <option key={key} value={key}>
                X-Axis: {key}
              </option>
            ))}
          </select>

          <select
            value={yAxis}
            onChange={(e) => setYAxis(e.target.value)}
            className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {Object.keys(data[0] || {}).map((key) => (
              <option key={key} value={key}>
                Y-Axis: {key}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ Download Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handlePNGDownload}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaDownload /> Download PNG
          </button>
          
          <button
            onClick={handlePDFDownload}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-md shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <FaFilePdf /> Download PDF
          </button>
        </div>
      </div>

      {/* ================= 2D CHARTS ================= */}
      {!chartType.includes("3d") && (
        <div ref={chartRef} className="w-full relative">
          {chartType === "bar" && (
            <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xAxis} angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={yAxis} fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartType === "line" && (
            <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xAxis} angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={yAxis}
                    stroke="#82ca9d"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ✅ Simplified Pie Chart */}
          {chartType === "pie" && (
            <div>
              {/* Pie Chart */}
              <div className="h-[400px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey={yAxis}
                      nameKey={xAxis}
                      cx="50%"
                      cy="50%"
                      outerRadius={140}
                      innerRadius={0}
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {data.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* ✅ Custom Legend Below Chart */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">Chart Legend</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {createLegendData().map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 bg-white rounded-md shadow-sm border"
                    >
                      {/* Color Box */}
                      <div 
                        className="w-6 h-6 rounded-md border-2 border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      
                      {/* Label and Values */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.value} ({item.percentage}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 3D CHARTS ================= */}
      {chartType.includes("3d") && (
        <div ref={chartRef} className="w-full relative">
          <div className="h-[500px] bg-gray-100 rounded-lg">
            <Canvas
              shadows
              camera={{ position: [0, 10, 20], fov: 60 }}
              gl={{ 
                preserveDrawingBuffer: true,
                antialias: true,
                alpha: false
              }}
              style={{ width: "100%", height: "100%" }}
            >
              <CanvasCapture onRendererReady={(gl, scene, camera) => {
                setThreeJsContext({ gl, scene, camera });
                gl.setClearColor('#f8f9fa');
                gl.shadowMap.enabled = true;
                gl.shadowMap.type = THREE.PCFSoftShadowMap;
              }} />
              
              {/* Lighting */}
              <ambientLight intensity={0.6} />
              <directionalLight 
                position={[10, 10, 5]} 
                intensity={0.8} 
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-camera-far={50}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
              />
              
              <OrbitControls enableZoom enablePan enableRotate />

              {/* 3D Bar Chart */}
              {chartType === "3d-bar" && (() => {
                const normalizedData = normalizeData(data, yAxis);
                const spacing = Math.min(4, 20 / data.length);
                const totalWidth = (data.length - 1) * spacing;
                const startX = -totalWidth / 2;
                
                return (
                  <>
                    {normalizedData.map((item, i) => {
                      const height = item.normalizedValue;
                      const xPos = startX + i * spacing;
                      const color = `hsl(${(i * 360 / data.length)}, 70%, 60%)`;
                      const labelText = String(item[xAxis]);
                      const displayLabel = labelText.length > 8 ? labelText.substring(0, 8) + '...' : labelText;
                      
                      return (
                        <group key={`bar-${i}`} position={[xPos, 0, 0]}>
                          {/* Bar */}
                          <Box 
                            args={[1.2, height, 1.2]} 
                            position={[0, height / 2, 0]}
                            castShadow
                            receiveShadow
                          >
                            <meshStandardMaterial 
                              color={color}
                              roughness={0.5}
                              metalness={0.1}
                            />
                          </Box>
                          
                          {/* Value label */}
                          <Text
                            position={[0, height + 1, 0]}
                            fontSize={0.5}
                            color="black"
                            anchorX="center"
                            anchorY="bottom"
                          >
                            {item.originalValue}
                          </Text>
                          
                          {/* Category label */}
                          <Text
                            position={[0, -1, 1.5]}
                            fontSize={0.4}
                            color="black"
                            anchorX="center"
                            anchorY="middle"
                            rotation={[0, 0, 0]}
                          >
                            {displayLabel}
                          </Text>
                        </group>
                      );
                    })}
                    
                    {/* Ground */}
                    <mesh 
                      rotation={[-Math.PI / 2, 0, 0]} 
                      position={[0, -0.5, 0]}
                      receiveShadow
                    >
                      <planeGeometry args={[30, 20]} />
                      <meshStandardMaterial color="#e0e0e0" />
                    </mesh>
                  </>
                );
              })()}

              {/* ✅ Simplified 3D Pie Chart */}
              {chartType === "3d-pie" && (() => {
                const total = data.reduce((sum, item) => sum + getNumericValue(item, yAxis), 0);
                let currentAngle = 0;
                
                return (
                  <>
                    {data.map((item, i) => {
                      const value = getNumericValue(item, yAxis);
                      const sweepAngle = (value / total) * Math.PI * 2;
                      const color = `hsl(${(i * 360 / data.length)}, 75%, 65%)`;
                      
                      const result = (
                        <PieSlice
                          key={`pie-${i}`}
                          radius={5}
                          height={1.5}
                          startAngle={currentAngle}
                          endAngle={currentAngle + sweepAngle}
                          color={color}
                          position={[0, 0, 0]}
                        />
                      );
                      
                      currentAngle += sweepAngle;
                      return result;
                    })}
                    
                    {/* Base */}
                    <mesh position={[0, -0.8, 0]} receiveShadow>
                      <cylinderGeometry args={[6, 6, 0.2]} />
                      <meshStandardMaterial color="#f0f0f0" />
                    </mesh>
                  </>
                );
              })()}
            </Canvas>
          </div>

          {/* ✅ Legend for 3D Pie Chart */}
          {chartType === "3d-pie" && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Chart Legend</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {createLegendData().map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-3 bg-white rounded-md shadow-sm border"
                  >
                    {/* Color Box */}
                    <div 
                      className="w-6 h-6 rounded-md border-2 border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    
                    {/* Label and Values */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.value} ({item.percentage}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChartRenderer;