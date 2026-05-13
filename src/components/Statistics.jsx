import { useFamilyStore } from '../store/familyStore'
import { useMemo } from 'react'

function getAge(person) {
  if (!person.birthYear) return null
  const end = person.isAlive === false && person.deathYear ? parseInt(person.deathYear) : new Date().getFullYear()
  return end - parseInt(person.birthYear)
}

export default function Statistics() {
  const { getCurrentPersons, getCurrentFamily } = useFamilyStore()
  const persons = getCurrentPersons()
  const family = getCurrentFamily()

  const stats = useMemo(() => {
    if (!persons.length) return null
    const alive = persons.filter(p => p.isAlive !== false)
    const deceased = persons.filter(p => p.isAlive === false)
    const males = persons.filter(p => p.gender === 'male')
    const females = persons.filter(p => p.gender === 'female')

    const ages = persons.map(getAge).filter(a => a !== null && a >= 0 && a < 150)
    const avgAge = ages.length ? Math.round(ages.reduce((a,b) => a+b, 0) / ages.length) : null
    const maxAge = ages.length ? Math.max(...ages) : null
    const oldest = ages.length ? persons.find(p => getAge(p) === maxAge) : null

    const genCounts = {}
    persons.forEach(p => {
      const g = p.generation || 1
      genCounts[g] = (genCounts[g] || 0) + 1
    })

    const occupations = {}
    persons.forEach(p => {
      if (p.occupation) occupations[p.occupation] = (occupations[p.occupation] || 0) + 1
    })
    const topOcc = Object.entries(occupations).sort((a,b) => b[1]-a[1]).slice(0, 5)

    const birthDecades = {}
    persons.forEach(p => {
      if (p.birthYear) {
        const dec = Math.floor(parseInt(p.birthYear) / 10) * 10
        birthDecades[dec] = (birthDecades[dec] || 0) + 1
      }
    })
    const decadeSorted = Object.entries(birthDecades).sort((a,b) => a[0]-b[0])

    const maxDecadeCount = Math.max(...decadeSorted.map(([,v]) => v), 1)

    const provinces = {}
    persons.forEach(p => {
      const place = p.birthPlace || p.currentPlace
      if (place) {
        const prov = place.slice(0, 2)
        provinces[prov] = (provinces[prov] || 0) + 1
      }
    })
    const topProvinces = Object.entries(provinces).sort((a,b) => b[1]-a[1]).slice(0, 5)

    return { alive, deceased, males, females, avgAge, oldest, genCounts, topOcc, decadeSorted, maxDecadeCount, topProvinces }
  }, [persons])

  if (!stats) return (
    <div className="text-center py-16 text-gray-400">
      <div className="text-4xl mb-3">📊</div>
      <p>暂无数据，请先添加家族成员</p>
    </div>
  )

  const card = 'bg-white rounded-xl border border-amber-100 p-5 shadow-sm'

  return (
    <div className="space-y-4 fade-in">
      {/* headline numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: '总人数', value: persons.length, color: 'text-[#8B4513]' },
          { label: '健在', value: stats.alive.length, color: 'text-green-600' },
          { label: '男性', value: stats.males.length, color: 'text-blue-500' },
          { label: '女性', value: stats.females.length, color: 'text-pink-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${card} text-center`}>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* age stats */}
        <div className={card}>
          <h3 className="text-sm font-semibold text-[#5C2E00] mb-3">年龄统计</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">平均年龄</span><span className="font-medium">{stats.avgAge ? `${stats.avgAge} 岁` : '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">最长寿</span><span className="font-medium">{stats.oldest ? `${stats.oldest.name} (${getAge(stats.oldest)}岁)` : '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">总世代</span><span className="font-medium">{Object.keys(stats.genCounts).length} 代</span></div>
          </div>
        </div>

        {/* generation distribution */}
        <div className={card}>
          <h3 className="text-sm font-semibold text-[#5C2E00] mb-3">世代分布</h3>
          <div className="space-y-1.5">
            {Object.entries(stats.genCounts).sort((a,b) => a[0]-b[0]).map(([gen, count]) => (
              <div key={gen} className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 w-12 shrink-0">第{gen}代</span>
                <div className="flex-1 bg-amber-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-[#D2691E] rounded-full flex items-center pl-2 text-white"
                    style={{ width: `${Math.max((count / persons.length) * 100, 4)}%` }}
                  >
                    {count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* birth by decade */}
        <div className={card}>
          <h3 className="text-sm font-semibold text-[#5C2E00] mb-3">出生年代分布</h3>
          <div className="space-y-1.5">
            {stats.decadeSorted.map(([dec, count]) => (
              <div key={dec} className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 w-16 shrink-0">{dec}s</span>
                <div className="flex-1 bg-blue-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full flex items-center pl-2 text-white"
                    style={{ width: `${(count / stats.maxDecadeCount) * 100}%` }}
                  >
                    {count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* occupations */}
        {stats.topOcc.length > 0 && (
          <div className={card}>
            <h3 className="text-sm font-semibold text-[#5C2E00] mb-3">职业分布 (Top 5)</h3>
            <div className="space-y-1.5">
              {stats.topOcc.map(([occ, count]) => (
                <div key={occ} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{occ}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-amber-100 rounded-full h-2">
                      <div className="h-full bg-[#DAA520] rounded-full" style={{ width: `${(count/stats.topOcc[0][1])*100}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-4">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* provinces */}
      {stats.topProvinces.length > 0 && (
        <div className={card}>
          <h3 className="text-sm font-semibold text-[#5C2E00] mb-3">主要分布地区</h3>
          <div className="flex flex-wrap gap-2">
            {stats.topProvinces.map(([prov, count]) => (
              <span key={prov} className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-sm text-[#8B4513]">
                {prov} <span className="font-bold">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
