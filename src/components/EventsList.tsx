"use client";

import { useState } from "react";
import Link from "next/link";
import EventCard from "./EventCard";

interface Event {
  id: number;
  name: string;
  date: string;
  time: string;
}

interface GroupedEvents {
  [dateKey: string]: Event[];
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function getRelativeDay(dateStr: string): string | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(dateStr + "T00:00:00");

  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;
  return null;
}

export default function EventsList({ initialEvents }: { initialEvents: GroupedEvents }) {
  const [eventsByDate, setEventsByDate] = useState<GroupedEvents>(initialEvents);

  const handleDeleteEvent = (eventId: number) => {
    const newEventsByDate: GroupedEvents = {};

    Object.entries(eventsByDate).forEach(([dateKey, events]) => {
      const filteredEvents = events.filter((e) => e.id !== eventId);
      if (filteredEvents.length > 0) {
        newEventsByDate[dateKey] = filteredEvents;
      }
    });

    setEventsByDate(newEventsByDate);
  };

  const dateKeys = Object.keys(eventsByDate).sort();
  const totalEvents = dateKeys.reduce((sum, key) => sum + eventsByDate[key].length, 0);

  if (totalEvents === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-500/10 flex items-center justify-center">
          <svg className="w-10 h-10 text-yellow-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl text-white/60 font-medium mb-2">No upcoming events</h3>
        <p className="text-gray-600 mb-8">Events you create will appear here</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-medium rounded-full hover:from-yellow-400 hover:to-amber-500 transition-all"
        >
          Go to Calendar
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {dateKeys.map((dateKey, groupIndex) => {
        const dateEvents = eventsByDate[dateKey];
        const date = new Date(dateKey + "T00:00:00");
        const relativeDay = getRelativeDay(dateKey);

        return (
          <div
            key={dateKey}
            className="animate-[fadeInUp_0.5s_ease-out_forwards] opacity-0"
            style={{ animationDelay: `${groupIndex * 100}ms` }}
          >
            {/* Date Header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex flex-col items-center justify-center shadow-lg shadow-amber-500/20">
                  <span className="text-[10px] font-bold text-black/60 uppercase tracking-wider leading-none">
                    {date.toLocaleDateString("en-US", { month: "short" })}
                  </span>
                  <span className="text-xl font-bold text-black leading-none">
                    {date.getDate()}
                  </span>
                </div>
                <div>
                  <h2 className="text-white font-medium">
                    {formatEventDate(dateKey)}
                  </h2>
                  {relativeDay && (
                    <span className="text-yellow-500/80 text-sm">{relativeDay}</span>
                  )}
                </div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/20 to-transparent" />
            </div>

            {/* Events for this date */}
            <div className="space-y-3 pl-[4.5rem]">
              {dateEvents.map((event, eventIndex) => (
                <div
                  key={event.id}
                  style={{ animationDelay: `${groupIndex * 100 + eventIndex * 50}ms` }}
                >
                  <EventCard
                    event={{
                      id: event.id,
                      name: event.name,
                      time: event.time,
                      dateFormatted: formatEventDate(dateKey),
                    }}
                    onDelete={handleDeleteEvent}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
