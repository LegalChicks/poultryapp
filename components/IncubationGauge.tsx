import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface IncubationGaugeProps {
  daysElapsed: number;
  totalDays: number;
  width?: number;
  height?: number;
}

export const IncubationGauge: React.FC<IncubationGaugeProps> = ({ daysElapsed, totalDays, width = 200, height = 200 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    const radius = Math.min(width, height) / 2;
    const thickness = 20;

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const arc = d3.arc<any>()
      .innerRadius(radius - thickness)
      .outerRadius(radius)
      .startAngle(0);

    // Background Arc
    g.append("path")
      .datum({ endAngle: 2 * Math.PI })
      .style("fill", "#e5e7eb")
      .attr("d", arc);

    // Foreground Arc
    const progressAngle = (daysElapsed / totalDays) * 2 * Math.PI;
    
    g.append("path")
      .datum({ endAngle: progressAngle })
      .style("fill", daysElapsed >= totalDays ? "#10b981" : "#f59e0b") // Green if done, Amber if active
      .attr("d", arc);

    // Text centered
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.5em")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .style("fill", "#374151")
      .text(`Day ${daysElapsed}`);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.2em")
      .style("font-size", "14px")
      .style("fill", "#6b7280")
      .text(`of ${totalDays}`);

  }, [daysElapsed, totalDays, width, height]);

  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};