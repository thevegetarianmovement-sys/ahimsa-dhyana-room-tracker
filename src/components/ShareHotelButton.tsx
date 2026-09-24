'use client'

export default function ShareHotelButton({ 
  name, 
  address, 
  googleMapsLink 
}: { 
  name: string, 
  address?: string, 
  googleMapsLink?: string 
}) {
  
  const handleShare = async () => {
    const text = `Location: ${name}\nAddress: ${address || 'N/A'}\nGoogle Maps: ${googleMapsLink || 'N/A'}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Accommodation: ${name}`,
          text: text
        })
      } catch (e) {
        console.error('Error sharing', e)
      }
    } else {
      navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    }
  }

  return (
    <button 
      onClick={handleShare}
      className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 whitespace-nowrap text-sm font-bold flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      Share Location
    </button>
  )
}
