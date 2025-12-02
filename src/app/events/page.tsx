import Link from "next/link";
import prisma from "@/lib/prisma";
import PasswordGate from "@/components/PasswordGate";
import BackButton from "@/components/BackButton";
import EventsList from "@/components/EventsList";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const events = await prisma.event.findMany({
    where: {
      date: {
        gte: today,
      },
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  // Group events by date for the client component
  const groupedEvents: { [dateKey: string]: { id: number; name: string; date: string; time: string }[] } = {};
  events.forEach((event) => {
    const dateKey = event.date.toISOString().split("T")[0];
    if (!groupedEvents[dateKey]) {
      groupedEvents[dateKey] = [];
    }
    groupedEvents[dateKey].push({
      id: event.id,
      name: event.name,
      date: dateKey,
      time: event.time,
    });
  });

  return (
    <PasswordGate>
      <div className="min-h-screen bg-[#0d0d0d] relative overflow-hidden">
        {/* Ambient golden glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-amber-500/[0.07] via-yellow-600/[0.03] to-transparent blur-3xl pointer-events-none" />

        {/* Subtle grid pattern */}
        <div
          className="fixed inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,215,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10">
          {/* Header */}
          <header className="border-b border-white/[0.06] bg-black/20 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                >
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm tracking-widest uppercase">Switch Profile</span>
                </Link>

                {/* Navigation Tabs */}
                <nav className="flex items-center gap-1 bg-white/[0.03] rounded-full p-1">
                  <BackButton className="px-5 py-2 text-sm text-gray-400 hover:text-white rounded-full transition-colors">
                    Calendar
                  </BackButton>
                  <div className="px-5 py-2 text-sm text-black bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-black/30 rounded-full" />
                    Events
                  </div>
                </nav>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <section className="pt-16 pb-12 px-6">
            <div className="max-w-4xl mx-auto text-center">
              

              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 font-[family-name:var(--font-bebas-neue)] tracking-wide">
                <span className="bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  Upcoming
                </span>
                <br />
                <span className="text-white/90">Events</span>
              </h1>
            </div>
          </section>

          {/* Events List */}
          <section className="px-6 pb-24">
            <div className="max-w-2xl mx-auto">
              <EventsList initialEvents={groupedEvents} />
            </div>
          </section>
        </div>

        {/* Bottom gradient fade */}
        <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0d0d0d] to-transparent pointer-events-none z-40" />
      </div>
    </PasswordGate>
  );
}
