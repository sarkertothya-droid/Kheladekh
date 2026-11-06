import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { NewsCard } from '../components/NewsCard';

export const NewsDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { news, categories } = useData();

  const article = news.find((n) => n.slug === slug || n.id === slug);

  if (!article) {
    return (
      <div className="bg-[#151E2B] rounded-2xl border border-white/10 p-10 text-center">
        <h1 className="font-display text-xl font-bold text-white">Article not found</h1>
        <Link
          to="/news"
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#00B7FF]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to News
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.id === article.categoryId);
  const related = news
    .filter((n) => n.status === 'PUBLISHED' && n.id !== article.id)
    .slice(0, 3);

  return (
    <div className="space-y-12">
      <Link
        to="/news"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#A5B1C2] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to News
      </Link>

      <article className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-xs text-[#A5B1C2]">
          <span className="text-[#00B7FF] font-semibold">
            {category?.name || article.categoryId}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">
            {new Date(article.publishedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        <h1
          className="font-display text-2xl sm:text-4xl font-extrabold text-white leading-tight"
          style={{ textWrap: 'balance' }}
        >
          {article.title}
        </h1>

        <p className="text-base text-[#A5B1C2] leading-relaxed">{article.description}</p>

        {article.imageUrl && (
          <div className="rounded-2xl overflow-hidden border border-white/10 aspect-[16/9] bg-[#101722]">
            <img
              src={article.imageUrl}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="space-y-4 text-sm sm:text-base text-[#E2E8F0] leading-relaxed whitespace-pre-line pt-2">
          {article.content}
        </div>
      </article>

      {related.length > 0 && (
        <section className="pt-8 border-t border-white/10">
          <h2 className="font-display text-xl font-bold text-white mb-6">More Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((item) => (
              <NewsCard key={item.id} article={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
