/* eslint-disable */
'use client'

import { useState } from 'react'

export default function BulkImportForm() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: number, skip: number } | null>(null)
  const [error, setError] = useState('')

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const text = event.target?.result as string
          if (!text) throw new Error('File is empty')

          // Parse CSV manually (very basic)
          const lines = text.split(/\r?\n/)
          const headers = lines[0].toLowerCase().split(',')
          
          // Find indexes
          const nameIdx = headers.findIndex(h => h.includes('name'))
          const phoneIdx = headers.findIndex(h => h.includes('phone'))
          const regIdx = headers.findIndex(h => h.includes('reg') || h.includes('id'))

          if (nameIdx === -1) throw new Error('CSV must contain a Name column')

          const dataToUpload = []
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue
            const cols = lines[i].split(',')
            const name = cols[nameIdx]?.trim().replace(/(^"|"$)/g, '')
            const phone = phoneIdx !== -1 ? cols[phoneIdx]?.trim().replace(/(^"|"$)/g, '') : undefined
            const registrationNumber = regIdx !== -1 ? cols[regIdx]?.trim().replace(/(^"|"$)/g, '') : undefined

            if (name) {
              dataToUpload.push({ name, phone, registrationNumber })
            }
          }

          if (dataToUpload.length === 0) throw new Error('No valid rows found to import')

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/participants/bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ participants: dataToUpload }) }); if(!response.ok) throw new Error('Failed to bulk import'); const res = await response.json();
          setResult({ success: res.successCount, skip: res.skipCount })
          
          if (e.target) {
            e.target.value = ''
          }
        } catch (err: any) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }
      reader.readAsText(file)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border max-w-xl">
      <h2 className="text-xl font-bold mb-4">Bulk Import via CSV</h2>
      <p className="text-sm text-slate-500 mb-6">
        Upload a CSV file with headers. Requires at least a <span className="font-mono bg-slate-100 px-1 rounded">Name</span> column. Optional: <span className="font-mono bg-slate-100 px-1 rounded">Phone</span>, <span className="font-mono bg-slate-100 px-1 rounded">RegistrationNumber</span>.
      </p>

      {error && <div className="mb-4 text-red-600 text-sm font-medium bg-red-50 p-3 rounded">{error}</div>}
      
      {result && (
        <div className="mb-4 bg-green-50 text-green-700 p-4 rounded-lg text-sm border border-green-200">
          <p className="font-bold mb-1">Import Complete!</p>
          <ul className="list-disc pl-5">
            <li>Successfully imported: {result.success}</li>
            <li>Skipped (duplicates/invalid): {result.skip}</li>
          </ul>
        </div>
      )}

      <div>
        <label className="block bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-100 transition-colors">
          <span className="text-blue-600 font-medium">{loading ? 'Processing...' : 'Click to select CSV file'}</span>
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            onChange={handleImport}
            disabled={loading}
          />
        </label>
      </div>
    </div>
  )
}
