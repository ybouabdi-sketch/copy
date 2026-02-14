
import { useState, useEffect, useRef } from 'react';
import { idbUtil } from '../services/indexedDB';

export function useIndexedDB<T>(key: string, initialValue: T[], memberId?: number): [T[], (value: T[] | ((val: T[]) => T[])) => void, boolean] {
  // المفتاح النهائي يجمع بين نوع البيانات ومعرف المنخرط
  const storageKey = memberId ? `member_${memberId}_${key}` : key;
  
  const [storedValue, setStoredValue] = useState<T[]>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  
  // تتبع المفتاح المحمل حالياً لمنع التداخل
  const lastLoadedKey = useRef<string | null>(null);
  const isDataFresh = useRef(false);

  // 1. تحميل البيانات عند تغيير المستخدم أو نوع البيانات
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    isDataFresh.current = false;

    idbUtil.getAll<T>(storageKey).then(valueFromDb => {
      if (mounted) {
        // إذا وجدنا بيانات، نحملها، وإلا نستخدم القيمة الابتدائية
        const dataToSet = (Array.isArray(valueFromDb) && valueFromDb.length > 0) ? valueFromDb : initialValue;
        setStoredValue(dataToSet);
        lastLoadedKey.current = storageKey;
        isDataFresh.current = true;
        setIsLoading(false);
      }
    }).catch(err => {
      console.error("Load Failed:", err);
      if (mounted) setIsLoading(false);
    });

    return () => { mounted = false; };
  }, [storageKey]);

  // 2. الحفظ التلقائي عند أي تغيير في البيانات
  useEffect(() => {
    // صمام الأمان: لا تحفظ أبداً إذا كنت لا تزال تحمل البيانات
    // أو إذا لم تكن متأكداً أن البيانات الحالية هي أحدث نسخة من قاعدة البيانات
    if (isLoading || !isDataFresh.current || lastLoadedKey.current !== storageKey) {
      return;
    }

    const timeoutId = setTimeout(() => {
      idbUtil.replaceAll(storageKey, storedValue).catch(err => 
        console.error("Save Failed:", err)
      );
    }, 150); // مزامنة سريعة

    return () => clearTimeout(timeoutId);
  }, [storedValue, storageKey, isLoading]);

  const setValue = (value: T[] | ((val: T[]) => T[])) => {
    setStoredValue(prev => {
      const nextValue = typeof value === 'function' ? (value as any)(prev) : value;
      return nextValue;
    });
  };

  return [storedValue, setValue, isLoading];
}
