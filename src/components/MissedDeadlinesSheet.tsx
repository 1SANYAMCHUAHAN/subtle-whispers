import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProductionItem } from './ProductionPlanner';
import { AlertTriangle, Calendar, TrendingDown } from 'lucide-react';

interface MissedDeadlinesSheetProps {
  items: ProductionItem[];
  onUpdateItem: (id: string, updates: Partial<ProductionItem>) => void;
}

export const MissedDeadlinesSheet: React.FC<MissedDeadlinesSheetProps> = ({
  items,
  onUpdateItem
}) => {
  const calculateProgress = (item: ProductionItem) => {
    const totalRequiredDays = Object.values(item.stages).reduce((sum, stage) => sum + stage.duration, 0);
    const completedDays = Object.entries(item.dailyStatus).filter(([_, dayStatus]) => dayStatus.status === 'Y').length;
    return totalRequiredDays > 0 ? (completedDays / totalRequiredDays) * 100 : 0;
  };

  const getDaysOverdue = (item: ProductionItem) => {
    const today = new Date().getDate();
    return Math.max(0, today - item.deadline);
  };

  const getDelayedDays = (item: ProductionItem) => {
    return Object.entries(item.dailyStatus).filter(([_, dayStatus]) => dayStatus.status === 'D').length;
  };

  const groupByMonth = (items: ProductionItem[]) => {
    const grouped = items.reduce((acc, item) => {
      const month = new Date().toLocaleString('default', { month: 'long' });
      if (!acc[month]) acc[month] = [];
      acc[month].push(item);
      return acc;
    }, {} as Record<string, ProductionItem[]>);
    return grouped;
  };

  const monthlyGroups = groupByMonth(items);

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-success mb-4">
            <Calendar className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Missed Deadlines</h3>
          <p className="text-muted-foreground text-center">
            Great job! All production items are on track or completed on time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(monthlyGroups).map(([month, monthItems]) => (
        <Card key={month}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {month} - Missed Deadlines ({monthItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Progress</TableHead>
                  <TableHead className="text-center">Deadline</TableHead>
                  <TableHead className="text-center">Days Overdue</TableHead>
                  <TableHead className="text-center">Delayed Days</TableHead>
                  <TableHead className="text-center">Priority</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-semibold text-sm">{item.productCode}</div>
                        <div className="text-xs text-muted-foreground">{item.productName}</div>
                        <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
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
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        Day {item.deadline}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="destructive" className="text-xs">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        {getDaysOverdue(item)} days
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="warning" className="text-xs">
                        {getDelayedDays(item)} delayed
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {item.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-1">
                        {calculateProgress(item) === 100 ? (
                          <Badge variant="success" className="text-xs">Completed Late</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">In Progress</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};