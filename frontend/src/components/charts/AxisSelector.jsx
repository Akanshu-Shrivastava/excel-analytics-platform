import React from 'react';

const AxisSelector = ({ columns, xAxis, setXAxis, yAxis, setYAxis }) => {
  return (
    <div className="flex gap-4 mb-4">
      {/* X Axis Selector */}
      <div>
        <label className="block font-medium">X Axis:</label>
        <select
          value={xAxis}
          onChange={(e) => setXAxis(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">--Select--</option>
          {columns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </div>

      {/* Y Axis Selector */}
      <div>
        <label className="block font-medium">Y Axis:</label>
        <select
          value={yAxis}
          onChange={(e) => setYAxis(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">--Select--</option>
          {columns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AxisSelector;
