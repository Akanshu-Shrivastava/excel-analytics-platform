// src/components/ChartCustomization.jsx
import React from 'react';

const ChartCustomization = ({ color, setColor, title, setTitle, showLegend, setShowLegend }) => {
  return (
    <div className="flex gap-4 items-center mb-4 flex-wrap">
      {/* Color Picker */}
      <div>
        <label className="block text-sm font-medium mb-1">Bar/Line Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-12 h-8 p-0 border rounded"
        />
      </div>

      {/* Chart Title */}
      <div>
        <label className="block text-sm font-medium mb-1">Chart Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter chart title"
          className="border px-2 py-1 rounded"
        />
      </div>

      {/* Legend Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={showLegend}
          onChange={() => setShowLegend(!showLegend)}
        />
        <label className="text-sm">Show Legend</label>
      </div>
    </div>
  );
};

export default ChartCustomization;
