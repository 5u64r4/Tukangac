import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  increment,
  writeBatch
} from 'firebase/firestore';
import db from '../lib/firebase';
import { Article, ArticleCategory, ArticleStatus } from '../types';
import { ARTICLES_DATA } from '../data/articlesData';
import { logAuditEvent } from './adminService';
import { sanitizeFirestoreData } from '../lib/firebaseUtils';

const ARTICLES_COLLECTION = 'articles';

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

/**
 * Mengambil semua artikel untuk CMS Admin (termasuk draft & archived)
 */
export async function getAllArticles(): Promise<Article[]> {
  try {
    const snapshot = await getDocs(collection(db, ARTICLES_COLLECTION));
    if (snapshot.empty) {
      // Fallback to in-memory initial data if Firestore collection not yet populated
      return ARTICLES_DATA.map(a => ({ ...a, status: (a.status || 'published') as ArticleStatus }));
    }
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Article));
  } catch (err) {
    console.error('Error fetching all articles from Firestore:', err);
    return ARTICLES_DATA.map(a => ({ ...a, status: (a.status || 'published') as ArticleStatus }));
  }
}

/**
 * Mengambil artikel yang terbit (published) untuk Customer Blog
 */
export async function getPublishedArticles(): Promise<Article[]> {
  try {
    const q = query(collection(db, ARTICLES_COLLECTION), where('status', '==', 'published'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return ARTICLES_DATA.filter(a => (a.status || 'published') === 'published');
    }
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Article));
  } catch (err) {
    console.error('Error fetching published articles:', err);
    return ARTICLES_DATA.filter(a => (a.status || 'published') === 'published');
  }
}

/**
 * Menyimpan artikel baru atau update artikel yang sudah ada di Firestore
 */
export async function saveArticle(article: Article): Promise<void> {
  try {
    const docRef = doc(db, ARTICLES_COLLECTION, article.id);
    const categoryTheme = getCategoryTheme(article.category);
    
    const articlePayload: Article = {
      ...article,
      categoryColor: categoryTheme,
      status: article.status || 'published',
      views: article.views || 0,
      updatedAt: new Date().toISOString(),
      createdAt: article.createdAt || new Date().toISOString()
    };

    await setDoc(docRef, sanitizeFirestoreData(articlePayload), { merge: true });

    // Log admin audit
    await logAuditEvent('CMS_SAVE_ARTICLE', 'admin', `Article: ${article.title}`, `Artikel ID: ${article.id} (${articlePayload.status})`);
  } catch (err) {
    console.error(`Error saving article ${article.id}:`, err);
    throw err;
  }
}

/**
 * Menghapus artikel dari database Firestore
 */
export async function deleteArticle(articleId: string, articleTitle: string): Promise<void> {
  try {
    const docRef = doc(db, ARTICLES_COLLECTION, articleId);
    await deleteDoc(docRef);
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
    const docRef = doc(db, ARTICLES_COLLECTION, articleId);
    await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
    await logAuditEvent('CMS_UPDATE_STATUS', 'admin', `Article: ${articleId}`, `Status artikel diubah menjadi: ${status}`);
  } catch (err) {
    console.error(`Error updating status for article ${articleId}:`, err);
    throw err;
  }
}

/**
 * Menambah counter views artikel
 */
export async function incrementArticleViews(articleId: string): Promise<void> {
  try {
    const docRef = doc(db, ARTICLES_COLLECTION, articleId);
    await updateDoc(docRef, { views: increment(1) });
  } catch (err) {
    // Non-blocking
    console.warn('Could not increment article views:', err);
  }
}

/**
 * Seed initial articles to Firestore if collection is empty
 */
export async function seedArticlesIfEmpty(): Promise<void> {
  try {
    const snapshot = await getDocs(collection(db, ARTICLES_COLLECTION));
    if (!snapshot.empty) return;

    const batch = writeBatch(db);
    for (const art of ARTICLES_DATA) {
      const ref = doc(db, ARTICLES_COLLECTION, art.id);
      batch.set(ref, {
        ...art,
        status: 'published',
        views: Math.floor(120 + Math.random() * 450),
        featured: art.id === 'art-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    await batch.commit();
    console.log('Successfully seeded initial articles into Cloud Firestore');
  } catch (err) {
    console.warn('Could not seed articles into Firestore:', err);
  }
}

/**
 * Real-time listener for articles in CMS
 */
export function subscribeArticles(callback: (articles: Article[]) => void) {
  return onSnapshot(collection(db, ARTICLES_COLLECTION), (snapshot) => {
    if (!snapshot.empty) {
      const articles = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Article));
      callback(articles);
    } else {
      callback(ARTICLES_DATA.map(a => ({ ...a, status: (a.status || 'published') as ArticleStatus })));
    }
  }, (err) => {
    if (err.code === 'unavailable' || err.message.includes('offline')) {
      console.info('Articles listener operating in offline/cached mode.');
    } else {
      console.warn('Articles subscription notice:', err.message);
    }
  });
}
