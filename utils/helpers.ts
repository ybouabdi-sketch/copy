
import { MONTH_NAMES } from '../constants';

declare const XLSX: any;

export const formatCurrency = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return (Number.isFinite(num) ? num : 0).toFixed(2);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  } catch {
    return '';
  }
};

export const formatMonth = (monthString: string, lang: 'ar' | 'fr' = 'ar'): string => {
  if (!monthString || !/^\d{4}-\d{2}$/.test(monthString)) return '';
  const [year, month] = monthString.split('-');
  const monthIdx = parseInt(month, 10) - 1;
  const names = MONTH_NAMES[lang];
  return lang === 'ar' ? `${names[monthIdx]} ${year}` : `${names[monthIdx]} ${year}`;
};

export const exportToExcel = (filename: string, data: any[]) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error("Export error:", error);
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
