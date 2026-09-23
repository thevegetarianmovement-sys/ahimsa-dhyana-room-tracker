import Link from 'next/link'
import ShadForm from '@/components/shads/ShadForm'

export default function NewShadPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Link href="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Dashboard</Link>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Add New Shad</h1>
      <ShadForm />
    </div>
  )
}
