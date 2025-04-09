import { jsx as _jsx } from "react/jsx-runtime";
import React, { createContext, useContext, useState } from "react";
// Create context with meaningful default values
const SearchContext = createContext({
    searchTerm: "",
    setSearchTerm: () => { },
    searchValue: "",
    setSearchValue: () => { },
});
export function SearchProvider({ children }) {
    const [searchTerm, setSearchTerm] = useState("");
    // Create a context that supports both naming conventions
    const contextValue = React.useMemo(() => ({
        searchTerm,
        setSearchTerm,
        // Aliases for backward compatibility
        searchValue: searchTerm,
        setSearchValue: setSearchTerm
    }), [searchTerm]);
    return (_jsx(SearchContext.Provider, { value: contextValue, children: children }));
}
export function useSearch() {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error("useSearch must be used within a SearchProvider");
    }
    return context;
}
