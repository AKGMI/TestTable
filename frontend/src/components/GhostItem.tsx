import React from 'react';
import { Item } from '../services/api';

interface GhostItemProps {
    position: number;
    draggedItem: Item | null;
    draggedIndex: number | null;
}

const GhostItem: React.FC<GhostItemProps> = ({ position, draggedItem, draggedIndex }) => {
    if (!draggedItem || draggedIndex === null) return null;
    
    if (position === draggedIndex || position === draggedIndex + 1) return null;
    
    const isSelected = draggedItem.selected || false;
    
    return (
        <div className="ghost-row">
            <div className="table-cell checkbox-cell">
                <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    disabled
                />
            </div>
            <div className="table-cell id-cell">{draggedItem.id}</div>
            <div className="table-cell value-cell">{draggedItem.value}</div>
        </div>
    );
};

export default GhostItem; 