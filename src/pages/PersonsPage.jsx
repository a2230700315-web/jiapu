import { useState } from 'react'
import { useFamilyStore } from '../store/familyStore'
import PersonCard from '../components/PersonCard'
import PersonForm from '../components/PersonForm'
import OcrScanner from '../components/OcrScanner'
import SearchBar from '../components/SearchBar'
import { Plus, Camera, Filter, SortAsc } from 'lucide-react'

export default function PersonsPage() {
  const { getCurrentPersons, getCurrentFamily, deletePerson } = useFamilyStore()
  const [showForm, setShowForm] = useState(false)
  const [editPerson, setEditPerson] = useState(null)
  const [showScanner, setShowScanner] = useState(false)
  const [filterGender, setFilterGender] = useState('')
  const [filterGen, setFilterGen] = useState('')
  const [sortBy, setSortBy] = useState('generation')
  const [selectedId, setSelectedId] = useState(null)

  const family = getCurrentFamily()
  const allPersons = getCurrentPersons()

  const gens = [...new Set(allPersons.map(p => p.generation||1))].sort((a,b)=>a-b)

  let persons = allPersons
  if (filterGender) persons = persons.filter(p => p.gender === filterGender)
  if (filterGen) persons = persons.filter(p => (p.generation||1) === parseInt(filterGen))

  persons = [...persons].sort((a, b) => {
    if (sortBy === 'generation') return (a.generation||1) - (b.generation||1)
    if (sortBy === 'birth') return (parseInt(a.birthYear)||9999) - (parseInt(b.birthYear)||9999)
    if (sortBy === 'name') return (a.name||'').localeCompare(b.name||'')
    return 0
  })

  if (!family) return (
    <div className="flex-1 flex items-center justify-center text-gray-400">
      <div className="text-center"><div className="text-5xl mb-3">🏠</div><p>请先在首页选择家族</p></div>
    </div>
  )

  const handleDelete = (person) => {
    if (confirm(`确认删除 "${person.name}"？`)) {
      deletePerson(person.id)
      if (selectedId === person.id) setSelectedId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#5C2E00]">{family.name}</h1>
          <p className="text-sm text-gray-400">族谱名录 · {allPersons.length} 位成员</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-1.5 px-4 py-2 border border-[#8B4513] text-[#8B4513] rounded-lg text-sm hover:bg-amber-50 transition-colors"
          >
            <Camera size={15} /> 拍照录入
          </button>
          <button
            onClick={() => { setEditPerson(null); setShowForm(true) }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#8B4513] text-white rounded-lg text-sm hover:bg-[#5C2E00] transition-colors"
          >
            <Plus size={15} /> 手动录入
          </button>
        </div>
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4 bg-white rounded-xl border border-amber-100 p-3 shadow-sm">
        <SearchBar onSelect={p => setSelectedId(p.id)} />
        <div className="flex items-center gap-2 text-sm">
          <Filter size={14} className="text-gray-400" />
          <select
            className="border border-amber-200 rounded px-2 py-1 text-sm focus:outline-none"
            value={filterGender}
            onChange={e => setFilterGender(e.target.value)}
          >
            <option value="">全部性别</option>
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
          <select
            className="border border-amber-200 rounded px-2 py-1 text-sm focus:outline-none"
            value={filterGen}
            onChange={e => setFilterGen(e.target.value)}
          >
            <option value="">全部世代</option>
            {gens.map(g => <option key={g} value={g}>第{g}代</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm ml-auto">
          <SortAsc size={14} className="text-gray-400" />
          <select
            className="border border-amber-200 rounded px-2 py-1 text-sm focus:outline-none"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="generation">按世代</option>
            <option value="birth">按出生年</option>
            <option value="name">按姓名</option>
          </select>
        </div>
      </div>

      {/* person grid */}
      {persons.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">👤</div>
          <p>暂无成员，请添加</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {persons.map(p => (
            <PersonCard
              key={p.id}
              person={p}
              isSelected={selectedId === p.id}
              onClick={() => setSelectedId(selectedId === p.id ? null : p.id)}
              onEdit={(person) => { setEditPerson(person); setShowForm(true) }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showForm && (
        <PersonForm
          initial={editPerson || {}}
          editId={editPerson?.id}
          onClose={() => { setShowForm(false); setEditPerson(null) }}
          onSave={() => { setShowForm(false); setEditPerson(null) }}
        />
      )}
      {showScanner && <OcrScanner onClose={() => setShowScanner(false)} />}
    </div>
  )
}
