'use client'

export default function SwitchButton() {
  const handleSwitch = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/volunteer/login';
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <button 
      onClick={handleSwitch}
      className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded font-medium transition-colors"
    >
      Switch
    </button>
  )
}
