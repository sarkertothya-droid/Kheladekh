import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useData } from '../context/DataContext';
import { NewsCard } from '../components/NewsCard';

export const NewsPage: React.FC = () => {
  const { news, categories } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [query, setQuery] = useState<string>('');

  const filteredNews = useMemo(() => {
    return news
      .filter((n) => n.status === 'PUBLISHED')
      .filter((n) => (selectedCategory === 'all' ? true : n.categoryId === selectedCategory))
      .filter((n) =>
        query.trim()
          ? n.title.toLowerCase().includes(query.toLowerCase()) ||
            n.description.toLowerCase().includes(query.toLowerCase())
          : true
      );
  }, [news, selectedCategory, query]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">Sports News</h1>
        <p className="text-sm text-[#A5B1C2] mt-1">
          Match reports, tactical breakdowns, and tournament updates.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#00B7FF] text-[#080B12]'
                : 'bg-[#151E2B] text-[#A5B1C2] hover:text-white'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#00B7FF] text-[#080B12]'
                  : 'bg-[#151E2B] text-[#A5B1C2] hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-[#A5B1C2] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#151E2B] border border-white/10 text-sm text-white placeholder-[#A5B1C2] focus:outline-none focus:border-[#00B7FF]"
          />
        </div>
      </div>

      {filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-10 text-center">
          <p className="text-base font-semibold text-white">No articles found</p>
        </div>
      )}
    </div>
  );
};
