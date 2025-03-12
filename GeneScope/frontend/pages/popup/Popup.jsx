// // Popup.js
// import React from "react";
// import "./Popup.css";

// const Popup = ({ feedback, fileText, onClose }) => {
//   return (
//     <div className="popup-overlay">
//       <div className="popup-container">
//         <h1>Generated Feedback</h1>
//         <pre className="popup-text">{feedback}</pre>
//         <div class="close-button-container">
//             <button class="close-button"onClick={onClose}>Close</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Popup;

// Popup.js
import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import "./Popup.css";

const Histogram = ({ data, columnLabel }) => {
  const svgRef = useRef();
  const margin = { top: 20, right: 30, bottom: 40, left: 40 };
  const width = 360 - margin.left - margin.right; // Adjusted width to fit within container
  const height = 300 - margin.top - margin.bottom;

  useEffect(() => {
    if (!data?.length) return;

    // Clear any previous SVG content before drawing
    d3.select(svgRef.current).selectAll("*").remove();

    const histogram = d3
      .histogram()
      .value((d) => d)
      .domain(d3.extent(data))
      .thresholds(10);

    const bins = histogram(data);

    const x = d3
      .scaleLinear()
      .domain([d3.min(bins, (d) => d.x0), d3.max(bins, (d) => d.x1)])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(bins, (d) => d.length)])
      .range([height, 0]);

    const barWidth = width / bins.length; // Calculate the width of each bar

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Draw the bars with a CSS class for styling
    svg
      .selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d, i) => i * barWidth)
      .attr("width", barWidth - 1) // Subtract 1 to add some space between bars
      .attr("height", (d) => height - y(d.length))
      .attr("y", (d) => y(d.length));

    // Draw x-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .attr("class", "axis");

    // Draw y-axis
    svg.append("g").call(d3.axisLeft(y)).attr("class", "axis");

    // Add x-axis label
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom)
      .attr("text-anchor", "middle")
      .attr("class", "x-axis-label")
      .text(columnLabel);
  }, [data, columnLabel]);

  return <svg ref={svgRef} />;
};

const Popup = ({ feedback, fileText, onClose }) => {
  const [columns, setColumns] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fileText) return;
    try {
      // Parse the file text (expecting CSV rows separated by newlines)
      const rows = fileText
        .trim()
        .split("\n")
        .map((line) => line.split(",").map(Number));

      // Ensure each row has 3 columns; adjust this as needed for your data
      if (!rows.every((row) => row.length === 3)) {
        throw new Error("Invalid file format - expected 3 columns");
      }

      // Transpose rows into columns so that each column becomes an array
      const transposed = rows[0].map((_, i) => rows.map((row) => row[i]));
      setColumns(transposed);
      setError(null);
    } catch (err) {
      setError("Error parsing file: " + err.message);
    }
  }, [fileText]);

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h1>Generated Feedback</h1>
        <pre className="popup-text">{feedback}</pre>
        
        {error && <div className="error-message">{error}</div>}

        {columns && (
          <div className="histogram-grid">
            {columns.map((col, index) => {
              const columnNames = ["Popularity Score", "Structure Score", "Stability Score"];
              return (
                <div key={index} className="histogram-container">
                  <h3 className="histogram-title">{columnNames[index]}</h3>
                  <Histogram data={col} columnLabel={columnNames[index]} />
                </div>
              );
            })}
          </div>
        )}

        <div className="close-button-container">
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;