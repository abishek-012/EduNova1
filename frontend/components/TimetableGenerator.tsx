"use client";

import { useState } from "react";
import { Calendar, Clock, Upload, Sparkles } from "lucide-react";

type TimetableResponse = {
  timetable: {
    [day: string]: {
      [period: number]: {
        [cls: string]: [string, string];
      };
    };
  };
  classes: string[];
  days: string[];
  periods: number;
};

export default function TimetableGenerator() {
  const [numClasses, setNumClasses] = useState<number | "">("");
  const [periods, setPeriods] = useState<number | "">("");
  const [includeSat, setIncludeSat] = useState<string>("");
  const [result, setResult] = useState<TimetableResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const generateTimetable = async () => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    if (includeSat === "yes") days.push("Saturday");

    const fileInput = document.getElementById(
      "excelFile"
    ) as HTMLInputElement;

    if (!fileInput.files || fileInput.files.length === 0) {
      alert("Please upload an Excel file");
      return;
    }

    const formData = new FormData();
    formData.append("num_classes", numClasses.toString());
    formData.append("periods_per_day", periods.toString());
    formData.append("days", days.join(","));
    formData.append("file", fileInput.files[0]);

    setLoading(true);
    const response = await fetch("http://127.0.0.1:8000/generate", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

    const sortedClasses =
    result?.classes
        ? [...result.classes].sort(
            (a, b) => Number(a.slice(1)) - Number(b.slice(1))
        )
        : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
              Timetable Generator
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Create optimized class schedules in seconds</p>
        </div>

        {/* FORM */}
        <div className="rounded-2xl border border-indigo-100 p-8 bg-white shadow-xl backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                Number of Sections
              </label>
              <input
                type="number"
                value={numClasses}
                onChange={(e) => setNumClasses(Number(e.target.value))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                placeholder="Enter number of sections"
              />
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Periods per Day
              </label>
              <input
                type="number"
                value={periods}
                onChange={(e) => setPeriods(Number(e.target.value))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                placeholder="Enter periods per day"
              />
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Include Saturday?
              </label>
              <select
                value={includeSat}
                onChange={(e) => setIncludeSat(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none bg-white"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-gray-700 flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-600" />
                Upload Subject–Teacher Excel
              </label>
              <input
                type="file"
                id="excelFile"
                accept=".xlsx,.xls"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-semibold hover:file:bg-indigo-100 file:cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={generateTimetable}
            disabled={loading}
            className="w-full mt-12 bg-gradient-to-r from-indigo-600 to-indigo-400 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                Generate Timetable
              </>
            )}
          </button>
        </div>

        {/* RESULT */}
        {result && (
          <div className="space-y-6">
            {sortedClasses.map((cls, idx) => (
              <div
                key={cls}
                className="rounded-2xl border border-indigo-100 p-6 bg-white shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {`${String.fromCharCode(64 + Number(cls.slice(1)))}`}
                </div>

                  <h3 className="text-xl font-bold text-gray-800">
                    Section {String.fromCharCode(64 + Number(cls.slice(1)))}
                  </h3>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-center text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-indigo-600 to-indigo-400 text-white">
                        <th className="p-4 font-semibold">Day / Period</th>
                        {Array.from({ length: result.periods }).map((_, i) => (
                          <th key={i} className="p-4 font-semibold">
                            Period {i + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {result.days.map((day, dayIdx) => (
                        <tr key={day} className={dayIdx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                          <td className="p-4 font-semibold text-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 border-r border-gray-200">
                            {day}
                          </td>
                          {Array.from({ length: result.periods }).map((_, p) => {
                            const cell = result.timetable[day][p][cls];
                            const isFree = cell[0] === "FREE";
                            return (
                              <td
                                key={p}
                                className={`p-4 border-l border-gray-200 ${
                                  isFree
                                    ? "text-gray-400 italic"
                                    : "text-gray-800 font-medium"
                                }`}
                              >
                                {isFree ? (
                                  <span className="inline-block px-3 py-1 bg-gray-100 rounded-lg text-xs">
                                    FREE
                                  </span>
                                ) : (
                                  <div className="space-y-1">
                                    <div className="font-semibold text-indigo-700">
                                      {cell[0]}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {cell[1]}
                                    </div>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}