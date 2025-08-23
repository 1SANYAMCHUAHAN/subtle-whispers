import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ProductionItem } from './ProductionPlanner';
import { Edit3, CheckSquare } from 'lucide-react';

interface BulkUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ProductionItem[];
  onBulkUpdate: (updates: { itemIds: string[]; status: 'Y' | 'N' | 'D'; stage: string; days: number[] }) => void;
}

export const BulkUpdateDialog: React.FC<BulkUpdateDialogProps> = ({
  open,
  onOpenChange,
  items,
  onBulkUpdate
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'Y' | 'N' | 'D'>('Y');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const stages = [
    { value: 'raised', label: 'Raised' },
    { value: 'preProduction', label: 'Pre Production' },
    { value: 'production', label: 'Production' },
    { value: 'packaging', label: 'Packaging' }
  ];

  const statusOptions = [
    { value: 'Y' as const, label: 'Complete (Y)', color: 'success' },
    { value: 'N' as const, label: 'Incomplete (N)', color: 'destructive' },
    { value: 'D' as const, label: 'Delayed (D)', color: 'warning' }
  ];

  const resetForm = () => {
    setSelectedItems([]);
    setSelectedStage('');
    setSelectedStatus('Y');
    setSelectedDays([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedItems.length === 0 || !selectedStage || selectedDays.length === 0) {
      return;
    }

    onBulkUpdate({
      itemIds: selectedItems,
      status: selectedStatus,
      stage: selectedStage,
      days: selectedDays
    });

    onOpenChange(false);
    resetForm();
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleAllItems = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };

  const getStageDays = (stage: string) => {
    if (!selectedItems.length || !stage) return [];
    
    const firstItem = items.find(item => selectedItems.includes(item.id));
    if (!firstItem) return [];

    const stageInfo = firstItem.stages[stage as keyof typeof firstItem.stages];
    const days = [];
    for (let i = 0; i < stageInfo.duration; i++) {
      days.push(stageInfo.start + i);
    }
    return days;
  };

  const availableDays = getStageDays(selectedStage);

  const toggleDaySelection = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const toggleAllDays = () => {
    if (selectedDays.length === availableDays.length) {
      setSelectedDays([]);
    } else {
      setSelectedDays(availableDays);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Bulk Update Production Status
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Select Items to Update</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleAllItems}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                {selectedItems.length === items.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto border rounded-lg p-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => toggleItemSelection(item.id)}
                  />
                  <label htmlFor={item.id} className="text-sm cursor-pointer flex-1">
                    <div className="font-medium">{item.productCode}</div>
                    <div className="text-xs text-muted-foreground">{item.productName}</div>
                  </label>
                  <Badge variant="outline" className="text-xs">
                    {item.priority}
                  </Badge>
                </div>
              ))}
            </div>
            
            {selectedItems.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Stage Selection */}
          <div className="space-y-2">
            <Label htmlFor="stage">Select Stage</Label>
            <Select value={selectedStage} onValueChange={setSelectedStage} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a stage" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Day Selection */}
          {selectedStage && availableDays.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Select Days</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleAllDays}
                >
                  {selectedDays.length === availableDays.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              
              <div className="grid grid-cols-8 gap-2">
                {availableDays.map((day) => (
                  <Button
                    key={day}
                    type="button"
                    variant={selectedDays.includes(day) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDaySelection(day)}
                    className="h-8 w-8 p-0"
                  >
                    {day}
                  </Button>
                ))}
              </div>
              
              {selectedDays.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          )}

          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">Set Status</Label>
            <Select value={selectedStatus} onValueChange={(value: 'Y' | 'N' | 'D') => setSelectedStatus(value)} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Badge variant={option.color as any} className="text-xs">
                        {option.value}
                      </Badge>
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={selectedItems.length === 0 || !selectedStage || selectedDays.length === 0}
              className="bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-elegant"
            >
              Update {selectedItems.length} Item{selectedItems.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};