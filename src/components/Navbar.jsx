"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const path = usePathname();

  const [manualLoggedIn, setManualLoggedIn] = useState(false);
  const [hasMcqs, setHasMcqs] = useState(false);

  useEffect(() => {
    setManualLoggedIn(Boolean(localStorage.getItem("email")));
    setHasMcqs(Boolean(localStorage.getItem("mcqs")));
  }, [path]);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    localStorage.removeItem("email");
    localStorage.removeItem("mcqs");
    setManualLoggedIn(false);
    router.replace("/login");
  };

  return (
    <nav className="bg-gray-900 shadow-lg px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src="/images/q.jpg"
            alt="Logo"
            className="w-10 h-10 rounded-full object-cover border-2 border-white"
          />
          <span className="text-2xl md:text-3xl font-bold text-blue-400 tracking-wide">
            QuizMaster
          </span>
        </div>

        {/* only show logout if logged-in AND no mcqs in localStorage */}
        {manualLoggedIn && !hasMcqs && (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-2 rounded-lg shadow transition-all duration-200"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
