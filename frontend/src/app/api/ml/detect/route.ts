import { NextResponse } from "next/server";

// Helper function to generate random mock data
function generateMockInference() {
  const vehicleTypes = ["Car", "Truck", "Motorcycle", "Bus"];
  const violations = ["None", "Speeding", "Red Light", "No Helmet"];
  const plates = ["ABC-123", "XYZ-987", "LMN-456", "QWE-111", "DEF-222"];
  
  const type = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
  const violation = violations[Math.floor(Math.random() * violations.length)];
  const plate = plates[Math.floor(Math.random() * plates.length)];
  
  // Random speed between 20 and 120 km/h
  const speed = Math.floor(Math.random() * 100) + 20;
  
  // Random confidence between 0.70 and 0.99
  const confidence = (Math.random() * 0.29 + 0.70).toFixed(2);
  
  // Random bounding box
  const bbox = [
    Math.floor(Math.random() * 200),
    Math.floor(Math.random() * 200),
    Math.floor(Math.random() * 200) + 200,
    Math.floor(Math.random() * 200) + 200,
  ];

  return {
    id: Math.random().toString(36).substring(7),
    timestamp: new Date().toISOString(),
    vehicleType: type,
    licensePlate: plate,
    speed: speed,
    violation: speed > 80 ? "Speeding" : violation, // force speeding if speed > 80
    confidence: parseFloat(confidence),
    bbox: bbox,
  };
}

export async function GET() {
  try {
    // Generate an array of 5 to 15 mock detections
    const numDetections = Math.floor(Math.random() * 10) + 5;
    const detections = Array.from({ length: numDetections }, generateMockInference);

    return NextResponse.json(
      {
        message: "Inference completed successfully",
        frameId: "cam_01_" + Date.now(),
        detections: detections,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "ML inference error" },
      { status: 500 }
    );
  }
}
