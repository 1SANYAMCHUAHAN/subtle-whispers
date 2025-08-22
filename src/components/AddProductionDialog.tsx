import React, { useState, useEffect } from 'react';
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
  editingItem?: ProductionItem | null;
  onSave?: (id: string, updates: Partial<ProductionItem>) => void;
  onEditClose?: () => void;
}

export const AddProductionDialog: React.FC<AddProductionDialogProps> = ({
  open,
  onOpenChange,
  onAdd,
  editingItem,
  onSave,
  onEditClose
}) => {
  const [formData, setFormData] = useState({
    productCode: '',
    productName: '',
    quantity: '',
    deadline: '30',
    priority: 'medium' as 'low' | 'medium' | 'high',
    raisedStart: '1',
    raisedDuration: '2',
    preProductionStart: '3',
    preProductionDuration: '3',
    productionStart: '6',
    productionDuration: '8',
    packagingStart: '14',
    packagingDuration: '3'
  });

  const isEditing = !!editingItem;

  useEffect(() => {
    if (editingItem) {
      setFormData({
        productCode: editingItem.productCode,
        productName: editingItem.productName,
        quantity: editingItem.quantity.toString(),
        deadline: editingItem.deadline.toString(),
        priority: editingItem.priority,
        raisedStart: editingItem.stages.raised.start.toString(),
        raisedDuration: editingItem.stages.raised.duration.toString(),
        preProductionStart: editingItem.stages.preProduction.start.toString(),
        preProductionDuration: editingItem.stages.preProduction.duration.toString(),
        productionStart: editingItem.stages.production.start.toString(),
        productionDuration: editingItem.stages.production.duration.toString(),
        packagingStart: editingItem.stages.packaging.start.toString(),
        packagingDuration: editingItem.stages.packaging.duration.toString(),
      });
    } else {
      resetForm();
    }
  }, [editingItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && editingItem && onSave) {
      const updates: Partial<ProductionItem> = {
        productCode: formData.productCode,
        productName: formData.productName,
        quantity: parseInt(formData.quantity),
        deadline: parseInt(formData.deadline),
        priority: formData.priority,
        stages: {
          raised: { 
            start: parseInt(formData.raisedStart), 
            duration: parseInt(formData.raisedDuration)
          },
          preProduction: { 
            start: parseInt(formData.preProductionStart), 
            duration: parseInt(formData.preProductionDuration)
          },
          production: { 
            start: parseInt(formData.productionStart), 
            duration: parseInt(formData.productionDuration)
          },
          packaging: { 
            start: parseInt(formData.packagingStart), 
            duration: parseInt(formData.packagingDuration)
          }
        }
      };
      onSave(editingItem.id, updates);
      onEditClose?.();
    } else {
      const newItem: Omit<ProductionItem, 'id'> = {
        productCode: formData.productCode,
        productName: formData.productName,
        quantity: parseInt(formData.quantity),
        deadline: parseInt(formData.deadline),
        priority: formData.priority,
        dailyStatus: {},
        stages: {
          raised: { 
            start: parseInt(formData.raisedStart), 
            duration: parseInt(formData.raisedDuration)
          },
          preProduction: { 
            start: parseInt(formData.preProductionStart), 
            duration: parseInt(formData.preProductionDuration)
          },
          production: { 
            start: parseInt(formData.productionStart), 
            duration: parseInt(formData.productionDuration)
          },
          packaging: { 
            start: parseInt(formData.packagingStart), 
            duration: parseInt(formData.packagingDuration)
          }
        }
      };

      onAdd(newItem);
    }
    
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      productCode: '',
      productName: '',
      quantity: '',
      deadline: '30',
      priority: 'medium',
      raisedStart: '1',
      raisedDuration: '2',
      preProductionStart: '3',
      preProductionDuration: '3',
      productionStart: '6',
      productionDuration: '8',
      packagingStart: '14',
      packagingDuration: '3'
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    if (isEditing && onEditClose) {
      onEditClose();
    }
  };

  return (
    <Dialog open={open || isEditing} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Production Item' : 'Add New Production Item'}
          </DialogTitle>
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

          <div className="grid grid-cols-3 gap-4">
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
              <Label htmlFor="deadline">Deadline (Day of Month)</Label>
              <Input
                id="deadline"
                type="number"
                min="1"
                max="31"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                placeholder="30"
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
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Save Changes' : 'Add Production Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};