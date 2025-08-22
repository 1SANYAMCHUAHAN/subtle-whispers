import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductionItem } from './ProductionPlanner';

interface AddProductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: Omit<ProductionItem, 'id'>) => void;
}

export const AddProductionDialog: React.FC<AddProductionDialogProps> = ({
  open,
  onOpenChange,
  onAdd
}) => {
  const [formData, setFormData] = useState({
    productCode: '',
    productName: '',
    quantity: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    raisedStart: '',
    raisedDuration: '',
    preProductionStart: '',
    preProductionDuration: '',
    productionStart: '',
    productionDuration: '',
    packagingStart: '',
    packagingDuration: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem: Omit<ProductionItem, 'id'> = {
      productCode: formData.productCode,
      productName: formData.productName,
      quantity: parseInt(formData.quantity),
      priority: formData.priority,
      stages: {
        raised: {
          start: parseInt(formData.raisedStart) || 1,
          duration: parseInt(formData.raisedDuration) || 2,
          completed: false
        },
        preProduction: {
          start: parseInt(formData.preProductionStart) || 3,
          duration: parseInt(formData.preProductionDuration) || 3,
          completed: false
        },
        production: {
          start: parseInt(formData.productionStart) || 6,
          duration: parseInt(formData.productionDuration) || 5,
          completed: false
        },
        packaging: {
          start: parseInt(formData.packagingStart) || 11,
          duration: parseInt(formData.packagingDuration) || 3,
          completed: false
        }
      }
    };

    onAdd(newItem);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      productCode: '',
      productName: '',
      quantity: '',
      priority: 'medium',
      raisedStart: '',
      raisedDuration: '',
      preProductionStart: '',
      preProductionDuration: '',
      productionStart: '',
      productionDuration: '',
      packagingStart: '',
      packagingDuration: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Production Item</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productCode">Product Code *</Label>
              <Input
                id="productCode"
                required
                value={formData.productCode}
                onChange={(e) => setFormData(prev => ({ ...prev, productCode: e.target.value }))}
                placeholder="e.g., PROD123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                required
                value={formData.productName}
                onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                placeholder="e.g., Deluxe Series"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                required
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="e.g., 500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: 'low' | 'medium' | 'high') => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stage Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Production Stages</h3>
            
            {/* Raised Stage */}
            <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
              <div className="col-span-4">
                <h4 className="font-medium text-blue-600 mb-2">Raised Stage</h4>
              </div>
              <div className="space-y-2">
                <Label>Start Day</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.raisedStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, raisedStart: e.target.value }))}
                  placeholder="1"
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.raisedDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, raisedDuration: e.target.value }))}
                  placeholder="2"
                />
              </div>
            </div>

            {/* Pre Production Stage */}
            <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
              <div className="col-span-4">
                <h4 className="font-medium text-orange-600 mb-2">Pre Production Stage</h4>
              </div>
              <div className="space-y-2">
                <Label>Start Day</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.preProductionStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, preProductionStart: e.target.value }))}
                  placeholder="3"
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.preProductionDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, preProductionDuration: e.target.value }))}
                  placeholder="3"
                />
              </div>
            </div>

            {/* Production Stage */}
            <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
              <div className="col-span-4">
                <h4 className="font-medium text-green-600 mb-2">Production Stage</h4>
              </div>
              <div className="space-y-2">
                <Label>Start Day</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.productionStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, productionStart: e.target.value }))}
                  placeholder="6"
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.productionDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, productionDuration: e.target.value }))}
                  placeholder="5"
                />
              </div>
            </div>

            {/* Packaging Stage */}
            <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
              <div className="col-span-4">
                <h4 className="font-medium text-purple-600 mb-2">Packaging Stage</h4>
              </div>
              <div className="space-y-2">
                <Label>Start Day</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.packagingStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, packagingStart: e.target.value }))}
                  placeholder="11"
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.packagingDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, packagingDuration: e.target.value }))}
                  placeholder="3"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Production Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};