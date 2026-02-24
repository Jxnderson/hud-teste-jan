import { useEffect, useState } from "react"

interface SpeedometerProps {
  maxLengthDisplay?: number
  rotateDegree?: number
  ringSize?: number
  progressColor?: string
  outlineColor?: string
  outlineColorOpacity?: number
  height?: number
  width?: number
  progressValue: number
  text?: string
  displayNumber: number
  maxProgressValue?: number
}

export default function Speedometer({
  maxLengthDisplay = 100,
  rotateDegree = 0,
  ringSize = 4,
  progressColor = "greenyellow",
  outlineColor = "red",
  outlineColorOpacity = 0.4,
  height = 50,
  width = 50,
  progressValue,
  text = "",
  displayNumber,
  maxProgressValue = 100,
}: SpeedometerProps) {
  const [animatedNumber, setAnimatedNumber] = useState(displayNumber)

  useEffect(() => {
    // Real-time update for speedometer - no animation delay
    setAnimatedNumber(displayNumber)
  }, [displayNumber])

  const radius = height > width ? height / 2 : width / 2
  const normalizedRadius = radius - ringSize / 2
  const circumference = normalizedRadius * 2 * Math.PI

  // Use progressValue (controlled externally)
  const transposeValue = (progressValue / maxProgressValue) * 100
  const strokeDashoffset = circumference - (transposeValue / (100 / maxLengthDisplay) / 100) * circumference
  const outlineStrokeDashoffset = circumference - (maxLengthDisplay / 100) * circumference

  // Calculate the positions of the speed ticks (8 speed marks)
  const speedMarks = [0, 30, 60, 90, 120, 150, 180, 200]
  const displayLabels = [0, 1, 2, 3, 4, 5, 6, 7]
  const ticks = Array.from({ length: speedMarks.length }, (_, i) => i)

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${radius * 2} ${radius * 2}`} style={{ overflow: "visible" }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g transform={`${rotateDegree ? `rotate(${rotateDegree} ${radius} ${radius})` : ""}`}>
        {/* Outline circle */}
        <circle
          opacity={outlineColorOpacity}
          fill="transparent"
          stroke={outlineColor}
          strokeDashoffset={outlineStrokeDashoffset}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeWidth={ringSize}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90, ${radius}, ${radius})`}
        />

        {/* Progress circle */}
        <circle
          stroke={progressColor}
          fill="transparent"
          strokeDashoffset={strokeDashoffset}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeWidth={ringSize}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90, ${radius}, ${radius})`}
          style={{
            filter: `drop-shadow(0 0 0.1vh ${progressColor})`,
            // No transition for real-time gear progress response
          }}
        />

        {/* Speed Ticks */}
        {ticks.map((tick, index) => {
          // Calculate angle to properly distribute ticks across the arc length
          const angleStep = (maxLengthDisplay / 100) * 360 / (speedMarks.length - 1)
          const angle = -90 + index * angleStep
          const rad = (angle * Math.PI) / 180
          const xStart = radius + (normalizedRadius - 3) * Math.cos(rad)
          const yStart = radius + (normalizedRadius - 3) * Math.sin(rad)
          const xEnd = radius + (normalizedRadius + 3) * Math.cos(rad)
          const yEnd = radius + (normalizedRadius + 3) * Math.sin(rad)

          return (
            <g key={index}>
              {/* Tick line */}
              <line x1={xStart} y1={yStart} x2={xEnd} y2={yEnd} stroke="rgba(255, 255, 255, 1)" strokeWidth="1.6" strokeLinecap="round" />
            </g>
          )
        })}
      </g>

      {/* Clock-style numbers positioned outside rotation */}
      {ticks.map((tick, index) => {
        // Calculate angle for proper clock positioning, accounting for the speedometer's rotation
        const angleStep = (maxLengthDisplay / 100) * 360 / (speedMarks.length - 1)
        const baseAngle = -90 + index * angleStep
        const adjustedAngle = baseAngle + rotateDegree
        const rad = (adjustedAngle * Math.PI) / 180
        
        // Position numbers close to tick lines
        const textRadius = normalizedRadius - 8
        const textX = radius + textRadius * Math.cos(rad)
        const textY = radius + textRadius * Math.sin(rad)

        return (
          <text
            key={`label-${index}`}
            x={textX}
            y={textY}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontFamily: "Gilroy-Medium, sans-serif",
              fontSize: `${radius * 0.13}px`,
              fill: "rgba(255, 255, 255, 0.9)",
              fontWeight: "bold",
            }}
          >
            {displayLabels[index]}
          </text>
        )
      })}

      {text && (
        <>
          <text
            className="vehicle-number"
            x="50%"
            y="41%"
            dominantBaseline="middle"
            textAnchor="middle"
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: `${radius * 0.7}px`,
              fill: "rgba(255, 255, 255, 0.9)",
              fontWeight: "400",
            }}
          >
            {Math.floor(animatedNumber)}
          </text>
                    <text
            className="vehicle-text"
            x="50%"
            y="65%"
            dominantBaseline="middle"
            textAnchor="middle"
 
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: `${radius * 0.3}px`,
              fill: "rgba(255, 255, 255, 0.7)",
              fontWeight: "400",
            }}
          >
            {text}
          </text>
        </>
      )}
    </svg>
  )
}
