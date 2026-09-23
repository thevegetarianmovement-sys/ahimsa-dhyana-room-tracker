import Link from 'next/link'
import VolunteerForm from '@/components/volunteers/VolunteerForm'

export default function NewVolunteerPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Link href="/volunteers" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Volunteers</Link>
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Add New Volunteer</h1>
      <VolunteerForm />
    </div>
  )
}
