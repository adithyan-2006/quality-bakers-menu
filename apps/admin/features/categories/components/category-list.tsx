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
import { AdminCategory } from '../repositories/category-repo';
import {
  updateCategoryDisplayOrderAction,
  updateCategoryAction,
  deleteCategoryAction,
} from '../actions/category-actions';
import { CategoryListItem } from './category-list-item';
import { Dialog, Button } from '@qbm/ui';

interface CategoryListProps {
  initialCategories: AdminCategory[];
}

export function CategoryList({ initialCategories }: CategoryListProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [categoryToDelete, setCategoryToDelete] = useState<AdminCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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
      const oldIndex = categories.findIndex((item) => item.id === active.id);
      const newIndex = categories.findIndex((item) => item.id === over.id);

      const newArray = arrayMove(categories, oldIndex, newIndex);

      // Optimistically update displayOrder
      const updatedArray = newArray.map((item, index) => ({
        ...item,
        displayOrder: index,
      }));

      setCategories(updatedArray);

      // Fire and forget repo update outside of state updater
      updateCategoryDisplayOrderAction(
        updatedArray.map((c) => ({
          id: c.id,
          displayOrder: c.displayOrder,
        })),
      ).catch(console.error);
    }
  };

  const handleToggleVisibility = async (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return;

    const newVisibility = !category.isVisible;

    setCategories((items) =>
      items.map((item) => (item.id === id ? { ...item, isVisible: newVisibility } : item)),
    );

    // Fire and forget repo update outside of state updater
    updateCategoryAction(id, { isVisible: newVisibility }).catch(console.error);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    setDeleteError('');
    const result = await deleteCategoryAction(categoryToDelete.id);
    if (result.success) {
      setCategories(categories.filter((c) => c.id !== categoryToDelete.id));
      setCategoryToDelete(null);
    } else {
      setDeleteError(result.error || 'Failed to delete category');
    }
    setIsDeleting(false);
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 bg-white/80 backdrop-blur-md border border-black/[0.08] rounded-2xl shadow-glass">
        <p className="text-stone-600 font-medium">
          No categories found. Start by creating your first category.
        </p>
      </div>
    );
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {categories.map((category) => (
              <CategoryListItem
                key={category.id}
                category={category}
                onToggleVisibility={handleToggleVisibility}
                onDelete={() => setCategoryToDelete(category)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Dialog open={!!categoryToDelete} onClose={() => setCategoryToDelete(null)}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Delete category?</Dialog.Title>
            <Dialog.Description>
              You are about to permanently delete '{categoryToDelete?.name}'. This action cannot be
              undone.
            </Dialog.Description>
          </Dialog.Header>
          {deleteError && <div className="text-sm text-red-500 mt-2">{deleteError}</div>}
          <Dialog.Footer className="mt-4">
            <Button
              variant="outline"
              onClick={() => setCategoryToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete permanently'}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </>
  );
}
