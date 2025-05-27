import React, { useState, useEffect } from 'react';
import GhostItem from './GhostItem';
import TableRow from './TableRow';
import { Item } from '../services/api';
import { useDraggableItems } from '../hooks/useDraggableItems';
import { useSelectableItems } from '../hooks/useSelectableItems';

interface ItemTableProps {
    items: Item[];
    loading: boolean;
    lastItemRef: (node: HTMLDivElement | null) => void;
    search: string;
    onRefetch: () => void;
    onSelectCountChange: (selectedCount: number) => void;
}

const ItemTable: React.FC<ItemTableProps> = ({ 
    items, 
    loading, 
    lastItemRef,
    search,
    onRefetch,
    onSelectCountChange
}) => {
    const [localItems, setLocalItems] = useState<Item[]>(
        items.map(item => ({
            ...item,
            selected: item.selected || false
        }))
    );
    
    useEffect(() => {
        setLocalItems(
            items.map(item => ({
                ...item,
                selected: item.selected || false
            }))
        );
    }, [items]);

    const {
        draggedIndex,
        dropTargetIndex,
        draggedItem,
        handleDragStart,
        handleDragEnd,
        handleTableDragOver,
        handleTableDrop
    } = useDraggableItems({
        items: localItems,
        search,
        onRefetch,
        onItemsReordered: setLocalItems
    });
    
    const {
        handleSelectItem
    } = useSelectableItems({
        items: localItems,
        onRefetch,
        onSelectCountChange,
        onItemsUpdated: setLocalItems
    });
    
    return (
        <div className="items-table">
            <div className="table-header">
                <div className="table-cell checkbox-cell"></div>
                <div className="table-cell id-cell">ID</div>
                <div className="table-cell value-cell">Значение</div>
            </div>
            
            <div
                className="table-body"
                onDragOver={handleTableDragOver}
                onDrop={handleTableDrop}
            >
                {dropTargetIndex === 0 && (
                    <GhostItem 
                        position={0} 
                        draggedItem={draggedItem} 
                        draggedIndex={draggedIndex} 
                    />
                )}
                
                {localItems.map((item, index) => (
                    <React.Fragment key={`row-${item.id}`}>
                        <TableRow
                            item={item}
                            index={index}
                            isLast={index === localItems.length - 1}
                            lastItemRef={lastItemRef}
                            isDragged={draggedIndex === index}
                            onSelect={handleSelectItem}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        />
                        {dropTargetIndex === index + 1 && (
                            <GhostItem 
                                position={index + 1} 
                                draggedItem={draggedItem} 
                                draggedIndex={draggedIndex} 
                            />
                        )}
                    </React.Fragment>
                ))}
                
                {loading && <div className="loading">Загрузка...</div>}
            </div>
        </div>
    );
};

export default ItemTable; 