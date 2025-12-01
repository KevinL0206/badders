"use client";

import { useState, useEffect, ReactNode } from "react";

const PASSWORD = "colbeh";

export default function PasswordGate({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("schedule-auth");
    setIsAuthenticated(auth === "true");
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      localStorage.setItem("schedule-auth", "true");
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Password screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center px-4">
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="Enter password"
            className={`w-64 px-4 py-3 bg-gray-800 border ${
              error ? "border-red-500" : "border-gray-700"
            } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500`}
            autoFocus
          />
          <button
            type="submit"
            className="w-64 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Submit
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
