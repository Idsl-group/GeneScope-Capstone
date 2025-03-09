import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import './TestPage.css'; // Import the CSS file <button class="citation-flag" data-index="2"><button class="citation-flag" data-index="5"><button class="citation-flag" data-index="9">

const Histogram = ({ data, columnLabel }) => {
  const svgRef = useRef();
  const margin = { top: 20, right: 30, bottom: 40, left: 40 };
  const width = 400 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  useEffect(() => {
    if (!data?.length) return;

    const histogram = d3.histogram()
      .value(d => d)
      .domain(d3.extent(data))
      .thresholds(10);

    const bins = histogram(data);

    const x = d3.scaleLinear()
      .domain([d3.min(bins, d => d.x0), d3.max(bins, d => d.x1)])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([height, 0]);

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add bar class for CSS styling <button class="citation-flag" data-index="8">
    svg.selectAll('rect')
      .data(bins)
      .enter()
      .append('rect')
      .attr('class', 'bar') // Add class for styling
      .attr('x', d => x(d.x0))
      .attr('width', d => x(d.x1) - x(d.x0))
      .attr('height', d => height - y(d.length))
      .attr('y', d => y(d.length));

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .attr('class', 'axis'); // Add axis class

    svg.append('g')
      .call(d3.axisLeft(y))
      .attr('class', 'axis'); // Add axis class

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom)
      .text(columnLabel);
  }, [data, columnLabel]);

  return <svg ref={svgRef} />;
};

const TestPage = () => {
  const [columns, setColumns] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const rows = text.trim().split('\n').map(line => 
          line.split(',').map(Number)
        );
        
        if (!rows.every(row => row.length === 3)) {
          throw new Error('Invalid file format - expected 3 columns');
        }
        
        const transposed = rows[0].map((_, i) => rows.map(row => row[i]));
        setColumns(transposed);
        setError(null);
      } catch (err) {
        setError('Error parsing file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="file-input-container"> {/* Container class <button class="citation-flag" data-index="5"> */}
      <input 
        type="file" 
        className="file-input" // Hidden input <button class="citation-flag" data-index="7">
        accept=".txt" 
        onChange={handleFileUpload}
        id="fileInput"
      />
      <label htmlFor="fileInput" className="file-input-label"> {/* Styled label <button class="citation-flag" data-index="5"> */}
        Upload File
      </label>
      
      {error && <div className="error-message">{error}</div>}
      
      {columns && (
        <div className="histogram-grid"> {/* Responsive grid <button class="citation-flag" data-index="4"> */}
          {columns.map((col, index) => (
            <div key={index} className="histogram-container"> {/* Card styling <button class="citation-flag" data-index="3"><button class="citation-flag" data-index="6"> */}
              <h3 className="histogram-title">Column {index + 1}</h3>
              <Histogram 
                data={col} 
                columnLabel={`Column ${index + 1}`} 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestPage;