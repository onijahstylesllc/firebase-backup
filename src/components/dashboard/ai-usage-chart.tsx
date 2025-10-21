'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

const chartConfig = {
  credits: {
    label: 'AI Credits',
    color: 'hsl(var(--primary))',
  },
};

export function AiUsageChart({ data }: { data: { label: string, credits: number }[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-64">
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
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
