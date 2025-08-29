import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Plus, Search, Filter, AlertTriangle } from 'lucide-react';
import { Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductionGrid } from './ProductionGrid';
import { AddProductionDialog } from './AddProductionDialog';
import { ProductionCalendarHeader } from './ProductionCalendarHeader';

export interface DayStatus {
  status: 'Y' | 'N' | 'D' | null; // Y=completed, N=not completed, D=delayed
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
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  stages: {
    raised: { start: number; duration: number };
    preProduction: { start: number; duration: number };
    production: { start: number; duration: number };
    packaging: { start: number; duration: number };
  };
  dailyStatus: { [day: number]: DayStatus }; // track each day's status
  priority: 'low' | 'medium' | 'high';
}

export const ProductionPlanner = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductionItem | null>(null);
  const [productionItems, setProductionItems] = useState<ProductionItem[]>([
    {
      id: '1',
      productCode: 'CENV32',
      skus: [
        { name: 'Smoked Almonds', quantity: 10000 }
      ],
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
        20: { status: 'Y', stage: 'preProduction' },
        21: { status: 'Y', stage: 'preProduction' },
        22: { status: 'Y', stage: 'production' },
        23: { status: 'Y', stage: 'production' },
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
        22: { status: 'Y', stage: 'production' },
        23: { status: 'Y', stage: 'production' },
        24: { status: 'Y', stage: 'production' },
        25: { status: 'Y', stage: 'production' },
        26: { status: 'Y', stage: 'production' },
        27: { status: 'Y', stage: 'production' },
        28: { status: 'N', stage: 'packaging' },
        29: { status: 'Y', stage: 'packaging' },
        30: { status: 'Y', stage: 'packaging' },
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
        24: { status: 'Y', stage: 'preProduction' },
        25: { status: 'Y', stage: 'preProduction' },
        26: { status: 'Y', stage: 'production' },
        27: { status: 'Y', stage: 'production' },
        28: { status: 'Y', stage: 'production' },
        29: { status: 'Y', stage: 'production' },
        30: { status: 'Y', stage: 'production' },
        31: { status: 'Y', stage: 'production' },
        1: { status: 'Y', stage: 'packaging' },
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
        24: { status: 'Y', stage: 'preProduction' },
        25: { status: 'Y', stage: 'production' },
        26: { status: 'Y', stage: 'production' },
        27: { status: 'Y', stage: 'production' },
        28: { status: 'Y', stage: 'production' },
        29: { status: 'Y', stage: 'production' },
        30: { status: 'Y', stage: 'packaging' },
        31: { status: 'N', stage: 'packaging' },
      },
      priority: 'high'
    }
  ]);

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


  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Production Planner</h1>
          <p className="text-muted-foreground">Manage and track your production schedule</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1">
            <CalendarDays className="w-4 h-4 mr-2" />
            {filteredItems.length} Items
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Production
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <ProductionCalendarHeader 
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        </CardHeader>
        <CardContent className="p-0">
          <ProductionGrid 
            items={filteredItems}
            currentMonth={currentMonth}
            onUpdateItem={updateProductionItem}
            onUpdateDayStatus={updateDayStatus}
            onEditItem={setEditingItem}
          />
        </CardContent>
      </Card>

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