"use client";

import Link from "next/link";
import { useState } from "react";

interface User {
  id: number;
  name: string;
}

interface ProfileCardProps {
  user: User;
  gradient: string;
  index: number;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfileCard({ user, gradient, index }: ProfileCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={`/calendar/${user.id}`}
      className="group flex flex-col items-center animate-[fadeInUp_0.5s_ease-out_both]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animationDelay: `${index * 0.08}s`,
      }}
    >
      {/* Avatar */}
      <div
        className={`
          relative w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-md overflow-hidden
          transition-all duration-300 ease-out
          ${isHovered ? "scale-110 ring-4 ring-white" : "scale-100"}
        `}
      >
        {/* Gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

        {/* Initials */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-white/90 tracking-tight font-[family-name:var(--font-bebas-neue)]">
            {getInitials(user.name)}
          </span>
        </div>

        {/* Subtle shine overlay */}
        <div
          className={`
            absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent
            transition-opacity duration-300
            ${isHovered ? "opacity-100" : "opacity-0"}
          `}
        />

        {/* Bottom vignette */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Name */}
      <span
        className={`
          mt-3 text-sm md:text-base text-center transition-colors duration-300 tracking-wide
          ${isHovered ? "text-white" : "text-gray-400"}
        `}
      >
        {user.name}
      </span>
    </Link>
  );
}
