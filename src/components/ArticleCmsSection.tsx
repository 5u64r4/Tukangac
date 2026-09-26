import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  Copy, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  BookOpen, 
  TrendingUp, 
  Layers, 
  Share2, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  Flame,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Article, ArticleCategory, ArticleStatus } from '../types';
import { ArticleEditorModal } from './ArticleEditorModal';
import { ArticleDetailModal } from './ArticleDetailModal';
import { 
  saveArticle, 
  deleteArticle, 
  updateArticleStatus, 
  getCategoryTheme 
} from '../services/articleService';

interface ArticleCmsSectionProps {
  articles?: Article[];
  onRefreshArticles?: () => Promise<void>;
  onToast: (msg: string) => void;
}

export const ArticleCmsSection: React.FC<ArticleCmsSectionProps> = ({
  articles = [],
  onRefreshArticles,
  onToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const safeArticles = Array.isArray(articles) ? articles : [];

  // Statistics calculation
  const totalArticles = safeArticles.length;
  const publishedCount = safeArticles.filter(a => (a.status || 'published') === 'published').length;
  const draftCount = safeArticles.filter(a => a.status === 'draft').length;
  const totalViews = safeArticles.reduce((sum, a) => sum + (a.views || 0), 0);

  // Filtering
  const filteredArticles = safeArticles.filter(art => {
    const status = art.status || 'published';
    const matchStatus = selectedStatus === 'all' ? true : status === selectedStatus;
    const matchCategory = selectedCategory === 'Semua' ? true : art.category === selectedCategory;
    const matchSearch = 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.tags && art.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchStatus && matchCategory && matchSearch;
  });

  const handleOpenNew = () => {
    setEditingArticle(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (art: Article) => {
    setEditingArticle(art);
    setIsEditorOpen(true);
  };

  const handleDuplicate = async (art: Article) => {
    try {
      const duplicatePayload: Article = {
        ...art,
        id: `art-copy-${Date.now().toString().slice(-5)}`,
        title: `${art.title} (Salinan Draft)`,
        slug: `${art.slug}-copy-${Date.now().toString().slice(-4)}`,
        status: 'draft',
        badge: 'Draft Baru',
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveArticle(duplicatePayload);
      await onRefreshArticles();
      onToast(`Artikel "${art.title}" berhasil diduplikasi menjadi Draft!`);
    } catch (err) {
      console.error('Error duplicating article:', err);
      onToast('Gagal menduplikasi artikel');
    }
  };

  const handleToggleStatus = async (art: Article) => {
    const current = art.status || 'published';
    const nextStatus: ArticleStatus = current === 'published' ? 'draft' : 'published';
    try {
      await updateArticleStatus(art.id, nextStatus);
      await onRefreshArticles();
      onToast(`Status artikel diubah menjadi: ${nextStatus === 'published' ? '🟢 Published (Terbit)' : '🟡 Draft (Konsep)'}`);
    } catch (err) {
      console.error('Error updating status:', err);
      onToast('Gagal mengubah status artikel');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteArticle(deleteTarget.id, deleteTarget.title);
      await onRefreshArticles();
      onToast(`Artikel "${deleteTarget.title}" berhasil dihapus dari database.`);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting article:', err);
      onToast('Gagal menghapus artikel: ' + (err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshArticles();
    setIsRefreshing(false);
    onToast('Data CMS Artikel Blog berhasil disinkronkan dengan Cloud Firestore.');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Quick Stats */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Blog Content Management System</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Manajemen Artikel & Edukasi AC
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Kelola publikasi panduan tips hemat, jadwal pembersihan, dan troubleshooting teknis AC untuk meningkatkan edukasi pelanggan serta performa SEO.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-2 transition-all border border-white/10 cursor-pointer"
              title="Sinkronkan data dari Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Cloud</span>
            </button>

            <button
              onClick={handleOpenNew}
              className="px-4 sm:px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-sky-500/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tulis Artikel Baru</span>
            </button>
          </div>
        </div>

        {/* CMS Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-700/60 mt-6">
          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Total Artikel</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">{totalArticles}</div>
            <div className="text-[10px] text-sky-400 mt-0.5 font-medium">Dalam Database</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Published</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">{publishedCount}</div>
            <div className="text-[10px] text-slate-300 mt-0.5 font-medium">Aktif Dibaca Customer</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Draft / Konsep</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">{draftCount}</div>
            <div className="text-[10px] text-slate-300 mt-0.5 font-medium">Menunggu Rilis</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <div className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">Total Pembaca</div>
            <div className="text-xl sm:text-2xl font-black text-purple-300 mt-0.5">{totalViews.toLocaleString('id-ID')}</div>
            <div className="text-[10px] text-purple-200 mt-0.5 font-medium">Akumulasi Views</div>
          </div>
        </div>
      </div>

      {/* 2. Filter, Search & Status Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul, kata kunci, tag..."
            className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50"
          />
        </div>

        {/* Filter Badges & Status */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Tips & Hemat">Tips & Hemat</option>
            <option value="Perawatan AC">Perawatan AC</option>
            <option value="Troubleshooting">Troubleshooting</option>
            <option value="Standar Layanan">Standar Layanan</option>
          </select>

          {/* Status Tabs */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold border border-slate-200/80">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Semua ({totalArticles})
            </button>
            <button
              onClick={() => setSelectedStatus('published')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedStatus === 'published' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Published ({publishedCount})
            </button>
            <button
              onClick={() => setSelectedStatus('draft')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedStatus === 'draft' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Draft ({draftCount})
            </button>
          </div>
        </div>
      </div>

      {/* 3. Article List Grid / Table */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-800 text-base">Tidak ada artikel yang cocok</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Ubah kata kunci pencarian atau kategori, atau buat artikel baru sekarang.
          </p>
          <button
            onClick={handleOpenNew}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md shadow-sky-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Artikel Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredArticles.map((art) => {
            const isPub = (art.status || 'published') === 'published';
            const catTheme = getCategoryTheme(art.category);

            return (
              <div
                key={art.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
              >
                {/* Left: Thumbnail & Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-200 relative bg-slate-100">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {art.badge && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[9px] font-black uppercase rounded-md bg-slate-900/80 backdrop-blur-xs text-white">
                        {art.badge}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${catTheme.bg} border ${catTheme.border}`}>
                        {art.category}
                      </span>

                      {/* Status pill */}
                      <button
                        onClick={() => handleToggleStatus(art)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors ${
                          isPub
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        }`}
                        title="Klik untuk mengubah status (Published / Draft)"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isPub ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        <span>{isPub ? 'Published' : 'Draft'}</span>
                      </button>

                      <span className="text-[11px] text-slate-400 font-medium">
                        {art.date} · {art.readTime}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug group-hover:text-sky-600 transition-colors line-clamp-2">
                      {art.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                      {art.summary}
                    </p>

                    {/* Author & Stats Tag */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">✍️ {art.author.name}</span>
                      <span>👁️ {art.views || 0} views</span>
                      {art.relatedServiceName && (
                        <span className="text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/80">
                          CTA: {art.relatedServiceName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0">
                  <button
                    onClick={() => setPreviewArticle(art)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-700 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="Pratinjau Artikel (Preview)"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Preview</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(art)}
                    className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="Edit Artikel"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  <button
                    onClick={() => handleDuplicate(art)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                    title="Duplikasi artikel ke draft baru"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteTarget(art)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Hapus artikel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      <ArticleEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingArticle(null);
        }}
        initialArticle={editingArticle}
        onSave={async (article) => {
          await saveArticle(article);
          await onRefreshArticles();
        }}
        onToast={onToast}
      />

      {/* Reader Preview Modal */}
      <ArticleDetailModal
        article={previewArticle}
        onClose={() => setPreviewArticle(null)}
        onSelectService={() => {}}
        onToast={onToast}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900">Hapus Artikel dari CMS?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus artikel <strong className="text-slate-800">"{deleteTarget.title}"</strong> dari database Cloud Firestore? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-extrabold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow-md shadow-rose-600/30"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Sekarang'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
