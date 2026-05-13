import { useState } from 'react'
import { useFamilyStore } from '../store/familyStore'
import PersonCard from '../components/PersonCard'
import PersonForm from '../components/PersonForm'
import { Search, Filter } from 'lucide-react'

export default function SearchPage() {
  const { getCurrentPersons, getCurrentFamily, deletePerson } = useFamilyStore()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ gender: '', alive: '', generation: '' })
  const [editPerson, setEditPerson] = useState(null)
  const family = getCurrentFamily()
  const persons = getCurrentPersons()

  const results = persons.filter(p => {
    if (query) {
      const q = query.toLowerCase()
      const match = p.name?.toLowerCase().includes(q)
        || p.namePinyin?.toLowerCase().includes(q)
        || p.birthPlace?.includes(query)
        || p.occupation?.includes(query)
        || p.notes?.includes(query)
      if (!match) return false
    }
    if (filters.gender && p.gender !== filters.gender) return false
    if (filters.alive === 'alive' && p.isAlive === false) return false
    if (filters.alive === 'deceased' && p.isAlive !== false) return false
    if (filters.generation && (p.generation||1) !== parseInt(filters.generation)) return false
    return true
  })

  const gens = [...new Set(persons.map(p => p.generation||1))].sort((a,b)=>a-b)

  if (!family) return (
    <div className="flex-1 flex items-center justify-center text-gray-400">
      <div className="text-center"><div className="text-5xl mb-3">🔍</div><p>请先选择家族</p></div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-[#5C2E00] mb-6">成员搜索</h1>

      {/* search box */}
      <div className="bg-white rounded-xl border border-amber-100 p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-2 border border-amber-200 rounded-lg px-3 py-2 focus-within:border-[#8B4513] mb-3">
          <Search size={16} className="text-gray-400" />
          <input
            className="flex-1 outline-none text-sm"
            placeholder="搜索姓名、籍贯、职业、备注..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <select className="border border-amber-200 rounded px-2 py-1 text-sm focus:outline-none" value={filters.gender} onChange={e => setFilters(f => ({...f, gender: e.target.value}))}>
            <option value="">全部性别</option>
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
          <select className="border border-amber-200 rounded px-2 py-1 text-sm focus:outline-none" value={filters.alive} onChange={e => setFilters(f => ({...f, alive: e.target.value}))}>
            <option value="">健在/已逝</option>
            <option value="alive">仅健在</option>
            <option value="deceased">仅已逝</option>
          </select>
          <select className="border border-amber-200 rounded px-2 py-1 text-sm focus:outline-none" value={filters.generation} onChange={e => setFilters(f => ({...f, generation: e.target.value}))}>
            <option value="">全部世代</option>
            {gens.map(g => <option key={g} value={g}>第{g}代</option>)}
          </select>
          <span className="ml-auto text-xs text-gray-400 self-center">找到 {results.length} 条结果</span>
        </div>
      </div>

      {/* results */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map(p => (
          <PersonCard
            key={p.id}
            person={p}
            onEdit={(person) => setEditPerson(person)}
            onDelete={(person) => { if (confirm(`确认删除 "${person.name}"？`)) deletePerson(person.id) }}
          />
        ))}
        {results.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <div className="text-4xl mb-2">🔍</div>
            <p>未找到匹配结果</p>
          </div>
        )}
      </div>

      {editPerson && (
        <PersonForm
          initial={editPerson}
          editId={editPerson.id}
          onClose={() => setEditPerson(null)}
          onSave={() => setEditPerson(null)}
        />
      )}
    </div>
  )
}
