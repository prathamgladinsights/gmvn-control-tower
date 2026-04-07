'use client'
import { useState } from 'react'
import { Package, Plus, Check, X, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, StatusBadge, Badge, Button } from '@/components/ui'

const INVENTORY_ITEMS = [
  { id: 1,  name: 'Bed Sheets (Single)',       category: 'Linen & Bedding',           unit: 'pieces' },
  { id: 2,  name: 'Bed Sheets (Double)',        category: 'Linen & Bedding',           unit: 'pieces' },
  { id: 3,  name: 'Pillow Covers',             category: 'Linen & Bedding',           unit: 'pieces' },
  { id: 4,  name: 'Pillows',                   category: 'Linen & Bedding',           unit: 'pieces' },
  { id: 5,  name: 'Blankets',                  category: 'Linen & Bedding',           unit: 'pieces' },
  { id: 6,  name: 'Towels (Bath)',             category: 'Linen & Bedding',           unit: 'pieces' },
  { id: 7,  name: 'Towels (Hand)',             category: 'Linen & Bedding',           unit: 'pieces' },
  { id: 8,  name: 'Mattresses (Single)',        category: 'Linen & Bedding',           unit: 'pieces' },
  { id: 9,  name: 'Mattresses (Double)',        category: 'Linen & Bedding',           unit: 'pieces' },
  { id: 10, name: 'Curtains',                  category: 'Linen & Bedding',           unit: 'sets'   },
  { id: 11, name: 'Air Conditioners',          category: 'Electrical & Mechanical',   unit: 'units'  },
  { id: 12, name: 'Ceiling Fans',              category: 'Electrical & Mechanical',   unit: 'units'  },
  { id: 13, name: 'Geysers / Water Heaters',   category: 'Electrical & Mechanical',   unit: 'units'  },
  { id: 14, name: 'Room Heaters',              category: 'Electrical & Mechanical',   unit: 'units'  },
  { id: 15, name: 'LED Bulbs',                 category: 'Electrical & Mechanical',   unit: 'pieces' },
  { id: 16, name: 'Plumbing Repair',           category: 'Maintenance & Repair',      unit: 'request'},
  { id: 17, name: 'Electrical Wiring Repair',  category: 'Maintenance & Repair',      unit: 'request'},
  { id: 18, name: 'Painting / Whitewash',      category: 'Maintenance & Repair',      unit: 'request'},
  { id: 19, name: 'Soap Bars',                 category: 'Consumables & Housekeeping',unit: 'pieces' },
  { id: 20, name: 'Toilet Paper Rolls',        category: 'Consumables & Housekeeping',unit: 'pieces' },
]

const MOCK_REQUISITIONS = [
  { id: 1, property: 'Gaurikund TRH',        item: 'Geysers / Water Heaters', qty: 2, urgency: 'critical', status: 'pending',    raised_by: 'R. Negi',    date: '2025-01-15', justification: 'Both geysers broken since Dec 30. Multiple guest complaints.' },
  { id: 2, property: 'Hotel Drona',           item: 'Bed Sheets (Double)',      qty: 15, urgency: 'routine',  status: 'approved',   raised_by: 'S. Rawat',   date: '2025-01-14', justification: 'Routine replenishment' },
  { id: 3, property: 'Chopta TRH',            item: 'Room Heaters',             qty: 4,  urgency: 'urgent',   status: 'dispatched', raised_by: 'M. Bisht',   date: '2025-01-12', justification: 'Winter season, inadequate heating' },
  { id: 4, property: 'Ghangharia TRH',        item: 'Mattresses (Single)',       qty: 6,  urgency: 'urgent',   status: 'pending',    raised_by: 'K. Thapa',   date: '2025-01-13', justification: 'Old mattresses in poor condition' },
  { id: 5, property: 'Badrinath TRH',         item: 'Plumbing Repair',          qty: 1,  urgency: 'critical', status: 'pending',    raised_by: 'D. Rana',    date: '2025-01-15', justification: 'Pipe burst in block B. Rooms 6,7,8 unusable.' },
  { id: 6, property: 'Joshimath TRH',         item: 'LED Bulbs',                qty: 30, urgency: 'routine',  status: 'approved',   raised_by: 'A. Panwar',  date: '2025-01-11', justification: 'Routine replacement' },
  { id: 7, property: 'Swargarohini Cottages', item: 'Blankets',                 qty: 12, urgency: 'urgent',   status: 'rejected',   raised_by: 'P. Semwal',  date: '2025-01-10', justification: 'Winter stock running low', approver_note: 'Dispatched in November, do recount first' },
]

type Status = 'all' | 'pending' | 'approved' | 'dispatched' | 'rejected'

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'requisitions' | 'new'>('requisitions')
  const [filterStatus, setFilterStatus] = useState<Status>('all')
  const [filterUrgency, setFilterUrgency] = useState('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  // New requisition form state
  const [form, setForm] = useState({
    property_id: '',
    item_id: '',
    quantity: '',
    urgency: 'routine',
    justification: '',
  })

  const filtered = MOCK_REQUISITIONS.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false
    if (filterUrgency !== 'all' && r.urgency !== filterUrgency) return false
    return true
  })

  const counts = {
    pending:    MOCK_REQUISITIONS.filter(r => r.status === 'pending').length,
    approved:   MOCK_REQUISITIONS.filter(r => r.status === 'approved').length,
    dispatched: MOCK_REQUISITIONS.filter(r => r.status === 'dispatched').length,
    rejected:   MOCK_REQUISITIONS.filter(r => r.status === 'rejected').length,
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory & Requisitions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage inventory requests across all properties</p>
        </div>
        <Button onClick={() => setActiveTab('new')} size="md">
          <Plus size={15} /> New Requisition
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Pending',    count: counts.pending,    color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { label: 'Approved',   count: counts.approved,   color: 'bg-green-50 border-green-200 text-green-700'   },
          { label: 'Dispatched', count: counts.dispatched, color: 'bg-blue-50 border-blue-200 text-blue-700'       },
          { label: 'Rejected',   count: counts.rejected,   color: 'bg-red-50 border-red-200 text-red-700'         },
        ].map(({ label, count, color }) => (
          <button
            key={label}
            onClick={() => setFilterStatus(label.toLowerCase() as Status)}
            className={`p-4 rounded-xl border text-left transition-all ${color} ${filterStatus === label.toLowerCase() ? 'ring-2 ring-offset-1 ring-indigo-400' : ''}`}
          >
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-sm font-medium">{label}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-3 mb-4">
        <button onClick={() => setFilterStatus('all')} className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${filterStatus === 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
          All ({MOCK_REQUISITIONS.length})
        </button>
        <select
          value={filterUrgency}
          onChange={e => setFilterUrgency(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Urgency</option>
          <option value="critical">Critical</option>
          <option value="urgent">Urgent</option>
          <option value="routine">Routine</option>
        </select>
      </div>

      {/* Requisitions list */}
      {activeTab === 'requisitions' && (
        <Card>
          <div className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">No requisitions found</div>
            )}
            {filtered.map((r) => (
              <div key={r.id} className="px-6 py-4">
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{r.property}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-sm text-gray-700">{r.item}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-sm text-gray-500">Qty: {r.qty}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{r.date} · Raised by {r.raised_by}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <Badge variant={r.urgency === 'critical' ? 'danger' : r.urgency === 'urgent' ? 'warning' : 'default'}>
                      {r.urgency}
                    </Badge>
                    <StatusBadge status={r.status} />
                    {r.status === 'pending' && (
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100" title="Approve">
                          <Check size={14} />
                        </button>
                        <button className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100" title="Reject">
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${expandedId === r.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {expandedId === r.id && (
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    <p className="text-sm text-gray-600 mb-2"><span className="font-medium">Justification:</span> {r.justification}</p>
                    {r.approver_note && (
                      <p className="text-sm text-red-600"><span className="font-medium">Note from office:</span> {r.approver_note}</p>
                    )}
                    {r.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <button className="text-sm bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 flex items-center gap-1.5">
                          <Check size={13} /> Approve
                        </button>
                        <button className="text-sm bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-1.5">
                          <X size={13} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* New Requisition Form */}
      {activeTab === 'new' && (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package size={16} /> New Requisition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
              <select
                value={form.property_id}
                onChange={e => setForm({ ...form, property_id: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select property...</option>
                <option value="1">Hotel Drona — Dehradun</option>
                <option value="48">Gaurikund TRH — Kedarnath</option>
                <option value="10">Auli Tourist Bungalow — Auli</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
              <select
                value={form.item_id}
                onChange={e => setForm({ ...form, item_id: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select item...</option>
                {INVENTORY_ITEMS.map(item => (
                  <option key={item.id} value={item.id}>{item.name} ({item.category})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                  placeholder="e.g. 10"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                <select
                  value={form.urgency}
                  onChange={e => setForm({ ...form, urgency: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Justification</label>
              <textarea
                rows={3}
                value={form.justification}
                onChange={e => setForm({ ...form, justification: e.target.value })}
                placeholder="Explain why this is needed and any relevant context..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button size="md">Submit Requisition</Button>
              <Button variant="outline" size="md" onClick={() => setActiveTab('requisitions')}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
