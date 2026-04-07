'use client'
import { useState } from 'react'
import { Bell, Plus, Check, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Badge, StatusBadge, Button } from '@/components/ui'

const MOCK_ALERTS = [
  { id: 1, property: 'Badrinath TRH',        title: 'Geyser not functioning in all rooms',        description: 'Both geysers have been non-functional since January 13. Guests complaining heavily. Urgent service needed.', severity: 'critical', status: 'open',         raised_by: 'D. Rana',  date: '2025-01-15' },
  { id: 2, property: 'Chopta TRH',            title: 'Roof leakage in Room 4 and common corridor', description: 'Heavy rain caused roof leakage. Room 4 is unusable. Common corridor also affected. Need immediate repair.', severity: 'high',     status: 'acknowledged', raised_by: 'M. Bisht', date: '2025-01-14', ack_by: 'Corporate Office', ack_date: '2025-01-14' },
  { id: 3, property: 'Uttarkashi TRH',        title: 'Critical shortage of linen stock',           description: 'Running less than 3 days of linen supply. Laundry machine also broken. Cannot serve guests properly.', severity: 'high',     status: 'open',         raised_by: 'A. Semwal', date: '2025-01-14' },
  { id: 4, property: 'Ghangharia TRH',        title: 'Power supply erratic since morning',         description: 'Frequent power cuts affecting food storage and guest comfort. Inverter capacity insufficient.', severity: 'medium',   status: 'open',         raised_by: 'K. Thapa', date: '2025-01-14' },
  { id: 5, property: 'Jyotir Tourist Complex', title: 'Sewage blockage in bathroom block B',       description: 'Blocked drain in bathroom block B. Foul smell affecting nearby rooms. Plumber needed urgently.', severity: 'high',     status: 'resolved',     raised_by: 'P. Joshi', date: '2025-01-10', resolved_by: 'Maintenance Team', resolved_date: '2025-01-12' },
]

const severityStyles: Record<string, string> = {
  critical: 'bg-red-50 border-red-200',
  high:     'bg-orange-50 border-orange-100',
  medium:   'bg-yellow-50 border-yellow-100',
  low:      'bg-gray-50 border-gray-100',
}

const severityBadge: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-yellow-100 text-yellow-700',
  low:      'bg-gray-100 text-gray-600',
}

export default function AlertsPage() {
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [form, setForm] = useState({ property_id: '', title: '', description: '', severity: 'medium' })

  const filtered = MOCK_ALERTS.filter(a => filterStatus === 'all' || a.status === filterStatus)
  const openCount = MOCK_ALERTS.filter(a => a.status === 'open').length
  const criticalCount = MOCK_ALERTS.filter(a => a.severity === 'critical' && a.status !== 'resolved').length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {openCount} open · {criticalCount} critical
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={15} /> Raise Alert
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6">
        {['all', 'open', 'acknowledged', 'resolved'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-sm px-3 py-1.5 rounded-lg border capitalize transition-colors ${filterStatus === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            {s} {s === 'all' ? `(${MOCK_ALERTS.length})` : `(${MOCK_ALERTS.filter(a => a.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Raise Alert Form */}
      {showForm && (
        <Card className="max-w-xl mb-6 border-red-200">
          <CardHeader className="bg-red-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Bell size={16} /> Raise New Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
              <select
                value={form.property_id}
                onChange={e => setForm({ ...form, property_id: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <option value="">Select property...</option>
                <option value="1">Hotel Drona — Dehradun</option>
                <option value="13">Badrinath TRH — Badrinath</option>
                <option value="48">Gaurikund TRH — Kedarnath</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alert Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Short description of the issue..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the issue in detail — what happened, how many guests are affected, what has been tried..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <div className="grid grid-cols-4 gap-2">
                {['low', 'medium', 'high', 'critical'].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setForm({ ...form, severity: sev })}
                    className={`py-2 text-sm font-medium rounded-lg border capitalize transition-all ${form.severity === sev ? `${severityBadge[sev]} border-current ring-2 ring-offset-1 ring-current` : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="danger" size="md">Submit Alert</Button>
              <Button variant="outline" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts list */}
      <div className="space-y-3">
        {filtered.map((alert) => (
          <div key={alert.id} className={`rounded-xl border p-5 ${severityStyles[alert.severity]}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-bold text-gray-900">{alert.property}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${severityBadge[alert.severity]}`}>
                    {alert.severity}
                  </span>
                  <StatusBadge status={alert.status} />
                </div>
                <p className="text-sm font-semibold text-gray-800">{alert.title}</p>
              </div>
              <span className="text-xs text-gray-400 ml-4 flex-shrink-0">{alert.date}</span>
            </div>

            <p className="text-sm text-gray-600 mb-3">{alert.description}</p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Raised by {alert.raised_by}</span>
              <div className="flex gap-2">
                {alert.status === 'open' && (
                  <>
                    <button className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                      <Check size={12} /> Acknowledge
                    </button>
                    <button className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 flex items-center gap-1">
                      <Check size={12} /> Mark Resolved
                    </button>
                  </>
                )}
                {alert.status === 'acknowledged' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Acknowledged by {alert.ack_by} on {alert.ack_date}</span>
                    <button className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 flex items-center gap-1">
                      <Check size={12} /> Mark Resolved
                    </button>
                  </div>
                )}
                {alert.status === 'resolved' && (
                  <span className="text-xs text-green-600">Resolved by {alert.resolved_by} on {alert.resolved_date}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
