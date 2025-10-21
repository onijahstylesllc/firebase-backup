
'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { AiUsageChart } from '@/components/dashboard/ai-usage-chart';
import { getUsageData } from '@/lib/usage-data';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { UsageData } from '@/lib/usage-data';

const placeholderData: UsageData[] = [
  { label: 'January', credits: 186 },
  { label: 'February', credits: 305 },
  { label: 'March', credits: 237 },
  { label: 'April', credits: 73 },
  { label: 'May', credits: 209 },
  { label: 'June', credits: 214 },
];

export function AiUsage() {
  const { toast } = useToast();
  const [timeUnit, setTimeUnit] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setIsLoading(true);
      try {
        // The getUsageData function will need to be adapted for Supabase
        // This is a placeholder for the actual implementation
        const data = await getUsageData(supabase, user.uid, timeUnit);
        setUsageData(data);
      } catch (error: any) {
        console.error('Error fetching usage data:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to fetch usage data',
          description: error.message || 'An unexpected error occurred. Please try again later.',
        });
        setUsageData(placeholderData); // Fallback to placeholder data on error
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [timeUnit, toast]);

  const handleTabChange = (value: string) => {
    if (value === 'daily' || value === 'weekly' || value === 'monthly') {
      setTimeUnit(value as 'daily' | 'weekly' | 'monthly');
    }
  };

  const ChartToShow = () => {
    if (isLoading) {
      return <Skeleton className="h-64 w-full" />;
    }
    if (usageData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No usage data available for this period.</p>
        </div>
      );
    }
    return <AiUsageChart data={usageData} />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Usage</CardTitle>
        <CardDescription>
          Your AI credit usage. View by daily, weekly, or monthly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monthly" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          <TabsContent value="daily">
            <ChartToShow />
          </TabsContent>
          <TabsContent value="weekly">
            <ChartToShow />
          </TabsContent>
          <TabsContent value="monthly">
            <ChartToShow />
          </TabsContent>
          <TabsContent value="calendar">
            <div className="flex justify-center pt-4">
              <Calendar mode="single" className="rounded-md border" />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
