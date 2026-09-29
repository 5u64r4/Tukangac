import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Eye, 
  Sparkles, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  HelpCircle, 
  Lightbulb, 
  CheckCircle2, 
  Tag, 
  Calendar, 
  Clock, 
  User, 
  Layers, 
  FileText, 
  ArrowRight,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Article, ArticleCategory, ArticleStatus, ArticleContentSection, ArticleFAQ } from '../types';
import { generateSlug, getCategoryTheme } from '../services/articleService';
import technicianImg from '../assets/images/ac_technician_clean_1787975735267.jpg';
import bannerLandscapeImg from '../assets/images/ac_banner_landscape_1787976115488.jpg';
import heroBannerImg from '../assets/images/ac_hero_banner_widescreen_1787976334630.jpg';
import bannerBlueImg from '../assets/images/ac_banner_blue_1787975721114.jpg';

interface ArticleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialArticle: Article | null;
  onSave: (article: Article) => Promise<void>;
  onToast: (msg: string) => void;
}

const PRESET_IMAGES = [
  { name: 'Teknisi Higienis', src: technicianImg, desc: 'Foto pengerjaan teknisi AC profesional' },
  { name: 'Service Landscape', src: bannerLandscapeImg, desc: 'Banner pemeliharaan & cuci AC' },
  { name: 'Unit Outdoor Widescreen', src: heroBannerImg, desc: 'Perawatan unit outdoor AC modern' },
  { name: 'Banner Sky Blue', src: bannerBlueImg, desc: 'Tema biru sejuk higienis' }
];

const CATEGORIES: ArticleCategory[] = [
  'Tips & Hemat',
  'Perawatan AC',
  'Troubleshooting',
  'Standar Layanan'
];

const SERVICES_LIST = [
  { name: 'Cuci AC Reguler (0.5 - 2 PK)', price: 'Rp75.000 / unit' },
  { name: 'Cuci AC Inverter Premium', price: 'Rp95.000 / unit' },
  { name: 'Isi & Tambah Freon R32/R410A', price: 'Mulai Rp175.000' },
  { name: 'Perbaikan AC Bocor Air / Freon', price: 'Mulai Rp150.000' },
  { name: 'Bongkar Pasang AC', price: 'Mulai Rp250.000' },
  { name: 'Perawatan Berkala Kontrak (4x Cuci)', price: 'Rp260.000 / tahun' }
];

export const ArticleEditorModal: React.FC<ArticleEditorModalProps> = ({
  isOpen,
  onClose,
  initialArticle,
  onSave,
  onToast
}) => {
  const [activeEditorTab, setActiveEditorTab] = useState<'editor' | 'preview'>('editor');
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<ArticleCategory>('Tips & Hemat');
  const [status, setStatus] = useState<ArticleStatus>('published');
  const [badge, setBadge] = useState('');
  const [featured, setFeatured] = useState(false);
  const [readTime, setReadTime] = useState('3 mnt baca');
  const [date, setDate] = useState('29 Agu 2026');
  const [authorName, setAuthorName] = useState('Tim Ahli Tukang AC Online');
  const [authorRole, setAuthorRole] = useState('Master Certified HVAC');
  const [image, setImage] = useState(technicianImg);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [summary, setSummary] = useState('');
  
  // Content states
  const [intro, setIntro] = useState('');
  const [sections, setSections] = useState<ArticleContentSection[]>([
    { heading: 'Penyebab & Analisa Utama', body: '' }
  ]);
  const [proTip, setProTip] = useState('');
  const [faqs, setFaqs] = useState<ArticleFAQ[]>([
    { q: '', a: '' }
  ]);
  const [conclusion, setConclusion] = useState('');
  
  // Tags & Service
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['AC Hemat', 'Tips AC', 'Cuci AC']);
  const [relatedService, setRelatedService] = useState('Cuci AC Reguler (0.5 - 2 PK)');

  // Populate data when editing
  useEffect(() => {
    if (initialArticle) {
      setTitle(initialArticle.title);
      setSlug(initialArticle.slug);
      setCategory(initialArticle.category);
      setStatus(initialArticle.status || 'published');
      setBadge(initialArticle.badge || '');
      setFeatured(initialArticle.featured || false);
      setReadTime(initialArticle.readTime);
      setDate(initialArticle.date);
      setAuthorName(initialArticle.author.name);
      setAuthorRole(initialArticle.author.role);
      setImage(initialArticle.image);
      setSummary(initialArticle.summary);
      setIntro(initialArticle.content.intro);
      setSections(initialArticle.content.sections.length > 0 ? initialArticle.content.sections : [{ heading: '', body: '' }]);
      setProTip(initialArticle.content.proTip || '');
      setFaqs(initialArticle.content.faqs && initialArticle.content.faqs.length > 0 ? initialArticle.content.faqs : [{ q: '', a: '' }]);
      setConclusion(initialArticle.content.conclusion || '');
      setTags(initialArticle.tags || []);
      setRelatedService(initialArticle.relatedServiceName || 'Cuci AC Reguler (0.5 - 2 PK)');
    } else {
      // New article reset
      const newId = `art-${Date.now().toString().slice(-4)}`;
      setTitle('');
      setSlug('');
      setCategory('Tips & Hemat');
      setStatus('published');
      setBadge('Baru');
      setFeatured(false);
      setReadTime('3 mnt baca');
      setDate('29 Agu 2026');
      setAuthorName('Tim Ahli Tukang AC Online');
      setAuthorRole('Master Certified HVAC');
      setImage(technicianImg);
      setCustomImageUrl('');
      setSummary('');
      setIntro('');
      setSections([{ heading: 'Langkah Pertama Pengecekan', body: '' }]);
      setProTip('');
      setFaqs([{ q: '', a: '' }]);
      setConclusion('');
      setTags(['Tips AC', 'Cuci AC', 'Hemat Listrik']);
      setRelatedService('Cuci AC Reguler (0.5 - 2 PK)');
    }
  }, [initialArticle, isOpen]);

  // Auto generate slug and word count estimate
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!initialArticle || !slug) {
      setSlug(generateSlug(val));
    }
  };

  const handleAddSection = () => {
    setSections([...sections, { heading: '', body: '' }]);
  };

  const handleRemoveSection = (idx: number) => {
    setSections(sections.filter((_, i) => i !== idx));
  };

  const handleSectionChange = (idx: number, field: 'heading' | 'body', val: string) => {
    const next = [...sections];
    next[idx][field] = val;
    setSections(next);
  };

  const handleAddFaq = () => {
    setFaqs([...faqs, { q: '', a: '' }]);
  };

  const handleRemoveFaq = (idx: number) => {
    setFaqs(faqs.filter((_, i) => i !== idx));
  };

  const handleFaqChange = (idx: number, field: 'q' | 'a', val: string) => {
    const next = [...faqs];
    next[idx][field] = val;
    setFaqs(next);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleCustomImageApply = () => {
    if (customImageUrl.trim()) {
      setImage(customImageUrl.trim());
      onToast('Gambar kustom berhasil diterapkan!');
    }
  };

  const handleSubmit = async (targetStatus?: ArticleStatus) => {
    if (!title.trim()) {
      onToast('Judul artikel wajib diisi');
      return;
    }
    if (!summary.trim()) {
      onToast('Ringkasan / Excerpt artikel wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      const activeServiceObj = SERVICES_LIST.find(s => s.name === relatedService);
      const cleanedFaqs = faqs.filter(f => f.q.trim() && f.a.trim());
      const cleanedSections = sections.filter(s => s.heading.trim() || s.body.trim());

      const articlePayload: Article = {
        id: initialArticle?.id || `art-${Date.now()}`,
        title: title.trim(),
        slug: slug.trim() || generateSlug(title),
        category,
        categoryColor: getCategoryTheme(category),
        status: targetStatus || status,
        badge: badge.trim() || undefined,
        featured,
        readTime: readTime.trim() || '3 mnt baca',
        date: date.trim() || '29 Agu 2026',
        author: {
          name: authorName.trim() || 'Tim Ahli Tukang AC Online',
          role: authorRole.trim() || 'HVAC Specialist'
        },
        image,
        summary: summary.trim(),
        content: {
          intro: intro.trim(),
          sections: cleanedSections.length > 0 ? cleanedSections : [{ heading: 'Pembahasan Utama', body: summary }],
          proTip: proTip.trim() || undefined,
          faqs: cleanedFaqs.length > 0 ? cleanedFaqs : undefined,
          conclusion: conclusion.trim() || 'Selalu percayakan pemeliharaan unit AC Anda kepada teknisi bersertifikat.'
        },
        tags: tags.length > 0 ? tags : ['Edukasi AC'],
        relatedServiceName: relatedService,
        relatedServicePrice: activeServiceObj?.price || 'Rp75.000',
        views: initialArticle?.views || 0,
        createdAt: initialArticle?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSave(articlePayload);
      onToast(`Artikel "${articlePayload.title}" berhasil disimpan di CMS Supabase!`);
      onClose();
    } catch (err) {
      console.error('Error saving article in CMS:', err);
      onToast('Gagal menyimpan artikel: ' + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white w-full max-w-5xl h-[94vh] sm:h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  {initialArticle ? 'Edit Artikel Blog' : 'Tulis Artikel Blog Baru'}
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  status === 'published' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {status === 'published' ? 'PUBLISHED' : 'DRAFT'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Content Management System untuk Edukasi & SEO Pelanggan AC</p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveEditorTab('editor')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeEditorTab === 'editor' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveEditorTab('preview')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeEditorTab === 'preview' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {activeEditorTab === 'editor' ? (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Card 1: Informasi Utama Artikel */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
                    <BookOpen className="w-4 h-4 text-sky-600" />
                    <span>Informasi Utama & Metadata</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={featured} 
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span>Tandai Unggulan (Featured)</span>
                    </label>
                  </div>
                </div>

                {/* Judul Artikel */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Judul Artikel <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Contoh: 5 Penyebab AC Tidak Dingin Tapi Angin Kencang & Solusinya"
                    className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
                  />
                </div>

                {/* Slug & Kategori */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      URL Slug (Permalink)
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="penyebab-ac-tidak-dingin"
                      className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Kategori Artikel <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ArticleCategory)}
                      className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Badge, Estimasi Waktu & Tanggal */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Badge Label (Opsional)
                    </label>
                    <input
                      type="text"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      placeholder="e.g. Populer, SOP Resmi, Tips"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Estimasi Waktu Baca
                    </label>
                    <input
                      type="text"
                      value={readTime}
                      onChange={(e) => setReadTime(e.target.value)}
                      placeholder="3 mnt baca"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tanggal Publikasi
                    </label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="29 Agu 2026"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
                    />
                  </div>
                </div>

                {/* Penulis */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nama Penulis / Tim
                    </label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Tim Teknisi Master Tukang AC"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Jabatan / Kualifikasi Penulis
                    </label>
                    <input
                      type="text"
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      placeholder="SOP Quality Assurance / HVAC Certified"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
                    />
                  </div>
                </div>

                {/* Ringkasan / Excerpt */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ringkasan Singkat (Excerpt / Meta Description) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Ringkasan 1-2 kalimat menarik untuk ditampilkan pada kartu blog dan hasil pencarian..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white leading-relaxed"
                  />
                </div>
              </div>

              {/* Card 2: Gambar Sampul (Cover Image) */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm border-b border-slate-100 pb-3">
                  <ImageIcon className="w-4 h-4 text-sky-600" />
                  <span>Gambar Sampul Artikel</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Pilih dari Preset Galeri Asset AC:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESET_IMAGES.map((preset, idx) => (
                        <div
                          key={idx}
                          onClick={() => setImage(preset.src)}
                          className={`p-2 rounded-xl border-2 transition-all cursor-pointer ${
                            image === preset.src ? 'border-sky-600 bg-sky-50/50 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img src={preset.src} alt={preset.name} className="w-full h-16 object-cover rounded-lg mb-1" />
                          <div className="text-[11px] font-bold text-slate-800 truncate">{preset.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Atau Gunakan URL Gambar Eksternal:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customImageUrl}
                          onChange={(e) => setCustomImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleCustomImageApply}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
                        >
                          Terapkan
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-600 block mb-1">Preview Gambar Terpilih:</span>
                      <div className="h-28 rounded-xl overflow-hidden border border-slate-200 relative">
                        <img src={image} alt="Preview Sampul" className="w-full h-full object-cover" />
                        <div className="absolute bottom-1.5 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Preview Sampul
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Isi & Pembahasan Artikel (Rich Sections) */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
                    <Layers className="w-4 h-4 text-sky-600" />
                    <span>Struktur & Konten Artikel</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Sub-Judul Bahasan</span>
                  </button>
                </div>

                {/* Intro */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Paragraf Pembuka (Introduction)
                  </label>
                  <textarea
                    rows={3}
                    value={intro}
                    onChange={(e) => setIntro(e.target.value)}
                    placeholder="Jelaskan latar belakang masalah atau topik artikel ini secara ringkas dan menarik..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white leading-relaxed"
                  />
                </div>

                {/* Sub-Sections */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-700 block">Sub-Bagian Pembahasan (Poin & Langkah):</span>
                  {sections.map((sec, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-sky-800">Poin #{idx + 1}</span>
                        {sections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                            title="Hapus bagian ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={sec.heading}
                        onChange={(e) => handleSectionChange(idx, 'heading', e.target.value)}
                        placeholder="Sub-Judul Bahasan (e.g. 1. Filter Udara Kotor Menyumbat Sirkulasi)"
                        className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500/20"
                      />
                      <textarea
                        rows={3}
                        value={sec.body}
                        onChange={(e) => handleSectionChange(idx, 'body', e.target.value)}
                        placeholder="Uraian penjelasan lengkap mengenai poin ini..."
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500/20 leading-relaxed"
                      />
                    </div>
                  ))}
                </div>

                {/* Pro Tip Callout */}
                <div className="pt-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pro Tip / Tips Rahasia Teknisi (Kotak Sorotan Khusus)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={proTip}
                    onChange={(e) => setProTip(e.target.value)}
                    placeholder="Contoh: Bersihkan filter AC mandiri 2 minggu sekali untuk menghemat daya kompresor hingga 15%..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-amber-300 bg-amber-50/50 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed"
                  />
                </div>

                {/* Kesimpulan */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kesimpulan & Saran Akhir (Conclusion)
                  </label>
                  <textarea
                    rows={2}
                    value={conclusion}
                    onChange={(e) => setConclusion(e.target.value)}
                    placeholder="Saran kesimpulan dan anjuran memanggil teknisi profesional jika kendala berlanjut..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white leading-relaxed"
                  />
                </div>
              </div>

              {/* Card 4: Tanya Jawab (FAQ) & Tagging & Rekomendasi Layanan */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
                    <HelpCircle className="w-4 h-4 text-indigo-600" />
                    <span>Tanya Jawab (FAQ) & Hubungan Layanan</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah FAQ</span>
                  </button>
                </div>

                {/* FAQ List */}
                <div className="space-y-3">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-indigo-700">Pertanyaan FAQ #{idx + 1}</span>
                        {faqs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFaq(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={faq.q}
                        onChange={(e) => handleFaqChange(idx, 'q', e.target.value)}
                        placeholder="Contoh: Berapa bulan sekali sebaiknya mencuci AC?"
                        className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white"
                      />
                      <textarea
                        rows={2}
                        value={faq.a}
                        onChange={(e) => handleFaqChange(idx, 'a', e.target.value)}
                        placeholder="Jawaban ringkas dan solutif untuk pelanggan..."
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white leading-relaxed"
                      />
                    </div>
                  ))}
                </div>

                {/* Hubungan Layanan Rekomendasi (Call to Action) */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Sambungkan dengan Layanan Booking Rekomendasi (Tombol CTA):
                  </label>
                  <select
                    value={relatedService}
                    onChange={(e) => setRelatedService(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
                  >
                    {SERVICES_LIST.map((srv) => (
                      <option key={srv.name} value={srv.name}>{srv.name} — {srv.price}</option>
                    ))}
                  </select>
                </div>

                {/* Tags SEO */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tags & Kata Kunci (Tekan Enter untuk Menambahkan):
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-slate-300 bg-white min-h-[42px]">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800"
                      >
                        <span>#{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="text-sky-600 hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Ketik tag lalu tekan enter..."
                      className="flex-1 min-w-[140px] text-xs outline-none bg-transparent py-1 px-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* LIVE PREVIEW TAB */
            <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${getCategoryTheme(category).bg} border ${getCategoryTheme(category).border}`}>
                  {category}
                </span>
                <span className="text-xs text-slate-400 font-semibold">{date} · {readTime}</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {title || 'Judul Artikel Anda Akan Muncul Di Sini'}
              </h1>

              <div className="flex items-center gap-3 py-2 border-y border-slate-100">
                <div className="w-9 h-9 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
                  {authorName.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{authorName}</div>
                  <div className="text-[11px] text-slate-500">{authorRole}</div>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                <img src={image} alt={title} className="w-full h-56 object-cover" />
              </div>

              <div className="text-sm font-semibold text-slate-700 bg-sky-50/70 p-4 rounded-2xl border border-sky-100 leading-relaxed">
                {summary || 'Ringkasan artikel akan tampil seperti ini bagi pembaca customer.'}
              </div>

              {intro && (
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {intro}
                </div>
              )}

              {sections.map((sec, idx) => (
                <div key={idx} className="space-y-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">{sec.heading}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">{sec.body}</p>
                </div>
              ))}

              {proTip && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-800">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>TIPS AHLI TEKNISI:</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">{proTip}</p>
                </div>
              )}

              {faqs.filter(f => f.q && f.a).length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-extrabold text-sm text-slate-900">Pertanyaan Sering Diajukan</h3>
                  {faqs.filter(f => f.q && f.a).map((faq, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs font-bold text-slate-900">Q: {faq.q}</div>
                      <div className="text-xs text-slate-600 mt-1">A: {faq.a}</div>
                    </div>
                  ))}
                </div>
              )}

              {conclusion && (
                <div className="p-4 rounded-2xl bg-slate-100 text-xs text-slate-700 leading-relaxed">
                  <strong>Kesimpulan:</strong> {conclusion}
                </div>
              )}

              {/* Call to Action Box in Live Preview */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 text-white flex items-center justify-between shadow-md">
                <div>
                  <div className="text-xs font-bold opacity-85">Layanan Rekomendasi:</div>
                  <div className="text-sm font-black">{relatedService}</div>
                </div>
                <button className="px-3.5 py-1.5 rounded-xl bg-white text-sky-700 font-extrabold text-xs shadow-xs">
                  Pesan Sekarang
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="bg-white px-5 sm:px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600">Simpan Sebagai:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ArticleStatus)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="published">🟢 Published (Terbit)</option>
              <option value="draft">🟡 Draft (Konsep)</option>
              <option value="archived">⚪ Archived (Arsip)</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors cursor-pointer"
            >
              Simpan Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('published')}
              disabled={isSaving}
              className="px-5 py-2 text-xs font-black rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-md shadow-sky-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Terbitkan ke Cloud (Publish)'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
