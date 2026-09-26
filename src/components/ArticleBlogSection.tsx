import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Clock, 
  Sparkles, 
  ArrowRight,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { Article, ARTICLES_DATA } from '../data/articlesData';

interface ArticleBlogSectionProps {
  articles?: Article[];
  onSelectArticle: (article: Article) => void;
  onOpenAllArticles: () => void;
  onSelectService?: (serviceName: string) => void;
}

export const ArticleBlogSection: React.FC<ArticleBlogSectionProps> = ({
  articles = ARTICLES_DATA,
  onSelectArticle,
  onOpenAllArticles,
  onSelectService
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const safeArticles = Array.isArray(articles) ? articles : ARTICLES_DATA;

  // Only show published articles in Customer Blog carousel
  const displayArticles = safeArticles.filter(a => (a.status || 'published') === 'published');

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Calculate approximate active card index based on scroll
    const cardWidth = 320; // approximate width of one card + gap
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(index, Math.max(0, displayArticles.length - 1)));
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll);
    checkScroll();
    return () => el.removeEventListener('scroll', checkScroll);
  }, [displayArticles.length]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const cardWidth = 340;
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const cardWidth = 340;
    scrollContainerRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-b from-white via-white to-slate-50/70 border border-slate-200/90 shadow-md shadow-slate-200/70 p-4 sm:p-6 space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-none">
                Artikel & Edukasi AC
              </h3>
              <span className="hidden sm:inline-flex text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {displayArticles.length} Artikel
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Tips praktis hemat listrik, jadwal cuci, & solusi AC bermasalah
            </p>
          </div>
        </div>

        {/* Action Buttons: View All & Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAllArticles}
            className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center gap-1 transition-colors group cursor-pointer shadow-xs"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className={`p-1.5 rounded-xl border border-slate-200 text-slate-600 transition-all ${
                canScrollLeft 
                  ? 'hover:bg-slate-100 active:scale-95 cursor-pointer shadow-xs' 
                  : 'opacity-30 cursor-not-allowed'
              }`}
              title="Geser Kiri"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className={`p-1.5 rounded-xl border border-slate-200 text-slate-600 transition-all ${
                canScrollRight 
                  ? 'hover:bg-slate-100 active:scale-95 cursor-pointer shadow-xs' 
                  : 'opacity-30 cursor-not-allowed'
              }`}
              title="Geser Kanan"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Swipeable / Scrollable Carousel Container */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-1 px-0.5 no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing"
      >
        {displayArticles.map((art) => (
          <div
            key={art.id}
            onClick={() => onSelectArticle(art)}
            className="min-w-[280px] sm:min-w-[340px] max-w-[340px] snap-start rounded-2xl bg-white border border-slate-200/90 hover:border-sky-400 p-4 shadow-sm hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-200 flex flex-col justify-between cursor-pointer group shrink-0"
          >
            <div className="space-y-3">
              {/* Thumbnail Image with Category Badge */}
              <div className="relative rounded-xl overflow-hidden aspect-16/9 bg-slate-200">
                <img
                  src={art.image}
                  alt={art.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Badges on Top of Image */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-white/95 backdrop-blur-xs shadow-xs ${(art.categoryColor?.text) || 'text-sky-700'}`}>
                    {art.category}
                  </span>
                  {art.badge && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-xs">
                      {art.badge}
                    </span>
                  )}
                </div>

                {/* Read time pill bottom right */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/75 backdrop-blur-xs text-white text-[10px] font-medium flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{art.readTime}</span>
                </div>
              </div>

              {/* Title & Excerpt */}
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-sky-600 transition-colors leading-snug line-clamp-2">
                  {art.title}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {art.summary}
                </p>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3.5 mt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <span>{art.date}</span>
                <span>·</span>
                <span className="font-medium text-slate-700 truncate max-w-[120px]">{art.author.name}</span>
              </div>
              <span className="text-sky-600 font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Baca</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Swipe Indicator Dots & Mobile Prompt */}
      <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <span className="animate-pulse">👉</span> Geser ke samping untuk artikel lainnya
        </span>

        {/* Dots Indicator */}
        <div className="flex items-center gap-1.5">
          {displayArticles.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => scrollToIndex(dotIdx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeIndex === dotIdx 
                  ? 'w-5 bg-sky-600' 
                  : 'w-1.5 bg-slate-200 hover:bg-slate-300'
              }`}
              title={`Artikel ${dotIdx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArticleBlogSection;
