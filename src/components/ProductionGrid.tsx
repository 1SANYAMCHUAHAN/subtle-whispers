import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ProductionItem, DayStatus } from './ProductionPlanner';
import { cn } from '@/lib/utils';
import { Edit, Calendar } from 'lucide-react';

interface ProductionGridProps {
  items: ProductionItem[];
  currentMonth: Date;
  onUpdateItem: (id: string, updates: Partial<ProductionItem>) => void;
  onUpdateDayStatus: (itemId: string, day: number, status: 'Y' | 'N' | 'D' | null, stage: string | null) => void;
  onEditItem: (item: ProductionItem) => void;
}

const stageColors = {
  raised: 'bg-primary/20 border-primary/30',
  preProduction: 'bg-warning/20 border-warning/30',
  production: 'bg-success/20 border-success/30',
  packaging: 'bg-accent/20 border-accent/30'
};

const statusColors = {
  Y: 'bg-success text-success-foreground',
  N: 'bg-destructive text-destructive-foreground',
  D: 'bg-warning text-warning-foreground'
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
  onUpdateItem,
  onUpdateDayStatus,
  onEditItem
}) => {
  const [editingCell, setEditingCell] = useState<{itemId: string, day: number} | null>(null);
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
    const totalRequiredDays = Object.values(item.stages).reduce((sum, stage) => sum + stage.duration, 0);
    const completedDays = Object.entries(item.dailyStatus).filter(([_, dayStatus]) => dayStatus.status === 'Y').length;
    return totalRequiredDays > 0 ? (completedDays / totalRequiredDays) * 100 : 0;
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

  const handleCellClick = (itemId: string, day: number) => {
    setEditingCell({ itemId, day });
  };

  const handleStatusChange = (itemId: string, day: number, status: 'Y' | 'N' | 'D') => {
    const item = items.find(i => i.id === itemId);
    const stageInfo = item ? getStageForDay(item, day) : null;
    onUpdateDayStatus(itemId, day, status, stageInfo?.name || null);
    setEditingCell(null);
  };

  const handleCellKeyDown = (e: React.KeyboardEvent, itemId: string, day: number) => {
    if (e.key === 'y' || e.key === 'Y') {
      e.preventDefault();
      handleStatusChange(itemId, day, 'Y');
    } else if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      handleStatusChange(itemId, day, 'N');
    } else if (e.key === 'd' || e.key === 'D') {
      e.preventDefault();
      handleStatusChange(itemId, day, 'D');
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
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
            <TableHead className="w-20 text-center">Deadline</TableHead>
            <TableHead className="w-16 text-center">Actions</TableHead>
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
              <TableCell className="text-center">
                <Badge variant={item.deadline < new Date().getDate() ? "destructive" : "outline"} className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {item.deadline}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditItem(item)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
              {days.map(day => {
                const stageInfo = getStageForDay(item, day);
                const dayStatus = item.dailyStatus[day];
                const isEditing = editingCell?.itemId === item.id && editingCell?.day === day;
                
                return (
                  <TableCell key={day} className="p-1">
                    {stageInfo && (
                      <div
                        className={cn(
                          "h-6 rounded border cursor-pointer transition-all hover:opacity-80 relative flex items-center justify-center text-xs font-bold",
                          stageColors[stageInfo.name],
                          dayStatus?.status && statusColors[dayStatus.status],
                          isEditing && "ring-2 ring-primary"
                        )}
                        title={`${stageLabels[stageInfo.name]} - Day ${day} - Press Y/N/D`}
                        onClick={() => handleCellClick(item.id, day)}
                        onKeyDown={(e) => handleCellKeyDown(e, item.id, day)}
                        tabIndex={0}
                      >
                        {dayStatus?.status || ''}
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