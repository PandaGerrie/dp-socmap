import { useState } from 'react'
import Header from './components/Header'
import MapComponent from './components/Map'
import Sidebar from './components/Sidebar'
import './App.css'

function App() {
  const [searchedLocation, setSearchedLocation] = useState(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState([])
  const [schoolRadius, setSchoolRadius] = useState('')
  const [addressRadius, setAddressRadius] = useState('')

  const handleLocationSearch = (location) => {
    setSearchedLocation(location)
  }

  return (
    <div className="app">
      <Header />
      <div className="app-content">
        <Sidebar 
          onLocationSearch={handleLocationSearch}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          searchedLocation={searchedLocation}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          schoolRadius={schoolRadius}
          setSchoolRadius={setSchoolRadius}
          addressRadius={addressRadius}
          setAddressRadius={setAddressRadius}
        />
        <MapComponent 
          searchedLocation={searchedLocation}
          isSidebarCollapsed={isSidebarCollapsed}
          selectedTypes={selectedTypes}
          schoolRadius={schoolRadius}
          addressRadius={addressRadius}
        />
      </div>
    </div>
  )
}

export default App
