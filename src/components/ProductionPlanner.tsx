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
      productCode: 'ZEPAU61',
      skus: [
        { name: 'MOTHER SECRET', quantity: 500 },
        { name: 'Kururra Cream & Onion', quantity: 500 },
        { name: 'Miller Chivda Bambaya Bhel', quantity: 500 }
      ],
      startDate: '2024-08-01',
      endDate: '2024-08-20',
      stages: {
        raised: { start: 1, duration: 2 },
        preProduction: { start: 3, duration: 3 },
        production: { start: 6, duration: 8 },
        packaging: { start: 14, duration: 3 },
      },
      dailyStatus: {
        1: { status: 'Y', stage: 'raised' },
        2: { status: 'Y', stage: 'raised' },
        3: { status: 'Y', stage: 'preProduction' },
        4: { status: 'N', stage: 'preProduction' },
        5: { status: 'D', stage: 'preProduction' },
        6: { status: 'Y', stage: 'production' },
        7: { status: 'N', stage: 'production' },
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