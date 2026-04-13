import React from "react";

export default function AcademicPage() {
  const stats = [
    { label: "CGPA", value: "8.76", icon: "📊" },
    { label: "Attendance", value: "94%", icon: "✅" },
    { label: "Semester", value: "6th", icon: "📅" },
    { label: "Credits", value: "82", icon: "🎓" },
  ];

  const courses = [
    {
      code: "CS201",
      name: "Data Structures",
      credits: 4,
      marks: 92,
      grade: "A+",
    },
    {
      code: "CS202",
      name: "Web Development",
      credits: 3,
      marks: 88,
      grade: "A",
    },
    { code: "CS203", name: "Database Systems", credits: 4, marks: 85, grade: "A" },
    {
      code: "CS204",
      name: "Advanced Algorithms",
      credits: 3,
      marks: 78,
      grade: "B+",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card p-8 space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">📚 Academic Portal</h1>
        <p className="text-slate-600">View your academic performance and course details</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-card p-6 space-y-2 text-center">
            <div className="text-4xl">{stat.icon}</div>
            <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
            <p className="text-slate-600 font-semibold">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Courses Table */}
      <div className="glass-card p-8 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Current Courses</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-300">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Course Code</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Course Name</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Credits</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Marks</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Grade</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr
                  key={course.code}
                  className="border-b border-slate-200 hover:bg-blue-50/50 transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-slate-900">{course.code}</td>
                  <td className="py-3 px-4 text-slate-900">{course.name}</td>
                  <td className="py-3 px-4 text-center text-slate-700">{course.credits}</td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-900">
                    {course.marks}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        course.grade.startsWith("A")
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {course.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Exams */}
      <div className="glass-card p-8 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">📅 Upcoming Exams</h2>

        <div className="space-y-3">
          {[
            { course: "Web Development", date: "Apr 15, 2024", time: "2:00 PM" },
            { course: "Database Systems", date: "Apr 18, 2024", time: "10:00 AM" },
            { course: "Advanced Algorithms", date: "Apr 22, 2024", time: "3:00 PM" },
          ].map((exam, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div>
                <p className="font-semibold text-slate-900">{exam.course}</p>
                <p className="text-sm text-slate-600">
                  {exam.date} at {exam.time}
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                Soon
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
