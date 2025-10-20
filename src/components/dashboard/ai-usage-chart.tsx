'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

const chartData = [
  { month: 'January', credits: 186 },
  { month: 'February', credits: 305 },
  { month: 'March', credits: 237 },
  { month: 'April', credits: 73 },
  { month: 'May', credits: 209 },
  { month: 'June', credits: 214 },
];

const chartConfig = {
  credits: {
    label: 'AI Credits',
    color: 'hsl(var(--primary))',
  },
};

export function AiUsageChart() {
  return (
    <ChartContainer config={chartConfig} className="h-64">
      <BarChart data={chartData} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="credits" fill="var(--color-credits)" radius={8} />
      </BarChart>
    </ChartContainer>
  );
}
