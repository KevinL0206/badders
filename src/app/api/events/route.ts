import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
  });

  // Group events by date
  const eventsByDate: Record<string, { id: number; name: string; time: string }[]> = {};
  events.forEach((event) => {
    const dateKey = event.date.toISOString().split("T")[0];
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    eventsByDate[dateKey].push({
      id: event.id,
      name: event.name,
      time: event.time,
    });
  });

  return NextResponse.json({ eventsByDate });
}

export async function POST(request: NextRequest) {
  const { name, date, time } = await request.json();

  if (!name || !date || !time) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const event = await prisma.event.create({
    data: {
      name,
      date: new Date(date),
      time,
    },
  });

  // Return updated events
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
  });

  const eventsByDate: Record<string, { id: number; name: string; time: string }[]> = {};
  events.forEach((e) => {
    const dateKey = e.date.toISOString().split("T")[0];
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    eventsByDate[dateKey].push({
      id: e.id,
      name: e.name,
      time: e.time,
    });
  });

  return NextResponse.json({ event, eventsByDate });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing event id" }, { status: 400 });
  }

  await prisma.event.delete({
    where: { id: parseInt(id, 10) },
  });

  // Return updated events
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
  });

  const eventsByDate: Record<string, { id: number; name: string; time: string }[]> = {};
  events.forEach((e) => {
    const dateKey = e.date.toISOString().split("T")[0];
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    eventsByDate[dateKey].push({
      id: e.id,
      name: e.name,
      time: e.time,
    });
  });

  return NextResponse.json({ eventsByDate });
}
