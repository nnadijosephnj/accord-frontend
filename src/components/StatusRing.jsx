import React from "react";

/**
 * StatusRing — a small SVG donut chart showing agreement status breakdown.
 *
 * @param {{ segments: Array<{ value: number, color: string }>, size?: number, strokeWidth?: number, center?: React.ReactNode }} props
 */
export default function StatusRing({ segments = [], size = 80, strokeWidth = 7, center }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  let offset = 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accord-border)"
          strokeWidth={strokeWidth}
        />
        {/* Data segments */}
        {segments.map((segment, index) => {
          const segmentLength = (segment.value / total) * circumference;
          const dashArray = `${segmentLength} ${circumference - segmentLength}`;
          const dashOffset = -offset;
          offset += segmentLength;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      {center ? (
        <div className="absolute inset-0 flex items-center justify-center">
          {center}
        </div>
      ) : null}
    </div>
  );
}
