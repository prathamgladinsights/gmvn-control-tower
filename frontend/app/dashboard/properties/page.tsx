import Link from 'next/link'
import { Search, MapPin, Star, Phone } from 'lucide-react'
import { Card, CardContent, ScoreBadge, Badge } from '@/components/ui'

// All 82 properties with mock scores — replace with DB call
const ALL_PROPERTIES = [
  { id: 1,  name: 'Hotel Drona',              location: 'Dehradun',    district: 'Dehradun',    score: 9.1, calls: 42, google_rating: 4.3, alerts: 0 },
  { id: 2,  name: 'Sahastradhara TRH',        location: 'Dehradun',    district: 'Dehradun',    score: 7.2, calls: 18, google_rating: 4.0, alerts: 0 },
  { id: 3,  name: 'Asan Conservation Resort', location: 'Dehradun',    district: 'Dehradun',    score: 7.8, calls: 12, google_rating: 4.1, alerts: 1 },
  { id: 4,  name: 'Dakpathar TRH',            location: 'Dehradun',    district: 'Dehradun',    score: 6.5, calls: 8,  google_rating: 3.8, alerts: 0 },
  { id: 5,  name: 'Garhwal Terrace',          location: 'Mussoorie',   district: 'Dehradun',    score: 8.6, calls: 35, google_rating: 4.5, alerts: 0 },
  { id: 6,  name: 'Ganga Resort',             location: 'Rishikesh',   district: 'Tehri',       score: 8.4, calls: 29, google_rating: 4.4, alerts: 0 },
  { id: 7,  name: 'Bharat Bhoomi',            location: 'Rishikesh',   district: 'Tehri',       score: 7.6, calls: 22, google_rating: 4.2, alerts: 0 },
  { id: 8,  name: 'Rishilok',                 location: 'Rishikesh',   district: 'Tehri',       score: 7.9, calls: 31, google_rating: 4.1, alerts: 1 },
  { id: 9,  name: 'Rahi Motel',               location: 'Haridwar',    district: 'Haridwar',    score: 7.1, calls: 19, google_rating: 3.9, alerts: 0 },
  { id: 10, name: 'Auli Tourist Bungalow',    location: 'Auli',        district: 'Chamoli',     score: 8.8, calls: 27, google_rating: 4.6, alerts: 0 },
  { id: 11, name: 'Jyotir Tourist Complex',   location: 'Joshimath',   district: 'Chamoli',     score: 6.9, calls: 14, google_rating: 3.7, alerts: 1 },
  { id: 12, name: 'Hotel Devlok',             location: 'Badrinath',   district: 'Chamoli',     score: 7.3, calls: 33, google_rating: 4.0, alerts: 0 },
  { id: 13, name: 'Badrinath TRH',            location: 'Badrinath',   district: 'Chamoli',     score: 6.8, calls: 28, google_rating: 3.8, alerts: 1 },
  { id: 14, name: 'Swargarohini Cottages',    location: 'Kedarnath',   district: 'Rudraprayag', score: 4.8, calls: 21, google_rating: 3.2, alerts: 2 },
  { id: 15, name: 'Sumeru Tent Colony',       location: 'Kedarnath',   district: 'Rudraprayag', score: 6.2, calls: 16, google_rating: 3.6, alerts: 0 },
  { id: 16, name: 'Gangotri TRH',             location: 'Gangotri',    district: 'Uttarkashi',  score: 7.0, calls: 13, google_rating: 4.0, alerts: 0 },
  { id: 17, name: 'Yamunotri TRH',            location: 'Yamunotri',   district: 'Uttarkashi',  score: 6.7, calls: 11, google_rating: 3.7, alerts: 0 },
  { id: 18, name: 'Harsil TRH',               location: 'Harsil',      district: 'Uttarkashi',  score: 7.5, calls: 9,  google_rating: 4.2, alerts: 0 },
  { id: 19, name: 'Tip-In-Top Huts',          location: 'Lansdowne',   district: 'Pauri',       score: 7.8, calls: 15, google_rating: 4.3, alerts: 0 },
  { id: 20, name: 'Dhanaulti Heights',         location: 'Dhanaulti',   district: 'Tehri',       score: 8.1, calls: 20, google_rating: 4.4, alerts: 0 },
  { id: 21, name: 'Srinagar Alaknanda',       location: 'Srinagar',    district: 'Pauri',       score: 6.4, calls: 10, google_rating: 3.6, alerts: 0 },
  { id: 22, name: 'Khirsu TRH',               location: 'Khirsu',      district: 'Pauri',       score: 7.2, calls: 8,  google_rating: 4.1, alerts: 0 },
  { id: 23, name: 'Guptkashi TRH',            location: 'Guptkashi',   district: 'Rudraprayag', score: 6.6, calls: 17, google_rating: 3.8, alerts: 0 },
  { id: 24, name: 'Barkot TRH',               location: 'Barkot',      district: 'Uttarkashi',  score: 6.9, calls: 7,  google_rating: 3.9, alerts: 0 },
  { id: 25, name: 'Uttarkashi TRH',           location: 'Uttarkashi',  district: 'Uttarkashi',  score: 7.4, calls: 12, google_rating: 4.0, alerts: 0 },
  { id: 26, name: 'Syalsaur Eco Resort',      location: 'Syalsaur',    district: 'Pauri',       score: 7.6, calls: 6,  google_rating: 4.2, alerts: 0 },
  { id: 27, name: 'Chandrapuri TRH',          location: 'Rudraprayag', district: 'Rudraprayag', score: 6.8, calls: 14, google_rating: 3.8, alerts: 0 },
  { id: 28, name: 'Rudra Complex',            location: 'Rudraprayag', district: 'Rudraprayag', score: 7.1, calls: 16, google_rating: 4.0, alerts: 1 },
  { id: 29, name: 'Ghangharia TRH',           location: 'Ghangharia',  district: 'Chamoli',     score: 5.1, calls: 9,  google_rating: 3.3, alerts: 1 },
  { id: 30, name: 'Govindghat TRH',           location: 'Govindghat',  district: 'Chamoli',     score: 6.3, calls: 11, google_rating: 3.7, alerts: 0 },
  { id: 31, name: 'Pipalkoti TRH',            location: 'Pipalkoti',   district: 'Chamoli',     score: 6.7, calls: 8,  google_rating: 3.8, alerts: 0 },
  { id: 32, name: 'Karnaprayag TRH',          location: 'Karnaprayag', district: 'Chamoli',     score: 7.0, calls: 10, google_rating: 4.0, alerts: 0 },
  { id: 33, name: 'Gauchar TRH',              location: 'Gauchar',     district: 'Chamoli',     score: 6.5, calls: 7,  google_rating: 3.7, alerts: 0 },
  { id: 34, name: 'Gwaldam TRH',              location: 'Gwaldam',     district: 'Chamoli',     score: 7.3, calls: 9,  google_rating: 4.1, alerts: 0 },
  { id: 35, name: 'Pauri TRH',                location: 'Pauri',       district: 'Pauri',       score: 6.8, calls: 11, google_rating: 3.9, alerts: 0 },
  { id: 36, name: 'Kotdwar TRH',              location: 'Kotdwar',     district: 'Pauri',       score: 6.4, calls: 13, google_rating: 3.6, alerts: 0 },
  { id: 37, name: 'Chamba TRH',               location: 'Tehri',       district: 'Tehri',       score: 7.1, calls: 10, google_rating: 4.0, alerts: 0 },
  { id: 38, name: 'Hanol TRH',                location: 'Chakrata',    district: 'Dehradun',    score: 7.5, calls: 6,  google_rating: 4.2, alerts: 0 },
  { id: 39, name: 'Purola TRH',               location: 'Uttarkashi',  district: 'Uttarkashi',  score: 6.9, calls: 5,  google_rating: 3.9, alerts: 0 },
  { id: 40, name: 'Mori TRH',                 location: 'Uttarkashi',  district: 'Uttarkashi',  score: 6.6, calls: 4,  google_rating: 3.8, alerts: 0 },
  { id: 41, name: 'Sankri TRH',               location: 'Uttarkashi',  district: 'Uttarkashi',  score: 7.2, calls: 5,  google_rating: 4.1, alerts: 0 },
  { id: 42, name: 'Bhojbasa TRH',             location: 'Gaumukh',     district: 'Uttarkashi',  score: 5.3, calls: 7,  google_rating: 3.4, alerts: 1 },
  { id: 43, name: 'Janki Chatti TRH',         location: 'Yamunotri',   district: 'Uttarkashi',  score: 6.4, calls: 9,  google_rating: 3.7, alerts: 0 },
  { id: 44, name: 'Syanachatti TRH',          location: 'Yamunotri',   district: 'Uttarkashi',  score: 6.7, calls: 8,  google_rating: 3.8, alerts: 0 },
  { id: 45, name: 'Phulchatti TRH',           location: 'Yamunotri',   district: 'Uttarkashi',  score: 6.1, calls: 6,  google_rating: 3.5, alerts: 0 },
  { id: 46, name: 'Bhaironghati TRH',         location: 'Gangotri',    district: 'Uttarkashi',  score: 6.8, calls: 5,  google_rating: 3.9, alerts: 0 },
  { id: 47, name: 'Lanka TRH',                location: 'Gangotri',    district: 'Uttarkashi',  score: 6.5, calls: 4,  google_rating: 3.7, alerts: 0 },
  { id: 48, name: 'Gaurikund TRH',            location: 'Kedarnath',   district: 'Rudraprayag', score: 4.2, calls: 18, google_rating: 3.0, alerts: 2 },
  { id: 49, name: 'Sonprayag TRH',            location: 'Kedarnath',   district: 'Rudraprayag', score: 6.0, calls: 14, google_rating: 3.5, alerts: 0 },
  { id: 50, name: 'Rampur TRH',               location: 'Kedarnath',   district: 'Rudraprayag', score: 6.3, calls: 10, google_rating: 3.6, alerts: 0 },
  { id: 51, name: 'Phata TRH',                location: 'Kedarnath',   district: 'Rudraprayag', score: 6.7, calls: 9,  google_rating: 3.8, alerts: 0 },
  { id: 52, name: 'Narayankoti TRH',          location: 'Rudraprayag', district: 'Rudraprayag', score: 7.0, calls: 7,  google_rating: 4.0, alerts: 0 },
  { id: 53, name: 'Jakholi TRH',              location: 'Rudraprayag', district: 'Rudraprayag', score: 6.8, calls: 6,  google_rating: 3.9, alerts: 0 },
  { id: 54, name: 'Augustmuni TRH',           location: 'Rudraprayag', district: 'Rudraprayag', score: 7.1, calls: 8,  google_rating: 4.0, alerts: 0 },
  { id: 55, name: 'Tilwara TRH',              location: 'Rudraprayag', district: 'Rudraprayag', score: 6.9, calls: 7,  google_rating: 3.9, alerts: 0 },
  { id: 56, name: 'Ukhimath TRH',             location: 'Rudraprayag', district: 'Rudraprayag', score: 7.2, calls: 9,  google_rating: 4.1, alerts: 0 },
  { id: 57, name: 'Chopta TRH',               location: 'Rudraprayag', district: 'Rudraprayag', score: 7.8, calls: 11, google_rating: 4.3, alerts: 1 },
  { id: 58, name: 'Mandal TRH',               location: 'Chamoli',     district: 'Chamoli',     score: 6.6, calls: 5,  google_rating: 3.8, alerts: 0 },
  { id: 59, name: 'Gopeshwar TRH',            location: 'Chamoli',     district: 'Chamoli',     score: 7.0, calls: 8,  google_rating: 4.0, alerts: 0 },
  { id: 60, name: 'Nandprayag TRH',           location: 'Chamoli',     district: 'Chamoli',     score: 6.7, calls: 6,  google_rating: 3.8, alerts: 0 },
  { id: 61, name: 'Birahi TRH',               location: 'Chamoli',     district: 'Chamoli',     score: 6.4, calls: 4,  google_rating: 3.6, alerts: 0 },
  { id: 62, name: 'Helang TRH',               location: 'Chamoli',     district: 'Chamoli',     score: 6.8, calls: 5,  google_rating: 3.9, alerts: 0 },
  { id: 63, name: 'Pandukeshwar TRH',         location: 'Chamoli',     district: 'Chamoli',     score: 6.5, calls: 6,  google_rating: 3.7, alerts: 0 },
  { id: 64, name: 'Mana Village TRH',         location: 'Chamoli',     district: 'Chamoli',     score: 7.1, calls: 8,  google_rating: 4.0, alerts: 0 },
  { id: 65, name: 'Wan TRH',                  location: 'Chamoli',     district: 'Chamoli',     score: 6.9, calls: 5,  google_rating: 3.9, alerts: 0 },
  { id: 66, name: 'Mundoli TRH',              location: 'Chamoli',     district: 'Chamoli',     score: 6.7, calls: 4,  google_rating: 3.8, alerts: 0 },
  { id: 67, name: 'Lohajung TRH',             location: 'Chamoli',     district: 'Chamoli',     score: 7.4, calls: 7,  google_rating: 4.2, alerts: 0 },
  { id: 68, name: 'Dewal TRH',                location: 'Chamoli',     district: 'Chamoli',     score: 6.6, calls: 4,  google_rating: 3.8, alerts: 0 },
  { id: 69, name: 'Tharali TRH',              location: 'Chamoli',     district: 'Chamoli',     score: 6.8, calls: 5,  google_rating: 3.9, alerts: 0 },
  { id: 70, name: 'Adi Badri TRH',            location: 'Chamoli',     district: 'Chamoli',     score: 7.0, calls: 6,  google_rating: 4.0, alerts: 0 },
  { id: 71, name: 'Devprayag TRH',            location: 'Tehri',       district: 'Tehri',       score: 7.3, calls: 9,  google_rating: 4.1, alerts: 0 },
  { id: 72, name: 'Kirti Nagar TRH',          location: 'Tehri',       district: 'Tehri',       score: 7.0, calls: 8,  google_rating: 4.0, alerts: 0 },
  { id: 73, name: 'New Tehri TRH',            location: 'Tehri',       district: 'Tehri',       score: 7.2, calls: 10, google_rating: 4.1, alerts: 0 },
  { id: 74, name: 'Koteshwar TRH',            location: 'Tehri',       district: 'Tehri',       score: 6.9, calls: 7,  google_rating: 3.9, alerts: 0 },
  { id: 75, name: 'Kaudiyala TRH',            location: 'Tehri',       district: 'Tehri',       score: 7.5, calls: 8,  google_rating: 4.2, alerts: 0 },
  { id: 76, name: 'Satpuli TRH',              location: 'Pauri',       district: 'Pauri',       score: 6.7, calls: 6,  google_rating: 3.8, alerts: 0 },
  { id: 77, name: 'Bubakhal TRH',             location: 'Pauri',       district: 'Pauri',       score: 6.5, calls: 5,  google_rating: 3.7, alerts: 0 },
  { id: 78, name: 'Thalisain TRH',            location: 'Pauri',       district: 'Pauri',       score: 6.8, calls: 6,  google_rating: 3.9, alerts: 0 },
  { id: 79, name: 'Chilla TRH',               location: 'Pauri',       district: 'Pauri',       score: 6.4, calls: 7,  google_rating: 3.6, alerts: 0 },
  { id: 80, name: 'Kanvashram TRH',           location: 'Pauri',       district: 'Pauri',       score: 6.9, calls: 6,  google_rating: 3.9, alerts: 0 },
  { id: 81, name: 'Corbett (Sultan)',          location: 'Pauri',       district: 'Pauri',       score: 7.6, calls: 9,  google_rating: 4.2, alerts: 0 },
  { id: 82, name: 'Roorkee TRH',              location: 'Haridwar',    district: 'Haridwar',    score: 7.0, calls: 14, google_rating: 4.0, alerts: 0 },
]

function scoreColor(score: number) {
  if (score >= 7.5) return 'text-green-600 bg-green-50'
  if (score >= 6)   return 'text-yellow-600 bg-yellow-50'
  return 'text-red-600 bg-red-50'
}

export default function PropertiesPage() {
  const districts = [...new Set(ALL_PROPERTIES.map(p => p.district))].sort()

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Properties</h1>
        <p className="text-sm text-gray-500 mt-0.5">82 GMVN guest houses across Garhwal</p>
      </div>

      {/* Filters row */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Districts</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Scores</option>
          <option value="high">High (7.5+)</option>
          <option value="medium">Medium (6–7.5)</option>
          <option value="low">Needs Attention (&lt;6)</option>
        </select>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-3 gap-4">
        {ALL_PROPERTIES.map((p) => (
          <Link key={p.id} href={`/dashboard/properties/${p.id}`}>
            <Card className="hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer h-full">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {p.location} · {p.district}
                    </p>
                  </div>
                  {p.alerts > 0 && (
                    <span className="ml-2 flex-shrink-0 text-xs bg-red-100 text-red-600 font-medium px-1.5 py-0.5 rounded-full">
                      {p.alerts} alert{p.alerts > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className={`text-lg font-bold px-2 py-0.5 rounded-lg ${scoreColor(p.score)}`}>
                    {p.score.toFixed(1)}
                    <span className="text-xs font-normal">/10</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Phone size={10} /> {p.calls}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={10} className="text-yellow-400" /> {p.google_rating}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
