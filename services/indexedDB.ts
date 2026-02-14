
import { DB_NAME, DB_VERSION, STORES } from '../constants';

const getDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      STORES.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName); // إنشاء مخزن KV بسيط
        }
      });
    };
  });
};

const KV_STORE = 'central_kv_store';

export const idbUtil = {
  // جلب البيانات بواسطة مفتاح (Key)
  getAll: async <T>(key: string): Promise<T[]> => {
    try {
      const db = await getDb();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(KV_STORE, 'readonly');
        const store = transaction.objectStore(KV_STORE);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error(`IDB Get Error [${key}]:`, e);
      return [];
    }
  },
  
  // حفظ البيانات بواسطة مفتاح (Key)
  replaceAll: async <T>(key: string, data: T[]): Promise<void> => {
    try {
      const db = await getDb();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(KV_STORE, 'readwrite');
        const store = transaction.objectStore(KV_STORE);
        
        // استخدام put لتحديث القيمة المرتبطة بالمفتاح أو إنشائها
        const request = store.put(data, key);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error(`IDB Save Error [${key}]:`, e);
    }
  }
};
