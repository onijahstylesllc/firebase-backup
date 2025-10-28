
import { SupabaseClient } from '@supabase/supabase-js';

interface UsageData {
  label: string;
  credits: number;
}

async function getUsageData(supabase: SupabaseClient, userId: string, timeUnit: 'daily' | 'weekly' | 'monthly'): Promise<UsageData[]> {
  const now = new Date();
  const usageData: { [key: string]: number } = {};

  let startDate: Date;
  if (timeUnit === 'daily') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
  } else if (timeUnit === 'weekly') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  } else { // monthly
    startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  }

  const { data, error } = await supabase
    .from('usage')
    .select('created_at, credits_used')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString());

  if (error) {
    console.error('Error fetching usage data:', error);
    throw error;
  }

  if (data) {
    data.forEach(item => {
      const timestamp = new Date(item.created_at);
      const credits = item.credits_used;

      let key: string;
      if (timeUnit === 'daily') {
        key = timestamp.toLocaleDateString();
      } else if (timeUnit === 'weekly') {
        const weekStart = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate() - timestamp.getDay());
        key = weekStart.toLocaleDateString();
      } else { // monthly
        key = timestamp.toLocaleString('default', { month: 'long' });
      }

      if (usageData[key]) {
        usageData[key] += credits;
      } else {
        usageData[key] = credits;
      }
    });
  }

  return Object.entries(usageData).map(([label, credits]) => ({ label, credits }));
}

export { getUsageData, type UsageData };
