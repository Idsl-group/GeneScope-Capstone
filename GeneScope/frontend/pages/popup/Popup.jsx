import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./Popup.css";

const Histogram = ({ data, columnLabel }) => {
  const svgRef = useRef();
  const margin = { top: 20, right: 30, bottom: 60, left: 40 }; 
  const width = 360 - margin.left - margin.right; 
  const height = 300 - margin.top - margin.bottom;

  useEffect(() => {
    if (!data?.length) return;

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

    const barWidth = width / bins.length; 

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    svg
      .selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d, i) => i * barWidth)
      .attr("width", barWidth - 1) 
      .attr("height", (d) => height - y(d.length))
      .attr("y", (d) => y(d.length));

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .attr("class", "axis");

    svg.append("g").call(d3.axisLeft(y)).attr("class", "axis");

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10) 
      .attr("text-anchor", "middle")
      .attr("class", "x-axis-label")
      .text(columnLabel);
  }, [data, columnLabel]);

  return <svg ref={svgRef} />;
};

const Popup = ({ feedback, fileText, onClose, selectedFileName }) => {
  const [columns, setColumns] = useState(null);
  const [error, setError] = useState(null);
  const popupRef = useRef();

  useEffect(() => {
    if (!fileText) return;
    try {
      const rows = fileText
        .trim()
        .split("\n")
        .map((line) => line.split(",").map(Number));

      if (!rows.every((row) => row.length === 3)) {
        throw new Error("Invalid file format - expected 3 columns");
      }

      const transposed = rows[0].map((_, i) => rows.map((row) => row[i]));
      setColumns(transposed);
      setError(null);
    } catch (err) {
      setError("Error parsing file: " + err.message);
    }
  }, [fileText]);

  const handleDownloadPDF = async () => {
    const pdf = new jsPDF();
    const element = popupRef.current;

    pdf.text("Generated Feedback", 10, 10);
    const lines = pdf.splitTextToSize(feedback, 180);
    pdf.text(lines, 10, 20);

    for (let i = 0; i < element.querySelectorAll('.histogram-container').length; i++) {
      const histogramElement = element.querySelectorAll('.histogram-container')[i];
      const canvas = await html2canvas(histogramElement);
      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, 10, pdfWidth - 20, pdfHeight);
    }

    pdf.save(`${selectedFileName} insights.pdf`);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container" ref={popupRef}>
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

        <div className="button-container">
          <button className="download-button" onClick={handleDownloadPDF}>
            Download File
          </button>
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;