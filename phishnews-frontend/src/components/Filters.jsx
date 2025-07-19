import { useState } from 'react'

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
  { value: 'newsapi', label: 'NewsAPI' },
  { value: 'gnews', label: 'GNews' },
]

export default function Filters({ values, onChange }) {
  const [local, setLocal] = useState(values || {
    country: 'us',
    category: '',
    source: 'newsapi',
    q: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    const updated = { ...local, [name]: value }
    setLocal(updated)
    onChange && onChange(updated)
  }

  return (
    <form className="flex flex-wrap gap-2 mb-4 items-end">
      <div>
        <label className="block text-xs font-semibold mb-1">Country</label>
        <select name="country" value={local.country} onChange={handleChange} className="px-2 py-1 border rounded">
          {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Category</label>
        <select name="category" value={local.category} onChange={handleChange} className="px-2 py-1 border rounded">
          <option value="">All</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Source</label>
        <select name="source" value={local.source} onChange={handleChange} className="px-2 py-1 border rounded">
          {sources.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-semibold mb-1">Query</label>
        <input
          name="q"
          value={local.q}
          onChange={handleChange}
          placeholder="Search keywords..."
          className="w-full px-2 py-1 border rounded"
        />
      </div>
    </form>
  )
} 