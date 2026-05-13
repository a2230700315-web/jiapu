import { useState } from 'react'
import { useFamilyStore } from '../store/familyStore'
import { Plus, Users, GitBranch, Camera, ArrowRight, BookOpen, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const { families, addFamily, deleteFamily, setCurrentFamily, currentFamilyId } = useFamilyStore()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const navigate = useNavigate()

  const handleCreate = () => {
    if (!name.trim()) return
    addFamily({ name: name.trim(), description: desc.trim() })
    setName(''); setDesc(''); setShowCreate(false)
  }

  const features = [
    { icon: GitBranch, title: '可视化家谱树', desc: '以树形图直观展示世代传承关系' },
    { icon: Users, title: '族谱名录', desc: '完整记录每位成员的基本信息' },
    { icon: Camera, title: 'AI 拍照识别', desc: '拍照即可自动提取成员信息' },
    { icon: BookOpen, title: '统计分析', desc: '年龄、世代、地域分布一览无余' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* hero */}
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">🏮</div>
        <h1 className="text-4xl font-bold text-[#5C2E00] mb-3">数字家谱</h1>
        <p className="text-gray-500 text-lg">传承千载，永续家风</p>
      </div>

      {/* features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-xl border border-amber-100 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icon size={20} className="text-[#8B4513]" />
            </div>
            <div className="font-medium text-sm text-gray-800">{title}</div>
            <div className="text-xs text-gray-400 mt-1">{desc}</div>
          </div>
        ))}
      </div>

      {/* family list */}
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-[#FFF8F0]">
          <h2 className="font-bold text-[#5C2E00] text-lg">我的家族</h2>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#8B4513] text-white rounded-lg text-sm hover:bg-[#5C2E00] transition-colors"
          >
            <Plus size={16} /> 新建家族
          </button>
        </div>

        {families.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-3">🌱</div>
            <p className="text-gray-400">还没有家族记录</p>
            <p className="text-sm text-gray-300 mt-1">点击"新建家族"开始记录</p>
          </div>
        ) : (
          <div className="divide-y divide-amber-50">
            {families.map(f => (
              <div
                key={f.id}
                className={`flex items-center justify-between px-6 py-4 hover:bg-amber-50/50 transition-colors ${f.id === currentFamilyId ? 'bg-amber-50' : ''}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-[#8B4513] rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {f.name?.[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-800 flex items-center gap-2">
                      {f.name}
                      {f.id === currentFamilyId && <span className="text-xs bg-[#8B4513] text-white px-1.5 py-0.5 rounded">当前</span>}
                    </div>
                    {f.description && <div className="text-xs text-gray-400 truncate">{f.description}</div>}
                    <div className="text-xs text-gray-300 mt-0.5">创建于 {new Date(f.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => { setCurrentFamily(f.id); navigate('/tree') }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#8B4513] text-white rounded text-xs hover:bg-[#5C2E00] transition-colors"
                  >
                    进入 <ArrowRight size={12} />
                  </button>
                  <button
                    onClick={() => { if (confirm(`确认删除 "${f.name}"？此操作不可撤销。`)) deleteFamily(f.id) }}
                    className="text-red-300 hover:text-red-500 p-1.5 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target===e.currentTarget && setShowCreate(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md fade-in">
            <div className="px-6 py-4 border-b border-amber-100 bg-[#FFF8F0] rounded-t-xl">
              <h3 className="font-bold text-[#5C2E00] text-lg">新建家族</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">家族名称 *</label>
                <input
                  className="w-full border border-amber-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#8B4513]"
                  placeholder="如：张氏家族、李家大院..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">简介（可选）</label>
                <textarea
                  className="w-full border border-amber-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#8B4513]"
                  placeholder="家族来源、发源地..."
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-amber-100">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded">取消</button>
              <button onClick={handleCreate} className="px-6 py-2 bg-[#8B4513] text-white text-sm rounded hover:bg-[#5C2E00] font-medium">创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
