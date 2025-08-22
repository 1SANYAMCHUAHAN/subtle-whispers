import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProductionItem } from './ProductionPlanner';
import { cn } from '@/lib/utils';

interface ProductionGridProps {
  items: ProductionItem[];
  currentMonth: Date;
  onUpdateItem: (id: string, updates: Partial<ProductionItem>) => void;
}

const stageColors = {
  raised: 'bg-blue-500/20 border-blue-500/30',
  preProduction: 'bg-orange-500/20 border-orange-500/30',
  production: 'bg-green-500/20 border-green-500/30',
  packaging: 'bg-purple-500/20 border-purple-500/30'
};

const stageLabels = {
  raised: 'Raised',
  preProduction: 'Pre Production', 
  production: 'Production',
  packaging: 'Packaging'
};

export const ProductionGrid: React.FC<ProductionGridProps> = ({ 
  items, 
  currentMonth,
  onUpdateItem 
}) => {
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const calculateProgress = (item: ProductionItem) => {
    const totalStages = 4;
    const completedStages = Object.values(item.stages).filter(stage => stage.completed).length;
    return (completedStages / totalStages) * 100;
  };

  const isStageActive = (stage: { start: number; duration: number }, day: number) => {
    return day >= stage.start && day < stage.start + stage.duration;
  };

  const getStageForDay = (item: ProductionItem, day: number) => {
    const stages = Object.entries(item.stages);
    for (const [stageName, stage] of stages) {
      if (isStageActive(stage, day)) {
        return { name: stageName as keyof typeof stageColors, stage };
      }
    }
    return null;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-48 sticky left-0 bg-background border-r">Product</TableHead>
            <TableHead className="w-24 text-center">Progress</TableHead>
            <TableHead className="w-20 text-center">QTY</TableHead>
            <TableHead className="w-20 text-center">Priority</TableHead>
            {days.map(day => (
              <TableHead key={day} className="w-8 text-center text-xs">
                {day}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/50">
              <TableCell className="font-medium sticky left-0 bg-background border-r">
                <div className="space-y-1">
                  <div className="font-semibold text-sm">{item.productCode}</div>
                  <div className="text-xs text-muted-foreground">{item.productName}</div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="space-y-1">
                  <Progress value={calculateProgress(item)} className="h-2" />
                  <span className="text-xs text-muted-foreground">
                    {Math.round(calculateProgress(item))}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center font-medium">
                {item.quantity}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={getPriorityColor(item.priority)} className="text-xs">
                  {item.priority}
                </Badge>
              </TableCell>
              {days.map(day => {
                const stageInfo = getStageForDay(item, day);
                return (
                  <TableCell key={day} className="p-1">
                    {stageInfo && (
                      <div
                        className={cn(
                          "h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-all hover:opacity-80",
                          stageColors[stageInfo.name],
                          stageInfo.stage.completed && "bg-opacity-60 border-opacity-60"
                        )}
                        title={`${stageLabels[stageInfo.name]} - Day ${day}`}
                      >
                        {stageInfo.stage.completed && (
                          <div className="w-2 h-2 bg-green-600 rounded-full" />
                        )}
                      </div>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};