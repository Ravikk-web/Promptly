import React from 'react';

interface ScoreGaugeProps {
  score: number;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  // Calculate circumference for SVG circle
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = "text-red-500";
  if (score >= 50) colorClass = "text-yellow-500";
  if (score >= 80) colorClass = "text-emerald-500";

  return (
    <div className="relative flex flex-col items-center justify-center w-40 h-40">
      <svg
        height={radius * 2.5}
        width={radius * 2.5}
        className="transform -rotate-90"
      >
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius * 1.25}
          cy={radius * 1.25}
          className="text-slate-700"
        />
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: "stroke-dashoffset 1s ease-in-out" }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius * 1.25}
          cy={radius * 1.25}
          className={colorClass}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-4xl font-bold ${colorClass}`}>
          {score}
        </span>
        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
          Score
        </span>
      </div>
    </div>
  );
};

export default ScoreGauge;