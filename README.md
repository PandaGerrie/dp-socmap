# SocialMap - Antwerp

A React-based interactive map application focused on Antwerp, Belgium, built with MapLibre GL.

## Features

- 🗺️ Interactive map powered by MapLibre GL
- 📍 Centered on Antwerp city center
- 🧭 Navigation controls (zoom, rotate, pitch)
- 📱 Geolocation support
- 📏 Scale control
- 🎯 Custom marker at Antwerp center
- 🎨 Modern, responsive UI

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **MapLibre GL** - Open-source mapping library
- **react-map-gl** - React wrapper for MapLibre
- **ESLint** - Code linting

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Map.jsx          # Main map component
│   └── Map.css          # Map styling
├── App.jsx              # Root component
├── App.css              # App styling
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## Map Coordinates

The map is centered on Antwerp:
- Latitude: 51.2194° N
- Longitude: 4.4025° E
- Default zoom: 12
Application for social map
