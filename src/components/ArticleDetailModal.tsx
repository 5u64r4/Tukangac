import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Clock, 
  Calendar, 
  User, 
  Share2, 
  CheckCircle2, 
  Lightbulb, 
  ArrowRight,
  HelpCircle,
  Sparkles,
  Bookmark
} from 'lucide-react';
import { Article } from '../data/articlesData';

interface ArticleDetailModalProps {
  article: Article | null;
  onClose: () => void;
  onSelectService?: (serviceName: string) => void;
  onToast: (msg: string) => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  article,
  onClose,
  onSelectService,
  onToast
}) => {
  if (!article) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href
      }).catch(() => {
        onToast('Tautan artikel disalin ke clipboard');
      });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      onToast('Tautan artikel berhasil disalin');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.96 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        >
          {/* Header Bar */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${article.categoryColor.bg} ${article.categoryColor.border}`}>
                {article.category}
              </span>
              <span className="text-xs text-slate-400 font-medium">·</span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {article.readTime}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleShare}
                className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-colors"
                title="Bagikan Artikel"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
            {/* Title & Metadata */}
            <div className="space-y-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {article.title}
              </h1>

              <div className="flex items-center justify-between pt-1 border-b border-slate-100 pb-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                    {article.author.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{article.author.name}</div>
                    <div className="text-[11px] text-slate-400">{article.author.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{article.date}</span>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-100 max-h-64 sm:max-h-80">
              <img
                src={article.image}
                alt={article.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {article.badge && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-sky-600 to-blue-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md">
                  {article.badge}
                </div>
              )}
            </div>

            {/* Intro Lead Paragraph */}
            <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-sky-500 text-slate-700 text-sm leading-relaxed font-medium">
              {article.content.intro}
            </div>

            {/* Article Main Sections */}
            <div className="space-y-5">
              {article.content.sections.map((sec, idx) => (
                <div key={idx} className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900 flex items-start gap-2">
                    <span className="text-sky-600">▪</span>
                    <span>{sec.heading}</span>
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed pl-4">
                    {sec.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Pro Tip Box */}
            {article.content.proTip && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200/80 shadow-xs">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>Pro Tip dari Teknisi Tukang AC Online</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-800/90 leading-relaxed pl-6">
                  {article.content.proTip}
                </p>
              </div>
            )}

            {/* FAQs if present */}
            {article.content.faqs && article.content.faqs.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <HelpCircle className="w-4 h-4 text-sky-600" />
                  <span>Pertanyaan yang Sering Diajukan (FAQ)</span>
                </div>
                <div className="space-y-2.5">
                  {article.content.faqs.map((faq, fIdx) => (
                    <div key={fIdx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs sm:text-sm space-y-1">
                      <div className="font-bold text-slate-800">Q: {faq.q}</div>
                      <div className="text-slate-600 leading-relaxed">A: {faq.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conclusion */}
            <div className="pt-2 pb-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
              <strong className="text-slate-800">Kesimpulan: </strong>
              {article.content.conclusion}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-xs text-slate-400 mr-1">Topik:</span>
              {article.tags.map((tag, tIdx) => (
                <span 
                  key={tIdx}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Related Service CTA Card */}
            {article.relatedServiceName && (
              <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-900 to-blue-900 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300">
                    <Sparkles className="w-3 h-3" />
                    Layanan Terkait Artikel Ini
                  </div>
                  <h4 className="font-extrabold text-base text-white">
                    {article.relatedServiceName}
                  </h4>
                  {article.relatedServicePrice && (
                    <p className="text-xs text-sky-200">
                      Mulai dari <strong className="text-white font-bold">{article.relatedServicePrice}</strong> · Garansi 30 Hari
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onSelectService && article.relatedServiceName) {
                      onSelectService(article.relatedServiceName);
                    }
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                >
                  <span>Pesan Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
