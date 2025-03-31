import React, { createContext, useContext, useState } from "react";

type SearchContextType = {
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
};

const SearchContext = createContext<SearchContextType>({
  searchValue: "",
  setSearchValue: () => {},
});

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchValue, setSearchValue] = useState<string>("");

  const contextValue = React.useMemo(
    () => ({ searchValue, setSearchValue }),
    [searchValue],
  );

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
