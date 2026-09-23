import Link from 'next/link'

export default function ReportsPage() {
  const reports = [
    {
      title: 'Hotel Accommodation ID List',
      description: 'Generates a printable list of every allocated JADMS Accommodation ID grouped by hotel, room, and bed. Required for operations.',
      href: '/reports/hotels',
      icon: '🏨'
    },
    {
      title: 'Ground Accommodation / Shad List',
      description: 'Generates a printable list of allocated Shad beds.',
      href: '/reports/shads',
      icon: '⛺'
    }
    // Further reports like Participant List or Volunteer List can be added here
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto print:hidden">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Report Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((r, i) => (
          <Link key={i} href={r.href} className="block bg-white p-6 rounded-lg shadow-sm border hover:border-blue-500 transition-colors">
            <div className="text-4xl mb-4">{r.icon}</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">{r.title}</h2>
            <p className="text-sm text-slate-600">{r.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
