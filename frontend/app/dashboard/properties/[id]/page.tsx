import { ArrowLeft, Phone, Star, Package, Bell, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, ScoreBadge, StatusBadge, Badge } from '@/components/ui'

// Mock property data — replace with DB lookup by id
function getMockProperty(id: number) {
  return {
    id,
    name: id === 48 ? 'Gaurikund TRH' : id === 1 ? 'Hotel Drona' : `Property #${id}`,
    location: id === 48 ? 'Kedarnath' : id === 1 ? 'Dehradun' : 'Uttarakhand',
    district: id === 48 ? 'Rudraprayag' : id === 1 ? 'Dehradun' : 'Garhwal',
    google_rating: id === 48 ? 3.0 : id === 1 ? 4.3 : 4.0,
    total_reviews: id === 48 ? 84 : id === 1 ? 312 : 120,
    score_food: id === 48 ? 3.1 : id === 1 ? 4.6 : 3.8,
    score_stay: id === 48 ? 3.4 : id === 1 ? 4.7 : 3.9,
    score_staff: id === 48 ? 6.2 : id === 1 ? 13.8 : 10.5,
    score_overall: id === 48 ? 4.2 : id === 1 ? 9.1 : 7.0,
    total_calls: id === 48 ? 18 : id === 1 ? 42 : 20,
    connected_calls: id === 48 ? 12 : id === 1 ? 31 : 14,
    open_alerts: id === 48 ? 2 : id === 1 ? 0 : 0,
    pending_requisitions: id === 48 ? 3 : id === 1 ? 1 : 1,
  }
}

const MOCK_FEEDBACK = [
  { id: 1, guest_name: 'Rajesh Kumar',    call_date: '2025-01-14', call_status: 'completed', score_food: 2.0, score_stay: 3.0, score_staff: 7.0, score_overall: 4.0, comments: 'Food was very basic, room had no hot water' },
  { id: 2, guest_name: 'Priya Sharma',    call_date: '2025-01-13', call_status: 'completed', score_food: 3.5, score_stay: 3.0, score_staff: 6.5, score_overall: 4.5, comments: 'Staff was helpful but cleanliness issues' },
  { id: 3, guest_name: 'Amit Singh',      call_date: '2025-01-12', call_status: 'no_answer', score_food: null, score_stay: null, score_staff: null, score_overall: null, comments: null },
  { id: 4, guest_name: 'Sunita Devi',     call_date: '2025-01-11', call_status: 'completed', score_food: 4.0, score_stay: 2.5, score_staff: 5.0, score_overall: 3.9, comments: 'Geyser not working for two days' },
]

const MOCK_REVIEWS = [
  { id: 1, text: 'Basic facility but the location near Kedarnath route is convenient. Staff tries hard but infrastructure needs work.', rating: 3, date: '2025-01-10' },
  { id: 2, text: 'No hot water in December. Rooms are cold and heating is inadequate for winter pilgrimage season.', rating: 2, date: '2025-01-08' },
  { id: 3, text: 'Good for a quick stopover. Do not expect luxury. Price is reasonable.', rating: 3, date: '2025-01-05' },
]

const MOCK_REQUISITIONS = [
  { id: 1, item: 'Geysers / Water Heaters', qty: 2, urgency: 'critical', status: 'pending',  date: '2025-01-13' },
  { id: 2, item: 'Bed Sheets (Single)',       qty: 20, urgency: 'urgent',   status: 'approved', date: '2025-01-10' },
  { id: 3, item: 'Room Heaters',              qty: 3,  urgency: 'urgent',   status: 'dispatched', date: '2025-01-08' },
]

const MOCK_INSIGHTS = [
  { type: 'inventory_gap',       title: '9 guests mentioned cold water or no hot water in the last 3 weeks', recommendation: 'Raise urgent requisition for geyser servicing or replacement' },
  { type: 'feedback_pattern',    title: 'Staff scores are 40% lower than network average despite positive intent mentions', recommendation: 'Consider requesting staff training support from corporate office' },
  { type: 'service_alert',       title: 'Google rating dropped from 3.4 to 3.0 over last 30 days', recommendation: 'Immediate management intervention needed on basic amenities' },
]

function ScoreBar({ label, score, max }: { label: string; score: number | null; max: number }) {
  const pct = score ? (score / max) * 100 : 0
  const color = pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold text-gray-800 w-16 text-right">
        {score?.toFixed(1) ?? '—'} / {max}
      </span>
    </div>
  )
}

export default function PropertyPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const p = getMockProperty(id)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/properties" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-3 w-fit">
          <ArrowLeft size={14} /> All Properties
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{p.name}</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin size={12} /> {p.location} · {p.district} District
            </p>
          </div>
          <div className="flex items-center gap-2">
            {p.open_alerts > 0 && (
              <Badge variant="danger">{p.open_alerts} open alert{p.open_alerts > 1 ? 's' : ''}</Badge>
            )}
            <Link href="/dashboard/inventory" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-1.5">
              <Package size={14} /> Raise Requisition
            </Link>
            <Link href="/dashboard/alerts" className="text-sm bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 flex items-center gap-1.5">
              <Bell size={14} /> Raise Alert
            </Link>
          </div>
        </div>
      </div>

      {/* Score summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Overall Score', value: p.score_overall, max: 10, icon: '★' },
          { label: 'Food Score',    value: p.score_food,    max: 5,  icon: '🍽' },
          { label: 'Stay Score',    value: p.score_stay,    max: 5,  icon: '🛏' },
          { label: 'Staff Score',   value: p.score_staff,   max: 15, icon: '👤' },
        ].map(({ label, value, max, icon }) => {
          const pct = value ? (value / max) * 100 : 0
          const color = pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'
          return (
            <Card key={label}>
              <CardContent className="pt-4">
                <p className="text-xs text-gray-500">{icon} {label}</p>
                <p className={`text-3xl font-bold mt-1 ${color}`}>
                  {value?.toFixed(1) ?? '—'}
                  <span className="text-sm font-normal text-gray-400">/{max}</span>
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left column — feedback + reviews */}
        <div className="col-span-2 space-y-6">

          {/* Score breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Phone size={15} /> Feedback Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ScoreBar label="Food"  score={p.score_food}  max={5} />
              <ScoreBar label="Stay"  score={p.score_stay}  max={5} />
              <ScoreBar label="Staff" score={p.score_staff} max={15} />
              <div className="pt-2 border-t border-gray-50 text-sm text-gray-500">
                Based on {p.connected_calls} completed calls out of {p.total_calls} initiated this month
              </div>
            </CardContent>
          </Card>

          {/* Recent calls */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback Calls</CardTitle>
            </CardHeader>
            <div>
              {MOCK_FEEDBACK.map((f) => (
                <div key={f.id} className="px-6 py-4 border-b border-gray-50 last:border-0">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{f.guest_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{f.call_date}</span>
                      <StatusBadge status={f.call_status} />
                    </div>
                  </div>
                  {f.score_overall !== null && (
                    <div className="flex gap-3 text-xs text-gray-500 mb-1">
                      <span>Food: {f.score_food}/5</span>
                      <span>Stay: {f.score_stay}/5</span>
                      <span>Staff: {f.score_staff}/15</span>
                      <span className="font-semibold text-gray-700">Overall: {f.score_overall}/10</span>
                    </div>
                  )}
                  {f.comments && <p className="text-xs text-gray-500 italic">"{f.comments}"</p>}
                </div>
              ))}
            </div>
          </Card>

          {/* Google Reviews */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Star size={15} className="text-yellow-500" /> Google Reviews</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-800">{p.google_rating}</span>
                  <div>
                    <div className="text-yellow-400">{'★'.repeat(Math.round(p.google_rating))}{'☆'.repeat(5 - Math.round(p.google_rating))}</div>
                    <div className="text-xs text-gray-400">{p.total_reviews} reviews</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <div>
              {MOCK_REVIEWS.map((r) => (
                <div key={r.id} className="px-6 py-4 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    <span className="text-xs text-gray-400">{r.date}</span>
                  </div>
                  <p className="text-sm text-gray-700">{r.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column — AI insights + requisitions */}
        <div className="space-y-6">

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>✦</span> AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              {MOCK_INSIGHTS.map((ins, i) => (
                <div key={i} className={`p-3 rounded-lg border ${ins.type === 'inventory_gap' ? 'bg-orange-50 border-orange-100' : ins.type === 'service_alert' ? 'bg-red-50 border-red-100' : 'bg-indigo-50 border-indigo-100'}`}>
                  <p className="text-sm font-medium text-gray-800 mb-1.5">{ins.title}</p>
                  <p className="text-xs text-gray-600">→ {ins.recommendation}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Requisitions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Package size={15} /> Requisitions</CardTitle>
                <Link href="/dashboard/inventory" className="text-xs text-indigo-600 hover:underline">+ New</Link>
              </div>
            </CardHeader>
            <div>
              {MOCK_REQUISITIONS.map((r) => (
                <div key={r.id} className="px-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.item}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Qty: {r.qty} · {r.date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={r.status} />
                      <Badge variant={r.urgency === 'critical' ? 'danger' : r.urgency === 'urgent' ? 'warning' : 'default'}>
                        {r.urgency}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
