import { useState, useEffect } from 'react'

const countries = [
  { code: 'us', name: 'United States' },
  { code: 'in', name: 'India' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'au', name: 'Australia' },
  { code: 'ca', name: 'Canada' },
  // Add more as needed
]

const categories = [
  'general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology'
]

const sources = [
  { value: 'all', label: 'All Sources' },
  { value: 'newsapi', label: 'NewsAPI' },
  { value: 'gnews', label: 'GNews' },
]

export default function Filters({ values, onChange }) {
  const [local, setLocal] = useState(values || {
    country: 'us',
    category: '',
    source: 'all',
    q: ''
  })
  const [channels, setChannels] = useState([])

  useEffect(() => {
    // Fetch channels from backend
    fetch('http://127.0.0.1:8000/news/channels')
      .then(res => res.json())
      .then(data => {
        setChannels(data.channels || [])
      })
      .catch(() => setChannels([]))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    const updated = { ...local, [name]: value }
    setLocal(updated)
    onChange && onChange(updated)
  }

  return (
    <form className="flex flex-wrap gap-4 mb-4 items-end bg-gray-800 p-4 rounded-lg">
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-300">Country</label>
        <select 
          name="country" 
          value={local.country} 
          onChange={handleChange} 
          className="px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-300">Category</label>
        <select 
          name="category" 
          value={local.category} 
          onChange={handleChange} 
          className="px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          <option value="">All</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-gray-300">Source</label>
        <select 
          name="source" 
          value={local.source} 
          onChange={handleChange} 
          className="px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          <option value="all">All Sources</option>
          {channels.map(channel => <option key={channel} value={channel}>{channel}</option>)}
        </select>
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-semibold mb-1 text-gray-300">Query</label>
        <input
          name="q"
          value={local.q}
          onChange={handleChange}
          placeholder="Search keywords..."
          className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
      </div>
    </form>
  )
} 