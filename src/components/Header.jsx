import { useState, useRef, useEffect } from 'react'
import './Header.css'
import logo from '../assets/icons/dePluim.png'
import { useLanguage } from '../context/LanguageContext'

function Header() {
  const { currentLanguage, changeLanguage, t, availableLanguages } = useLanguage()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode)
    setIsDropdownOpen(false)
  }

  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage)

  return (
    <header className="app-header">
      <div className="header-left">
        <img src={logo} alt="Logo" className="header-logo" />
        <h1 className="header-title">{t('header.title')}</h1>
      </div>
      <div className="header-right">
        <div className="language-switcher" ref={dropdownRef}>
          <button 
            className="language-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {currentLang?.shortName || 'NL'}
            <span className="language-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
          </button>
          
          {isDropdownOpen && (
            <div className="language-dropdown">
              {availableLanguages.map((lang) => (
                <div
                  key={lang.code}
                  className={`language-option ${lang.code === currentLanguage ? 'active' : ''}`}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <span className="language-short">{lang.shortName}</span>
                  <span className="language-full">{lang.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
