import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Building2, Phone, Star, Package, Bell, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Badge, ScoreBadge } from '@/components/ui'
import Link from 'next/link'

// Mock data until backend is live - replace with real API calls
const MOCK_STATS = {
  totalProperties: 82,
  activeCallsThisMonth: 247,
  avgOverallScore: 7.4,
  openAlerts: 8,
  pendingRequisitions: 14,
  callsConnectedRate: 68,
  propertiesWithLowScore: 11,
  propertiesWithHighScore: 34,
}

const MOCK_LOW_PERFORMERS = [
  { id: 48, name: 'Gaurikund TRH',      location: 'Kedarnath',  score: 4.2, issue: 'Staff complaints' },
  { id: 14, name: 'Swargarohini Cottages', location: 'Kedarnath', score: 4.8, issue: 'Food quality' },
  { id: 29, name: 'Ghangharia TRH',     location: 'Chamoli',    score: 5.1, issue: 'Cleanliness' },
  { id: 42, name: 'Bhojbasa TRH',       location: 'Gaumukh',    score: 5.3, issue: 'Facility condition' },
]

const MOCK_TOP_PERFORMERS = [
  { id: 1,  name: 'Hotel Drona',         location: 'Dehradun',   score: 9.1 },
  { id: 10, name: 'Auli Tourist Bungalow', location: 'Auli',     score: 8.8 },
  { id: 5,  name: 'Garhwal Terrace',     location: 'Mussoorie',  score: 8.6 },
  { id: 6,  name: 'Ganga Resort',        location: 'Rishikesh',  score: 8.4 },
]

const MOCK_RECENT_ALERTS = [
  { id: 1, property: 'Badrinath TRH',    title: 'Geyser not functioning',     severity: 'critical', created_at: '2025-01-15' },
  { id: 2, property: 'Chopta TRH',       title: 'Roof leakage in room 4',     severity: 'high',     created_at: '2025-01-14' },
  { id: 3, property: 'Uttarkashi TRH',   title: 'Shortage of linen stock',    severity: 'medium',   created_at: '2025-01-14' },
]

const MOCK_INSIGHTS = [
  { id: 1, property: 'Gaurikund TRH',    title: 'Staff complaints correlate with no training requisitions raised in 6 months', type: 'inventory_gap' },
  { id: 2, property: 'Ghangharia TRH',   title: '9 guests mentioned cold water — no geyser requisition on record', type: 'inventory_gap' },
  { id: 3, property: 'Hotel Drona',      title: 'Consistently high food scores — share practices with underperformers', type: 'positive_highlight' },
]

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; color: string
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          </div>
          <div className={`p-2.5 rounded-lg ${color}`}>
            <Icon size={20} className="text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-gray-100 text-gray-600',
  }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[severity] || map.low}`}>{severity}</span>
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const role = (user?.publicMetadata?.role as string) || 'property_manager'
  const propertyId = user?.publicMetadata?.property_id as number | undefined

  // If manager, redirect to their property page
  if (role === 'property_manager' && propertyId) {
    redirect(`/dashboard/properties/${propertyId}`)
  }

  const s = MOCK_STATS

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Control Tower</h1>
        <p className="text-gray-500 text-sm mt-0.5">Overview across all 82 GMVN properties</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Properties"       value={s.totalProperties}         sub="across Garhwal region"        icon={Building2}     color="bg-indigo-500" />
        <StatCard label="Calls This Month"        value={s.activeCallsThisMonth}    sub={`${s.callsConnectedRate}% connected`} icon={Phone} color="bg-blue-500" />
        <StatCard label="Avg Overall Score"       value={`${s.avgOverallScore}/10`} sub="across completed calls"       icon={TrendingUp}    color="bg-green-500" />
        <StatCard label="Open Alerts"             value={s.openAlerts}              sub={`${s.pendingRequisitions} pending requisitions`} icon={Bell} color="bg-red-500" />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-2 gap-6 mb-6">

        {/* Low performers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
                Needs Attention
              </CardTitle>
              <Link href="/dashboard/properties" className="text-xs text-indigo-600 hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {MOCK_LOW_PERFORMERS.map((p, i) => (
              <Link
                key={p.id}
                href={`/dashboard/properties/${p.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.location} · {p.issue}</p>
                </div>
                <ScoreBadge score={p.score} max={10} />
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Top performers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                Top Performers
              </CardTitle>
              <Link href="/dashboard/properties" className="text-xs text-indigo-600 hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {MOCK_TOP_PERFORMERS.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/properties/${p.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.location}</p>
                </div>
                <ScoreBadge score={p.score} max={10} />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-6">

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell size={16} className="text-orange-500" />
                Recent Alerts
              </CardTitle>
              <Link href="/dashboard/alerts" className="text-xs text-indigo-600 hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {MOCK_RECENT_ALERTS.map((a) => (
              <div key={a.id} className="flex items-start justify-between px-6 py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.property} · {a.created_at}</p>
                </div>
                <SeverityBadge severity={a.severity} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="text-base">✦</span> AI Insights
              </CardTitle>
              <span className="text-xs text-gray-400">Updated weekly</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {MOCK_INSIGHTS.map((insight) => (
              <div key={insight.id} className="px-6 py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5">
                    {insight.type === 'positive_highlight' ? '🟢' : '🔴'}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-indigo-700 mb-0.5">{insight.property}</p>
                    <p className="text-sm text-gray-700">{insight.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
