import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { external_id, status } = body; // status can be "PAID", "PENDING", "EXPIRED", "FAILED"

    console.log(`🧪 Simulating payment status: ${status} for ${external_id}`);

    // In a real implementation, you would update your database here
    // For now, just return the simulated status
    
    return NextResponse.json({ 
      external_id,
      status,
      message: `Payment status simulated as ${status}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
