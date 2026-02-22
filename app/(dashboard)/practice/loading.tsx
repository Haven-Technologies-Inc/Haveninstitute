import { Card } from '@/components/ui/card';

export default function PracticeLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="h-10 w-10 bg-muted rounded-lg mb-4" />
            <div className="h-5 w-32 bg-muted rounded mb-2" />
            <div className="h-4 w-full bg-muted rounded" />
          </Card>
        ))}
      </div>
    </div>
  );
}
