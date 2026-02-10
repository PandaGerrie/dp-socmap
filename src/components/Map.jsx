import { useRef, useState } from 'react'
import Map, { Marker, NavigationControl, GeolocateControl, ScaleControl, Popup, Source, Layer } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import './Map.css'
import locations from '../data/locations.json'
import { useLanguage } from '../context/LanguageContext'

const ANTWERP_COORDS = {
  latitude: 51.178220,
  longitude: 4.363360,
  zoom: 14
}

function MapComponent({ searchedLocation, isSidebarCollapsed, selectedTypes, schoolRadius, addressRadius }) {
  const { t } = useLanguage()
  const mapRef = useRef()
  const [viewState, setViewState] = useState({
    longitude: ANTWERP_COORDS.longitude,
    latitude: ANTWERP_COORDS.latitude,
    zoom: ANTWERP_COORDS.zoom
  })
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [isListViewOpen, setIsListViewOpen] = useState(false)

  // Filter locations based on selected types
  // "Ignore" masterType always shows regardless of filters
  // When no filters selected: show all locations
  // When filters selected: show selected types + all "Ignore" locations
  const filteredLocations = selectedTypes.length === 0 
    ? locations
    : locations.filter(loc => loc.masterType === 'Ignore' || selectedTypes.includes(loc.type))

  // Helper function to get icon image path
  const getIconPath = (iconName) => {
    return new URL(`../assets/icons/${iconName}.png`, import.meta.url).href
  }

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in km
  }

  // Create circle polygon for radius display
  const createCircle = (center, radiusInKm, points = 64) => {
    const coords = {
      latitude: center[1],
      longitude: center[0]
    }
    
    const ret = []
    const distanceX = radiusInKm / (111.320 * Math.cos(coords.latitude * Math.PI / 180))
    const distanceY = radiusInKm / 110.574

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI)
      const x = distanceX * Math.cos(theta)
      const y = distanceY * Math.sin(theta)
      ret.push([coords.longitude + x, coords.latitude + y])
    }
    ret.push(ret[0])

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [ret]
      }
    }
  }

  // Get marker with ID 1 (school)
  const schoolMarker = locations.find(loc => loc.id === 1)

  // Create circle data for school radius
  const schoolCircle = schoolRadius && parseFloat(schoolRadius) > 0 && schoolMarker
    ? createCircle([schoolMarker.longitude, schoolMarker.latitude], parseFloat(schoolRadius))
    : null

  // Create circle data for address radius
  const addressCircle = addressRadius && parseFloat(addressRadius) > 0 && searchedLocation
    ? createCircle([searchedLocation.longitude, searchedLocation.latitude], parseFloat(addressRadius))
    : null

  // Handle map movement and log coordinates
  const handleMove = (evt) => {
    const { longitude, latitude, zoom } = evt.viewState
    console.log(`Longitude: ${longitude.toFixed(6)}, Latitude: ${latitude.toFixed(6)}, Zoom: ${zoom.toFixed(2)}`)
    setViewState(evt.viewState)
  }

  return (
    <div className={`map-container ${isSidebarCollapsed ? '' : 'sidebar-open'}`}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={handleMove}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
      >
        {/* Map Controls */}
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />
        <ScaleControl position="bottom-left" />
        
        {/* School radius circle */}
        {schoolCircle && (
          <Source id="school-radius-circle" type="geojson" data={schoolCircle}>
            <Layer
              id="school-radius-fill"
              type="fill"
              paint={{
                'fill-color': '#1D2C48',
                'fill-opacity': 0.15
              }}
            />
            <Layer
              id="school-radius-outline"
              type="line"
              paint={{
                'line-color': '#1D2C48',
                'line-width': 2,
                'line-dasharray': [2, 2]
              }}
            />
          </Source>
        )}

        {/* Address radius circle */}
        {addressCircle && (
          <Source id="address-radius-circle" type="geojson" data={addressCircle}>
            <Layer
              id="address-radius-fill"
              type="fill"
              paint={{
                'fill-color': '#e74c3c',
                'fill-opacity': 0.15
              }}
            />
            <Layer
              id="address-radius-outline"
              type="line"
              paint={{
                'line-color': '#e74c3c',
                'line-width': 2,
                'line-dasharray': [2, 2]
              }}
            />
          </Source>
        )}
        
        {/* Markers from locations.json */}
        {filteredLocations.map((location) => {
          // Calculate distance if there's a searched location
          const distance = searchedLocation 
            ? calculateDistance(
                location.latitude,
                location.longitude,
                searchedLocation.latitude,
                searchedLocation.longitude
              )
            : null

          return (
            <Marker 
              key={location.id}
              longitude={location.longitude} 
              latitude={location.latitude}
              anchor="bottom"
            >
              <div className="marker-wrapper">
                <div 
                  className="marker-icon" 
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedLocation(location)
                  }}
                >
                  <img 
                    src={getIconPath(location.icon)} 
                    alt={location.name}
                    style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                  />
                </div>
                {distance !== null && (
                  <div className="distance-bubble">
                    {distance.toFixed(2)} km
                  </div>
                )}
              </div>
            </Marker>
          )
        })}

        {/* Marker for searched location */}
        {searchedLocation && (
          <Marker 
            longitude={searchedLocation.longitude} 
            latitude={searchedLocation.latitude}
            anchor="bottom"
          >
            <div className="searched-marker" title={searchedLocation.name}>
              <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M15 0C8.373 0 3 5.373 3 12c0 9 12 28 12 28s12-19 12-28c0-6.627-5.373-12-12-12z" 
                  fill="#e74c3c"
                  stroke="#fff"
                  strokeWidth="2"
                />
                <circle cx="15" cy="12" r="4" fill="#fff"/>
              </svg>
            </div>
          </Marker>
        )}

        {/* Popup callout card */}
        {selectedLocation && (
          <Popup
            longitude={selectedLocation.longitude}
            latitude={selectedLocation.latitude}
            anchor="top"
            onClose={() => setSelectedLocation(null)}
            closeOnClick={true}
            offset={45}
          >
            <div className="location-popup">
              <h3>{selectedLocation.name}</h3>
              <div className="popup-info">
                <div className="popup-row">
                  <span className="popup-icon">📍</span>
                  <span className="popup-text">{selectedLocation.address}</span>
                </div>
                <div className="popup-row">
                  <span className="popup-icon">🏷️</span>
                  <span className="popup-text">{selectedLocation.type}</span>
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Map>
      
      {/* Results counter bubble (excluding "Ignore" masterType) */}
      {(() => {
        const resultsCount = filteredLocations.filter(loc => loc.masterType !== 'Ignore').length
        return (
          <div className="results-counter" onClick={() => setIsListViewOpen(!isListViewOpen)} style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
            {resultsCount} {resultsCount === 1 ? t('map.result') : t('map.results')} {t('map.found')}
            <svg className="view-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="3" width="16" height="3" rx="1" fill="currentColor"/>
              <rect x="2" y="8.5" width="16" height="3" rx="1" fill="currentColor"/>
              <rect x="2" y="14" width="16" height="3" rx="1" fill="currentColor"/>
            </svg>
          </div>
        )
      })()}

      {/* List view panel */}
      <div className={`list-view-panel ${isListViewOpen ? 'open' : ''}`}>
        <div className="list-view-header">
          <h3>{t('map.resultsTitle')}</h3>
          <button className="list-view-close" onClick={() => setIsListViewOpen(false)}>✕</button>
        </div>
        <div className="list-view-content">
          {(() => {
            // Group locations by masterType
            const grouped = {}
            filteredLocations
              .filter(loc => loc.masterType !== 'Ignore')
              .forEach(loc => {
                if (!grouped[loc.masterType]) {
                  grouped[loc.masterType] = []
                }
                // Add distance to location object if searchedLocation exists
                const locationWithDistance = searchedLocation 
                  ? {
                      ...loc,
                      distance: calculateDistance(
                        loc.latitude,
                        loc.longitude,
                        searchedLocation.latitude,
                        searchedLocation.longitude
                      )
                    }
                  : loc
                grouped[loc.masterType].push(locationWithDistance)
              })
            
            // Sort masterTypes alphabetically
            const sortedMasterTypes = Object.keys(grouped).sort()
            
            // Sort locations within each group by distance if searchedLocation exists
            if (searchedLocation) {
              sortedMasterTypes.forEach(masterType => {
                grouped[masterType].sort((a, b) => a.distance - b.distance)
              })
            }
            
            return sortedMasterTypes.map(masterType => (
              <div key={masterType} className="list-view-section">
                <div className="list-view-section-header">{masterType}</div>
                {grouped[masterType].map((location) => (
                  <div 
                    key={location.id} 
                    className="list-view-item"
                    onClick={() => {
                      setSelectedLocation(location)
                      setViewState({
                        ...viewState,
                        longitude: location.longitude,
                        latitude: location.latitude,
                        zoom: 15
                      })
                    }}
                  >
                    <div className="list-view-icon">
                      <img 
                        src={getIconPath(location.icon)} 
                        alt={location.name}
                      />
                    </div>
                    <div className="list-view-info">
                      <div className="list-view-name">{location.name}</div>
                      <div className="list-view-address">{location.address}</div>
                    </div>
                    {location.distance !== undefined && (
                      <div className="list-view-distance">
                        {location.distance.toFixed(2)} km
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))
          })()}
        </div>
      </div>
    </div>
  )
}

export default MapComponent
