import React from 'react';
import { Category } from '../types';

interface CategoriesProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const Categories: React.FC<CategoriesProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="fixed top-16 w-full bg-white z-40 border-b">
      <div className="overflow-x-auto">
        <div className="flex gap-2 px-4 py-2">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => onSelectCategory(category.name)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors
                ${selectedCategory === category.name
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
            >
              {category.icon}
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;