import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, Loader2, CheckCircle, AlertCircle, X, RotateCcw, Wand2 } from 'lucide-react'
import { useFamilyStore } from '../store/familyStore'
import PersonForm from './PersonForm'

// Claude API OCR (via Cloudflare Worker proxy)
async function ocrWithClaude(base64Image, mimeType) {
  const resp = await fetch('/api/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image, mimeType }),
  })
  if (!resp.ok) throw new Error('OCR API failed')
  return resp.json()
}

// Tesseract.js fallback
async function ocrWithTesseract(imageUrl) {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('chi_sim+eng', 1, {
    logger: () => {},
  })
  const { data } = await worker.recognize(imageUrl)
  await worker.terminate()
  return data.text
}

function parseOcrText(text) {
  const result = {}
  const patterns = [
    { keys: ['name', '姓名'], regex: /姓名[：:]\s*([^\s\n]{2,6})/i },
    { keys: ['gender', '性别'], regex: /性别[：:]\s*(男|女)/ },
    { keys: ['birthYear', '出生年'], regex: /(?:出生|生于)[：:\s]*(\d{4})/ },
    { keys: ['birthPlace', '籍贯'], regex: /籍贯[：:]\s*([^\n]{2,20})/ },
    { keys: ['occupation', '职业'], regex: /职业[：:]\s*([^\n]{2,10})/ },
  ]
  for (const { keys, regex } of patterns) {
    const m = text.match(regex)
    if (m) result[keys[0]] = m[1].trim()
  }
  return result
}

export default function OcrScanner({ onClose }) {
  const [step, setStep] = useState('upload') // upload | preview | processing | result | form
  const [image, setImage] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [ocrText, setOcrText] = useState('')
  const [parsed, setParsed] = useState({})
  const [error, setError] = useState('')
  const [useCamera, setUseCamera] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileRef = useRef(null)

  const handleFile = (file) => {
    if (!file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setImage({ base64: e.target.result.split(',')[1], mimeType: file.type })
      setImageUrl(e.target.result)
      setStep('preview')
    }
    reader.readAsDataURL(file)
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      setUseCamera(true)
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream
      }, 100)
    } catch {
      setError('无法访问摄像头，请检查权限')
    }
  }

  const capturePhoto = () => {
    const canvas = document.createElement('canvas')
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setImage({ base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' })
    setImageUrl(dataUrl)
    stopCamera()
    setStep('preview')
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setUseCamera(false)
  }

  const processOcr = async () => {
    setStep('processing')
    setError('')
    try {
      let parsedData = {}
      let text = ''
      try {
        const result = await ocrWithClaude(image.base64, image.mimeType)
        parsedData = result.person || {}
        text = result.rawText || ''
      } catch {
        text = await ocrWithTesseract(imageUrl)
        parsedData = parseOcrText(text)
      }
      setOcrText(text)
      setParsed(parsedData)
      setStep('result')
    } catch (err) {
      setError('识别失败，请重试或手动输入')
      setStep('preview')
    }
  }

  const reset = () => {
    setStep('upload')
    setImage(null)
    setImageUrl(null)
    setOcrText('')
    setParsed({})
    setError('')
  }

  if (step === 'form') {
    return <PersonForm initial={{ ...parsed, photo: imageUrl }} onClose={onClose} onSave={onClose} />
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-[#FFF8F0] rounded-t-xl">
          <h2 className="text-lg font-bold text-[#5C2E00] flex items-center gap-2">
            <Camera size={18} /> 拍照/扫描录入
          </h2>
          <button onClick={() => { stopCamera(); onClose?.() }} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* upload step */}
          {step === 'upload' && !useCamera && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 text-center">上传族谱照片或扫描件，AI将自动识别人员信息</p>
              <div
                className="border-2 border-dashed border-amber-300 rounded-xl p-10 text-center cursor-pointer hover:bg-amber-50 transition-colors"
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
              >
                <Upload size={40} className="text-amber-400 mx-auto mb-3" />
                <p className="text-[#8B4513] font-medium">点击上传或拖拽图片</p>
                <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG、WebP 格式</p>
                <input ref={fileRef} type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} className="hidden" />
              </div>
              <button
                onClick={startCamera}
                className="w-full flex items-center justify-center gap-2 py-3 border border-[#8B4513] text-[#8B4513] rounded-lg hover:bg-amber-50 transition-colors"
              >
                <Camera size={18} /> 使用摄像头拍摄
              </button>
            </div>
          )}

          {/* camera */}
          {useCamera && (
            <div className="space-y-3">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-amber-400 opacity-50 pointer-events-none m-4 rounded" />
              </div>
              <div className="flex gap-2">
                <button onClick={stopCamera} className="flex-1 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 text-sm">取消</button>
                <button onClick={capturePhoto} className="flex-1 py-2 bg-[#8B4513] text-white rounded hover:bg-[#5C2E00] text-sm font-medium">拍照</button>
              </div>
            </div>
          )}

          {/* preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden border border-amber-200 max-h-64">
                <img src={imageUrl} alt="preview" className="w-full h-full object-contain bg-gray-50" />
              </div>
              <div className="flex gap-2">
                <button onClick={reset} className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 text-sm">
                  <RotateCcw size={15} /> 重新选择
                </button>
                <button onClick={processOcr} className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#8B4513] text-white rounded hover:bg-[#5C2E00] text-sm font-medium">
                  <Wand2 size={15} /> AI 智能识别
                </button>
              </div>
            </div>
          )}

          {/* processing */}
          {step === 'processing' && (
            <div className="text-center py-10">
              <Loader2 size={40} className="text-[#8B4513] animate-spin mx-auto mb-4" />
              <p className="text-[#8B4513] font-medium">AI 正在识别人员信息...</p>
              <p className="text-xs text-gray-400 mt-1">请稍候，通常需要 3-10 秒</p>
            </div>
          )}

          {/* result */}
          {step === 'result' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded text-sm">
                <CheckCircle size={16} /> 识别完成！请确认以下信息
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(parsed).filter(([,v]) => v).map(([k,v]) => (
                  <div key={k} className="bg-amber-50 rounded px-3 py-2">
                    <div className="text-xs text-gray-500">{k}</div>
                    <div className="text-sm font-medium text-gray-800">{v}</div>
                  </div>
                ))}
              </div>
              {ocrText && (
                <details className="text-xs text-gray-400">
                  <summary className="cursor-pointer hover:text-gray-600">查看原始识别文本</summary>
                  <pre className="mt-2 bg-gray-50 p-2 rounded overflow-auto max-h-24 whitespace-pre-wrap">{ocrText}</pre>
                </details>
              )}
              <div className="flex gap-2 pt-2">
                <button onClick={reset} className="flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 text-sm">
                  <RotateCcw size={14} /> 重来
                </button>
                <button onClick={() => setStep('form')} className="flex-1 py-2 bg-[#8B4513] text-white rounded hover:bg-[#5C2E00] text-sm font-medium">
                  确认并完善信息 →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
