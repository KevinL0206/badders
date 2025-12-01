import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Unavailability } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, dates, available } = body;

    if (!userId || !dates || !Array.isArray(dates)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Convert date strings to Date objects
    const dateObjects = dates.map((d: string) => new Date(d + "T00:00:00.000Z"));

    if (available) {
      // Remove unavailability records (mark as available)
      await prisma.unavailability.deleteMany({
        where: {
          userId: userId,
          date: { in: dateObjects },
        },
      });
    } else {
      // Add unavailability records (mark as unavailable)
      for (const date of dateObjects) {
        await prisma.unavailability.upsert({
          where: {
            userId_date: {
              userId: userId,
              date: date,
            },
          },
          update: {},
          create: {
            userId: userId,
            date: date,
          },
        });
      }
    }

    // Fetch updated data with user names
    const userUnavailability = await prisma.unavailability.findMany({
      where: { userId },
    });

    const allUnavailability = await prisma.unavailability.findMany({
      include: { user: true },
    });

    // Group unavailability by date with user info
    const unavailabilityByDate: Record<string, { id: number; name: string }[]> = {};
    allUnavailability.forEach((u) => {
      const dateKey = u.date.toISOString().split("T")[0];
      if (!unavailabilityByDate[dateKey]) {
        unavailabilityByDate[dateKey] = [];
      }
      unavailabilityByDate[dateKey].push({
        id: u.user.id,
        name: u.user.name,
      });
    });

    return NextResponse.json({
      unavailableDates: userUnavailability.map(
        (u: Unavailability) => u.date.toISOString().split("T")[0]
      ),
      unavailabilityByDate,
    });
  } catch (error) {
    console.error("Availability update error:", error);
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}
