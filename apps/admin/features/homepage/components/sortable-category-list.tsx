'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { AdminCategory } from '../../categories/repositories/category-repo';
import { getCategoriesAction } from '../../categories/actions/category-actions';

// --- Sortable Item Component ---
function SortableItem({
  id,
  category,
  onRemove,
}: {
  id: string;
  category?: AdminCategory | undefined;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white/85 backdrop-blur-md border border-black/[0.08] rounded-2xl shadow-glass mb-2 group"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-stone-400 hover:text-black transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {category ? (
        <>
          <div className="w-10 h-10 rounded-xl bg-black/[0.04] border border-black/[0.08] overflow-hidden shrink-0">
            {}
            {category.coverImage && (
              <img src={category.coverImage} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-black truncate">{category.name}</p>
            <p className="text-xs text-stone-500 truncate max-w-[200px]">{category.description}</p>
          </div>
        </>
      ) : (
        <div className="flex-1 text-sm text-stone-500 italic">Unknown Category ({id})</div>
      )}

      <button
        type="button"
        onClick={() => onRemove(id)}
        className="p-2 text-stone-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
        title="Remove from list"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// --- Main List Component ---
interface SortableCategoryListProps {
  items: string[]; // Category IDs
  onChange: (items: string[]) => void;
  initialCategories?: AdminCategory[] | undefined;
}

export function SortableCategoryList({
  items,
  onChange,
  initialCategories,
}: SortableCategoryListProps) {
  const [categories, setCategories] = useState<AdminCategory[]>(initialCategories ?? []);
  const [availableCategories, setAvailableCategories] = useState<AdminCategory[]>([]);
  const [selectedToAdd, setSelectedToAdd] = useState<string>('');

  useEffect(() => {
    if (initialCategories) return;
    let cancelled = false;
    getCategoriesAction().then((cats) => {
      if (!cancelled) {
        setCategories(cats);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [initialCategories]);

  useEffect(() => {
    // Filter out categories already in the list
    // eslint-disable-next-line
    setAvailableCategories(categories.filter((c) => !items.includes(c.id)));
  }, [categories, items]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      onChange(arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleAdd = () => {
    if (selectedToAdd && !items.includes(selectedToAdd)) {
      onChange([...items, selectedToAdd]);
      setSelectedToAdd('');
    }
  };

  const handleRemove = (id: string) => {
    onChange(items.filter((item) => item !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <select
          value={selectedToAdd}
          onChange={(e) => setSelectedToAdd(e.target.value)}
          className="flex-1 rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black shadow-sm"
        >
          <option value="">-- Select Category to Add --</option>
          {availableCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selectedToAdd}
          className="px-5 py-2.5 bg-black text-white rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-colors disabled:opacity-50 shadow-sm"
        >
          Add
        </button>
      </div>

      {items.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-black/10 rounded-2xl text-center text-sm text-stone-600 bg-white/40">
          No categories selected. Add one from the dropdown above.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((id) => (
                <SortableItem
                  key={id}
                  id={id}
                  category={categories.find((c) => c.id === id)}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
