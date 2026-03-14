export default function StatsCard({ title, value, icon: Icon, color = 'indigo' }) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    teal:   'bg-teal-50 text-teal-600',
    violet: 'bg-violet-50 text-violet-600',
    amber:  'bg-amber-50 text-amber-600',
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5">
      <div className={`rounded-xl p-3 ${colorMap[color]}`}>
        <Icon className="h-7 w-7" />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  )
}
