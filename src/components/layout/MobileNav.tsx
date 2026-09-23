'use client'

import { useState } from 'react'

export default function MobileNav({ isAdmin }: { isAdmin: boolean }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden w-full bg-slate-900 text-white flex flex-col print:hidden shrink-0">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <div>
          <span className="font-bold text-xl block">ADM</span>
          <span className="text-xs text-slate-400">Accommodation</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-slate-800 rounded text-slate-300 hover:text-white focus:outline-none"
        >
          {isOpen ? '✖' : '☰'}
        </button>
      </div>

      {isOpen && (
        <nav className="flex flex-col p-4 space-y-2 border-b border-slate-700">
          {isAdmin && (
            <>
              <a href="/dashboard" className="block py-2 px-4 rounded hover:bg-slate-800">Dashboard</a>
              <a href="/participants" className="block py-2 px-4 rounded hover:bg-slate-800">Participants</a>
              <a href="/hotels" className="block py-2 px-4 rounded hover:bg-slate-800">Hotels</a>
              <a href="/shads" className="block py-2 px-4 rounded hover:bg-slate-800">Shads</a>
              <a href="/reports" className="block py-2 px-4 rounded hover:bg-slate-800">Reports</a>
            </>
          )}
          <div className="pt-2 mt-2 border-t border-slate-700">
            <a href="/volunteer" className="block py-2 px-4 rounded text-yellow-300 hover:bg-slate-800 font-bold">Volunteer Ops</a>
          </div>
        </nav>
      )}
    </div>
  )
}
