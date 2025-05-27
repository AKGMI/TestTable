import React from 'react';
import { Item } from '../services/api';

interface TableRowProps {
    item: Item;
    index: number;
    isLast: boolean;
    lastItemRef: (node: HTMLDivElement | null) => void;
    isDragged: boolean;
    onSelect: (id: number) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number, item: Item) => void;
    onDragEnd: () => void;
}

const TableRow: React.FC<TableRowProps> = ({
    item,
    index,
    isLast,
    lastItemRef,
    isDragged,
    onSelect,
    onDragStart,
    onDragEnd
}) => {
    const isSelected = item.selected || false;
    
    return (
        <div
            ref={isLast ? lastItemRef : null}
            className={`table-row ${isSelected ? 'selected' : ''} ${isDragged ? 'dragging' : ''}`}
            draggable
            onDragStart={(e) => onDragStart(e, index, item)}
            onDragEnd={onDragEnd}
        >
            <div className="table-cell checkbox-cell">
                <input
                    type="checkbox"
                    defaultChecked={!!item.selected}
                    onChange={() => onSelect(item.id)}
                />
            </div>
            <div className="table-cell id-cell">{item.id}</div>
            <div className="table-cell value-cell">{item.value}</div>
        </div>
    );
};

export default TableRow; 