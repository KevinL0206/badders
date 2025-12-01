import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Calendar from "@/components/Calendar";
import PasswordGate from "@/components/PasswordGate";
import type { Unavailability } from "@prisma/client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function CalendarPage({ params }: PageProps) {
  const { userId } = await params;
  const userIdNum = parseInt(userId, 10);

  if (isNaN(userIdNum)) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id: userIdNum },
    include: {
      unavailability: true,
    },
  });

  if (!user) {
    notFound();
  }

  // Get all unavailability data with user names
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

  // User's unavailable dates
  const userUnavailableDates = user.unavailability.map(
    (u: Unavailability) => u.date.toISOString().split("T")[0]
  );

  return (
    <PasswordGate>
    <div className="min-h-screen bg-[#141414] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(30,30,30,1)_0%,rgba(20,20,20,1)_100%)]" />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 py-8 px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 group"
          >
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm uppercase tracking-widest">Switch Profile</span>
          </Link>
        </div>

        <Calendar
          userId={user.id}
          userName={user.name}
          initialUnavailableDates={userUnavailableDates}
          initialUnavailabilityByDate={unavailabilityByDate}
        />
      </div>
    </div>
    </PasswordGate>
  );
}
