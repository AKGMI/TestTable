import { Item, selectItem } from '../services/api';

interface UseSelectableItemsProps {
    items: Item[];
    onRefetch: () => void;
    onSelectCountChange: (count: number) => void;
    onItemsUpdated: (newItems: Item[]) => void;
}

export const useSelectableItems = ({
    items,
    onRefetch,
    onSelectCountChange,
    onItemsUpdated
}: UseSelectableItemsProps) => {

    const handleSelectItem = async (id: number) => {
        const itemIndex = items.findIndex(item => item.id === id);
        if (itemIndex === -1) return;

        const updatedItems = [...items];
        const currentSelected = updatedItems[itemIndex].selected ?? false;
        updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            selected: !currentSelected
        };

        onItemsUpdated(updatedItems);

        try {
            const response = await selectItem(id, !currentSelected);

            onSelectCountChange(response.selectedCount);
        } catch (error) {
            console.error('Error selecting item:', error);
            onRefetch();
        }
    };

    return {
        handleSelectItem
    };
}; 