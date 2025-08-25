import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ProductionItem } from './ProductionPlanner';
import { cn } from '@/lib/utils';

interface SKUDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productionItem: ProductionItem | null;
  currentMonth: Date;
}

const stageColors = {
  raised: 'bg-blue-300 border-blue-500 text-blue-900',
  preProduction: 'bg-orange-300 border-orange-500 text-orange-900',
  production: 'bg-green-300 border-green-500 text-green-900',
  packaging: 'bg-violet-300 border-violet-500 text-violet-900'
};

const stageLabels = {
  raised: 'Raised',
  preProduction: 'Pre Production',
  production: 'Production',
  packaging: 'Packaging'
};

export const SKUDetailView: React.FC<SKUDetailViewProps> = ({
  open,
  onOpenChange,
  productionItem,
  currentMonth
}) => {
  if (!productionItem) return null;

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isStageActive = (stage: { start: number; duration: number }, day: number) => {
    return day >= stage.start && day < stage.start + stage.duration;
  };

  const getStageForDay = (day: number) => {
    const stages = Object.entries(productionItem.stages);
    for (const [stageName, stage] of stages) {
      if (isStageActive(stage, day)) {
        return { name: stageName as keyof typeof stageColors, stage };
      }
    }
    return null;
  };

  const totalQuantity = productionItem.skus.reduce((sum, sku) => sum + sku.quantity, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <span>SKU Details - {productionItem.productCode}</span>
            <Badge variant="outline">{productionItem.skus.length} SKUs</Badge>
            <Badge variant="secondary">Total Qty: {totalQuantity}</Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Production Timeline Overview */}
        <div className="mb-6 p-4 bg-muted/30 rounded-lg">
          <h3 className="font-semibold mb-3">Production Timeline</h3>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(productionItem.stages).map(([stageName, stage]) => (
              <div key={stageName} className="text-center">
                <div className={cn("p-2 rounded-lg mb-2", stageColors[stageName as keyof typeof stageColors])}>
                  <div className="font-semibold text-sm">
                    {stageLabels[stageName as keyof typeof stageLabels]}
                  </div>
                  <div className="text-xs">
                    Days {stage.start}-{stage.start + stage.duration - 1}
                  </div>
                  <div className="text-xs">
                    ({stage.duration} days)
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            <strong>Duration:</strong> {new Date(productionItem.startDate).toLocaleDateString()} to {new Date(productionItem.endDate).toLocaleDateString()}
          </div>
        </div>

        {/* SKU Table with Date Chart */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-64 sticky left-0 bg-background border-r">SKU Details</TableHead>
                <TableHead className="w-20 text-center">Quantity</TableHead>
                {days.map(day => (
                  <TableHead key={day} className="w-8 text-center text-xs">
                    {day}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {productionItem.skus.map((sku, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  <TableCell className="font-medium sticky left-0 bg-background border-r">
                    <div className="space-y-1">
                      <div className="font-semibold text-sm">{sku.name}</div>
                      <div className="text-xs text-muted-foreground">
                        SKU #{index + 1}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {sku.quantity.toLocaleString()}
                  </TableCell>
                  {days.map(day => {
                    const stageInfo = getStageForDay(day);
                    const dayStatus = productionItem.dailyStatus[day];
                    
                    return (
                      <TableCell key={day} className="p-1">
                        {stageInfo ? (
                          <div
                            className={cn(
                              "h-6 w-6 rounded-md border-2 flex items-center justify-center text-xs font-bold shadow-sm mx-auto",
                              stageColors[stageInfo.name]
                            )}
                            title={`${stageLabels[stageInfo.name]} - Day ${day} - ${sku.name}`}
                          >
                            {dayStatus?.status || ''}
                          </div>
                        ) : (
                          <div className="h-6 w-6"></div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              
              {/* Summary Row */}
              <TableRow className="bg-muted/50 font-semibold border-t-2">
                <TableCell className="sticky left-0 bg-muted border-r">
                  <div className="font-bold">TOTAL ({productionItem.skus.length} SKUs)</div>
                </TableCell>
                <TableCell className="text-center font-bold">
                  {totalQuantity.toLocaleString()}
                </TableCell>
                {days.map(day => {
                  const stageInfo = getStageForDay(day);
                  const dayStatus = productionItem.dailyStatus[day];
                  
                  return (
                    <TableCell key={day} className="p-1">
                      {stageInfo ? (
                        <div
                          className={cn(
                            "h-6 w-6 rounded-md border-2 flex items-center justify-center text-xs font-bold shadow-sm mx-auto",
                            stageColors[stageInfo.name],
                            "ring-2 ring-primary/50"
                          )}
                          title={`${stageLabels[stageInfo.name]} - Day ${day} - All SKUs`}
                        >
                          {dayStatus?.status || ''}
                        </div>
                      ) : (
                        <div className="h-6 w-6"></div>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Legend */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <h4 className="font-semibold mb-2 text-sm">Legend:</h4>
          <div className="flex flex-wrap gap-4 text-xs">
            {Object.entries(stageColors).map(([stage, colorClass]) => (
              <div key={stage} className="flex items-center gap-2">
                <div className={cn("w-4 h-4 rounded border-2", colorClass)}></div>
                <span>{stageLabels[stage as keyof typeof stageLabels]}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Each SKU follows the same production timeline. Status markers: Y = Complete, N = Not Complete, D = Delayed
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};