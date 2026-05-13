import { useState } from 'react'
import { X, User, Calendar, MapPin, BookOpen, Link2, Upload } from 'lucide-react'
import { useFamilyStore } from '../store/familyStore'

const EMPTY = {
  name: '', namePinyin: '', gender: 'male', birthYear: '', birthMonth: '', birthDay: '',
  deathYear: '', deathMonth: '', deathDay: '', isAlive: true,
  birthPlace: '', currentPlace: '', occupation: '', education: '',
  phone: '', email: '', notes: '', generation: 1,
  fatherId: null, motherId: null, spouseId: null,
  photo: null,
}

export default function PersonForm({ initial = {}, onSave, onClose, editId = null }) {
  const { getCurrentPersons, addPerson, updatePerson } = useFamilyStore()
  const [form, setForm] = useState({ ...EMPTY, ...initial })
  const [tab, setTab] = useState('basic')
  const [photoPreview, setPhotoPreview] = useState(initial.photo || null)

  const persons = getCurrentPersons()
  const others = persons.filter(p => p.id !== editId)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      set('photo', ev.target.result)
      setPhotoPreview(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editId) {
      updatePerson(editId, form)
    } else {
      addPerson(form)
    }
    onSave?.()
    onClose?.()
  }

  const inputCls = 'w-full border border-amber-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#8B4513] bg-white'
  const labelCls = 'text-xs text-gray-500 mb-1 block'

  const tabs = [
    { id: 'basic', label: '基本信息' },
    { id: 'dates', label: '生卒信息' },
    { id: 'location', label: '地址职业' },
    { id: 'relations', label: '家庭关系' },
    { id: 'contact', label: '联系方式' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col fade-in">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-[#FFF8F0] rounded-t-xl">
          <h2 className="text-lg font-bold text-[#5C2E00] flex items-center gap-2">
            <User size={18} /> {editId ? '编辑成员' : '添加成员'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* tabs */}
        <div className="flex border-b border-amber-100 bg-amber-50/50">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.id ? 'border-b-2 border-[#8B4513] text-[#8B4513]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4">
          {/* basic */}
          {tab === 'basic' && (
            <div className="space-y-4">
              <div className="flex gap-4">
                {/* photo upload */}
                <div className="shrink-0">
                  <label className={labelCls}>照片</label>
                  <label className="cursor-pointer block">
                    <div className="w-24 h-28 border-2 border-dashed border-amber-300 rounded-lg flex flex-col items-center justify-center bg-amber-50 hover:bg-amber-100 transition-colors overflow-hidden">
                      {photoPreview ? (
                        <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Upload size={20} className="text-amber-400 mb-1" />
                          <span className="text-xs text-amber-500">上传照片</span>
                        </>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                  </label>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className={labelCls}>姓名 *</label>
                    <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} required placeholder="请输入姓名" />
                  </div>
                  <div>
                    <label className={labelCls}>拼音/英文名</label>
                    <input className={inputCls} value={form.namePinyin} onChange={e => set('namePinyin', e.target.value)} placeholder="如：Zhang Wei" />
                  </div>
                  <div>
                    <label className={labelCls}>性别</label>
                    <div className="flex gap-3">
                      {[['male','男'],['female','女'],['unknown','不详']].map(([v,l]) => (
                        <label key={v} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" name="gender" value={v} checked={form.gender===v} onChange={() => set('gender', v)} className="text-[#8B4513]" />
                          <span className="text-sm">{l}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>世代</label>
                  <input type="number" className={inputCls} value={form.generation} min={1} onChange={e => set('generation', parseInt(e.target.value)||1)} />
                </div>
                <div>
                  <label className={labelCls}>字辈/行辈</label>
                  <input className={inputCls} value={form.generationName||''} onChange={e => set('generationName', e.target.value)} placeholder="如：仁义礼智信..." />
                </div>
              </div>
              <div>
                <label className={labelCls}>备注</label>
                <textarea className={inputCls} value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="其他说明、历史记录..." />
              </div>
            </div>
          )}

          {/* dates */}
          {tab === 'dates' && (
            <div className="space-y-5">
              <div>
                <label className={labelCls + ' font-medium text-gray-700'}>出生日期</label>
                <div className="grid grid-cols-3 gap-2">
                  <div><label className={labelCls}>年</label><input type="number" className={inputCls} value={form.birthYear} onChange={e => set('birthYear', e.target.value)} placeholder="如 1950" /></div>
                  <div><label className={labelCls}>月</label><input type="number" className={inputCls} value={form.birthMonth} min={1} max={12} onChange={e => set('birthMonth', e.target.value)} placeholder="1-12" /></div>
                  <div><label className={labelCls}>日</label><input type="number" className={inputCls} value={form.birthDay} min={1} max={31} onChange={e => set('birthDay', e.target.value)} placeholder="1-31" /></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isAlive" checked={form.isAlive} onChange={e => set('isAlive', e.target.checked)} className="text-[#8B4513]" />
                <label htmlFor="isAlive" className="text-sm cursor-pointer">健在</label>
              </div>
              {!form.isAlive && (
                <div>
                  <label className={labelCls + ' font-medium text-gray-700'}>逝世日期</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div><label className={labelCls}>年</label><input type="number" className={inputCls} value={form.deathYear} onChange={e => set('deathYear', e.target.value)} placeholder="如 2020" /></div>
                    <div><label className={labelCls}>月</label><input type="number" className={inputCls} value={form.deathMonth} min={1} max={12} onChange={e => set('deathMonth', e.target.value)} /></div>
                    <div><label className={labelCls}>日</label><input type="number" className={inputCls} value={form.deathDay} min={1} max={31} onChange={e => set('deathDay', e.target.value)} /></div>
                  </div>
                </div>
              )}
              <div>
                <label className={labelCls}>农历/阳历说明</label>
                <input className={inputCls} value={form.calendarNote||''} onChange={e => set('calendarNote', e.target.value)} placeholder="如：农历庚午年正月初一" />
              </div>
            </div>
          )}

          {/* location & occupation */}
          {tab === 'location' && (
            <div className="space-y-3">
              <div>
                <label className={labelCls}>出生地</label>
                <input className={inputCls} value={form.birthPlace} onChange={e => set('birthPlace', e.target.value)} placeholder="省市县..." />
              </div>
              <div>
                <label className={labelCls}>现居地</label>
                <input className={inputCls} value={form.currentPlace} onChange={e => set('currentPlace', e.target.value)} placeholder="省市县..." />
              </div>
              <div>
                <label className={labelCls}>职业</label>
                <input className={inputCls} value={form.occupation} onChange={e => set('occupation', e.target.value)} placeholder="如：农民、工程师..." />
              </div>
              <div>
                <label className={labelCls}>学历</label>
                <select className={inputCls} value={form.education} onChange={e => set('education', e.target.value)}>
                  {['','不详','私塾','小学','初中','高中/中专','大专','本科','硕士','博士'].map(v => (
                    <option key={v} value={v}>{v || '请选择'}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* relations */}
          {tab === 'relations' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 bg-amber-50 px-3 py-2 rounded">选择家庭关系以构建家谱树结构</p>
              {[['fatherId','父亲'],['motherId','母亲'],['spouseId','配偶']].map(([key, label]) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <select className={inputCls} value={form[key]||''} onChange={e => set(key, e.target.value||null)}>
                    <option value="">-- 未设置 --</option>
                    {others.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}{p.birthYear ? ` (${p.birthYear})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* contact */}
          {tab === 'contact' && (
            <div className="space-y-3">
              <div>
                <label className={labelCls}>手机号</label>
                <input type="tel" className={inputCls} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="138..." />
              </div>
              <div>
                <label className={labelCls}>邮箱</label>
                <input type="email" className={inputCls} value={form.email} onChange={e => set('email', e.target.value)} placeholder="name@example.com" />
              </div>
              <div>
                <label className={labelCls}>微信号</label>
                <input className={inputCls} value={form.wechat||''} onChange={e => set('wechat', e.target.value)} placeholder="微信号..." />
              </div>
            </div>
          )}
        </form>

        {/* footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-amber-100 bg-amber-50/50 rounded-b-xl">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">
            取消
          </button>
          <button onClick={handleSubmit} className="px-6 py-2 bg-[#8B4513] text-white text-sm rounded hover:bg-[#5C2E00] transition-colors font-medium">
            {editId ? '保存修改' : '添加成员'}
          </button>
        </div>
      </div>
    </div>
  )
}
