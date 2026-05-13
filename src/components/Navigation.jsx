import { Link, useLocation } from 'react-router-dom'
import { GitBranch, Users, Camera, BarChart2, Search, Home, ChevronDown } from 'lucide-react'
import { useFamilyStore } from '../store/familyStore'
import { useState } from 'react'

const navItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/tree', icon: GitBranch, label: '家谱树' },
  { to: '/persons', icon: Users, label: '族谱名录' },
  { to: '/scan', icon: Camera, label: '拍照录入' },
  { to: '/stats', icon: BarChart2, label: '统计分析' },
  { to: '/search', icon: Search, label: '人员搜索' },
]

export default function Navigation() {
  const loc = useLocation()
  const { families, currentFamilyId, setCurrentFamily, getCurrentFamily } = useFamilyStore()
  const [showFamilyPicker, setShowFamilyPicker] = useState(false)
  const currentFamily = getCurrentFamily()

  return (
    <header className="bg-[#5C2E00] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* logo */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl font-bold text-[#DAA520] shrink-0">家谱</span>
            <span className="text-[#DAA520] opacity-60 shrink-0">·</span>
            {/* family selector */}
            <div className="relative">
              <button
                onClick={() => setShowFamilyPicker(!showFamilyPicker)}
                className="flex items-center gap-1 text-sm text-amber-100 hover:text-white transition-colors truncate max-w-[140px]"
              >
                <span className="truncate">{currentFamily ? currentFamily.name : '选择家族'}</span>
                <ChevronDown size={14} className="shrink-0" />
              </button>
              {showFamilyPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white text-gray-800 rounded shadow-xl min-w-[180px] z-50">
                  {families.map(f => (
                    <button
                      key={f.id}
                      onClick={() => { setCurrentFamily(f.id); setShowFamilyPicker(false) }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-amber-50 ${f.id === currentFamilyId ? 'font-bold text-[#8B4513]' : ''}`}
                    >
                      {f.name}
                    </button>
                  ))}
                  <div className="border-t">
                    <Link
                      to="/"
                      onClick={() => setShowFamilyPicker(false)}
                      className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                    >
                      + 新建家族
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* nav */}
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded text-sm transition-colors ${
                  loc.pathname === to
                    ? 'bg-[#DAA520] text-white font-semibold'
                    : 'text-amber-100 hover:bg-[#8B4513]'
                }`}
              >
                <Icon size={15} />
                <span className="hidden md:inline">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
