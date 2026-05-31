'use client'

import { useWindowSizeContext } from '@/app/ctx/windowSizeContext'
import { PieChartDataWithColors } from '@/app/lib/definitions'
import { useState, useRef, useEffect } from 'react'
import {
  Pie,
  PieChart as PieChartPlugin,
  Sector,
  PieSectorDataItem,
  PieLabelRenderProps,
} from 'recharts'

interface PieChartProps {
  data: PieChartDataWithColors[]
  total: number
  centerTitle: string
  pieChartTitle: string
}

export default function PieChart({
  data,
  total,
  centerTitle,
  pieChartTitle,
}: PieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const hasFinishedFirstAnimation = useRef<boolean>(false)

  const { isMobileSize } = useWindowSizeContext()

  // (We use isMobileSizeOnClient to set local values instead of the isMobileSize directly from the useMobileSizeDetector(), because the useMobileSizeDetector() by default returns 1024 when on the Server Side, and when running on the Client side afterwards, it'll cause Server side and Client side mismatch issue. So we create the isMobileSizeOnClient and set it in a useEffect, which only runs on the Client, so no Server side and Client side mismatch issue.)
  const [isMobileSizeOnClient, setIsMobileSizeOnClient] = useState(false)

  useEffect(() => {
    setIsMobileSizeOnClient(isMobileSize)
  }, [isMobileSize])

  const myLabelDistance = isMobileSizeOnClient ? 1.5 : 3.3
  const myLabelFontSize = isMobileSizeOnClient ? 12 : 16
  const myLabelFontSize_Active = isMobileSizeOnClient ? 14 : 20
  const myLabelLineDistance = isMobileSizeOnClient ? 1 : 1.4
  const myHeight = isMobileSizeOnClient ? 200 : 300
  const myMargin = isMobileSizeOnClient ? 10 : 60
  const myCenterTitleDy = isMobileSizeOnClient ? -10 : -13
  const myCenterTitleFontSize = isMobileSizeOnClient ? 16 : 18
  const myCenterNumberDy = isMobileSizeOnClient ? 15 : 18
  const myCenterNumberFontSize = isMobileSizeOnClient ? 20 : 23
  const myInnerRadius = isMobileSizeOnClient ? '48%' : '70%'
  const myOuterRadius = isMobileSizeOnClient ? '65%' : '90%'
  const myAdjustedOuterRange = isMobileSizeOnClient ? 3 : 5

  // Pie Sectors - original or active
  const renderActiveShape = ({
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    index,
  }: PieSectorDataItem & { index?: number }) => {

    const isActive = index === activeIndex
    const adjustedOuter = isActive
      ? (outerRadius ?? 0) + myAdjustedOuterRange
      : outerRadius
    const filterStyle = isActive ? 'brightness(1.2)' : 'brightness(1)'

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={adjustedOuter}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          //   opacity={adjustedOpa}
          stroke='#fff'
          strokeWidth={1}
          style={{ filter: filterStyle }}
        />

        {isActive && (
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={adjustedOuter}
            outerRadius={adjustedOuter}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
            // opacity={adjustedOpa}
            stroke='#fff'
            strokeWidth={1}
            style={{ filter: filterStyle }}
          />
        )}
      </g>
    )
  }

  // Labels
  const renderLabel = ({
    name,
    value,
    percent,
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    index,
    fill,
  }: PieLabelRenderProps) => {
    const isActive = index === activeIndex

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * myLabelDistance
    const x = cx + radius * Math.cos(-midAngle! * RADIAN)
    const y = cy + radius * Math.sin(-midAngle! * RADIAN)

    return (
      <text
        x={x}
        y={y}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline='central'
        fontSize={isActive ? myLabelFontSize_Active : myLabelFontSize}
        fontWeight={600}
        fill={fill}
        // style={{ cursor: 'pointer', pointerEvents: 'all' }}
        onMouseEnter={() => setActiveIndex(index)}
        onMouseLeave={() => setActiveIndex(null)}
      >
        {`${name} ${(percent! * 100).toFixed(0)}% (${value})`}
      </text>
    )
  }

  // Label Lines
  const renderLabelLine = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    stroke,
    fill,
  }: PieLabelRenderProps) => {
    const RADIAN = Math.PI / 180
    const sx = cx + outerRadius * Math.cos(-midAngle! * RADIAN)
    const sy = cy + outerRadius * Math.sin(-midAngle! * RADIAN)
    const labelDistance = outerRadius * myLabelLineDistance
    const ex = cx + labelDistance * Math.cos(-midAngle! * RADIAN)
    const ey = cy + labelDistance * Math.sin(-midAngle! * RADIAN)

    return <path d={`M${sx},${sy}L${ex},${ey}`} stroke={stroke} fill={fill} />
  }

  return (
    <PieChartPlugin
      title={pieChartTitle}
      responsive
      width={600}
      height={myHeight}
      margin={{
        top: myMargin,
        right: myMargin,
        bottom: myMargin,
        left: myMargin,
      }}
      // style={{
      // height: '400',
      // width: '140%',
      // flex: '1 1 200px',
      // aspectRatio: 1,
      // }}
    >
      {/* Center total */}
      <text
        x='50%'
        y='50%'
        dy={myCenterTitleDy}
        textAnchor='middle'
        dominantBaseline='middle'
        fontSize={myCenterTitleFontSize}
        fill='#999'
      >
        {centerTitle}
      </text>

      <text
        x='50%'
        y='50%'
        dy={myCenterNumberDy}
        textAnchor='middle'
        dominantBaseline='middle'
        fontSize={myCenterNumberFontSize}
        fontWeight={600}
        fill='var(--color-dashboard-text-1)'
      >
        {total}
      </text>

      {/* Pie */}
      <Pie
        data={data}
        dataKey='value'
        cx='50%'
        cy='50%'
        innerRadius={myInnerRadius}
        outerRadius={myOuterRadius}
        startAngle={90}
        endAngle={-270}
        activeIndex={activeIndex !== null ? activeIndex : undefined}
        isAnimationActive={
          !hasFinishedFirstAnimation.current && activeIndex === null
        }
        onAnimationEnd={() => {
          hasFinishedFirstAnimation.current = true
        }}
        shape={renderActiveShape}
        label={renderLabel}
        labelLine={renderLabelLine}
        onMouseEnter={(_, index) => setActiveIndex(index)}
        onMouseLeave={() => setActiveIndex(null)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...({} as any)}
      />
    </PieChartPlugin>
  )
}
