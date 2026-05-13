import { useState } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { useFamilyStore } from '../store/familyStore'

export default function SearchBar({ onSelect }) {
  const { getCurrentPersons } = useFamilyStore()
  const [query, setQuery] = useState('')
  const [gender, setGender] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [open, setOpen] = useState(false)

  const persons = getCurrentPersons()
  const results = query.length >= 1
    ? persons.filter(p => {
        const q = query.toLowerCase()
        const matchName = p.name?.toLowerCase().includes(q) || p.namePinyin?.toLowerCase().includes(q)
        const matchGender = !gender || p.gender === gender
        return matchName && matchGender
      }).slice(0, 8)
    : []

  return (
    <div className="relative w-full max-w-md">
      <div className="flex items-center border border-amber-300 rounded-lg bg-white overflow-hidden focus-within:border-[#8B4513] focus-within:ring-1 focus-within:ring-[#8B4513]">
        <Search size={16} className="ml-3 text-gray-400 shrink-0" />
        <input
          className="flex-1 px-3 py-2 text-sm outline-none"
          placeholder="搜索姓名、拼音..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {query && (
          <button onClick={() => setQuery('')} className="mr-2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`px-3 py-2 border-l border-amber-200 text-gray-400 hover:bg-amber-50 transition-colors ${showFilter ? 'bg-amber-50 text-[#8B4513]' : ''}`}
        >
          <Filter size={14} />
        </button>
      </div>
      {showFilter && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-amber-200 rounded-lg p-3 z-40 shadow-md">
          <label className="text-xs text-gray-500 mb-1 block">性别筛选</label>
          <div className="flex gap-2">
            {[['','全部'],['male','男'],['female','女']].map(([v,l]) => (
              <button
                key={v}
                onClick={() => setGender(v)}
                className={`px-3 py-1 rounded text-xs border transition-colors ${gender===v ? 'bg-[#8B4513] text-white border-[#8B4513]' : 'border-gray-200 hover:border-amber-300'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      )}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-amber-200 rounded-lg shadow-xl z-40 overflow-hidden">
          {results.map(p => (
            <button
              key={p.id}
              onMouseDown={() => { onSelect?.(p); setQuery(''); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 text-left transition-colors"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${p.gender === 'female' ? 'bg-pink-400' : 'bg-blue-400'}`}>
                {p.name?.[0]}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">{p.name}</div>
                <div className="text-xs text-gray-400">{p.birthYear ? `${p.birthYear}年生` : ''}{p.occupation ? ` · ${p.occupation}` : ''}</div>
              </div>
              <span className="ml-auto text-xs text-gray-300">第{p.generation||1}代</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
