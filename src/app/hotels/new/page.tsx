import Link from 'next/link'
import HotelForm from '@/components/hotels/HotelForm'

export default function NewHotelPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Link href="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Dashboard</Link>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Add New Hotel</h1>
      <HotelForm />
    </div>
  )
}
