import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return NextResponse.json({ teacherId: null }, { status: 401 });
    }

    return NextResponse.json({ teacherId: session.user.id });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json({ teacherId: null }, { status: 500 });
  }
}
