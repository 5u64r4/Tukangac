import { supabase } from '../lib/supabase';
import { Article, ArticleCategory, ArticleStatus } from '../types';
import { ARTICLES_DATA } from '../data/articlesData';
import { logAuditEvent } from './adminService';

const ARTICLES_TABLE = 'articles';

/**
 * Get category colors for styling
 */
export function getCategoryTheme(category: ArticleCategory): { bg: string; text: string; border: string } {
  switch (category) {
    case 'Standar Layanan':
      return { bg: 'bg-sky-50 text-sky-700', text: 'text-sky-700', border: 'border-sky-200' };
    case 'Tips & Hemat':
      return { bg: 'bg-emerald-50 text-emerald-700', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'Perawatan AC':
      return { bg: 'bg-amber-50 text-amber-700', text: 'text-amber-700', border: 'border-amber-200' };
    case 'Troubleshooting':
      return { bg: 'bg-rose-50 text-rose-700', text: 'text-rose-700', border: 'border-rose-200' };
    default:
      return { bg: 'bg-sky-50 text-sky-700', text: 'text-sky-700', border: 'border-sky-200' };
  }
}

/**
 * Helper to generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

function mapArticleRow(row: any): Article {
  const category = (row.category || 'Tips & Hemat') as ArticleCategory;
  return {
    id: row.id,
    title: row.title || 'Panduan Perawatan AC',
    slug: row.slug || generateSlug(row.title || 'panduan-ac'),
    category,
    categoryColor: row.category_color || row.categoryColor || getCategoryTheme(category),
    status: (row.status || 'published') as ArticleStatus,
    readTime: row.read_time || row.readTime || '3 min baca',
    date: row.date || 'Terbaru',
    author: row.author || { name: 'Tim Teknisi AC', role: 'Spesialis HVAC' },
    image: row.image || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    badge: row.badge,
    summary: row.summary || '',
    content: row.content || {
      intro: '',
      sections: [],
      proTip: '',
      faqs: [],
      conclusion: ''
    },
    tags: Array.isArray(row.tags) ? row.tags : [],
    views: Number(row.views ?? 0),
    featured: Boolean(row.featured ?? false),
    relatedServiceName: row.related_service_name || row.relatedServiceName,
    relatedServicePrice: row.related_service_price || row.relatedServicePrice,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt
  };
}

function mapArticleToRow(article: Article): any {
  const categoryTheme = getCategoryTheme(article.category);
  return {
    id: article.id,
    title: article.title,
    slug: article.slug || generateSlug(article.title),
    category: article.category,
    category_color: article.categoryColor || categoryTheme,
    status: article.status || 'published',
    read_time: article.readTime,
    date: article.date,
    author: article.author,
    image: article.image,
    badge: article.badge || null,
    summary: article.summary,
    content: article.content,
    tags: article.tags || [],
    views: article.views || 0,
    featured: article.featured || false,
    related_service_name: article.relatedServiceName || null,
    related_service_price: article.relatedServicePrice || null,
    updated_at: new Date().toISOString()
  };
}

/**
 * Mengambil semua artikel untuk CMS Admin dari Supabase
 */
export async function getAllArticles(): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from(ARTICLES_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      // Return defaults if database is not yet populated
      return ARTICLES_DATA.map(a => ({ ...a, status: (a.status || 'published') as ArticleStatus }));
    }

    return data.map(mapArticleRow);
  } catch (err) {
    console.error('Error fetching all articles from Supabase:', err);
    return ARTICLES_DATA.map(a => ({ ...a, status: (a.status || 'published') as ArticleStatus }));
  }
}

/**
 * Mengambil artikel yang terbit (published) untuk Customer Blog
 */
export async function getPublishedArticles(): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from(ARTICLES_TABLE)
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return ARTICLES_DATA.filter(a => (a.status || 'published') === 'published');
    }

    return data.map(mapArticleRow);
  } catch (err) {
    console.error('Error fetching published articles from Supabase:', err);
    return ARTICLES_DATA.filter(a => (a.status || 'published') === 'published');
  }
}

/**
 * Menyimpan artikel baru atau update artikel yang sudah ada di Supabase
 */
export async function saveArticle(article: Article): Promise<void> {
  try {
    const row = mapArticleToRow(article);
    const { error } = await supabase
      .from(ARTICLES_TABLE)
      .upsert(row);

    if (error) {
      throw error;
    }

    // Log admin audit
    await logAuditEvent(
      'CMS_SAVE_ARTICLE', 
      'admin', 
      `Article: ${article.title}`, 
      `Artikel ID: ${article.id} (${row.status})`
    );
  } catch (err) {
    console.error(`Error saving article ${article.id}:`, err);
    throw err;
  }
}

/**
 * Menghapus artikel dari database Supabase
 */
export async function deleteArticle(articleId: string, articleTitle: string): Promise<void> {
  try {
    const { error } = await supabase
      .from(ARTICLES_TABLE)
      .delete()
      .eq('id', articleId);

    if (error) {
      throw error;
    }

    await logAuditEvent('CMS_DELETE_ARTICLE', 'admin', `Article: ${articleTitle}`, `Artikel ID: ${articleId} dihapus dari CMS`);
  } catch (err) {
    console.error(`Error deleting article ${articleId}:`, err);
    throw err;
  }
}

/**
 * Memperbarui status artikel (published, draft, archived)
 */
export async function updateArticleStatus(articleId: string, status: ArticleStatus): Promise<void> {
  try {
    const { error } = await supabase
      .from(ARTICLES_TABLE)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', articleId);

    if (error) {
      throw error;
    }

    await logAuditEvent('CMS_UPDATE_STATUS', 'admin', `Article: ${articleId}`, `Status artikel diubah menjadi: ${status}`);
  } catch (err) {
    console.error(`Error updating status for article ${articleId}:`, err);
    throw err;
  }
}

/**
 * Menambah counter views artikel menggunakan PostgreSQL update di Supabase
 */
export async function incrementArticleViews(articleId: string): Promise<void> {
  try {
    // 1. Try Supabase RPC if defined
    const { error: rpcError } = await supabase.rpc('increment_article_views', { article_id: articleId });
    if (!rpcError) return;

    // 2. Fallback: select current views and update
    const { data } = await supabase
      .from(ARTICLES_TABLE)
      .select('views')
      .eq('id', articleId)
      .single();

    const currentViews = Number(data?.views ?? 0);
    await supabase
      .from(ARTICLES_TABLE)
      .update({ views: currentViews + 1, updated_at: new Date().toISOString() })
      .eq('id', articleId);
  } catch (err) {
    console.warn('Could not increment article views in Supabase:', err);
  }
}

/**
 * Seed initial articles to Supabase if collection is empty
 */
export async function seedArticlesIfEmpty(): Promise<void> {
  try {
    const { data } = await supabase.from(ARTICLES_TABLE).select('id').limit(1);
    if (data && data.length > 0) return;

    const rows = ARTICLES_DATA.map(art => mapArticleToRow({
      ...art,
      status: 'published',
      views: Math.floor(120 + Math.random() * 450),
      featured: art.id === 'art-1'
    }));

    await supabase.from(ARTICLES_TABLE).insert(rows);
  } catch (err) {
    console.warn('Could not seed articles into Supabase:', err);
  }
}

/**
 * Real-time listener for articles in CMS via Supabase Realtime
 */
export function subscribeArticles(callback: (articles: Article[]) => void): () => void {
  getAllArticles().then(callback);

  const channel = supabase
    .channel('articles_cms_realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: ARTICLES_TABLE
      },
      () => {
        getAllArticles().then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel ? supabase.removeChannel(channel) : channel.unsubscribe();
  };
}
