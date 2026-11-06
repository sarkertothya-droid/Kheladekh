import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper } from 'lucide-react';
import { NewsArticle } from '../types';
import { useData } from '../context/DataContext';

interface NewsCardProps {
  article: NewsArticle;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const { categories } = useData();
  const [imgError, setImgError] = useState(false);

  const category = categories.find((c) => c.id === article.categoryId);
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link
      to={`/news/${article.slug}`}
      className="group block bg-[#151E2B] rounded-2xl overflow-hidden border border-white/10 hover:border-[#00B7FF]/50 transition-colors"
    >
      <div className="relative aspect-[16/10] bg-[#101722] overflow-hidden">
        {article.imageUrl && !imgError ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#101722] to-[#151E2B]">
            <Newspaper className="w-8 h-8 text-[#00B7FF]/70 mb-2" />
            <span className="text-xs font-medium text-[#A5B1C2]">
              {category?.name || 'News'}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-[#A5B1C2] mb-2">
          <span className="text-[#00B7FF] font-medium">
            {category?.name || article.categoryId}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{formattedDate}</span>
        </div>

        <h3 className="font-display text-base font-bold text-white group-hover:text-[#00B7FF] transition-colors line-clamp-2">
          {article.title}
        </h3>

        <p className="mt-2 text-xs text-[#A5B1C2] line-clamp-2 leading-relaxed">
          {article.description}
        </p>
      </div>
    </Link>
  );
};
