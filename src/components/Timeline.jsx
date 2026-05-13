import { useFamilyStore } from '../store/familyStore'
import { useMemo } from 'react'

function getYear(p) {
  return parseInt(p.birthYear) || null
}

export default function Timeline({ onSelectPerson }) {
  const { getCurrentPersons } = useFamilyStore()
  const persons = getCurrentPersons()

  const sorted = useMemo(() =>
    [...persons].filter(p => p.birthYear).sort((a,b) => getYear(a) - getYear(b)),
    [persons]
  )

  if (!sorted.length) return (
    <div className="text-center py-12 text-gray-400">
      <div className="text-4xl mb-2">📅</div>
      <p className="text-sm">请先为成员填写出生年份</p>
    </div>
  )

  const minYear = getYear(sorted[0])
  const maxYear = Math.max(...sorted.map(p => parseInt(p.deathYear||p.birthYear) || 0))
  const span = maxYear - minYear || 1

  return (
    <div className="overflow-x-auto pb-4">
      <div className="relative" style={{ minWidth: Math.max(600, span * 2 + 200) }}>
        {/* axis */}
        <div className="h-px bg-amber-300 w-full my-8 relative">
          {Array.from({ length: Math.ceil(span / 10) + 1 }, (_, i) => minYear + i * 10).map(year => (
            <div key={year} className="absolute" style={{ left: `${((year - minYear) / span) * 100}%` }}>
              <div className="w-px h-3 bg-amber-400 -mt-1" />
              <div className="text-xs text-amber-700 mt-1 -translate-x-1/2">{year}</div>
            </div>
          ))}
        </div>

        {/* person bars */}
        <div className="space-y-2">
          {sorted.map((p, i) => {
            const start = ((getYear(p) - minYear) / span) * 100
            const end = p.deathYear ? ((parseInt(p.deathYear) - minYear) / span) * 100 : 100
            const width = Math.max(end - start, 0.5)
            return (
              <div
                key={p.id}
                className="relative h-7 cursor-pointer group"
                onClick={() => onSelectPerson?.(p)}
              >
                <div
                  className="absolute top-0 h-full rounded-full flex items-center px-2 text-xs text-white font-medium overflow-hidden whitespace-nowrap transition-all group-hover:brightness-110"
                  style={{
                    left: `${start}%`,
                    width: `${width}%`,
                    minWidth: 60,
                    background: p.gender === 'female' ? '#EC4899' : '#3B82F6',
                    opacity: p.isAlive === false ? 0.6 : 1,
                  }}
                >
                  {p.name}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
