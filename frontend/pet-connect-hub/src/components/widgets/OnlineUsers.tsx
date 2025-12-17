import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { statsApi } from '@/services/api';

export function OnlineUsers() {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsApi.getSiteStats();
        if (response.success) {
          setCount(response.data.onlineUsers);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setCount(prev => {
        const change = Math.floor(Math.random() * 10) - 5;
        return Math.max(100, prev + change);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-success/10 rounded-lg">
      <div className="relative">
        <Users className="h-4 w-4 text-success" />
        <span className="absolute -top-1 -right-1 h-2 w-2 bg-success rounded-full animate-pulse" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Online Now</span>
        <span className="text-sm font-semibold text-foreground">
          {isLoading ? '...' : count.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
