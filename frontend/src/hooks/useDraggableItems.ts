import { useState } from 'react';
import { Item, reorderItems } from '../services/api';

interface UseDraggableItemsProps {
  items: Item[];
  search: string;
  onRefetch: () => void;
  onItemsReordered: (newItems: Item[]) => void;
}

export const useDraggableItems = ({
  items,
  search,
  onRefetch,
  onItemsReordered
}: UseDraggableItemsProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [draggedItem, setDraggedItem] = useState<Item | null>(null);
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number, item: Item) => {
    e.dataTransfer.setData('text/plain', index.toString());
    
    const ghostElement = document.createElement('div');
    ghostElement.className = 'table-row drag-ghost';
    
    const idCell = document.createElement('div');
    idCell.className = 'table-cell id-cell';
    idCell.textContent = item.id.toString();
    
    const valueCell = document.createElement('div');
    valueCell.className = 'table-cell value-cell';
    valueCell.textContent = item.value;
    
    ghostElement.appendChild(document.createElement('div'));
    ghostElement.appendChild(idCell);
    ghostElement.appendChild(valueCell);
    
    document.body.appendChild(ghostElement);
    
    e.dataTransfer.setDragImage(ghostElement, 20, 20);
    
    setTimeout(() => {
      document.body.removeChild(ghostElement);
    }, 0);
    
    setDraggedIndex(index);
    setDraggedItem(item);
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDraggedItem(null);
  };
  
  const handleTableDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (draggedIndex === null || !draggedItem) return;
    
    const rows = Array.from(document.querySelectorAll('.table-row'));
    
    if (rows.length === 0) {
      setDropTargetIndex(0);
      return;
    }
    
    const firstRowRect = rows[0].getBoundingClientRect();
    if (e.clientY < firstRowRect.top) {
      setDropTargetIndex(0);
      return;
    }
    
    const lastRowRect = rows[rows.length - 1].getBoundingClientRect();
    if (e.clientY > lastRowRect.bottom) {
      setDropTargetIndex(rows.length);
      return;
    }
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowRect = row.getBoundingClientRect();
      
      if (e.clientY >= rowRect.top && e.clientY <= rowRect.bottom) {
        if (e.clientY < rowRect.top + rowRect.height / 2) {
          setDropTargetIndex(i);
        }
        else {
          setDropTargetIndex(i + 1);
        }
        return;
      }
      
      if (i < rows.length - 1) {
        const nextRow = rows[i + 1];
        const nextRowRect = nextRow.getBoundingClientRect();
        
        if (e.clientY > rowRect.bottom && e.clientY < nextRowRect.top) {
          setDropTargetIndex(i + 1);
          return;
        }
      }
    }
  };
  
  const handleTableDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (dropTargetIndex !== null && draggedIndex !== null) {
      const dragIndex = draggedIndex;
      const draggedItemValue = items[dragIndex];
      
      if (!draggedItemValue) return;
      
      const insertIndex = dragIndex < dropTargetIndex ? dropTargetIndex - 1 : dropTargetIndex;
      
      const reorderedItems = [...items];
      const [removed] = reorderedItems.splice(dragIndex, 1);
      reorderedItems.splice(insertIndex, 0, removed);
      
      onItemsReordered(reorderedItems);
      
      try {
        await reorderItems(
          draggedItemValue.id,
          insertIndex,
          { search }
        );
      } catch (error) {
        console.error('Error reordering items:', error);
        onRefetch();
      }
    }
    
    setDropTargetIndex(null);
    setDraggedIndex(null);
    setDraggedItem(null);
  };

  return {
    draggedIndex,
    dropTargetIndex,
    draggedItem,
    handleDragStart,
    handleDragEnd,
    handleTableDragOver,
    handleTableDrop
  };
}; 