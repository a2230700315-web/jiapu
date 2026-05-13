import { useState } from 'react'
import FamilyTree from '../components/FamilyTree'
import PersonCard from '../components/PersonCard'
import PersonForm from '../components/PersonForm'
import SearchBar from '../components/SearchBar'
import { useFamilyStore } from '../store/familyStore'
import { LayoutGrid, GitBranch, AlignLeft } from 'lucide-react'

export default function TreePage() {
  const { getCurrentFamily, getCurrentPersons, deletePerson } = useFamilyStore()
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [editPerson, setEditPerson] = useState(null)
  const [view, setView] = useState('tree') // tree | split
  const family = getCurrentFamily()
  const persons = getCurrentPersons()

  if (!family) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center text-gray-400">
        <div className="text-5xl mb-3">🏠</div>
        <p>请先在首页选择或创建家族</p>
      </div>
    </div>
  )

  const handleDelete = (person) => {
    if (confirm(`确认删除 "${person.name}"？`)) {
      deletePerson(person.id)
      if (selectedPerson?.id === person.id) setSelectedPerson(null)
    }
  }

  return (
    <div className="flex-1 flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      {/* toolbar */}
      <div className="bg-white border-b border-amber-100 px-4 py-2 flex items-center gap-3 shrink-0">
        <h2 className="font-bold text-[#5C2E00]">{family.name} · 家谱树</h2>
        <span className="text-xs text-gray-400">共 {persons.length} 位成员</span>
        <div className="ml-auto flex items-center gap-2">
          <SearchBar onSelect={setSelectedPerson} />
          <div className="flex border border-amber-200 rounded overflow-hidden">
            <button onClick={() => setView('tree')} className={`px-3 py-1.5 text-xs flex items-center gap-1 ${view==='tree' ? 'bg-[#8B4513] text-white' : 'text-gray-500 hover:bg-amber-50'}`}>
              <GitBranch size={13} /> 树形
            </button>
            <button onClick={() => setView('split')} className={`px-3 py-1.5 text-xs flex items-center gap-1 ${view==='split' ? 'bg-[#8B4513] text-white' : 'text-gray-500 hover:bg-amber-50'}`}>
              <LayoutGrid size={13} /> 分屏
            </button>
          </div>
        </div>
      </div>

      {/* content */}
      <div className="flex-1 flex overflow-hidden">
        <div className={`flex-1 p-3 overflow-hidden ${view==='split' ? 'w-2/3' : 'w-full'}`}>
          <FamilyTree onSelectPerson={setSelectedPerson} />
        </div>

        {(view === 'split' || selectedPerson) && (
          <div className={`${view==='split' ? 'w-80 border-l border-amber-100' : 'fixed right-4 top-20 w-80 z-30'} bg-white overflow-y-auto`}>
            {selectedPerson ? (
              <div className="p-3">
                <PersonCard
                  person={selectedPerson}
                  isSelected
                  onEdit={() => setEditPerson(selectedPerson)}
                  onDelete={handleDelete}
                />
              </div>
            ) : (
              <div className="p-4 text-center text-gray-400 text-sm mt-8">
                点击树中节点查看详情
              </div>
            )}
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
