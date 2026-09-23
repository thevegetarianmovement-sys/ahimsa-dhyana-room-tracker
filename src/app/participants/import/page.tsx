import Link from 'next/link'
import BulkImportForm from './BulkImportForm'

export default function BulkImportPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <Link href="/participants" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Participants</Link>
        <h1 className="text-3xl font-bold text-slate-800">Bulk Import Participants</h1>
        <p className="text-slate-600 mt-2">Upload a CSV file to rapidly add hundreds of participants to the database.</p>
      </div>

      <BulkImportForm />
    </div>
  )
}
