import React, { createContext, useContext, useState, useEffect } from 'react';
import { Translations, Language } from '@/constants/Translations';
import { db, auth } from '@/constants/FirebaseConfig';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LanguageContextType = {
  locale: Language;
  setLocale: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Language>('es');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadLocalLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('user_language');
        if (savedLang && ['es', 'en', 'pt', 'fr', 'ko', 'ru', 'ar'].includes(savedLang)) {
          setLocaleState(savedLang as Language);
        }
      } catch (e) {
        console.error("Error loading local lang", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadLocalLanguage();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    
    // Solo permitimos que Firebase actualice el idioma si no hay uno local o si viene del perfil web
    const unsubscribe = onSnapshot(userRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const validLangs: Language[] = ['es', 'en', 'pt', 'fr', 'ko', 'ru', 'ar'];
        
        // Verificamos si en la base de datos es distinto a local,
        // pero AsyncStorage tiene prioridad en móviles.
        if (data.language && validLangs.includes(data.language)) {
          const localLang = await AsyncStorage.getItem('user_language');
          if (!localLang) {
            setLocaleState(data.language);
            AsyncStorage.setItem('user_language', data.language);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const setLocale = async (lang: Language) => {
    setLocaleState(lang);
    try {
      await AsyncStorage.setItem('user_language', lang);
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { language: lang }, { merge: true });
      }
    } catch (e) {
       console.error("Error setting language", e);
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

  if (!isLoaded) return null;

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
