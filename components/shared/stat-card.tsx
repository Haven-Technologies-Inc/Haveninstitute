import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function StatCard({ label, value, change, icon: Icon, iconColor = 'text-primary', className }: StatCardProps) {
  return (
    <Card className={cn('border-0 shadow-sm', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className={cn('h-5 w-5', iconColor)} />
          {change && <Badge variant="secondary" className="text-[10px] font-normal">{change}</Badge>}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
