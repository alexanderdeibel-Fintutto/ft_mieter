import React, { useState } from 'react';
import { X, GripVertical, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function DashboardCustomizer({
  availableWidgets,
  activeWidgets,
  widgetOrder,
  onToggleWidget,
  onReorderWidgets,
  onSave,
  onClose,
}) {
  const [localOrder, setLocalOrder] = useState(widgetOrder);
  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newOrder = [...localOrder];
    const draggedWidget = newOrder[draggedItem];
    newOrder.splice(draggedItem, 1);
    newOrder.splice(index, 0, draggedWidget);
    setDraggedItem(index);
    setLocalOrder(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    onReorderWidgets(localOrder);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Dashboard anpassen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Wähle die Widgets aus, die du sehen möchtest, und ziehe sie, um die Reihenfolge zu ändern.
          </p>

          <div className="space-y-2">
            {localOrder.map((widgetId, index) => {
              const widget = availableWidgets.find(w => w.id === widgetId);
              const isActive = activeWidgets.includes(widgetId);

              if (!widget) return null;

              return (
                <div
                  key={widgetId}
                  draggable={isActive}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border ${
                    draggedItem === index ? 'opacity-50' : ''
                  } ${isActive ? 'border-blue-300 dark:border-blue-700' : 'border-gray-200 dark:border-gray-700'}`}
                >
                  {isActive && (
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing" />
                  )}

                  <button
                    onClick={() => onToggleWidget(widgetId)}
                    className="flex-shrink-0"
                    title={isActive ? 'Ausblenden' : 'Anzeigen'}
                  >
                    {isActive ? (
                      <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                    )}
                  </button>

                  <div className="flex-1">
                    <p className={`font-medium ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                      {widget.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}