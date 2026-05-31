'use client'

import { formatNumber } from '@/app/lib/utils'
import {
  AreaChart as AreaChartPlugin,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelProps,
} from 'recharts'

interface AreaChartProps {
  data: { name: string; Revenue: number }[]
  areaChartTitle: string
}

export default function AreaChart({ data, areaChartTitle }: AreaChartProps) {
  const renderLabel = ({ x, y, value }: LabelProps) => {
    if (typeof x !== 'number' || typeof y !== 'number' || value == null) {
      return null
    }

    return (
      <text
        x={x}
        y={y - 10}
        fill='#c97c2d'
        fontSize={16}
        // fontWeight={400}
        textAnchor='middle'
      >
        {value}
      </text>
    )
  }

  return (
    <AreaChartPlugin
      title={areaChartTitle}
      style={{
        width: '100%',
        height: '100%',
        // maxWidth: '700px',
        // maxHeight: '70vh',
        aspectRatio: 1.618,
      }}
      responsive
      data={data}
      margin={{
        top: 40,
        right: 20,
        left: 20,
        bottom: 20,
      }}
    >
      {/* Define the Gradient */}
      <defs>
        <linearGradient id='gradient' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor='#1592b4' stopOpacity={1} />
          <stop offset='100%' stopColor='#1592b4' stopOpacity={0.05} />
        </linearGradient>
      </defs>

      <CartesianGrid strokeDasharray='3 3' />
      <XAxis
        dataKey='name'
        tick={{ fontSize: 14, fill: 'var(--color-dashboard-text-2)' }}
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        width='auto'
        // tick={{ fontSize: 14, fill: '#6bbbcf' }}
        // tick={false}
        hide={true}
        axisLine={false}
        tickLine={false}
      />
      <Tooltip
        // contentStyle={{
        //   backgroundColor: '#2f6f95',
        //   borderRadius: '8px',
        //   border: 'none',
        //   boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        // }}
        labelStyle={{ color: '#2f6f95', fontSize: 20 }}
        itemStyle={{ color: '#c97c2d', fontSize: 20 }}
        formatter={(value) => [`$${formatNumber(value as number)}`, 'Revenue']}
      />
      <Area
        type='natural'
        dataKey='Revenue'
        label={renderLabel}
        stroke='#f2b84b'
        // fill='#6bbbcf'
        fill='url(#gradient)'
      />
    </AreaChartPlugin>
  )
}
