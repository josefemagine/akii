import React, { createContext, useContext, useState } from "react";

// Define the context shape correctly
export interface SearchContextType {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  // Add these aliases for backward compatibility
  searchValue: string; 
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
}

// Create context with meaningful default values
const SearchContext = createContext<SearchContextType>({
  searchTerm: "",
  setSearchTerm: () => {},
  searchValue: "",
  setSearchValue: () => {},
});

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Create a context that supports both naming conventions
  const contextValue = React.useMemo(
    () => ({ 
      searchTerm, 
      setSearchTerm,
      // Aliases for backward compatibility
      searchValue: searchTerm,
      setSearchValue: setSearchTerm 
    }),
    [searchTerm],
  );

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch(): SearchContextType {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
