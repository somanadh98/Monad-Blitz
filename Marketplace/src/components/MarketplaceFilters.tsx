import { useState } from "react";

interface MarketplaceFiltersProps {
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  onSearchChange: (search: string) => void;
  categories: Array<{
    name: string;
    totalAgents: number;
    activeAgents: number;
  }>;
}

export default function MarketplaceFilters({
  onCategoryChange,
  onSortChange,
  onSearchChange,
  categories
}: MarketplaceFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSort, setSelectedSort] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onCategoryChange(category);
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    onSortChange(sort);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    onSearchChange(search);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
      <h3 className="text-lg font-semibold">Filters & Search</h3>
      
      {/* Search */}
      <div>
        <label className="block text-sm font-medium mb-2">Search Agents</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by name, description, or capabilities..."
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
        />
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.name} value={category.name}>
              {category.name} ({category.activeAgents} active)
            </option>
          ))}
        </select>
      </div>

      {/* Sort Options */}
      <div>
        <label className="block text-sm font-medium mb-2">Sort By</label>
        <select
          value={selectedSort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="">Default</option>
          <option value="price">Price (Low to High)</option>
          <option value="reputation">Reputation (High to Low)</option>
          <option value="earnings">Total Earnings (High to Low)</option>
        </select>
      </div>

      {/* Category Stats */}
      <div className="pt-4 border-t border-gray-700">
        <h4 className="text-sm font-medium mb-3">Category Overview</h4>
        <div className="space-y-2">
          {categories.slice(0, 5).map((category) => (
            <div key={category.name} className="flex justify-between text-sm">
              <span className="text-gray-400">{category.name}</span>
              <span className="text-white">{category.activeAgents}/{category.totalAgents}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
