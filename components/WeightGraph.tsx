'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface WeightGraphProps {
  stats: any[]
}

export default function WeightGraph({ stats }: WeightGraphProps) {
  if (!stats || stats.length < 2) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        {stats?.length === 0 ? 'No data yet — log some stats to see your graph.' : 'Log at least 2 entries to see your graph.'}
      </div>
    )
  }

  // Sort oldest to newest for the chart
  const sorted = [...stats].filter(s => s.weight_lbs).sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime())

  if (sorted.length < 2) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        Log at least 2 weight entries to see your graph.
      </div>
    )
  }

  const data = sorted.map(s => ({
    date: new Date(s.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: parseFloat(s.weight_lbs),
  }))

  const weights = data.map(d => d.weight)
  const minWeight = Math.floor(Math.min(...weights) - 2)
  const maxWeight = Math.ceil(Math.max(...weights) + 2)
  const startWeight = data[0].weight
  const currentWeight = data[data.length - 1].weight
  const change = (currentWeight - startWeight).toFixed(1)
  const isDown = parseFloat(change) < 0

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm text-sm">
          <p className="text-slate-500">{label}</p>
          <p className="font-semibold text-slate-800">{payload[0].value} lbs</p>
        </div>
      )
    }
    return null
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-4 px-1">
        <div>
          <p className="text-xs text-slate-400">Current</p>
          <p className="font-bold text-slate-800 text-lg">{currentWeight} lbs</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Change</p>
          <p className={`font-bold text-lg ${isDown ? 'text-sky-600' : parseFloat(change) > 0 ? 'text-red-500' : 'text-slate-400'}`}>
            {parseFloat(change) > 0 ? '+' : ''}{change} lbs
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Entries</p>
          <p className="font-bold text-slate-800 text-lg">{sorted.length}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minWeight, maxWeight]}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={startWeight} stroke="#e2e8f0" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#0ea5e9"
            strokeWidth={2.5}
            dot={{ fill: '#0ea5e9', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#0284c7' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
