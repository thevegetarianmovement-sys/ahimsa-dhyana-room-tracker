'use client'

export default function ShareAllocationButton({ 
  participantName, 
  hotelName, 
  address, 
  googleMapsLink, 
  roomNo, 
  bedNo 
}: { 
  participantName: string, 
  hotelName: string, 
  address?: string, 
  googleMapsLink?: string, 
  roomNo: string, 
  bedNo: string 
}) {
  
  const handleShare = async () => {
    const text = `Jai Jinendra ${participantName},\n\nYour accommodation is confirmed.\n\nLocation: ${hotelName}\nAddress: ${address || 'N/A'}\nMap: ${googleMapsLink || 'N/A'}\nRoom No: ${roomNo}\nBed No: ${bedNo}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Accommodation Details',
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
      className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 w-full flex items-center justify-center gap-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      Share Allocation
    </button>
  )
}
