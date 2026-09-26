import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  Clock, 
  Calendar, 
  ArrowRight, 
  BookOpen, 
  Sparkles,
  Filter,
  Flame
} from 'lucide-react';
import { Article, ARTICLES_DATA } from '../data/articlesData';

interface AllArticlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles?: Article[];
  onSelectArticle: (article: Article) => void;
}

export const AllArticlesModal: React.FC<AllArticlesModalProps> = ({
  isOpen,
  onClose,
  articles = ARTICLES_DATA,
  onSelectArticle
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const categories = ['Semua', 'Tips & Hemat', 'Perawatan AC', 'Troubleshooting', 'Standar Layanan'];
  const safeArticles = Array.isArray(articles) ? articles : ARTICLES_DATA;

  // Only show published articles in Customer all-articles modal
  const publishedOnly = safeArticles.filter(a => (a.status || 'published') === 'published');

  const filteredArticles = publishedOnly.filter(art => {
    const matchesCat = selectedCategory === 'Semua' || art.category === selectedCategory;
    const matchesSearch = 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.tags && art.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCat && matchesSearch;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-slate-50 w-full max-w-4xl max-h-[94vh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="sticky top-0 z-20 px-5 sm:px-7 py-4 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Pusat Artikel & Edukasi AC
                </h2>
                <p className="text-xs text-slate-500">
                  {publishedOnly.length} panduan praktis & tips perawatan dari teknisi profesional
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="p-4 sm:px-7 bg-white border-b border-slate-100 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari topik artikel (misal: bocor, hemat listrik, freon, bau apek)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-transparent focus:border-sky-500 focus:bg-white focus:outline-hidden transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'Tips & Hemat' && <Flame className="w-3 h-3 text-amber-400" />}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Articles Grid Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-7">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">Tidak ada artikel yang cocok</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Coba gunakan kata kunci pencarian lain atau pilih kategori Semua.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('Semua');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-100 text-sky-700 text-xs font-bold hover:bg-sky-200 transition-colors"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {filteredArticles.map((art) => (
                  <motion.div
                    key={art.id}
                    whileHover={{ y: -3 }}
                    onClick={() => {
                      onClose();
                      onSelectArticle(art);
                    }}
                    className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      {/* Image Preview & Badge */}
                      <div className="relative rounded-xl overflow-hidden aspect-16/9 max-h-44">
                        <img
                          src={art.image}
                          alt={art.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-white/90 backdrop-blur-xs shadow-xs ${art.categoryColor.text}`}>
                            {art.category}
                          </span>
                          {art.badge && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-xs">
                              {art.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-1.5">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-sky-600 transition-colors leading-snug line-clamp-2">
                          {art.title}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {art.summary}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{art.readTime}</span>
                        <span>·</span>
                        <span>{art.date}</span>
                      </div>
                      <span className="text-sky-600 font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Baca</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
