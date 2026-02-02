import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, GripVertical, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomizableDashboard({ availableWidgets, children }) {
  const [widgets, setWidgets] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dashboard_widgets');
    if (saved) {
      setWidgets(JSON.parse(saved));
    } else {
      setWidgets(availableWidgets.map((w, idx) => ({ ...w, visible: true, order: idx })));
    }
  }, [availableWidgets]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    const updated = items.map((item, idx) => ({ ...item, order: idx }));
    setWidgets(updated);
    localStorage.setItem('dashboard_widgets', JSON.stringify(updated));
  };

  const toggleVisibility = (id) => {
    const updated = widgets.map((w) =>
      w.id === id ? { ...w, visible: !w.visible } : w
    );
    setWidgets(updated);
    localStorage.setItem('dashboard_widgets', JSON.stringify(updated));
  };

  const visibleWidgets = widgets.filter((w) => w.visible).sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Ihr Dashboard</h2>
        <Button
          variant={isEditing ? 'default' : 'outline'}
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Settings className="w-4 h-4 mr-2" />
          {isEditing ? 'Fertig' : 'Anpassen'}
        </Button>
      </div>

      {isEditing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-4 bg-blue-50 rounded-lg"
        >
          <p className="text-sm text-blue-900 mb-3">
            Ziehen Sie Widgets, um sie neu anzuordnen, oder blenden Sie sie aus
          </p>
          <div className="flex flex-wrap gap-2">
            {widgets.map((widget) => (
              <Button
                key={widget.id}
                variant={widget.visible ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleVisibility(widget.id)}
              >
                {widget.visible ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                {widget.title}
              </Button>
            ))}
          </div>
        </motion.div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="widgets">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid gap-4 md:grid-cols-2"
            >
              {visibleWidgets.map((widget, index) => (
                <Draggable
                  key={widget.id}
                  draggableId={widget.id}
                  index={index}
                  isDragDisabled={!isEditing}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="relative"
                    >
                      {isEditing && (
                        <div
                          {...provided.dragHandleProps}
                          className="absolute top-2 right-2 z-10 cursor-move p-1 bg-white rounded shadow"
                        >
                          <GripVertical className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      {widget.component}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}