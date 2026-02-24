import { useState, useEffect } from "react"

interface VehicleData {
  showing: boolean
  rpm: number
  speed: number
  fuel: number
  engineOn: boolean
  beltOn: boolean
}

// Simulate the ReceiveEvent function
export function useVehicleEvents() {
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    showing: true, // Start visible for demo
    rpm: 0.5,
    speed: 67,
    fuel: 75,
    engineOn: true,
    beltOn: true,
  })

  // Simulate receiving events (for demo purposes)
  useEffect(() => {
    // You can replace this with your actual event handling logic
    const simulateEvents = () => {
      // Simulate some dynamic changes for demo
      setVehicleData((prev) => ({
        ...prev,
        rpm: 0.3 + Math.random() * 0.6, // Random RPM between 0.3 and 0.9
        speed: Math.max(0, prev.speed + (Math.random() - 0.5) * 5),
        fuel: Math.max(0, Math.min(100, prev.fuel + (Math.random() - 0.5) * 2)),
      }))
    }

    const interval = setInterval(simulateEvents, 3000)
    return () => clearInterval(interval)
  }, [])

  // Function to manually update vehicle data (for testing)
  const updateVehicleData = (data: Partial<VehicleData>) => {
    setVehicleData((prev) => ({ ...prev, ...data }))
  }

  return { vehicleData, updateVehicleData }
}
