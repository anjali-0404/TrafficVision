import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Mock validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    if (email === "test@example.com" && password === "password123") {
      // Mock successful login
      return NextResponse.json(
        { message: "Login successful", user: { email, name: "Test User" } },
        { status: 200 }
      );
    } else {
      // Mock any other login as successful too for prototyping
      return NextResponse.json(
        { message: "Login successful", user: { email, name: "Mock User" } },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
