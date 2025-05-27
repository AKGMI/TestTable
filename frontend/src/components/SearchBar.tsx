import React from 'react';

interface SearchBarProps {
    search: string;
    onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ search, onChange }) => {
    return (
        <div className="search-container">
            <input
                type="text"
                placeholder="Поиск..."
                value={search}
                onChange={(e) => onChange(e.target.value)}
                className="search-input"
            />
        </div>
    );
};

export default SearchBar; 