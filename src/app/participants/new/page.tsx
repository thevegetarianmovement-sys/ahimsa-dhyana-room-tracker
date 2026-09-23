import Link from 'next/link'
import { cookies } from 'next/headers'
import ParticipantForm from '@/components/participants/ParticipantForm'

export default async function NewParticipantPage() {
  const sessionCookie = cookies().get('session')?.value || ''
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/participants/categories`, {
    headers: { Cookie: `session=${sessionCookie}` },
    cache: 'no-store'
  })
  const categories = await res.json()

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Link href="/participants" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Participants</Link>
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Add New Participant</h1>
      <ParticipantForm categories={categories} />
    </div>
  )
}
