import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { CardTitle } from '@/components/ui/card';

interface ProductionCalendarHeaderProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

const stageColors = {
  raised: 'bg-blue-500',
  preProduction: 'bg-orange-500',
  production: 'bg-green-500',
  packaging: 'bg-purple-500'
};

export const ProductionCalendarHeader: React.FC<ProductionCalendarHeaderProps> = ({
  currentMonth,
  onMonthChange
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    onMonthChange(newDate);
  };

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Production Schedule
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-lg font-semibold min-w-[200px] text-center">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">Stages:</span>
          {Object.entries(stageColors).map(([stage, color]) => (
            <Badge key={stage} variant="outline" className="gap-2">
              <div className={`w-3 h-3 rounded ${color}`} />
              {stage === 'preProduction' ? 'Pre Production' : 
               stage.charAt(0).toUpperCase() + stage.slice(1)}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};