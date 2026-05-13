import { useState } from 'react'
import OcrScanner from '../components/OcrScanner'
import { Camera, FileText, Wand2, CheckCircle } from 'lucide-react'
import { useFamilyStore } from '../store/familyStore'

export default function ScanPage() {
  const [showScanner, setShowScanner] = useState(false)
  const { getCurrentFamily } = useFamilyStore()
  const family = getCurrentFamily()

  const steps = [
    { icon: Camera, title: '拍摄或上传', desc: '拍摄族谱原件照片，或上传扫描图片' },
    { icon: Wand2, title: 'AI 自动识别', desc: 'Claude AI 分析图片，提取人名、年份等信息' },
    { icon: FileText, title: '确认并完善', desc: '检查识别结果，补充或修正信息' },
    { icon: CheckCircle, title: '保存入档', desc: '一键保存到家族档案中' },
  ]

  if (!family) return (
    <div className="flex-1 flex items-center justify-center text-gray-400">
      <div className="text-center"><div className="text-5xl mb-3">🏠</div><p>请先在首页选择家族</p></div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">📸</div>
        <h1 className="text-2xl font-bold text-[#5C2E00]">拍照 / 扫描录入</h1>
        <p className="text-gray-500 mt-2">AI 智能识别老族谱，快速数字化</p>
      </div>

      {/* steps */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {steps.map((step, i) => (
          <div key={i} className="text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2 relative">
              <step.icon size={22} className="text-[#8B4513]" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#8B4513] text-white text-xs rounded-full flex items-center justify-center font-bold">{i+1}</div>
            </div>
            <div className="text-sm font-medium text-gray-700">{step.title}</div>
            <div className="text-xs text-gray-400 mt-1">{step.desc}</div>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="grid sm:grid-cols-2 gap-4">
        <button
          onClick={() => setShowScanner(true)}
          className="flex flex-col items-center gap-3 p-8 bg-[#8B4513] text-white rounded-2xl hover:bg-[#5C2E00] transition-colors shadow-lg"
        >
          <Camera size={36} />
          <span className="text-lg font-bold">立即拍照</span>
          <span className="text-sm opacity-75">调用摄像头，拍摄族谱原件</span>
        </button>
        <button
          onClick={() => setShowScanner(true)}
          className="flex flex-col items-center gap-3 p-8 bg-white border-2 border-[#8B4513] text-[#8B4513] rounded-2xl hover:bg-amber-50 transition-colors shadow-sm"
        >
          <FileText size={36} />
          <span className="text-lg font-bold">上传图片</span>
          <span className="text-sm opacity-75">上传已有的族谱照片/扫描件</span>
        </button>
      </div>

      {/* tips */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-[#8B4513] mb-2">📋 拍摄小贴士</h3>
        <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
          <li>保证光线充足，避免阴影遮挡文字</li>
          <li>保持镜头与页面平行，减少透视变形</li>
          <li>图片清晰度越高，识别效果越好</li>
          <li>支持繁简体中文、汉字识别</li>
          <li>识别后可手动修正错误内容</li>
        </ul>
      </div>

      {showScanner && <OcrScanner onClose={() => setShowScanner(false)} />}
    </div>
  )
}
