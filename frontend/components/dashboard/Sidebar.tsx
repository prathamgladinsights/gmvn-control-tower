'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import {
  LayoutDashboard, Building2, Package, Bell,
  Users, BarChart3, Phone, Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

const superAdminNav = [
  { href: '/dashboard',            label: 'Overview',      icon: LayoutDashboard },
  { href: '/dashboard/properties', label: 'Properties',    icon: Building2 },
  { href: '/dashboard/feedback',   label: 'Feedback Calls',icon: Phone },
  { href: '/dashboard/reviews',    label: 'Google Reviews', icon: Star },
  { href: '/dashboard/inventory',  label: 'Inventory',     icon: Package },
  { href: '/dashboard/alerts',     label: 'Alerts',        icon: Bell },
  { href: '/dashboard/admin',      label: 'User Management',icon: Users },
]

const managerNav = [
  { href: '/dashboard',           label: 'My Property',   icon: LayoutDashboard },
  { href: '/dashboard/inventory', label: 'Requisitions',  icon: Package },
  { href: '/dashboard/alerts',    label: 'Raise Alert',   icon: Bell },
]

export function Sidebar({ role }: { role: 'super_admin' | 'property_manager' }) {
  const pathname = usePathname()
  const nav = role === 'super_admin' ? superAdminNav : managerNav

  return (
    <aside className="w-60 min-h-screen bg-indigo-950 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-indigo-900">
        <div className="text-white font-bold text-lg leading-tight">GMVN</div>
        <div className="text-indigo-300 text-xs font-medium">Control Tower</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-800 text-white'
                  : 'text-indigo-300 hover:bg-indigo-900 hover:text-white'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-indigo-900 flex items-center gap-3">
       <UserButton />
        <div className="text-indigo-300 text-xs">
          {role === 'super_admin' ? 'Super Admin' : 'Property Manager'}
        </div>
      </div>
    </aside>
  )
}
