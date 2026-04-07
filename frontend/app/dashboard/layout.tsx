import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  // Role is stored in Clerk publicMetadata: { role: 'super_admin' | 'property_manager' }
  const role = (user?.publicMetadata?.role as string) || 'property_manager'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role as 'super_admin' | 'property_manager'} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
