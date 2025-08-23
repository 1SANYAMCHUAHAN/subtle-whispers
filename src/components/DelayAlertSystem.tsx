import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Calendar, Clock, User } from 'lucide-react';
import { ProductionItem } from './ProductionPlanner';

export interface DelayRecord {
  id: string;
  projectName: string;
  productCode: string;
  originalDeadline: string;
  actualCompletionDate: string;
  reasonForDelay: string;
  impactAssessment: string;
  responsibleTeam: string;
  delayDuration: number; // in days
  createdAt: string;
  stage: string;
}

interface DelayAlertSystemProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productionItem: ProductionItem | null;
  onSaveDelayRecord: (record: Omit<DelayRecord, 'id' | 'createdAt'>) => void;
}

export const DelayAlertSystem: React.FC<DelayAlertSystemProps> = ({
  open,
  onOpenChange,
  productionItem,
  onSaveDelayRecord
}) => {
  const [formData, setFormData] = useState({
    actualCompletionDate: '',
    reasonForDelay: '',
    impactAssessment: '',
    responsibleTeam: '',
  });

  const resetForm = () => {
    setFormData({
      actualCompletionDate: '',
      reasonForDelay: '',
      impactAssessment: '',
      responsibleTeam: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productionItem) return;

    const today = new Date();
    const originalDeadlineDate = new Date(today.getFullYear(), today.getMonth(), productionItem.deadline);
    const actualDate = new Date(formData.actualCompletionDate);
    const delayDuration = Math.ceil((actualDate.getTime() - originalDeadlineDate.getTime()) / (1000 * 60 * 60 * 24));

    const delayRecord: Omit<DelayRecord, 'id' | 'createdAt'> = {
      projectName: productionItem.productName,
      productCode: productionItem.productCode,
      originalDeadline: originalDeadlineDate.toISOString().split('T')[0],
      actualCompletionDate: formData.actualCompletionDate,
      reasonForDelay: formData.reasonForDelay,
      impactAssessment: formData.impactAssessment,
      responsibleTeam: formData.responsibleTeam,
      delayDuration,
      stage: 'packaging'
    };

    onSaveDelayRecord(delayRecord);
    onOpenChange(false);
    resetForm();
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  if (!productionItem) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Packaging Stage Delay Detected
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Project Information */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Project Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Product Code:</span> {productionItem.productCode}
              </div>
              <div>
                <span className="font-medium">Product Name:</span> {productionItem.productName}
              </div>
              <div>
                <span className="font-medium">Quantity:</span> {productionItem.quantity}
              </div>
              <div>
                <span className="font-medium">Original Deadline:</span> Day {productionItem.deadline}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="actualCompletionDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Actual Completion Date *
                </Label>
                <Input
                  id="actualCompletionDate"
                  type="date"
                  required
                  value={formData.actualCompletionDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, actualCompletionDate: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="responsibleTeam" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Responsible Team/Person *
                </Label>
                <Select
                  value={formData.responsibleTeam}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, responsibleTeam: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production Team</SelectItem>
                    <SelectItem value="packaging">Packaging Team</SelectItem>
                    <SelectItem value="quality">Quality Control</SelectItem>
                    <SelectItem value="logistics">Logistics</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="external">External Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reasonForDelay" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Reason for Delay *
              </Label>
              <Textarea
                id="reasonForDelay"
                required
                placeholder="Describe the specific reason for the delay..."
                value={formData.reasonForDelay}
                onChange={(e) => setFormData(prev => ({ ...prev, reasonForDelay: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="impactAssessment">Impact Assessment *</Label>
              <Textarea
                id="impactAssessment"
                required
                placeholder="Describe the impact on other projects, customers, or operations..."
                value={formData.impactAssessment}
                onChange={(e) => setFormData(prev => ({ ...prev, impactAssessment: e.target.value }))}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-elegant"
              >
                Save Delay Record
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};