import { useState } from 'react'
import { useFamilyStore } from '../store/familyStore'
import { Edit2, Trash2, Phone, Mail, MapPin, Calendar, User, ChevronDown, ChevronUp } from 'lucide-react'

const GENDER_ICON = { male: '♂', female: '♀', unknown: '?' }
const GENDER_COLOR = { male: 'text-blue-500 bg-blue-50', female: 'text-pink-500 bg-pink-50', unknown: 'text-gray-400 bg-gray-50' }

export default function PersonCard({ person, onEdit, onDelete, isSelected, onClick }) {
  const { getCurrentPersons } = useFamilyStore()
  const [expanded, setExpanded] = useState(false)
  const persons = getCurrentPersons()

  const father = persons.find(p => p.id === person.fatherId)
  const mother = persons.find(p => p.id === person.motherId)
  const spouse = persons.find(p => p.id === person.spouseId)
  const children = persons.filter(p => p.fatherId === person.id || p.motherId === person.id)

  const age = person.birthYear
    ? (person.isAlive === false && person.deathYear
        ? parseInt(person.deathYear) - parseInt(person.birthYear)
        : new Date().getFullYear() - parseInt(person.birthYear))
    : null

  return (
    <div
      className={`bg-white rounded-xl border transition-all fade-in ${
        isSelected ? 'border-[#8B4513] ring-2 ring-[#8B4513] ring-opacity-30' : 'border-amber-100 hover:border-amber-300'
      } shadow-sm overflow-hidden`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3 p-4">
        {/* photo/avatar */}
        <div className="shrink-0 relative">
          {person.photo ? (
            <img src={person.photo} alt={person.name} className="w-14 h-16 object-cover rounded-lg" />
          ) : (
            <div className={`w-14 h-16 rounded-lg flex items-center justify-center text-2xl font-bold ${GENDER_COLOR[person.gender]||GENDER_COLOR.unknown}`}>
              {person.name?.[0] || '?'}
            </div>
          )}
          {person.isAlive === false && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-400 rounded-full text-white text-xs flex items-center justify-center" title="已逝">†</div>
          )}
        </div>

        {/* info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-[#2c1810] text-base leading-tight">{person.name || '未知'}</h3>
              {person.namePinyin && <p className="text-xs text-gray-400">{person.namePinyin}</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <span className={`text-xs px-1.5 py-0.5 rounded ${GENDER_COLOR[person.gender]||GENDER_COLOR.unknown}`}>
                {GENDER_ICON[person.gender]||'?'}
              </span>
              <span className="text-xs text-gray-400">第{person.generation||1}代</span>
            </div>
          </div>

          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
            {person.birthYear && (
              <span className="flex items-center gap-0.5">
                <Calendar size={11} />
                {person.birthYear}
                {person.isAlive === false && person.deathYear ? `—${person.deathYear}` : '—'}
                {age !== null ? ` (${age}岁)` : ''}
              </span>
            )}
            {person.birthPlace && (
              <span className="flex items-center gap-0.5 truncate max-w-[120px]">
                <MapPin size={11} /> {person.birthPlace}
              </span>
            )}
            {person.occupation && <span className="text-[#8B4513]">{person.occupation}</span>}
          </div>
        </div>
      </div>

      {/* expand */}
      {expanded && (
        <div className="px-4 pb-3 border-t border-amber-50 pt-3 space-y-2 text-sm fade-in">
          {/* relations */}
          {(father||mother||spouse||children.length>0) && (
            <div className="space-y-1">
              {father && <div className="flex gap-2 text-xs"><span className="text-gray-400 w-12">父亲</span><span className="text-[#8B4513]">{father.name}</span></div>}
              {mother && <div className="flex gap-2 text-xs"><span className="text-gray-400 w-12">母亲</span><span className="text-[#8B4513]">{mother.name}</span></div>}
              {spouse && <div className="flex gap-2 text-xs"><span className="text-gray-400 w-12">配偶</span><span className="text-[#8B4513]">{spouse.name}</span></div>}
              {children.length > 0 && (
                <div className="flex gap-2 text-xs">
                  <span className="text-gray-400 w-12">子女</span>
                  <span className="text-[#8B4513]">{children.map(c => c.name).join('、')}</span>
                </div>
              )}
            </div>
          )}
          {/* contact */}
          {person.phone && <div className="flex items-center gap-1.5 text-xs text-gray-500"><Phone size={11} />{person.phone}</div>}
          {person.email && <div className="flex items-center gap-1.5 text-xs text-gray-500"><Mail size={11} />{person.email}</div>}
          {person.notes && <p className="text-xs text-gray-500 bg-amber-50 rounded p-2">{person.notes}</p>}
        </div>
      )}

      {/* footer actions */}
      <div className="flex items-center justify-between px-3 py-2 bg-amber-50/50 border-t border-amber-50">
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
          className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
        >
          {expanded ? <><ChevronUp size={12} />收起</> : <><ChevronDown size={12} />详情</>}
        </button>
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(person) }}
            className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
          >
            <Edit2 size={12} /> 编辑
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(person) }}
            className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
          >
            <Trash2 size={12} /> 删除
          </button>
        </div>
      </div>
    </div>
  )
}
