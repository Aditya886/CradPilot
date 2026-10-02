import en from "./en.json";

export const t = (key: string): string => {
  const keys = key.split('.');
  let result: any = en;

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k as keyof typeof result];
    } else {
      return key;
    }
  }

  return typeof result === 'string' ? result : key;
};