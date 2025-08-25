import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { ProductionItem, SKU } from './ProductionPlanner';

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
    startDate: '',
    endDate: '',
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

  const [skus, setSkus] = useState<SKU[]>([{ name: '', quantity: 0 }]);
  const [bulkSkuInput, setBulkSkuInput] = useState('');
  const [inputMode, setInputMode] = useState<'individual' | 'bulk'>('individual');

  const isEditing = !!editingItem;

  useEffect(() => {
    if (editingItem) {
      setFormData({
        productCode: editingItem.productCode,
        startDate: editingItem.startDate,
        endDate: editingItem.endDate,
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
      setSkus(editingItem.skus);
    } else {
      resetForm();
    }
  }, [editingItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalSkus = skus;
    
    // If using bulk input mode, parse the textarea
    if (inputMode === 'bulk' && bulkSkuInput.trim()) {
      finalSkus = parseBulkSkuInput(bulkSkuInput);
    }
    
    if (isEditing && editingItem && onSave) {
      const updates: Partial<ProductionItem> = {
        productCode: formData.productCode,
        skus: finalSkus,
        startDate: formData.startDate,
        endDate: formData.endDate,
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
        skus: finalSkus,
        startDate: formData.startDate,
        endDate: formData.endDate,
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

  const parseBulkSkuInput = (input: string): SKU[] => {
    const lines = input.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const parts = line.split('\t'); // Tab-separated
      if (parts.length >= 2) {
        return {
          name: parts[0].trim(),
          quantity: parseInt(parts[1]) || 500 // Default quantity
        };
      }
      return {
        name: line.trim(),
        quantity: 500 // Default quantity
      };
    }).filter(sku => sku.name);
  };

  const resetForm = () => {
    setFormData({
      productCode: '',
      startDate: '',
      endDate: '',
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
    setSkus([{ name: '', quantity: 0 }]);
    setBulkSkuInput('');
    setInputMode('individual');
  };

  const addSku = () => {
    setSkus([...skus, { name: '', quantity: 0 }]);
  };

  const removeSku = (index: number) => {
    setSkus(skus.filter((_, i) => i !== index));
  };

  const updateSku = (index: number, field: keyof SKU, value: string | number) => {
    setSkus(skus.map((sku, i) => 
      i === index ? { ...sku, [field]: value } : sku
    ));
  };

  const handleClose = () => {
    onOpenChange(false);
    if (isEditing && onEditClose) {
      onEditClose();
    }
  };

  return (
    <Dialog open={open || isEditing} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Production Item' : 'Add New Production Item'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-3 gap-4">
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
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: 'low' | 'medium' | 'high') => 
                setFormData(prev => ({ ...prev, priority: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* SKU Input Mode Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label>SKU Input Mode:</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={inputMode === 'individual' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInputMode('individual')}
                >
                  Individual
                </Button>
                <Button
                  type="button"
                  variant={inputMode === 'bulk' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInputMode('bulk')}
                >
                  Bulk Paste
                </Button>
              </div>
            </div>

            {inputMode === 'individual' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>SKUs</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSku}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add SKU
                  </Button>
                </div>
                
                {skus.map((sku, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <Input
                        placeholder="SKU Name"
                        value={sku.name}
                        onChange={(e) => updateSku(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={sku.quantity}
                        onChange={(e) => updateSku(index, 'quantity', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    {skus.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSku(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="bulkSkuInput">
                  Paste SKUs (one per line, tab-separated: Name + Quantity)
                </Label>
                <Textarea
                  id="bulkSkuInput"
                  placeholder="Kururra Cream & Onion	500&#10;Miller Chivda Bambaya Bhel	500&#10;Hazelnut Protein Balls	500"
                  value={bulkSkuInput}
                  onChange={(e) => setBulkSkuInput(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  Copy and paste from Excel/spreadsheet. Format: SKU Name [Tab] Quantity
                </p>
              </div>
            )}
          </div>

          {/* Stage Configuration - Simplified*/}
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-blue-600">Raised (Days)</Label>
              <Input
                type="number"
                min="1"
                value={formData.raisedDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, raisedDuration: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-orange-600">Pre Production (Days)</Label>
              <Input
                type="number"
                min="1"
                value={formData.preProductionDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, preProductionDuration: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-green-600">Production (Days)</Label>
              <Input
                type="number"
                min="1"
                value={formData.productionDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, productionDuration: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-purple-600">Packaging (Days)</Label>
              <Input
                type="number"
                min="1"
                value={formData.packagingDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, packagingDuration: e.target.value }))}
              />
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