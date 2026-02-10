import { useState, useMemo } from 'react'
import './Sidebar.css'
import locations from '../data/locations.json'
import { useLanguage } from '../context/LanguageContext'

function Sidebar({ onLocationSearch, isCollapsed, setIsCollapsed, searchedLocation, selectedTypes, setSelectedTypes, schoolRadius, setSchoolRadius, addressRadius, setAddressRadius }) {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
  const [filterSearchQuery, setFilterSearchQuery] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    
    try {
      // Using Nominatim API for geocoding (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=be`
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectLocation = (result) => {
    const location = {
      name: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon)
    }
    onLocationSearch(location)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleClearSelection = () => {
    onLocationSearch(null)
  }

  // Group types by masterType (excluding "Ignore")
  const typesByMasterType = useMemo(() => {
    const grouped = {}
    locations.forEach(loc => {
      if (loc.masterType && loc.masterType !== 'Ignore' && loc.type) {
        if (!grouped[loc.masterType]) {
          grouped[loc.masterType] = new Set()
        }
        grouped[loc.masterType].add(loc.type)
      }
    })
    
    // Convert Sets to sorted arrays
    const result = {}
    Object.keys(grouped).sort().forEach(masterType => {
      result[masterType] = Array.from(grouped[masterType]).sort()
    })
    
    return result
  }, [])

  // Filter types based on search query
  const filteredTypesByMasterType = useMemo(() => {
    if (!filterSearchQuery) return typesByMasterType
    
    const filtered = {}
    Object.entries(typesByMasterType).forEach(([masterType, types]) => {
      const matchingTypes = types.filter(type =>
        type.toLowerCase().includes(filterSearchQuery.toLowerCase()) ||
        masterType.toLowerCase().includes(filterSearchQuery.toLowerCase())
      )
      if (matchingTypes.length > 0) {
        filtered[masterType] = matchingTypes
      }
    })
    
    return filtered
  }, [typesByMasterType, filterSearchQuery])

  const handleToggleType = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type))
    } else {
      setSelectedTypes([...selectedTypes, type])
    }
  }

  const handleClearFilters = () => {
    setSelectedTypes([])
  }

  return (
    <>
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-content">
          <h2>{t('sidebar.yourLocation')}</h2>
          <p>{t('sidebar.locationDescription')}</p>
          
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('sidebar.searchPlaceholder')}
              className="search-input"
            />
            <button type="submit" className="search-button" disabled={isSearching}>
              {isSearching ? t('sidebar.searching') : t('sidebar.searchButton')}
            </button>
          </form>

          {/* Selected location card */}
          {searchedLocation && (
            <div className="selected-location-card">
              <div className="selected-location-info">
                <span className="selected-icon">📍</span>
                <span className="selected-name">{searchedLocation.name}</span>
              </div>
              <button 
                className="clear-selection-button" 
                onClick={handleClearSelection}
                title={t('sidebar.clearSelection')}
              >
                ✕
              </button>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="search-result-item"
                  onClick={() => handleSelectLocation(result)}
                >
                  <span className="result-icon">📍</span>
                  <span className="result-name">{result.display_name}</span>
                </div>
              ))}
            </div>
          )}
          <hr className="sidebar-divider" />
          <h2>{t('sidebar.yourSearch')}</h2>
          <p>{t('sidebar.searchDescription')}</p>
          
          {/* Multiselect dropdown */}
          <div className="filter-dropdown-container">
            <button 
              className="filter-dropdown-button"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            >
              <span className="filter-dropdown-text">
                {selectedTypes.length === 0 
                  ? t('sidebar.selectCategories')
                  : `${selectedTypes.length} ${t('sidebar.selected')}`}
              </span>
              <span className="filter-dropdown-arrow">{isFilterDropdownOpen ? '▲' : '▼'}</span>
            </button>

            {isFilterDropdownOpen && (
              <div className="filter-dropdown-menu">
                <div className="filter-search-container">
                  <input
                    type="text"
                    placeholder={t('sidebar.searchCategories')}
                    value={filterSearchQuery}
                    onChange={(e) => setFilterSearchQuery(e.target.value)}
                    className="filter-search-input"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="filter-options">
                  {Object.keys(filteredTypesByMasterType).length > 0 ? (
                    Object.entries(filteredTypesByMasterType).map(([masterType, types]) => (
                      <div key={masterType} className="filter-group">
                        <div className="filter-group-header">{masterType}</div>
                        {types.map((type) => (
                          <div
                            key={type}
                            className="filter-option"
                            onClick={() => handleToggleType(type)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedTypes.includes(type)}
                              onChange={() => {}}
                              className="filter-checkbox"
                            />
                            <span className="filter-option-label">{type}</span>
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    <div className="filter-no-results">{t('sidebar.noResults')}</div>
                  )}
                </div>

                {selectedTypes.length > 0 && (
                  <button 
                    className="filter-clear-button"
                    onClick={handleClearFilters}
                  >
                    {t('sidebar.clearAllFilters')}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Selected filters display */}
          {selectedTypes.length > 0 && (
            <div className="selected-filters">
              {selectedTypes.map((type) => (
                <div key={type} className="selected-filter-chip">
                  <span>{type}</span>
                  <button
                    className="filter-chip-remove"
                    onClick={() => handleToggleType(type)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Radius input fields */}
          <div className="radius-inputs">
            <div className="radius-input-row radius-input-right">
              <input
                type="number"
                value={schoolRadius}
                onChange={(e) => setSchoolRadius(e.target.value)}
                placeholder="0"
                className="radius-input-field"
                min="0"
                step="0.1"
              />
              <label className="radius-input-label">{t('sidebar.schoolRadius')}</label>
            </div>

            <div className="radius-input-row radius-input-left">
              <label className="radius-input-label">{t('sidebar.addressRadius')}</label>
              <input
                type="number"
                value={addressRadius}
                onChange={(e) => setAddressRadius(e.target.value)}
                placeholder="0"
                className="radius-input-field"
                min="0"
                step="0.1"
                disabled={!searchedLocation}
              />
            </div>
          </div>
        </div>
      </div>

      <button 
        className={`sidebar-toggle ${isCollapsed ? 'collapsed' : ''}`}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? '▶' : '◀'}
      </button>
    </>
  )
}

export default Sidebar
