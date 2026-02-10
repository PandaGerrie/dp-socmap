import { createContext, useContext, useState, useEffect } from 'react'
import translations from '../data/translations.json'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Try to get saved language from localStorage
    const savedLanguage = localStorage.getItem('appLanguage')
    return savedLanguage || 'nl' // Default to Dutch
  })

  const t = (path) => {
    const keys = path.split('.')
    let value = translations[currentLanguage]
    
    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key]
      } else {
        return path // Return the path if translation not found
      }
    }
    
    return value || path
  }

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setCurrentLanguage(lang)
      localStorage.setItem('appLanguage', lang)
    }
  }

  useEffect(() => {
    // Save language preference whenever it changes
    localStorage.setItem('appLanguage', currentLanguage)
  }, [currentLanguage])

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: [
      { code: 'nl', name: 'Nederlands', shortName: 'NL' },
      { code: 'fr', name: 'Français', shortName: 'FR' },
      { code: 'en', name: 'English', shortName: 'EN' },
      { code: 'ber', name: 'Tamaziɣt', shortName: 'ⵜⵎ' }
    ]
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
