import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import ItemTable from './components/ItemTable';
import SearchBar from './components/SearchBar';
import { 
    fetchItems, 
    updateUrl, 
    getUrlParams,
    Item
} from './services/api';

function App() {
    const urlParams = getUrlParams();

    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState(urlParams.search);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedCount, setSelectedCount] = useState(0);

    const prevSearchRef = useRef(search);
    const prevPageRef = useRef(page);
    const isFirstRenderRef = useRef(true);

    const itemsFetcher = async (resetItems = false) => {
        setLoading(true);
        
        try {
            const currentPage = resetItems ? 1 : page;
            const data = await fetchItems(currentPage, search);
            
            if (resetItems) {
                setItems(data.items);
                setPage(1);
            } else {
                setItems(prev => [...prev, ...data.items]);
            }
            
            setTotalItems(data.total);
            setHasMore(currentPage < data.totalPages);
            setSelectedCount(data.selectedCount || 0);
        } catch (error) {
            console.error('Error in itemsFetcher:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            itemsFetcher(true);

            const handlePopState = (event: PopStateEvent) => {
                const state = event.state || {};
                setSearch(state.search || '');
            };

            window.addEventListener('popstate', handlePopState);
            return () => window.removeEventListener('popstate', handlePopState);
        }

        const isSearchChanged = prevSearchRef.current !== search;
        const isPageChanged = prevPageRef.current !== page;

        prevSearchRef.current = search;
        prevPageRef.current = page;

        if (isSearchChanged) {
            updateUrl(search);

            const searchTimer = setTimeout(() => {
                itemsFetcher(true);
            }, 300);

            return () => clearTimeout(searchTimer);
        } else if (isPageChanged && page > 1) {
            itemsFetcher(false);
        }
    }, [search, page]);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastItemRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    return (
        <div className="app">
            <h1>Таблица элементов</h1>
            
            <SearchBar search={search} onChange={setSearch} />
            
            <div className="stats">
                <p>Всего элементов: {totalItems}</p>
                <p>Выбрано: {selectedCount}</p>
            </div>
            
            <ItemTable 
                items={items}
                loading={loading}
                lastItemRef={lastItemRef}
                search={search}
                onRefetch={() => itemsFetcher(true)}
                onSelectCountChange={setSelectedCount}
            />
        </div>
    );
}

export default App; 