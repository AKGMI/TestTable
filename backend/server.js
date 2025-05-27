const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const storage = {
    itemsMap: new Map(),
    order: [],
    selectedIds: new Set()
};

for (let i = 0; i < 1000000; i++) {
    const id = i + 1;
    const item = {
        id,
        value: `Элемент ${id}`,
        selected: false
    };
    storage.itemsMap.set(id, item);
    storage.order.push(id);
}

app.get('/api/items', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    let filteredIds = search 
        ? storage.order.filter(id => {
            const item = storage.itemsMap.get(id);
            return item && item.value.toLowerCase().includes(search.toLowerCase());
        })
        : [...storage.order];
    
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedIds = filteredIds.slice(startIndex, endIndex);
    
    const items = paginatedIds.map(id => storage.itemsMap.get(id));
    
    res.json({
        items,
        total: filteredIds.length,
        page,
        totalPages: Math.ceil(filteredIds.length / limit),
        selectedCount: storage.selectedIds.size
    });
});

app.post('/api/items/select', (req, res) => {
    const { id, selected } = req.body;
    
    if (!id) {
        return res.status(400).json({ 
            success: false,
            error: 'Item ID is required' 
        });
    }
    
    const item = storage.itemsMap.get(id);
    if (item) {
        item.selected = !!selected;
        
        if (item.selected) {
            storage.selectedIds.add(id);
        } else {
            storage.selectedIds.delete(id);
        }
    }
    
    res.json({
        success: true,
        item,
        selectedCount: storage.selectedIds.size
    });
});

app.post('/api/items/order', (req, res) => {
    const { id, newPosition, filters } = req.body;
    
    if (!id || typeof newPosition !== 'number') {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required parameters' 
        });
    }
    
    try {
        const item = storage.itemsMap.get(id);
        if (!item) {
            return res.status(404).json({ 
                success: false, 
                error: 'Item not found' 
            });
        }
        
        let filteredIds = [...storage.order];
        
        if (filters && filters.search) {
            filteredIds = filteredIds.filter(itemId => {
                const item = storage.itemsMap.get(itemId);
                return item && item.value.toLowerCase().includes(filters.search.toLowerCase());
            });
        }
        
        let adjustedPosition = newPosition;
        if (adjustedPosition < 0) adjustedPosition = 0;
        if (adjustedPosition >= filteredIds.length) adjustedPosition = filteredIds.length - 1;
        
        const currentIndex = filteredIds.indexOf(id);
        
        if (currentIndex === -1) {
            return res.status(200).json({ 
                success: true, 
                message: 'Item not in current view' 
            });
        }
        
        filteredIds.splice(currentIndex, 1);
        
        const prevId = adjustedPosition > 0 ? filteredIds[adjustedPosition - 1] : null;
        const nextId = filteredIds[adjustedPosition] || null;
        
        filteredIds.splice(adjustedPosition, 0, id);
        
        if (filters && filters.search) {
            const fullOrder = [...storage.order];
            
            const globalIndex = fullOrder.indexOf(id);
            if (globalIndex !== -1) {
                fullOrder.splice(globalIndex, 1);
            }
            
            const prevIndex = prevId ? fullOrder.indexOf(prevId) : -1;
            const nextIndex = nextId ? fullOrder.indexOf(nextId) : fullOrder.length;
            
            let insertIndex;
            
            if (prevIndex !== -1) {
                insertIndex = prevIndex + 1;
            } else if (nextIndex !== -1) {
                insertIndex = nextIndex;
            } else {
                insertIndex = fullOrder.length;
            }
            
            fullOrder.splice(insertIndex, 0, id);
            storage.order = fullOrder;
        } else {
            storage.order = filteredIds;
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error("Error processing order:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 