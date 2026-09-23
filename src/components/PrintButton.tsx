'use client'

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="bg-slate-200 text-slate-800 px-4 py-2 rounded shadow-sm hover:bg-slate-300 font-medium print:hidden"
    >
      Print Roster
    </button>
  )
}
