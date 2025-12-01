import prisma from "@/lib/prisma";
import type { User } from "@prisma/client";
import ProfileCard from "@/components/ProfileCard";
import PasswordGate from "@/components/PasswordGate";

export const dynamic = "force-dynamic";

// Vibrant gradient colors for each profile - Netflix-style colorful avatars
const avatarGradients = [
  "from-red-500 to-orange-600",
  "from-blue-500 to-cyan-400",
  "from-emerald-500 to-teal-400",
  "from-violet-500 to-purple-600",
  "from-pink-500 to-rose-400",
  "from-amber-500 to-yellow-400",
  "from-indigo-500 to-blue-400",
  "from-fuchsia-500 to-pink-400",
  "from-lime-500 to-green-400",
  "from-sky-500 to-blue-300",
];

export default async function Home() {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <PasswordGate>
    <div className="min-h-screen bg-[#141414] relative overflow-hidden">
      {/* Subtle radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(30,30,30,1)_0%,rgba(20,20,20,1)_100%)]" />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
        {/* Logo / Brand */}
        <div className="mb-4">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-900/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 tracking-tight text-center font-[family-name:var(--font-bebas-neue)]">
          Who&apos;s Scheduling?
        </h1>

        <p className="text-gray-400 text-lg mb-12 tracking-wide">
          Select your profile to continue
        </p>

        {/* Profile Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 max-w-4xl">
          {users.map((user: User, index: number) => (
            <ProfileCard
              key={user.id}
              user={user}
              gradient={avatarGradients[index % avatarGradients.length]}
              index={index}
            />
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No profiles yet</p>
            <p className="text-gray-600 text-sm mt-2">
              Run <code className="bg-gray-800 px-2 py-1 rounded text-red-400">npm run db:setup</code> to add team members
            </p>
          </div>
        )}

      </div>
    </div>
    </PasswordGate>
  );
}
