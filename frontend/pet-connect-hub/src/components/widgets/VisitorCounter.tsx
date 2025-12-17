import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { statsApi } from '@/services/api';

export function VisitorCounter() {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsApi.getSiteStats();
        if (response.success) {
          setCount(response.data.totalVisitors);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
      <Eye className="h-4 w-4 text-primary" />
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Total Visits</span>
        <span className="text-sm font-semibold text-foreground">
          {isLoading ? '...' : count.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
