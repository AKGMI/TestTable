const API_BASE_URL = 'http://localhost:5000';

export interface Item {
    id: number;
    value: string;
    selected: boolean;
}

export interface ItemsResponse {
    items: Item[];
    total: number;
    page: number;
    totalPages: number;
    selectedCount: number;
}

export interface SelectResponse {
    success: boolean;
    item?: Item;
    selectedCount: number;
    error?: string;
}

export interface OrderResponse {
    success: boolean;
    message?: string;
    error?: string;
}

export const fetchItems = async (page: number, search: string): Promise<ItemsResponse> => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: '20',
            search
        });

        const response = await fetch(`${API_BASE_URL}/api/items?${params.toString()}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        return {
            ...data,
            items: data.items.map((item: Item) => ({
                ...item,
                selected: item.selected || false
            }))
        };
    } catch (error) {
        console.error('Error fetching items:', error);
        return {
            items: [],
            total: 0,
            page: 1,
            totalPages: 0,
            selectedCount: 0
        };
    }
};

export const selectItem = async (id: number, selected: boolean): Promise<SelectResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/items/select`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, selected }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error selecting item:', error);
        return {
            success: false,
            selectedCount: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export const reorderItems = async (
    id: number, 
    newPosition: number, 
    filters: { search: string }
): Promise<OrderResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/items/order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id,
                newPosition,
                filters
            }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error reordering items:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export const updateUrl = (search: string): void => {
    const params = new URLSearchParams();

    if (search) params.set('search', search);

    const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : '');

    window.history.pushState({ search }, '', newUrl);
};

export const getUrlParams = (): { search: string } => {
    const params = new URLSearchParams(window.location.search);
    return {
        search: params.get('search') || ''
    };
}; 