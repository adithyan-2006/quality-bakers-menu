'use client';

import { useState } from 'react';
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
} from '@dnd-kit/sortable';
import { AdminCategory, CategoryRepository } from '../repositories/category-repo';
import { CategoryListItem } from './category-list-item';

interface CategoryListProps {
  initialCategories: AdminCategory[];
}

export function CategoryList({ initialCategories }: CategoryListProps) {
  const [categories, setCategories] = useState(initialCategories);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newArray = arrayMove(items, oldIndex, newIndex);

        // Optimistically update displayOrder
        const updatedArray = newArray.map((item, index) => ({
          ...item,
          displayOrder: index,
        }));

        // Fire and forget repo update (mimicking API call)
        CategoryRepository.updateDisplayOrder(
          updatedArray.map((c) => ({ id: c.id, displayOrder: c.displayOrder })),
        ).catch(console.error);

        return updatedArray;
      });
    }
  };

  const handleToggleVisibility = async (id: string) => {
    setCategories((items) =>
      items.map((item) => {
        if (item.id === id) {
          const newVisibility = !item.isVisible;

          // Fire and forget repo update
          CategoryRepository.updateCategory(id, { isVisible: newVisibility }).catch(console.error);

          return { ...item, isVisible: newVisibility };
        }
        return item;
      }),
    );
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm">
        <p className="text-stone-500">
          No categories found. Start by creating your first category.
        </p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {categories.map((category) => (
            <CategoryListItem
              key={category.id}
              category={category}
              onToggleVisibility={handleToggleVisibility}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
