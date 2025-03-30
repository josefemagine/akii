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
  const [searchValue, setSearchValue] = useState("");

  return (
    <SearchContext.Provider value={{ searchValue, setSearchValue }}>
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
