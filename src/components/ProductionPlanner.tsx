import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { AddProductionDialog } from './AddProductionDialog';

export interface DayStatus {
  status: 'Y' | 'N' | 'D' | null;
  stage: 'raised' | 'preProduction' | 'production' | 'packaging' | null;
}

export interface SKU {
  name: string;
  quantity: number;
}

export interface ProductionItem {
  id: string;
  productCode: string;
  skus: SKU[];
  startDate: string;
  endDate: string;
  stages: {
    raised: { start: number; duration: number };
    preProduction: { start: number; duration: number };
    production: { start: number; duration: number };
    packaging: { start: number; duration: number };
  };
  dailyStatus: { [day: number]: DayStatus };
  priority: 'low' | 'medium' | 'high';
}

const stageColors = {
  raised: 'bg-red-400',
  preProduction: 'bg-orange-400', 
  production: 'bg-blue-400',
  packaging: 'bg-green-500'
};

export const ProductionPlanner = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductionItem | null>(null);
  const [productionItems, setProductionItems] = useState<ProductionItem[]>([
    {
      id: '1',
      productCode: 'CENV32',
      skus: [{ name: 'Smoked Almonds', quantity: 10000 }],
      startDate: '2024-08-19',
      endDate: '2024-09-01',
      stages: {
        raised: { start: 19, duration: 1 },
        preProduction: { start: 20, duration: 2 },
        production: { start: 22, duration: 4 },
        packaging: { start: 26, duration: 2 },
      },
      dailyStatus: {
        19: { status: 'Y', stage: 'raised' },
        20: { status: null, stage: 'preProduction' },
        21: { status: null, stage: 'preProduction' },
        22: { status: 'Y', stage: 'production' },
        23: { status: null, stage: 'production' },
        24: { status: 'Y', stage: 'production' },
        25: { status: 'Y', stage: 'production' },
      },
      priority: 'high'
    },
    {
      id: '2',
      productCode: 'SP031',
      skus: [
        { name: 'SALTED CASHEW', quantity: 10000 },
        { name: 'PAAN DATE', quantity: 2500 }
      ],
      startDate: '2024-08-20',
      endDate: '2024-09-02',
      stages: {
        raised: { start: 20, duration: 1 },
        preProduction: { start: 21, duration: 1 },
        production: { start: 22, duration: 6 },
        packaging: { start: 28, duration: 3 },
      },
      dailyStatus: {
        20: { status: 'Y', stage: 'raised' },
        21: { status: 'Y', stage: 'preProduction' },
        22: { status: null, stage: 'production' },
        23: { status: 'Y', stage: 'production' },
        24: { status: null, stage: 'production' },
        25: { status: 'Y', stage: 'production' },
        28: { status: 'N', stage: 'packaging' },
        29: { status: 'Y', stage: 'packaging' },
      },
      priority: 'medium'
    },
    {
      id: '3',
      productCode: 'DIW37',
      skus: [
        { name: 'Dry Fruit Mix', quantity: 30 },
        { name: 'Kurmura Cream & Onion', quantity: 40 },
        { name: 'Hazelnut Date Laddoo', quantity: 30 },
        { name: 'Cashews', quantity: 30 },
        { name: 'Almonds', quantity: 30 }
      ],
      startDate: '2024-08-23',
      endDate: '2024-09-05',
      stages: {
        raised: { start: 23, duration: 1 },
        preProduction: { start: 24, duration: 2 },
        production: { start: 26, duration: 6 },
        packaging: { start: 1, duration: 2 },
      },
      dailyStatus: {
        23: { status: 'Y', stage: 'raised' },
        24: { status: null, stage: 'preProduction' },
        25: { status: null, stage: 'preProduction' },
        26: { status: 'Y', stage: 'production' },
        27: { status: null, stage: 'production' },
        28: { status: null, stage: 'production' },
        29: { status: null, stage: 'production' },
        30: { status: null, stage: 'production' },
        31: { status: null, stage: 'production' },
        1: { status: null, stage: 'packaging' },
      },
      priority: 'medium'
    },
    {
      id: '4',
      productCode: 'FBA36',
      skus: [
        { name: 'Dried Cranberries', quantity: 2900 },
        { name: 'Hazelnut Protein Balls', quantity: 1100 },
        { name: 'Coconut Orange Protein Balls', quantity: 800 },
        { name: 'Peanut Butter Protein Balls', quantity: 700 },
        { name: 'Hazelnut Date Laddoo', quantity: 1050 },
        { name: 'Coconut Orange Date Laddoo', quantity: 600 },
        { name: 'Coffee Cinnamon Date Laddoo', quantity: 600 }
      ],
      startDate: '2024-08-22',
      endDate: '2024-09-03',
      stages: {
        raised: { start: 22, duration: 1 },
        preProduction: { start: 23, duration: 2 },
        production: { start: 25, duration: 5 },
        packaging: { start: 30, duration: 3 },
      },
      dailyStatus: {
        22: { status: 'Y', stage: 'raised' },
        23: { status: 'Y', stage: 'preProduction' },
        24: { status: null, stage: 'preProduction' },
        25: { status: 'Y', stage: 'production' },
        26: { status: null, stage: 'production' },
        27: { status: null, stage: 'production' },
        28: { status: null, stage: 'production' },
        29: { status: null, stage: 'production' },
        30: { status: 'Y', stage: 'packaging' },
        31: { status: 'N', stage: 'packaging' },
        1: { status: null, stage: 'packaging' },
      },
      priority: 'high'
    }
  ]);

  const days = [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1];

  const filteredItems = productionItems.filter(item =>
    item.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.skus.some(sku => sku.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addProductionItem = (item: Omit<ProductionItem, 'id'>) => {
    const newItem: ProductionItem = {
      ...item,
      id: Date.now().toString()
    };
    setProductionItems([...productionItems, newItem]);
  };

  const updateProductionItem = (id: string, updates: Partial<ProductionItem>) => {
    setProductionItems(items =>
      items.map(item => item.id === id ? { ...item, ...updates } : item)
    );
  };

  const updateDayStatus = (itemId: string, day: number, status: 'Y' | 'N' | 'D' | null, stage: string | null) => {
    setProductionItems(items =>
      items.map(item => {
        if (item.id === itemId) {
          const newDailyStatus = { ...item.dailyStatus };
          if (status === null) {
            delete newDailyStatus[day];
          } else {
            newDailyStatus[day] = { status, stage: stage as any };
          }
          return { ...item, dailyStatus: newDailyStatus };
        }
        return item;
      })
    );
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

  const handleCellClick = (itemId: string, day: number, skuIndex?: number) => {
    const item = productionItems.find(i => i.id === itemId);
    const stageInfo = item ? getStageForDay(item, day) : null;
    
    // Cycle through Y -> N -> D -> null
    const currentStatus = item?.dailyStatus[day]?.status;
    let newStatus: 'Y' | 'N' | 'D' | null;
    
    if (currentStatus === 'Y') newStatus = 'N';
    else if (currentStatus === 'N') newStatus = 'D';
    else if (currentStatus === 'D') newStatus = null;
    else newStatus = 'Y';
    
    updateDayStatus(itemId, day, newStatus, stageInfo?.name || null);
  };

  const renderProductRow = (item: ProductionItem, skuIndex?: number) => {
    const sku = skuIndex !== undefined ? item.skus[skuIndex] : null;
    const isMainRow = skuIndex === undefined || skuIndex === 0;
    
    return (
      <tr key={`${item.id}-${skuIndex || 'main'}`} className="border-b border-gray-200">
        {/* Product Code */}
        <td className="border-r border-gray-300 px-2 py-1 bg-blue-100 font-medium text-sm">
          {isMainRow ? item.productCode : ''}
        </td>
        
        {/* Production/SKU Name */}
        <td className="border-r border-gray-300 px-2 py-1 text-sm">
          {sku ? sku.name : (isMainRow ? item.skus[0]?.name || '' : '')}
        </td>
        
        {/* Quantity */}
        <td className="border-r border-gray-300 px-2 py-1 text-center text-sm font-medium">
          {sku ? sku.quantity : (isMainRow ? item.skus.reduce((sum, s) => sum + s.quantity, 0) : '')}
        </td>
        
        {/* Day columns */}
        {days.map(day => {
          const stageInfo = getStageForDay(item, day);
          const dayStatus = item.dailyStatus[day];
          
          return (
            <td 
              key={day} 
              className="border-r border-gray-300 px-1 py-1 text-center cursor-pointer hover:bg-gray-50"
              onClick={() => handleCellClick(item.id, day, skuIndex)}
            >
              {stageInfo ? (
                <div 
                  className={`w-full h-6 flex items-center justify-center text-xs font-bold text-white ${stageColors[stageInfo.name]}`}
                  title={`${stageInfo.name} - Day ${day}`}
                >
                  {dayStatus?.status || ''}
                </div>
              ) : (
                <div className="w-full h-6"></div>
              )}
            </td>
          );
        })}
        
        {/* Reason column */}
        <td className="px-2 py-1 text-sm">
          {/* Empty for now */}
        </td>
      </tr>
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Simple header with search and add button */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Production
        </Button>
      </div>

      {/* Main production table matching the reference image */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="border border-gray-300 px-2 py-2 text-sm font-medium">ROD CODE</th>
              <th className="border border-gray-300 px-2 py-2 text-sm font-medium">PRODUCTION</th>
              <th className="border border-gray-300 px-2 py-2 text-sm font-medium">QTY</th>
              {days.map(day => (
                <th key={day} className="border border-gray-300 px-1 py-2 text-xs font-medium w-8">
                  {day}
                </th>
              ))}
              <th className="border border-gray-300 px-2 py-2 text-sm font-medium">Reason</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => {
              const rows = [];
              
              // Main product row
              rows.push(renderProductRow(item));
              
              // Additional SKU rows (if more than 1 SKU)
              if (item.skus.length > 1) {
                for (let i = 1; i < item.skus.length; i++) {
                  rows.push(renderProductRow(item, i));
                }
              }
              
              return rows;
            })}
          </tbody>
        </table>
      </div>

      {/* Add Production Dialog */}
      <AddProductionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={addProductionItem}
        editingItem={editingItem}
        onSave={updateProductionItem}
        onEditClose={() => setEditingItem(null)}
      />
    </div>
  );
};