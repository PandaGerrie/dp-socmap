import { useState } from 'react'
import MapComponent from './components/Map'
import Sidebar from './components/Sidebar'
import './App.css'

function App() {
  const [searchedLocation, setSearchedLocation] = useState(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState([])

  const handleLocationSearch = (location) => {
    setSearchedLocation(location)
  }

  return (
    <div className="app">
      <Sidebar 
        onLocationSearch={handleLocationSearch}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        searchedLocation={searchedLocation}
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
      />
      <MapComponent 
        searchedLocation={searchedLocation}
        isSidebarCollapsed={isSidebarCollapsed}
        selectedTypes={selectedTypes}
      />
    </div>
  )
}

export default App
