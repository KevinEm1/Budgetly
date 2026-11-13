
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

type ChartData = {
  name: string
  value: number
}

type BudgetChartProps = {
  chartData: ChartData[]
  categoryColors: Record<string, string>
}

export default function BudgetChart({
  chartData,
  categoryColors,
}: BudgetChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="55%"
          outerRadius={100}
          label
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.name}
              fill={
                categoryColors[entry.name] ??
                categoryColors.Other
              }
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) =>
            Number(value).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })
          }
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
