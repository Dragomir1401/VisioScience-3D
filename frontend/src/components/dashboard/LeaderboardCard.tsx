import React, { useEffect, useState } from "react";
import {
  TrophyIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SearchIcon,
} from "lucide-react";

interface LeaderboardEntry {
  user_id: string;
  email: string;
  total_points: number;
  ranking: number;
  badges: any[];
}

interface ClassFilter {
  id: string;
  name: string;
}

const LeaderboardCard = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classFilters, setClassFilters] = useState<ClassFilter[]>([
    { id: "all", name: "Toate Clasele" },
  ]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("http://localhost:8000/user/classes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: any[] = await response.json();
        const fetchedClasses: ClassFilter[] = data.map((cls) => ({
          id: cls.id,
          name: cls.name,
        }));
        setClassFilters((prev) => [
          { id: "all", name: "Toate Clasele" },
          ...fetchedClasses,
        ]);
      } catch (e: any) {
        console.error("Failed to fetch classes:", e);
      }
    };
    fetchClasses();
  }, [token]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `http://localhost:8000/user/leaderboard${
          filter !== "all" ? `?class_id=${filter}` : ""
        }`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: LeaderboardEntry[] = await response.json();
        setLeaderboard(data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [filter, token]);

  const filteredData = leaderboard.filter((entry) =>
    entry.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <p className="pt-24 text-center text-mulberry">
        Se încarcă clasamentul...
      </p>
    );
  }

  if (error) {
    return (
      <p className="pt-24 text-center text-red-600">
        Eroare la încărcarea clasamentului: {error}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <TrophyIcon size={24} className="text-[#4f46e5]" />
          <h2 className="text-2xl font-bold text-[#690375]">
            Clasament Studenți
          </h2>
        </div>
        <div className="flex gap-10 px-20">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon size={16} className="text-[#888888]" />
            </div>
            <input
              type="text"
              placeholder="Căutați student..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="px-10 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {classFilters.map((classFilter) => (
              <option key={classFilter.id} value={classFilter.id}>
                {classFilter.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-5 py-3 text-left text-sm font-medium text-[#888888]">
                CLASAMENT
              </th>
              <th className="px-20 py-3 text-left text-sm font-medium text-[#888888]">
                STUDENT
              </th>
              <th className=" py-3 text-left text-sm font-medium text-[#888888]">
                PUNCTE TOTALE
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((entry) => (
              <tr
                key={entry.user_id}
                className="border-b border-gray-100 hover:bg-[#f3e8ff]"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-opacity-20 font-semibold text-sm">
                    {entry.ranking === 1 ? (
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <TrophyIcon size={14} className="text-yellow-500" />
                      </div>
                    ) : entry.ranking === 2 ? (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <TrophyIcon size={14} className="text-gray-500" />
                      </div>
                    ) : entry.ranking === 3 ? (
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <TrophyIcon size={14} className="text-amber-600" />
                      </div>
                    ) : (
                      <span className="text-[#888888]">{entry.ranking}</span>
                    )}
                  </div>
                </td>
                <td className="px-20 py-4">
                  <div className="flex items-center">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        entry.email
                      )}&background=random`}
                      alt={entry.email}
                      className="w-9 h-9 rounded-full mr-3"
                    />
                    <span className="font-medium">{entry.email}</span>
                  </div>
                </td>
                <td className="px-2 py-4">
                  <span className="ml-3 font-semibold">
                    {entry.total_points}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardCard;
