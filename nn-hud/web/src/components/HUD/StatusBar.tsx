interface StatusBarProps {
  label: string
  value: number
  backgroundColor?: string
  isBoolean?: boolean
}

export default function StatusBar({
  label,
  value,
  backgroundColor = "yellowgreen",
  isBoolean = false,
}: StatusBarProps) {
  const displayValue = isBoolean ? (value > 0 ? 100 : 0) : value

  return (
    <div className="stat-wrapper">
      <div className="stat-label color-white">{label}</div>
      <div className="stat-bar-base">
        <div
          className="stat-bar"
          style={{
            width: `${displayValue}%`,
            backgroundColor: backgroundColor,
          }}
        />
      </div>
    </div>
  )
}
