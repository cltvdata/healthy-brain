import React, { createContext, useContext, useState, useEffect } from 'react';
import { Translations, Language } from '@/constants/Translations';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

type LanguageContextType = {
  locale: Language;
  setLocale: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Language>('es');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    
    // Listen for remote changes (e.g. from profile setup)
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const validLangs: Language[] = ['es', 'en', 'pt', 'fr'];
        if (data.language && validLangs.includes(data.language)) {
          setLocaleState(data.language);
        }
      }
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const setLocale = async (lang: Language) => {
    setLocaleState(lang);
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { language: lang }, { merge: true });
    }
  };

  const t = (path: string, params?: Record<string, string | number>) => {
    const keys = path.split('.');
    let result = Translations[locale];

    for (const key of keys) {
      if (result && result[key]) {
        result = result[key];
      } else {
        return path; // Fallback to key name
      }
    }

    if (typeof result !== 'string') return path;

    // Handle params (e.g. {{days}})
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        result = (result as string).replace(`{{${key}}}`, String(value));
      });
    }

    return result as string;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
