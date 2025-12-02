"use client";

import { useState, useCallback, useEffect } from "react";

interface UnavailableUser {
  id: number;
  name: string;
}

interface Event {
  id: number;
  name: string;
  time: string;
}

interface CalendarProps {
  userId: number;
  userName: string;
  initialUnavailableDates: string[];
  initialUnavailabilityByDate: Record<string, UnavailableUser[]>;
}

function getAvailabilityColor(unavailableCount: number): string {
  if (unavailableCount === 0) {
    return "bg-green-500 hover:bg-green-400 border-green-400/50";
  } else if (unavailableCount <= 2) {
    return "bg-emerald-500/50 hover:bg-emerald-400/50 border-emerald-400/30";
  } else if (unavailableCount <= 4) {
    return "bg-amber-500/60 hover:bg-amber-400/60 border-amber-400/30";
  } else if (unavailableCount <= 5) {
    return "bg-red-500/50 hover:bg-red-400/50 border-red-400/30";
  } else {
    return "bg-red-600/70 hover:bg-red-500/70 border-red-500/30";
  }
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Calendar({
  userId,
  userName,
  initialUnavailableDates,
  initialUnavailabilityByDate,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(
    new Set(initialUnavailableDates)
  );
  const [unavailabilityByDate, setUnavailabilityByDate] = useState<Record<string, UnavailableUser[]>>(
    initialUnavailabilityByDate
  );
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<string | null>(null);
  const [eventsByDate, setEventsByDate] = useState<Record<string, Event[]>>({});
  const [eventModalDate, setEventModalDate] = useState<string | null>(null);
  const [newEventName, setNewEventName] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [savingEvent, setSavingEvent] = useState(false);

  // Fetch events on mount
  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => setEventsByDate(data.eventsByDate || {}))
      .catch(console.error);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDayOfWeek = new Date(year, month, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getSelectedRange = useCallback((): string[] => {
    if (!selectionStart) return [];
    if (!selectionEnd) return [selectionStart];

    const start = new Date(selectionStart);
    const end = new Date(selectionEnd);
    const dates: string[] = [];

    const [first, last] = start <= end ? [start, end] : [end, start];

    const current = new Date(first);
    while (current <= last) {
      dates.push(formatDateKey(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }, [selectionStart, selectionEnd]);

  const isInSelection = (dateKey: string): boolean => {
    const range = getSelectedRange();
    return range.includes(dateKey);
  };

  const handleDateClick = (dateKey: string) => {
    if (!selectionStart) {
      setSelectionStart(dateKey);
      setSelectionEnd(null);
    } else if (!selectionEnd) {
      setSelectionEnd(dateKey);
    } else {
      setSelectionStart(dateKey);
      setSelectionEnd(null);
    }
  };

  const handleViewUnavailable = (dateKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const users = unavailabilityByDate[dateKey] || [];
    if (users.length > 0) {
      setSelectedDateForModal(dateKey);
    }
  };

  const handleSubmit = async (markAsAvailable: boolean) => {
    const selectedDates = getSelectedRange();
    if (selectedDates.length === 0) return;

    setSaving(true);
    try {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          dates: selectedDates,
          available: markAsAvailable,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUnavailableDates(new Set(data.unavailableDates));
        setUnavailabilityByDate(data.unavailabilityByDate);
      }
    } catch (error) {
      console.error("Failed to update availability:", error);
    } finally {
      setSaving(false);
      setSelectionStart(null);
      setSelectionEnd(null);
    }
  };

  const handleClearSelection = () => {
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  const handleOpenEventModal = (dateKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEventModalDate(dateKey);
    setNewEventName("");
    setNewEventTime("");
  };

  const handleCreateEvent = async () => {
    if (!eventModalDate || !newEventName || !newEventTime) return;

    setSavingEvent(true);
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newEventName,
          date: eventModalDate,
          time: newEventTime,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEventsByDate(data.eventsByDate || {});
        setNewEventName("");
        setNewEventTime("");
      }
    } catch (error) {
      console.error("Failed to create event:", error);
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      const response = await fetch(`/api/events?id=${eventId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        setEventsByDate(data.eventsByDate || {});
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const formatDisplayDate = (dateKey: string) => {
    const date = new Date(dateKey + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const renderCalendarDays = () => {
    const days: React.ReactNode[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 md:h-24" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = formatDateKey(date);
      const isUnavailable = unavailableDates.has(dateKey);
      const inSelection = isInSelection(dateKey);
      const isStart = dateKey === selectionStart;
      const isEnd = dateKey === selectionEnd;
      const unavailableUsers = unavailabilityByDate[dateKey] || [];
      const unavailableCount = unavailableUsers.length;
      const dateEvents = eventsByDate[dateKey] || [];
      const hasEvents = dateEvents.length > 0;

      const colorClass = hasEvents
        ? "bg-gradient-to-br from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 border-yellow-400/50"
        : getAvailabilityColor(unavailableCount);

      const isToday = formatDateKey(new Date()) === dateKey;

      days.push(
        <div
          key={dateKey}
          onClick={() => handleDateClick(dateKey)}
          className={`
            h-20 md:h-24 flex flex-col items-center justify-start pt-2 rounded-lg cursor-pointer
            select-none transition-all duration-200 relative border
            ${colorClass}
            ${inSelection ? "ring-2 ring-white ring-offset-2 ring-offset-[#141414]" : ""}
            ${isStart || isEnd ? "ring-2 ring-red-500 ring-offset-2 ring-offset-[#141414]" : ""}
            ${isToday ? "ring-1 ring-white/50" : ""}
          `}
        >

          {/* Day number */}
          <span className={`relative z-10 text-sm md:text-base font-medium ${isUnavailable ? "text-white" : "text-white/90"}`}>
            {day}
          </span>

          {/* Event indicator - golden badge */}
          {hasEvents && (
            <div
              className="absolute bottom-1 left-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-[10px] md:text-xs font-bold text-black shadow-lg shadow-yellow-500/50 cursor-pointer z-10"
              onClick={(e) => handleOpenEventModal(dateKey, e)}
            >
              {dateEvents.length}
            </div>
          )}

          {/* Unavailable count indicator */}
          {unavailableCount > 0 && (
            <div
              className="absolute bottom-1 right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-[10px] md:text-xs font-bold text-white/90 border border-white/20 z-10"
              onClick={(e) => handleViewUnavailable(dateKey, e)}
            >
              {unavailableCount}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const formatModalDate = (dateKey: string) => {
    const date = new Date(dateKey + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const selectedRange = getSelectedRange();
  const allSelectedAreUnavailable = selectedRange.length > 0 &&
    selectedRange.every(d => unavailableDates.has(d));

  return (
    <div className="max-w-4xl mx-auto animate-[fadeIn_0.5s_ease-out]">
      {/* User Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 font-[family-name:var(--font-bebas-neue)] tracking-wide">
          Schedule
        </h1>
        <p className="text-gray-400">
          {saving ? (
            <span className="text-amber-400">Saving changes...</span>
          ) : (
            "Select dates to mark your unavailability"
          )}
        </p>
      </div>

      {/* Calendar Card */}
      <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden">
        {/* Month Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50">
          <button
            onClick={goToPreviousMonth}
            className="p-3 hover:bg-white/5 rounded-lg transition-all duration-200 group"
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl md:text-2xl font-bold text-white font-[family-name:var(--font-bebas-neue)] tracking-wider">
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-3 hover:bg-white/5 rounded-lg transition-all duration-200 group"
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 px-4 pt-4 pb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 p-4 pt-0">
          {renderCalendarDays()}
        </div>

        {/* Selection Panel */}
        {selectionStart && (
          <div className="px-6 py-4 bg-[#222] border-t border-gray-800/50 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-300">
                <span className="text-gray-500">Selected: </span>
                {selectionEnd ? (
                  <>
                    <span className="text-white font-medium">
                      {formatDisplayDate(selectionStart <= selectionEnd ? selectionStart : selectionEnd)}
                    </span>
                    <span className="text-gray-500 mx-2">→</span>
                    <span className="text-white font-medium">
                      {formatDisplayDate(selectionStart <= selectionEnd ? selectionEnd : selectionStart)}
                    </span>
                    <span className="text-gray-500 ml-2">({selectedRange.length} days)</span>
                  </>
                ) : (
                  <>
                    <span className="text-white font-medium">{formatDisplayDate(selectionStart)}</span>
                    <span className="text-gray-500 ml-2">(click another date for range)</span>
                  </>
                )}
              </div>
              <button
                onClick={handleClearSelection}
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {allSelectedAreUnavailable ? (
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={saving}
                  className="w-full py-3 px-6 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark as Available
                </button>
              ) : (
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={saving}
                  className="w-full py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark as Unavailable
                </button>
              )}
              <button
                onClick={() => {
                  setEventModalDate(selectionStart);
                  setNewEventName("");
                  setNewEventTime("");
                }}
                className="w-full py-3 px-6 bg-gradient-to-r from-yellow-500 to-amber-600 text-black rounded-lg hover:from-yellow-400 hover:to-amber-500 transition-all duration-200 font-medium"
              >
                Add Event
              </button>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="px-6 py-4 bg-[#1a1a1a] border-t border-gray-800/50">
          <div className="flex flex-wrap gap-4 justify-center text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500 border border-green-400/50"></div>
              <span className="text-gray-400">All available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500/50 border border-emerald-400/30"></div>
              <span className="text-gray-400">1-2 out</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500/60 border border-amber-400/30"></div>
              <span className="text-gray-400">3-4 out</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500/50 border border-red-400/30"></div>
              <span className="text-gray-400">4-5 out</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-600/70 border border-red-500/30"></div>
              <span className="text-gray-400">6+ out</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Click a date to select • Click another to set a range • Tap the number to see who&apos;s out</p>
      </div>

      {/* Unavailable Modal */}
      {selectedDateForModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setSelectedDateForModal(null)}
        >
          <div
            className="bg-[#1a1a1a] rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-gray-800/50 animate-[scaleIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-white mb-1 font-[family-name:var(--font-bebas-neue)] tracking-wide">
              Unavailable
            </h3>
            <p className="text-gray-400 mb-6 text-sm">
              {formatModalDate(selectedDateForModal)}
            </p>
            <ul className="space-y-3 mb-6">
              {(unavailabilityByDate[selectedDateForModal] || []).map((user) => (
                <li key={user.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-sm font-bold text-white">
                    {getInitials(user.name)}
                  </div>
                  <span className="text-white">{user.name}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setSelectedDateForModal(null)}
              className="w-full py-3 px-4 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {eventModalDate && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setEventModalDate(null)}
        >
          <div
            className="bg-[#1a1a1a] rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-yellow-500/30 animate-[scaleIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-1 font-[family-name:var(--font-bebas-neue)] tracking-wide bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Events
            </h3>
            <p className="text-gray-400 mb-6 text-sm">
              {formatModalDate(eventModalDate)}
            </p>

            {/* Existing events */}
            {(eventsByDate[eventModalDate] || []).length > 0 && (
              <ul className="space-y-3 mb-6">
                {(eventsByDate[eventModalDate] || []).map((event) => (
                  <li key={event.id} className="flex items-center justify-between gap-3 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg p-3 border border-yellow-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-sm font-bold text-black shadow-lg shadow-yellow-500/30">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">{event.name}</p>
                        <p className="text-yellow-400/80 text-sm">{event.time}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Add new event form */}
            <div className="space-y-3 mb-6">
              <input
                type="text"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="Event name"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
              />
              <div className="relative">
                <input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-500/50"
                />
                {!newEventTime && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    Select time
                  </span>
                )}
              </div>
              <button
                onClick={handleCreateEvent}
                disabled={savingEvent || !newEventName || !newEventTime}
                className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-black rounded-lg hover:from-yellow-400 hover:to-amber-500 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingEvent ? "Adding..." : "Add Event"}
              </button>
            </div>

            <button
              onClick={() => setEventModalDate(null)}
              className="w-full py-3 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
