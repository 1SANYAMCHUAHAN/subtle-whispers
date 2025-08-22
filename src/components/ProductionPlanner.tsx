import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ProductionGrid } from './ProductionGrid';
import { AddProductionDialog } from './AddProductionDialog';
import { ProductionCalendarHeader } from './ProductionCalendarHeader';

export interface ProductionItem {
  id: string;
  productCode: string;
  productName: string;
  quantity: number;
  stages: {
    raised: { start: number; duration: number; completed: boolean };
    preProduction: { start: number; duration: number; completed: boolean };
    production: { start: number; duration: number; completed: boolean };
    packaging: { start: number; duration: number; completed: boolean };
  };
  priority: 'low' | 'medium' | 'high';
}

export const ProductionPlanner = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [productionItems, setProductionItems] = useState<ProductionItem[]>([
    {
      id: '1',
      productCode: 'ZEPAU61',
      productName: 'MOTHER SECRET',
      quantity: 500,
      stages: {
        raised: { start: 1, duration: 2, completed: true },
        preProduction: { start: 3, duration: 3, completed: true },
        production: { start: 6, duration: 8, completed: false },
        packaging: { start: 14, duration: 3, completed: false },
      },
      priority: 'high'
    },
    {
      id: '2',
      productCode: 'PROD789',
      productName: 'DELUXE SERIES',
      quantity: 300,
      stages: {
        raised: { start: 5, duration: 1, completed: true },
        preProduction: { start: 6, duration: 4, completed: false },
        production: { start: 10, duration: 6, completed: false },
        packaging: { start: 16, duration: 2, completed: false },
      },
      priority: 'medium'
    }
  ]);

  const filteredItems = productionItems.filter(item =>
    item.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.productName.toLowerCase().includes(searchQuery.toLowerCase())
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
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Production
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar and Grid */}
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
          />
        </CardContent>
      </Card>

      {/* Add Production Dialog */}
      <AddProductionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={addProductionItem}
      />
    </div>
  );
};