import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variable retrieval
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseAnonKey.includes('placeholder') &&
    supabaseUrl.startsWith('http')
  );
};

// ============================================================================
// Fallback Local Store & Realtime Emitter (Ensures robust offline/preview mode)
// ============================================================================
type EventCallback = (payload: any) => void;
const subscribers: Map<string, Set<EventCallback>> = new Map();

export const notifyTableChange = (table: string, eventType: 'INSERT' | 'UPDATE' | 'DELETE', newRecord: any, oldRecord?: any) => {
  const callbacks = subscribers.get(table);
  if (callbacks) {
    const payload = {
      eventType,
      new: newRecord,
      old: oldRecord || newRecord,
      table,
      schema: 'public',
      commit_timestamp: new Date().toISOString()
    };
    callbacks.forEach(cb => {
      try {
        cb(payload);
      } catch (err) {
        console.warn('Realtime callback error:', err);
      }
    });
  }
};

const getLocalTableData = (table: string): any[] => {
  try {
    const stored = localStorage.getItem(`sb_${table}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn(`Error reading local table ${table}:`, e);
  }
  return [];
};

const setLocalTableData = (table: string, data: any[]) => {
  try {
    localStorage.setItem(`sb_${table}`, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error saving local table ${table}:`, e);
  }
};

// Builder simulation for offline / preview fallback
class MockQueryBuilder {
  private table: string;
  private filters: Array<(item: any) => boolean> = [];
  private orderField?: string;
  private orderAscending: boolean = true;
  private isSingle: boolean = false;

  constructor(table: string) {
    this.table = table;
  }

  select(_columns: string = '*') {
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push(item => {
      const val = item[column] ?? item[this.toSnakeCase(column)] ?? item[this.toCamelCase(column)];
      return String(val) === String(value);
    });
    return this;
  }

  ilike(column: string, value: string) {
    const target = String(value).toLowerCase();
    this.filters.push(item => {
      const val = String(item[column] ?? item[this.toSnakeCase(column)] ?? item[this.toCamelCase(column)] ?? '').toLowerCase();
      return val === target;
    });
    return this;
  }

  order(column: string, options: { ascending?: boolean } = { ascending: true }) {
    this.orderField = column;
    this.orderAscending = options.ascending ?? true;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isSingle = true;
    return this;
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  private toCamelCase(str: string): string {
    return str.replace(/([-_][a-z])/ig, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''));
  }

  async then(resolve: (res: { data: any; error: any }) => void, reject?: (err: any) => void) {
    try {
      let rows = [...getLocalTableData(this.table)];
      for (const filter of this.filters) {
        rows = rows.filter(filter);
      }

      if (this.orderField) {
        const field = this.orderField;
        rows.sort((a, b) => {
          const valA = a[field] ?? '';
          const valB = b[field] ?? '';
          if (valA < valB) return this.orderAscending ? -1 : 1;
          if (valA > valB) return this.orderAscending ? 1 : -1;
          return 0;
        });
      }

      const resultData = this.isSingle ? (rows[0] || null) : rows;
      resolve({ data: resultData, error: null });
    } catch (err) {
      if (reject) reject(err);
      else resolve({ data: null, error: err });
    }
  }

  async insert(data: any | any[]) {
    const rows = getLocalTableData(this.table);
    const toInsert = Array.isArray(data) ? data : [data];
    const inserted = toInsert.map(item => ({
      ...item,
      id: item.id || `rec_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      created_at: item.created_at || new Date().toISOString()
    }));

    const updated = [...inserted, ...rows];
    setLocalTableData(this.table, updated);

    inserted.forEach(record => {
      notifyTableChange(this.table, 'INSERT', record);
    });

    return { data: this.isSingle ? inserted[0] : inserted, error: null };
  }

  async upsert(data: any | any[]) {
    let rows = [...getLocalTableData(this.table)];
    const toUpsert = Array.isArray(data) ? data : [data];

    for (const item of toUpsert) {
      const idx = rows.findIndex(r => r.id === item.id);
      if (idx >= 0) {
        rows[idx] = { ...rows[idx], ...item, updated_at: new Date().toISOString() };
        notifyTableChange(this.table, 'UPDATE', rows[idx]);
      } else {
        const newItem = {
          ...item,
          id: item.id || `rec_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          created_at: item.created_at || new Date().toISOString()
        };
        rows.unshift(newItem);
        notifyTableChange(this.table, 'INSERT', newItem);
      }
    }

    setLocalTableData(this.table, rows);
    return { data, error: null };
  }

  async update(patch: any) {
    let rows = [...getLocalTableData(this.table)];
    let matchedCount = 0;
    let lastUpdated: any = null;

    rows = rows.map(item => {
      let matches = true;
      for (const filter of this.filters) {
        if (!filter(item)) {
          matches = false;
          break;
        }
      }
      if (matches) {
        matchedCount++;
        lastUpdated = { ...item, ...patch, updated_at: new Date().toISOString() };
        notifyTableChange(this.table, 'UPDATE', lastUpdated, item);
        return lastUpdated;
      }
      return item;
    });

    setLocalTableData(this.table, rows);
    return { data: lastUpdated, error: null, count: matchedCount };
  }

  async delete() {
    let rows = [...getLocalTableData(this.table)];
    let deletedCount = 0;

    const remaining = rows.filter(item => {
      let matches = true;
      for (const filter of this.filters) {
        if (!filter(item)) {
          matches = false;
          break;
        }
      }
      if (matches) {
        deletedCount++;
        notifyTableChange(this.table, 'DELETE', item);
        return false;
      }
      return true;
    });

    setLocalTableData(this.table, remaining);
    return { data: null, error: null, count: deletedCount };
  }
}

// Channel simulation for Realtime
class MockChannel {
  private channelName: string;
  private listeners: Array<{ table: string; callback: EventCallback }> = [];

  constructor(channelName: string) {
    this.channelName = channelName;
  }

  on(type: string, filter: { event: string; schema?: string; table: string }, callback: EventCallback) {
    if (filter.table) {
      this.listeners.push({ table: filter.table, callback });
      if (!subscribers.has(filter.table)) {
        subscribers.set(filter.table, new Set());
      }
      subscribers.get(filter.table)!.add(callback);
    }
    return this;
  }

  subscribe() {
    return this;
  }

  unsubscribe() {
    this.listeners.forEach(({ table, callback }) => {
      const set = subscribers.get(table);
      if (set) {
        set.delete(callback);
      }
    });
  }
}

// Local mock client fallback
const createLocalMockClient = () => {
  return {
    from: (table: string) => new MockQueryBuilder(table),
    channel: (name: string) => new MockChannel(name),
    rpc: async (functionName: string, params: any) => {
      if (functionName === 'increment_article_views' && params?.article_id) {
        const articles = getLocalTableData('articles');
        const idx = articles.findIndex((a: any) => a.id === params.article_id);
        if (idx >= 0) {
          articles[idx].views = (articles[idx].views || 0) + 1;
          setLocalTableData('articles', articles);
          notifyTableChange('articles', 'UPDATE', articles[idx]);
        }
      }
      return { data: null, error: null };
    },
    auth: {
      signUp: async ({ email, password, options }: any) => {
        const normalizedEmail = (email || '').trim().toLowerCase();
        const role = normalizedEmail === 'sugara.ardi@gmail.com' ? 'superadmin' : 'customer';
        const fullName = options?.data?.full_name || 'Pengguna Baru';
        const phone = options?.data?.phone || '';
        const id = `usr_${Date.now()}`;

        const user = {
          id,
          email,
          user_metadata: {
            full_name: fullName,
            phone,
            role
          }
        };

        // Upsert to local profiles table
        const profiles = getLocalTableData('profiles');
        const existingIdx = profiles.findIndex((p: any) => p.email && p.email.toLowerCase() === normalizedEmail);
        const profileRecord = {
          id,
          email,
          full_name: fullName,
          phone,
          role,
          is_active: true,
          created_at: new Date().toISOString()
        };

        if (existingIdx >= 0) {
          profiles[existingIdx] = { ...profiles[existingIdx], ...profileRecord };
        } else {
          profiles.push(profileRecord);
        }
        setLocalTableData('profiles', profiles);

        localStorage.setItem('sb_current_user', JSON.stringify(user));
        return { data: { user, session: { user } }, error: null };
      },
      signInWithPassword: async ({ email, password }: any) => {
        const normalizedEmail = (email || '').trim().toLowerCase();

        // One-way SHA-256 hash helper for offline verification (no plain text passwords stored)
        const sha256Hex = async (str: string): Promise<string> => {
          try {
            const msgUint8 = new TextEncoder().encode(str);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          } catch {
            return '';
          }
        };

        // Tester account role mapping with cryptographic password digests
        const testerAccountMap: Record<string, { passHash: string; role: string; name: string; phone: string }> = {
          'budisantoso@gmail.com': {
            passHash: '15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225',
            role: 'customer',
            name: 'Budi Santoso',
            phone: '0812-3456-7890'
          },
          'andipratama@gmail.com': {
            passHash: '15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225',
            role: 'technician',
            name: 'Andi Pratama',
            phone: '0812-9876-5432'
          },
          'ardi5u64r4@gmail.com': {
            passHash: '63640264849a87c90356129d99ea165e37aa5fabc1fea46906df1a7ca50db492',
            role: 'admin',
            name: 'Ardi Sugara (Admin)',
            phone: '0812-3456-7890'
          },
          'sugara.ardi@gmail.com': {
            passHash: '347c9a3a91ceee960653d6c8ef724405f6896279ce72d8e77fc771f7ae2b0bd4',
            role: 'superadmin',
            name: 'Ardi Sugara (Superadmin)',
            phone: '0812-3456-7890'
          }
        };

        // If tester account, validate using cryptographic digest
        if (testerAccountMap[normalizedEmail]) {
          const expected = testerAccountMap[normalizedEmail];
          const inputHash = await sha256Hex(password || '');
          if (inputHash !== expected.passHash) {
            return {
              data: { user: null, session: null },
              error: new Error('Password salah. Silakan coba lagi.')
            };
          }
        }

        const profiles = getLocalTableData('profiles');
        const existing = profiles.find((p: any) => p.email && p.email.toLowerCase() === normalizedEmail);

        let role = existing?.role || 'customer';
        let fullName = existing?.full_name || 'Pengguna';
        let phone = existing?.phone || '0812-3456-7890';
        let id = existing?.id || `usr_${Date.now()}`;

        if (testerAccountMap[normalizedEmail]) {
          role = testerAccountMap[normalizedEmail].role;
          fullName = testerAccountMap[normalizedEmail].name;
          phone = testerAccountMap[normalizedEmail].phone;
        }

        // Keep local profiles consistent
        const profileRecord = {
          id,
          email,
          full_name: fullName,
          phone,
          role,
          is_active: true,
          created_at: existing?.created_at || new Date().toISOString()
        };

        const existingIdx = profiles.findIndex((p: any) => p.email && p.email.toLowerCase() === normalizedEmail);
        if (existingIdx >= 0) {
          profiles[existingIdx] = { ...profiles[existingIdx], ...profileRecord };
        } else {
          profiles.push(profileRecord);
        }
        setLocalTableData('profiles', profiles);

        const user = {
          id,
          email,
          user_metadata: {
            full_name: fullName,
            phone,
            role
          }
        };

        localStorage.setItem('sb_current_user', JSON.stringify(user));
        return { data: { user, session: { user } }, error: null };
      },
      signOut: async () => {
        localStorage.removeItem('sb_current_user');
        return { error: null };
      },
      getSession: async () => {
        try {
          const u = localStorage.getItem('sb_current_user');
          if (u) {
            const user = JSON.parse(u);
            return { data: { session: { user } }, error: null };
          }
        } catch (_) {}
        return { data: { session: null }, error: null };
      },
      onAuthStateChange: (_callback: any) => {
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    }
  } as unknown as SupabaseClient;
};

// Export the singleton supabase client instance
export const supabase: SupabaseClient = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : createLocalMockClient();

export default supabase;
