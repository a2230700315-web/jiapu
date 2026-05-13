import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { useFamilyStore } from '../store/familyStore'
import { ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react'

const NODE_W = 120
const NODE_H = 64
const GENDER_COLOR = { male: '#3B82F6', female: '#EC4899', unknown: '#9CA3AF' }

function buildTree(persons) {
  if (!persons.length) return { nodes: [], links: [] }

  // Build adjacency — child links (parent->child)
  const map = Object.fromEntries(persons.map(p => [p.id, p]))
  const nodes = persons.map(p => ({ ...p }))
  const links = []

  for (const p of persons) {
    if (p.fatherId && map[p.fatherId]) {
      links.push({ source: p.fatherId, target: p.id, type: 'parent' })
    } else if (p.motherId && map[p.motherId]) {
      links.push({ source: p.motherId, target: p.id, type: 'parent' })
    }
    if (p.spouseId && map[p.spouseId] && p.id < p.spouseId) {
      links.push({ source: p.id, target: p.spouseId, type: 'spouse' })
    }
  }

  return { nodes, links }
}

export default function FamilyTree({ onSelectPerson }) {
  const svgRef = useRef(null)
  const { getCurrentPersons } = useFamilyStore()
  const persons = getCurrentPersons()
  const [selected, setSelected] = useState(null)

  const render = useCallback(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth || 900
    const height = svgRef.current.clientHeight || 600

    const zoom = d3.zoom().scaleExtent([0.1, 3]).on('zoom', (e) => {
      g.attr('transform', e.transform)
    })
    svg.call(zoom)

    const g = svg.append('g')

    const { nodes, links } = buildTree(persons)
    if (!nodes.length) return

    // stratify by generation
    const genMap = {}
    nodes.forEach(n => {
      const gen = n.generation || 1
      if (!genMap[gen]) genMap[gen] = []
      genMap[gen].push(n)
    })
    const gens = Object.keys(genMap).map(Number).sort((a,b) => a-b)

    const genY = {}
    gens.forEach((gen, i) => { genY[gen] = i * (NODE_H + 80) + 60 })

    nodes.forEach(n => {
      const gen = n.generation || 1
      const siblings = genMap[gen]
      const idx = siblings.indexOf(n)
      n.x = (idx - (siblings.length - 1) / 2) * (NODE_W + 40)
      n.y = genY[gen]
    })

    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))

    // draw links
    links.forEach(link => {
      const s = nodeMap[link.source]
      const t = nodeMap[link.target]
      if (!s || !t) return
      if (link.type === 'spouse') {
        g.append('line')
          .attr('x1', s.x + NODE_W/2).attr('y1', s.y + NODE_H/2)
          .attr('x2', t.x + NODE_W/2).attr('y2', t.y + NODE_H/2)
          .attr('stroke', '#F59E0B').attr('stroke-width', 2)
          .attr('stroke-dasharray', '5,3')
      } else {
        const sx = s.x + NODE_W/2, sy = s.y + NODE_H
        const tx = t.x + NODE_W/2, ty = t.y
        const my = (sy + ty) / 2
        g.append('path')
          .attr('d', `M${sx},${sy} C${sx},${my} ${tx},${my} ${tx},${ty}`)
          .attr('class', 'tree-line')
          .attr('stroke', '#8B4513').attr('stroke-width', 1.5).attr('fill', 'none')
      }
    })

    // draw nodes
    const nodeG = g.selectAll('.node').data(nodes).enter().append('g')
      .attr('class', 'person-node')
      .attr('transform', n => `translate(${n.x},${n.y})`)
      .style('cursor', 'pointer')
      .on('click', (_, d) => {
        setSelected(d.id)
        onSelectPerson?.(d)
      })

    nodeG.append('rect')
      .attr('width', NODE_W).attr('height', NODE_H)
      .attr('rx', 6)
      .attr('fill', n => n.isAlive === false ? '#FEE2E2' : '#FFF8F0')
      .attr('stroke', n => GENDER_COLOR[n.gender] || GENDER_COLOR.unknown)
      .attr('stroke-width', n => selected === n.id ? 3 : 1.5)

    // photo circle or initial
    nodeG.each(function(d) {
      const el = d3.select(this)
      if (d.photo) {
        const defs = svg.append('defs')
        const clipId = `clip-${d.id}`
        defs.append('clipPath').attr('id', clipId)
          .append('circle').attr('cx', 22).attr('cy', NODE_H/2).attr('r', 18)
        el.append('image')
          .attr('href', d.photo)
          .attr('x', 4).attr('y', NODE_H/2 - 18)
          .attr('width', 36).attr('height', 36)
          .attr('clip-path', `url(#${clipId})`)
      } else {
        el.append('circle')
          .attr('cx', 22).attr('cy', NODE_H/2).attr('r', 18)
          .attr('fill', GENDER_COLOR[d.gender] || GENDER_COLOR.unknown)
          .attr('opacity', 0.15)
        el.append('text')
          .attr('x', 22).attr('y', NODE_H/2 + 5)
          .attr('text-anchor', 'middle')
          .attr('font-size', 16)
          .attr('fill', GENDER_COLOR[d.gender] || GENDER_COLOR.unknown)
          .text(d.name?.[0] || '?')
      }
    })

    nodeG.append('text')
      .attr('x', 46).attr('y', NODE_H/2 - 6)
      .attr('font-size', 14).attr('font-weight', '600')
      .attr('fill', '#2c1810')
      .text(d => d.name?.slice(0, 6) || '未知')

    nodeG.append('text')
      .attr('x', 46).attr('y', NODE_H/2 + 10)
      .attr('font-size', 10).attr('fill', '#9CA3AF')
      .text(d => d.birthYear ? `${d.birthYear}${d.isAlive===false && d.deathYear ? '—'+d.deathYear : '—'}` : '')

    nodeG.append('text')
      .attr('x', 46).attr('y', NODE_H/2 + 22)
      .attr('font-size', 10).attr('fill', '#9CA3AF')
      .text(d => d.occupation?.slice(0, 8) || '')

    // generation labels on left
    gens.forEach(gen => {
      g.append('text')
        .attr('x', Math.min(...genMap[gen].map(n => n.x)) - 60)
        .attr('y', genY[gen] + NODE_H/2 + 4)
        .attr('font-size', 12).attr('fill', '#8B451366')
        .attr('text-anchor', 'middle')
        .text(`第${gen}代`)
    })

    // center view
    const bounds = g.node().getBBox()
    const scale = Math.min(0.9, Math.min(width / (bounds.width + 80), height / (bounds.height + 80)))
    const tx = (width - bounds.width * scale) / 2 - bounds.x * scale
    const ty = (height - bounds.height * scale) / 2 - bounds.y * scale
    svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale))
  }, [persons, selected, onSelectPerson])

  useEffect(() => { render() }, [render])

  const handleZoom = (factor) => {
    const svg = d3.select(svgRef.current)
    svg.transition().call(d3.zoom().scaleBy, factor)
  }

  const handleDownload = () => {
    const svgEl = svgRef.current
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svgEl)
    const blob = new Blob([svgStr], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = '家谱树.svg'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative w-full h-full bg-[#FDFAF5] rounded-xl border border-amber-200 overflow-hidden">
      {persons.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
          <div className="text-6xl mb-4">🌳</div>
          <p className="text-lg font-medium text-[#8B4513]">家谱树尚未建立</p>
          <p className="text-sm mt-1">请先添加家族成员</p>
        </div>
      ) : (
        <svg ref={svgRef} className="w-full h-full" />
      )}
      {/* controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        {[
          { icon: ZoomIn, action: () => handleZoom(1.3), tip: '放大' },
          { icon: ZoomOut, action: () => handleZoom(0.77), tip: '缩小' },
          { icon: Maximize2, action: render, tip: '适应屏幕' },
          { icon: Download, action: handleDownload, tip: '导出SVG' },
        ].map(({ icon: Icon, action, tip }) => (
          <button
            key={tip}
            onClick={action}
            title={tip}
            className="w-9 h-9 bg-white border border-amber-200 rounded-lg flex items-center justify-center text-[#8B4513] hover:bg-amber-50 shadow-sm transition-colors"
          >
            <Icon size={16} />
          </button>
        ))}
      </div>
    </div>
  )
}
