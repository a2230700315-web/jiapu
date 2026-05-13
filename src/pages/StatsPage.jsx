import Statistics from '../components/Statistics'
import Timeline from '../components/Timeline'
import { useFamilyStore } from '../store/familyStore'
import { useState } from 'react'
import { BarChart2, Clock } from 'lucide-react'

export default function StatsPage() {
  const { getCurrentFamily } = useFamilyStore()
  const [tab, setTab] = useState('stats')
  const family = getCurrentFamily()

  if (!family) return (
    <div className="flex-1 flex items-center justify-center text-gray-400">
      <div className="text-center"><div className="text-5xl mb-3">📊</div><p>请先选择家族</p></div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#5C2E00]">{family.name} · 分析</h1>
          <p className="text-sm text-gray-400">家族人口统计与历史时间线</p>
        </div>
        <div className="ml-auto flex border border-amber-200 rounded-lg overflow-hidden">
          {[
            { id: 'stats', icon: BarChart2, label: '统计分析' },
            { id: 'timeline', icon: Clock, label: '历史时间线' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm transition-colors ${tab===id ? 'bg-[#8B4513] text-white' : 'text-gray-500 hover:bg-amber-50'}`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'stats' && <Statistics />}
      {tab === 'timeline' && (
        <div className="bg-white rounded-xl border border-amber-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#5C2E00] mb-4">家族成员生命时间线</h3>
          <Timeline />
        </div>
      )}
    </div>
  )
}
