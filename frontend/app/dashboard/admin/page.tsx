'use client'
import { useState } from 'react'
import { Plus, User, Shield, Building2, ToggleLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui'

const MOCK_USERS = [
  { id: 1, name: 'Arun Sharma',     email: 'arun.sharma@gmvn.uk.gov.in',   role: 'super_admin',      property: null,                    is_active: true,  last_login: '2025-01-15' },
  { id: 2, name: 'Rajesh Negi',     email: 'rajesh.negi@gmvn.uk.gov.in',   role: 'property_manager', property: 'Gaurikund TRH',         is_active: true,  last_login: '2025-01-14' },
  { id: 3, name: 'Sunita Rawat',    email: 'sunita.rawat@gmvn.uk.gov.in',  role: 'property_manager', property: 'Hotel Drona',           is_active: true,  last_login: '2025-01-15' },
  { id: 4, name: 'Mohan Bisht',     email: 'mohan.bisht@gmvn.uk.gov.in',   role: 'property_manager', property: 'Chopta TRH',            is_active: true,  last_login: '2025-01-13' },
  { id: 5, name: 'Kavita Thapa',    email: 'kavita.thapa@gmvn.uk.gov.in',  role: 'property_manager', property: 'Ghangharia TRH',        is_active: false, last_login: '2024-12-20' },
  { id: 6, name: 'Deepak Rana',     email: 'deepak.rana@gmvn.uk.gov.in',   role: 'property_manager', property: 'Badrinath TRH',         is_active: true,  last_login: '2025-01-15' },
  { id: 7, name: 'Priya Semwal',    email: 'priya.semwal@gmvn.uk.gov.in',  role: 'property_manager', property: 'Swargarohini Cottages', is_active: true,  last_login: '2025-01-12' },
]

const PROPERTIES_LIST = [
  'Hotel Drona', 'Sahastradhara TRH', 'Garhwal Terrace', 'Ganga Resort',
  'Auli Tourist Bungalow', 'Jyotir Tourist Complex', 'Badrinath TRH',
  'Gaurikund TRH', 'Gangotri TRH', 'Dhanaulti Heights', 'Chopta TRH',
  'Ghangharia TRH', 'Swargarohini Cottages',
]

export default function AdminPage() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'property_manager', property: '' })

  const admins   = MOCK_USERS.filter(u => u.role === 'super_admin')
  const managers = MOCK_USERS.filter(u => u.role === 'property_manager')

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{MOCK_USERS.filter(u => u.is_active).length} active users · {MOCK_USERS.length} total</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={15} /> Add User
        </Button>
      </div>

      {/* Add User Form */}
      {showForm && (
        <Card className="max-w-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User size={16} /> New User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ramesh Dobhal"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="name@gmvn.uk.gov.in"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setForm({ ...form, role: 'property_manager' })}
                  className={`py-2.5 px-3 text-sm font-medium rounded-lg border text-left transition-all ${form.role === 'property_manager' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <Building2 size={14} className="inline mr-1.5" />
                  Property Manager
                </button>
                <button
                  onClick={() => setForm({ ...form, role: 'super_admin' })}
                  className={`py-2.5 px-3 text-sm font-medium rounded-lg border text-left transition-all ${form.role === 'super_admin' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <Shield size={14} className="inline mr-1.5" />
                  Super Admin
                </button>
              </div>
            </div>
            {form.role === 'property_manager' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Property</label>
                <select
                  value={form.property}
                  onChange={e => setForm({ ...form, property: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select property...</option>
                  {PROPERTIES_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            )}
            <p className="text-xs text-gray-400">
              An invitation email will be sent to the user. They will set their own password via the link.
              Password reset is available anytime from the login page.
            </p>
            <div className="flex gap-2 pt-1">
              <Button size="md">Send Invitation</Button>
              <Button variant="outline" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Super Admins */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Shield size={14} /> Super Admins ({admins.length})
        </h2>
        <Card>
          <div className="divide-y divide-gray-50">
            {admins.map(u => (
              <div key={u.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                    {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">Last login: {u.last_login}</span>
                  <Badge variant="info">Super Admin</Badge>
                  <Badge variant={u.is_active ? 'success' : 'default'}>{u.is_active ? 'Active' : 'Inactive'}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Property Managers */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Building2 size={14} /> Property Managers ({managers.length})
        </h2>
        <Card>
          <div className="divide-y divide-gray-50">
            {managers.map(u => (
              <div key={u.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${u.is_active ? 'text-gray-900' : 'text-gray-400'}`}>{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{u.property}</span>
                  <span className="text-xs text-gray-400">Last: {u.last_login}</span>
                  <Badge variant={u.is_active ? 'success' : 'default'}>{u.is_active ? 'Active' : 'Inactive'}</Badge>
                  <button className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
                    <ToggleLeft size={14} />
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
