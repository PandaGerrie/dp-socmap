import { useRef, useState } from 'react'
import Map, { Marker, NavigationControl, GeolocateControl, ScaleControl, Popup } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import './Map.css'
import locations from '../data/locations.json'

const ANTWERP_COORDS = {
  latitude: 51.178220,
  longitude: 4.363360,
  zoom: 14
}

function MapComponent({ searchedLocation, isSidebarCollapsed, selectedTypes }) {
  const mapRef = useRef()
  const [viewState, setViewState] = useState({
    longitude: ANTWERP_COORDS.longitude,
    latitude: ANTWERP_COORDS.latitude,
    zoom: ANTWERP_COORDS.zoom
  })
  const [selectedLocation, setSelectedLocation] = useState(null)

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
                  onClick={() => setSelectedLocation(location)}
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
            closeOnClick={false}
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
    </div>
  )
}

export default MapComponent
