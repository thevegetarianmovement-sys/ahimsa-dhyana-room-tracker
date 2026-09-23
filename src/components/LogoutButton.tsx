'use client'

export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/auth/logout`, { 
      method: 'POST',
      credentials: 'include'
    })
    window.location.href = '/login'
  }

  return (
    <button onClick={handleLogout} className="text-red-300 font-bold hover:text-red-400 ml-4 border border-red-400 px-2 rounded">
      Logout
    </button>
  )
}
