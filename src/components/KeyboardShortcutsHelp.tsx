import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Keyboard, HelpCircle } from 'lucide-react';

export const KeyboardShortcutsHelp: React.FC = () => {
  const [open, setOpen] = useState(false);

  const shortcuts = [
    {
      category: 'Cell Status Updates',
      items: [
        { key: 'Y', description: 'Mark cell as Complete (Yes)' },
        { key: 'N', description: 'Mark cell as Incomplete (No)' },
        { key: 'D', description: 'Mark cell as Delayed' },
        { key: 'Delete/Backspace', description: 'Clear cell status' },
        { key: 'Escape', description: 'Cancel editing' },
      ]
    },
    {
      category: 'Navigation',
      items: [
        { key: 'Tab', description: 'Move to next cell' },
        { key: 'Shift + Tab', description: 'Move to previous cell' },
        { key: 'Enter', description: 'Confirm selection and move down' },
        { key: 'Arrow Keys', description: 'Navigate between cells' },
      ]
    },
    {
      category: 'General',
      items: [
        { key: 'Ctrl + F', description: 'Focus search box' },
        { key: 'Ctrl + N', description: 'Add new production item' },
        { key: 'Ctrl + E', description: 'Export current view' },
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Keyboard className="w-4 h-4 mr-2" />
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {shortcuts.map((category) => (
            <div key={category.category} className="space-y-3">
              <h3 className="font-semibold text-lg">{category.category}</h3>
              <div className="space-y-2">
                {category.items.map((shortcut) => (
                  <div key={shortcut.key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm">{shortcut.description}</span>
                    <Badge variant="outline" className="font-mono">
                      {shortcut.key}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-primary/10 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Click on any stage cell to start editing, then use Y/N/D keys for quick status updates. 
            The system will automatically detect packaging delays and prompt for delay documentation.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};