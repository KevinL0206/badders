"use client";

import { useState } from "react";

interface Event {
  id: number;
  name: string;
  time: string;
  dateFormatted: string;
}

export default function EventCard({ event, onDelete }: { event: Event; onDelete: (id: number) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/events?id=${event.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        onDelete(event.id);
        setShowModal(false);
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="group relative bg-gradient-to-r from-white/[0.03] to-transparent border border-white/[0.06] rounded-xl p-4 hover:border-yellow-500/30 hover:from-yellow-500/[0.05] transition-all duration-300 cursor-pointer"
      >
        {/* Golden accent line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-yellow-400 to-amber-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-medium group-hover:text-yellow-50 transition-colors">
                {event.name}
              </h3>
              <p className="text-gray-500 text-sm">{event.time}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-600 group-hover:text-yellow-500/60 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[#1a1a1a] rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-yellow-500/30 animate-[scaleIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center mb-4 shadow-lg shadow-yellow-500/20">
              <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-white mb-1 font-[family-name:var(--font-bebas-neue)] tracking-wide">
              {event.name}
            </h3>
            <p className="text-yellow-500 mb-1">{event.time}</p>
            <p className="text-gray-500 text-sm mb-6">{event.dateFormatted}</p>

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors font-medium disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Event"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
