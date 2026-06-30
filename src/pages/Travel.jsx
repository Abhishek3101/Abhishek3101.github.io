import React, { useState, useMemo, useRef, useEffect } from 'react'
import PageWrapper from '@/components/PageWrapper'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from "react-simple-maps"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Mountain, MapPin, Plane, Award, Bookmark, Tent, Building2, Car, Palmtree, Bike, ChevronDown, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const worldGeoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
const indiaGeoUrl = "/india-states.json"
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { Plus, Minus } from 'lucide-react'

const COUNTRY_FLAGS = {
  'India': '🇮🇳',
  'United States': '🇺🇸',
  'France': '🇫🇷',
  'Japan': '🇯🇵',
  'Vietnam': '🇻🇳',
  'Thailand': '🇹🇭',
  'Bhutan': '🇧🇹',
  'Nepal': '🇳🇵',
  'Sri Lanka': '🇱🇰',
  'Maldives': '🇲🇻',
  'UAE': '🇦🇪',
  'Singapore': '🇸🇬',
  'Malaysia': '🇲🇾',
  'Indonesia': '🇮🇩'
}



function Typewriter({ text, speed = 40 }) {
  const [displayedText, setDisplayedText] = useState('')
  
  useEffect(() => {
    setDisplayedText('')
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i))
      i++
      if (i > text.length) clearInterval(interval)
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return <span>{displayedText}</span>
}

export default function Travel({ isPreview = false }) {
  const [isLoading, setIsLoading] = useState(true)
  const [places, setPlaces] = useState([])
  const [flights, setFlights] = useState([])
  const [airlines, setAirlines] = useState({})
  const [learnings, setLearnings] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [selectedPolaroid, setSelectedPolaroid] = useState(null)
  const [scatteredPhotos, setScatteredPhotos] = useState([])
  const [mapView, setMapView] = useState('world')
  const [activeFilter, setActiveFilter] = useState(null)
  const [showPhotosOnMap, setShowPhotosOnMap] = useState(true)
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 })
  const [canScrollMore, setCanScrollMore] = useState(false)
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    if (!selectedPolaroid) return;
    
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
        setCanScrollMore(scrollHeight > clientHeight && !isBottom);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [selectedPolaroid]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
    setCanScrollMore(scrollHeight > clientHeight && !isBottom);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDocs(collection(db, 'travel_logs'));
        const placesData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlaces(placesData);
        
        // Background prefetch first photos to fix SVG hover lag
        placesData.forEach(p => {
          if (p.photos && p.photos.length > 0) {
            const img = new Image();
            img.src = p.photos[0];
          }
        });
      
      const flightSnap = await getDocs(collection(db, 'travel_flights'));
      const flightList = flightSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      flightList.sort((a, b) => new Date(b.date) - new Date(a.date));
      setFlights(flightList);

      const learnSnap = await getDocs(collection(db, 'travel_learnings'));
      setLearnings(learnSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const wishSnap = await getDocs(collection(db, 'travel_wishlist'));
      setWishlist(wishSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const airSnap = await getDocs(collection(db, 'travel_airlines'));
      const airDict = {};
        airSnap.docs.forEach(doc => {
          const data = doc.data();
          airDict[data.name.toLowerCase()] = data;
        });
        setAirlines(airDict);
      } catch (error) {
        console.error("Error fetching travel data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [])

  const visitedCountries = useMemo(() => new Set(places.map(p => p.country).filter(Boolean)), [places]);
  const visitedStates = useMemo(() => new Set(places.map(p => p.state).filter(Boolean)), [places]);
  const indiaPlaces = places.filter(p => p.country === 'India');

  const activeFlags = Array.from(visitedCountries).map(country => ({
    code: country,
    label: country,
    emoji: COUNTRY_FLAGS[country] || '📍'
  }));

  const handleFilter = (code) => {
    // Legacy filter placeholder, can be hooked to actual filters
    if (activeFilter === code) {
      setActiveFilter(null)
      setScatteredPhotos([])
    } else {
      setActiveFilter(code)
      setScatteredPhotos(places.filter(p => p.country === code && p.photos && p.photos.length > 0))
    }
  }

  const handleMapClick = () => {
    // Click on empty map clears scatter
    if (scatteredPhotos.length > 0) {
      setScatteredPhotos([])
      setActiveFilter(null)
    }
  }

  const spiderfiedPlaces = useMemo(() => {
    const grouped = {};
    places.forEach(place => {
      if (!place.coordinates || place.coordinates.length < 2) return;
      const key = `${place.coordinates[0].toFixed(1)},${place.coordinates[1].toFixed(1)}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(place);
    });

    const result = [];
    Object.values(grouped).forEach(group => {
      if (group.length === 1) {
        result.push({ ...group[0], spiderOffset: [0, 0] });
      } else {
        group.forEach((p, i) => {
          const angle = (i / group.length) * Math.PI * 2;
          const radius = Math.max(25, group.length * 6); // original small radius
          const offsetX = Math.cos(angle) * radius;
          const offsetY = Math.sin(angle) * radius;
          result.push({ ...p, spiderOffset: [offsetX, offsetY] });
        });
      }
    });
    return result;
  }, [places]);

  const renderMarker = (place) => {
    let Icon = MapPin;
    let bgColor = "bg-red-500";
    
    if (place.pinType === 'mountain') { Icon = Mountain; bgColor = "bg-blue-500"; }
    else if (place.pinType === 'beach') { Icon = Palmtree; bgColor = "bg-yellow-500"; }
    else if (place.pinType === 'temple') { Icon = Tent; bgColor = "bg-orange-600"; }
    else if (place.pinType === 'forest') { Icon = Tent; bgColor = "bg-green-600"; }
    else if (place.pinType === 'city') { Icon = Building2; bgColor = "bg-purple-500"; }

    return (
      <Marker key={place.id} coordinates={place.coordinates}>
        <g transform={`translate(${place.spiderOffset?.[0] || 0}, ${place.spiderOffset?.[1] || 0})`}>
          <CustomPin 
            icon={Icon} 
            bgColor={bgColor} 
            place={place} 
            showPhoto={showPhotosOnMap} 
            onClick={(e) => { 
              e.stopPropagation(); 
              if (place.photos && place.photos.length > 0) {
                setSelectedPolaroid(place);
              }
            }} 
          />
        </g>
      </Marker>
    );
  };

  const sortPlacesForZIndex = (a, b) => {
    const aHasPhoto = a.photos && a.photos.length > 0;
    const bHasPhoto = b.photos && b.photos.length > 0;
    
    // 1. Places with photos come last (render on top)
    if (aHasPhoto && !bHasPhoto) return 1;
    if (!aHasPhoto && bHasPhoto) return -1;
    
    // 2. If both have photos, sort by date (newest last, so it renders on top)
    if (aHasPhoto && bHasPhoto) {
      const dateA = a.dateVisited ? new Date(a.dateVisited) : new Date(0);
      const dateB = b.dateVisited ? new Date(b.dateVisited) : new Date(0);
      return dateA - dateB;
    }
    
    return 0;
  };

  const indiaMarkers = useMemo(() => {
    return spiderfiedPlaces
      .filter(p => p.country === 'India')
      .sort(sortPlacesForZIndex)
      .map(renderMarker);
  }, [spiderfiedPlaces, showPhotosOnMap]);

  const worldMarkers = useMemo(() => {
    return spiderfiedPlaces
      .filter(p => p.country !== 'India')
      .sort(sortPlacesForZIndex)
      .map(renderMarker);
  }, [spiderfiedPlaces, showPhotosOnMap]);

  if (isLoading) {
    return (
      <PageWrapper title="Movement & Travel" fullScreen={true}>
        <div className="w-full h-full bg-[#fdfaf6] flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-[#e2cca4] border-t-[#8c5a45] rounded-full animate-spin shadow-lg"></div>
          <p className="mt-6 font-handwriting text-2xl text-[#8c5a45] animate-pulse">Packing bags...</p>
        </div>
      </PageWrapper>
    );
  }

  const MapContent = (
    <>
    <div className={`relative w-full ${isPreview ? 'h-full rounded-xl' : 'h-full md:min-h-0'} bg-[#fdfaf6] flex flex-col md:overflow-hidden overflow-y-auto`}>
      
      {/* Main Map Area */}
        <div className="relative flex-grow md:flex-grow-0 md:h-full min-h-[60vh] overflow-hidden" onClick={handleMapClick}>

          {/* Consolidated Map Controls */}
          <div className="absolute top-3 md:top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 max-w-[95vw] pointer-events-none">
            
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 bg-white/80 backdrop-blur-md px-3 md:px-6 py-2 md:py-3 rounded-xl md:rounded-full shadow-lg border border-[#e5dfd3] pointer-events-auto w-full md:w-auto justify-center" onClick={e => e.stopPropagation()}>
            
            {/* Top row: map toggle + photo toggle */}
            <div className="flex items-center gap-2 md:gap-6">
              <div className="flex bg-gray-100 rounded-full p-0.5 md:p-1 border border-gray-200">
                <button 
                  className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors ${mapView === 'world' ? 'bg-[#475569] text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
                  onClick={() => { setMapView('world'); setPosition({ coordinates: [0,0], zoom: 1 }); setScatteredPhotos([]); setActiveFilter(null); }}
                >
                  World
                </button>
                <button 
                  className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors ${mapView === 'india' ? 'bg-[#475569] text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
                  onClick={() => { setMapView('india'); setPosition({ coordinates: [0,0], zoom: 1 }); setScatteredPhotos([]); setActiveFilter(null); }}
                >
                  India
                </button>
              </div>

              <div className="w-px h-5 bg-gray-300"></div>

              <button
                onClick={() => setShowPhotosOnMap(!showPhotosOnMap)}
                className={`p-1.5 rounded-full transition-colors flex items-center justify-center ${showPhotosOnMap ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-transparent hover:border-gray-300'}`}
                title={showPhotosOnMap ? "Hide photos on map" : "Show photos on map"}
              >
                <ImageIcon size={16} strokeWidth={2.5} />
              </button>

              <div className="w-px h-5 bg-gray-300"></div>
              
              <div className="flex items-center gap-1 md:gap-2 bg-[#f4ebdc] px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-[#d4c5ab] shadow-sm">
                <span className="text-[9px] md:text-[10px] font-bold text-[#8c5a45] uppercase tracking-wider">Footprints</span>
                <span className="text-xs md:text-sm font-black text-[#5c3a21]">{places.length}</span>
              </div>
            </div>

            {/* Flags row — wraps on mobile */}
            {activeFlags.length > 0 && (
              <>
                <div className="hidden md:block w-px h-6 bg-gray-300"></div>
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
                  {activeFlags.map(flag => (
                    <button
                      key={flag.code}
                      onClick={() => handleFilter(flag.code)}
                      className={`text-lg md:text-2xl transition-transform duration-300 hover:scale-125 ${activeFilter && activeFilter !== flag.code ? 'opacity-30 grayscale' : 'opacity-100 drop-shadow'}`}
                      title={`Filter by ${flag.label}`}
                    >
                      {flag.emoji}
                    </button>
                  ))}
                  {activeFilter && (
                    <button 
                      onClick={() => { setActiveFilter(null); setScatteredPhotos([]); }}
                      className="text-[10px] font-bold text-gray-400 hover:text-gray-800 uppercase tracking-wider transition-colors ml-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </>
            )}
            </div>

            {/* Guiding Text */}
            <div className="bg-[#fdfaf6]/90 backdrop-blur-sm px-5 py-2 rounded-full border border-[#e2cca4] shadow-sm pointer-events-auto text-center hidden md:block mt-1">
               <p className="text-[11px] md:text-xs font-sans text-[#8c5a45] leading-relaxed">
                 Every pin holds a story. Where chapters overlap, unfurl the flag to explore the memories hidden beneath. <span className="hidden md:inline px-1">|</span><br className="md:hidden"/> Tap any polaroid to step inside the journal.
               </p>
            </div>
          </div>

          {/* Left Panel: Ticket Roll */}
          <div className="hidden md:block absolute top-24 left-8 z-40 w-64" onClick={e => e.stopPropagation()}>
            <BoardingPassRoll flights={flights} airlines={airlines} />
          </div>

          {/* Right Panel: Learnings & Wishes */}
          <div className="hidden md:flex absolute top-24 right-8 z-30 flex-col gap-8 w-64 items-end pointer-events-none">
            {learnings.length > 0 && (
              <div className="bg-yellow-100 p-5 shadow-md w-full pointer-events-auto transform rotate-2 relative rounded-sm">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/60 transform -rotate-3 backdrop-blur-sm shadow-sm"></div>
                <h4 className="font-handwriting text-2xl mb-2 flex items-center gap-2 text-yellow-800"><Bookmark size={20}/> Learnings</h4>
                <div className="space-y-4">
                  {learnings.slice(0, 3).map((item, i) => (
                    <p key={item.id || i} className="text-lg font-handwriting leading-tight text-yellow-900">{item.text}</p>
                  ))}
                </div>
              </div>
            )}

            {wishlist.length > 0 && (
              <div className="bg-blue-50 p-5 shadow-md w-full pointer-events-auto transform -rotate-3 relative border border-blue-100 rounded-lg">
                <h4 className="font-handwriting text-2xl mb-2 flex items-center gap-2 text-blue-800"><Award size={20}/> Wishlist</h4>
                <ul className="text-lg font-handwriting list-disc pl-5 text-blue-900 space-y-1">
                  {wishlist.slice(0, 5).map((item, i) => (
                    <li key={item.id || i}>{item.text}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* The Base Map */}
          <div className="absolute inset-0 z-0 flex items-center justify-center pt-10">
            <ComposableMap
              key={mapView}
              projection={mapView === 'india' ? "geoMercator" : "geoEqualEarth"}
              projectionConfig={
                mapView === 'india' 
                  ? { scale: 1100, center: [80, 24.5] } 
                  : { scale: 220, center: [10, 0] }
              }
              width={1200}
              height={800}
              style={{ width: "100%", height: "100%" }}
            >
              {mapView === 'india' ? (
                <ZoomableGroup 
                  zoom={position.zoom} 
                  center={position.coordinates} 
                  onMoveEnd={setPosition}
                  translateExtent={[[ -400, -400 ], [ 1600, 1200 ]]}
                  disableZooming={true}
                  disablePanning={true}
                >
                  <Geographies geography={indiaGeoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo, i) => {
                        let stateName = geo.properties.name || geo.properties.ST_NM || geo.properties.NAME_1;
                        if (stateName === 'Orissa') stateName = 'Odisha';
                        if (stateName === 'Uttaranchal') stateName = 'Uttarakhand';
                        const isVisited = visitedStates.has(stateName);
                        const fill = isVisited ? "#9c6b53" : "#eeddc3";
                        const hoverFill = isVisited ? "#825743" : "#e5cda8";
                        const stroke = "#d4c5ab";

                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={fill}
                            stroke={stroke}
                            strokeWidth={0.5}
                            style={{
                              default: { outline: "none", transition: "all 250ms" },
                              hover: { fill: hoverFill, outline: "none", cursor: "default" },
                              pressed: { fill: hoverFill, outline: "none" },
                            }}
                          />
                        )
                      })
                    }
                  </Geographies>

                  {/* Markers for Places in India View */}
                  {indiaMarkers}
                </ZoomableGroup>
              ) : (
                <ZoomableGroup 
                  zoom={position.zoom} 
                  center={position.coordinates} 
                  onMoveEnd={setPosition}
                  translateExtent={[[ -400, -400 ], [ 1600, 1200 ]]}
                  disableZooming={true}
                  disablePanning={true}
                >
                  <Geographies geography={worldGeoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const isVisited = visitedCountries.has(geo.properties.name);
                        const fill = isVisited ? "#9c6b53" : "#eeddc3";
                        const hoverFill = isVisited ? "#825743" : "#e5cda8";
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={fill}
                            stroke="#d4c5ab"
                            strokeWidth={0.5}
                            style={{
                              default: { outline: "none", transition: "all 250ms" },
                              hover: { fill: hoverFill, outline: "none", cursor: "default" },
                              pressed: { fill: hoverFill, outline: "none" },
                            }}
                          />
                        )
                      })
                    }
                  </Geographies>

                  {/* World View Clustering for India (Delhi Coordinates) */}
                  {indiaPlaces.length > 0 && (
                    <Marker coordinates={[77.2090, 28.6139]}>
                      <ClusterPin 
                        count={indiaPlaces.length} 
                        onClick={(e) => { e.stopPropagation(); setMapView('india'); setPosition({coordinates:[0,0], zoom: 1}); setScatteredPhotos([]); setActiveFilter(null); }} 
                      />
                    </Marker>
                  )}

                  {/* Markers for Places (Excluding India) */}
                  {worldMarkers}
                </ZoomableGroup>
              )}

            </ComposableMap>
          </div>

          {/* Scatter Layer */}
          <ScatterLayer photos={scatteredPhotos} onPhotoClick={setSelectedPolaroid} />

        </div>

        {/* Mobile Panels — shown below map on small screens */}
        <div className="md:hidden flex flex-col gap-8 p-4 pt-10 flex-shrink-0 bg-[#fdfaf6] relative z-20">
          {flights.length > 0 && (
            <div className="flex justify-center w-full min-h-[350px]">
              <div className="w-[85%] max-w-[320px] relative">
                <BoardingPassRoll flights={flights} airlines={airlines} isMobileLayout={true} />
              </div>
            </div>
          )}

          {learnings.length > 0 && (
            <div className="bg-yellow-100 p-6 shadow-lg w-full relative rounded-sm transform rotate-1">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-5 bg-white/60 transform -rotate-2 backdrop-blur-sm shadow-sm"></div>
              <h4 className="font-handwriting text-2xl mb-4 flex items-center gap-2 text-yellow-800"><Bookmark size={20}/> Learnings</h4>
              <div className="space-y-4">
                {learnings.slice(0, 3).map((item, i) => (
                  <p key={item.id || i} className="text-lg font-handwriting leading-relaxed text-yellow-900 border-b border-yellow-200/50 pb-2">{item.text}</p>
                ))}
              </div>
            </div>
          )}

          {wishlist.length > 0 && (
            <div className="bg-blue-50 p-6 shadow-lg w-full relative border border-blue-100 rounded-xl mb-12">
              <h4 className="font-handwriting text-2xl mb-4 flex items-center gap-2 text-blue-800"><Award size={20}/> Wishlist</h4>
              <ul className="text-lg font-handwriting space-y-3">
                {wishlist.slice(0, 5).map((item, i) => (
                  <li key={item.id || i} className="flex gap-2 items-start text-blue-900">
                    <span className="text-blue-400 mt-1">•</span>
                    <span className="leading-tight">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Travelogue Book Modal */}
      <Dialog open={!!selectedPolaroid} onOpenChange={(open) => !open && setSelectedPolaroid(null)}>
        <DialogContent className="max-w-5xl w-full h-auto md:h-[75vh] bg-transparent border-none shadow-none p-0 z-[100] flex items-center justify-center">
          {selectedPolaroid && (
            <div 
              className="flex flex-col md:flex-row w-full h-full relative rounded-sm overflow-hidden bg-[#f4ead5] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-[8px] border-[#e2cca4]" 
              style={{ backgroundImage: "radial-gradient(circle at center, #fdfbf7 0%, #ecdcb9 100%)" }}
            >
              {/* Spine shadow */}
              <div className="absolute left-1/2 top-0 bottom-0 w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.15)] to-transparent z-20 pointer-events-none"></div>
              
              {/* Left Page (Photo) */}
              <div className="w-full md:w-1/2 h-64 md:h-full flex flex-col items-center justify-center p-6 md:p-12 relative border-b md:border-b-0 md:border-r border-[#d4c19a]">
                <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/old-wall.png')" }}></div>
                
                {/* Taped Photo */}
                <div className="relative transform -rotate-2 bg-white p-4 shadow-[2px_4px_10px_rgba(0,0,0,0.1)] max-w-sm w-full z-10 transition-transform duration-500 hover:rotate-0">
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/40 backdrop-blur-sm transform rotate-3 shadow-sm border border-white/20 z-20"></div>
                   <div className="absolute -bottom-4 right-4 w-12 h-6 bg-white/40 backdrop-blur-sm transform -rotate-6 shadow-sm border border-white/20 z-20"></div>
                   
                   {selectedPolaroid.photos && selectedPolaroid.photos.length > 0 ? (
                     <img src={selectedPolaroid.photos[0]} className="w-full h-auto max-h-[50vh] object-contain bg-gray-100" />
                   ) : (
                     <div className="w-full h-64 bg-[#e5dfd3] flex items-center justify-center border border-[#d4c19a] shadow-inner">
                       <span className="text-gray-400 font-handwriting text-2xl">No Photo</span>
                     </div>
                   )}
                   <div className="pt-4 pb-2 text-center">
                      <p className="font-handwriting text-3xl text-gray-800">{selectedPolaroid.title || selectedPolaroid.name}</p>
                      {selectedPolaroid.dateVisited && (
                        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">{selectedPolaroid.dateVisited}</p>
                      )}
                   </div>
                </div>
              </div>

              {/* Right Page (Journal) */}
              <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="w-full md:w-1/2 h-auto md:h-full p-6 md:p-12 pt-8 md:pt-16 flex flex-col relative overflow-y-auto custom-scrollbar"
              >
                 <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/old-wall.png')" }}></div>
                 {/* Paper lines */}
                 <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 39px, #7092be 39px, #7092be 40px)", backgroundPositionY: "38px" }}></div>
                 
                 <div className="relative z-10 pb-16">
                   <h2 className="text-4xl font-handwriting mb-8 text-[#2c3e50]">
                     {selectedPolaroid.name}
                     {selectedPolaroid.description ? ` - ${selectedPolaroid.description}` : ''}
                   </h2>
                   <div className="font-handwriting text-2xl leading-[40px] text-[#34495e] whitespace-pre-wrap">
                     <Typewriter text={selectedPolaroid.journalText || selectedPolaroid.content || "No journal entry yet."} speed={40} />
                   </div>
                 </div>

                 {/* Sticky scroll instruction for long journals */}
                 <AnimatePresence>
                   {canScrollMore && (
                     <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: 10 }}
                       className="sticky bottom-0 mt-auto left-0 right-0 py-4 bg-gradient-to-t from-[#f4ead5] via-[#f4ead5] to-transparent pointer-events-none flex justify-center z-20"
                     >
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm border border-black/5 shadow-sm animate-pulse">
                          ↓ Scroll to keep reading
                        </span>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )

  if (isPreview) return MapContent;

  return (
    <PageWrapper title="Movement & Travel" fullScreen={true}>
      {MapContent}
    </PageWrapper>
  )
}

function BoardingPassRoll({ flights = [], airlines = {}, isMobileLayout = false }) {
  const [isRolledOut, setIsRolledOut] = useState(false)

  const airlineCounts = flights.reduce((acc, pass) => {
    acc[pass.airline] = (acc[pass.airline] || 0) + 1
    return acc
  }, {})

  return (
    <div className={`relative pointer-events-auto ${isMobileLayout ? 'w-full' : ''}`}>
      {/* Dispenser Header / Stats Box */}
      <div 
        className="bg-white p-4 rounded shadow-lg border border-[#e5dfd3] cursor-pointer hover:bg-gray-50 transition-colors z-30 relative flex flex-col items-center"
        onClick={() => setIsRolledOut(!isRolledOut)}
      >
        <div className="w-12 h-2 bg-gray-200 rounded-full mb-3 shadow-inner"></div>
        <h3 className="font-sans font-bold text-gray-800 text-sm uppercase tracking-widest mb-1 flex items-center gap-2">
          <Plane size={14} className="text-gray-500" /> Flight Log
        </h3>
        <p className="text-4xl font-light text-[#475569] mb-4">{flights.length}</p>
        
        <div className="w-full space-y-1">
          {Object.entries(airlineCounts).map(([airline, count]) => (
            <div key={airline} className="flex justify-between text-[10px] uppercase font-bold text-gray-400">
              <span>{airline}</span>
              <span>{count}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-gray-300">
          <ChevronDown size={20} className={`transform transition-transform duration-500 ${isRolledOut ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* The Roll Container */}
      <div className={`${isMobileLayout ? 'relative' : 'absolute'} top-[100%] left-0 w-full z-10 flex flex-col items-center pb-8`}>
        <AnimatePresence initial={false}>
          {flights.map((pass, index) => {
            const isFirst = index === 0;
            // When closed, only the first ticket renders and it peeks out.
            if (!isRolledOut && !isFirst) return null;

            return (
              <motion.div
                key={pass.id}
                layout={isMobileLayout}
                initial={{ opacity: 0, y: -50, rotateX: 90 }}
                animate={{ 
                  opacity: 1, 
                  y: isRolledOut ? 0 : -35, // When rolled in, slide it up mostly behind the header
                  rotateX: isRolledOut ? 0 : 5,
                  scale: isRolledOut ? 1 : 0.95
                }}
                exit={{ opacity: 0, y: -50, rotateX: 90 }}
                transition={{ 
                  duration: 0.5, 
                  delay: isRolledOut ? index * 0.1 : 0, 
                  type: "spring", 
                  stiffness: 100, 
                  damping: 15 
                }}
                className={`w-[95%] bg-white shadow-[0_10px_20px_rgba(0,0,0,0.15)] border-b border-dashed border-gray-300 relative overflow-hidden ${isRolledOut ? '' : 'cursor-pointer hover:translate-y-[-30px] transition-transform'}`}
                style={{ zIndex: isRolledOut ? 20 - index : 10 }}
                onClick={() => !isRolledOut && setIsRolledOut(true)}
              >
                {/* Airline Branding Header */}
                <div 
                  className={`w-full py-1 px-3 flex justify-between items-center`}
                  style={{
                    backgroundColor: airlines[pass.airline?.toLowerCase()]?.color || '#475569',
                    color: airlines[pass.airline?.toLowerCase()]?.textColor || '#ffffff'
                  }}
                >
                   <span className="text-[10px] font-black tracking-widest">{pass.flightNumber}</span>
                   <span className="text-[9px] font-bold uppercase opacity-80">{pass.airline}</span>
                </div>
                
                <div className="p-3">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-sans font-bold text-lg uppercase tracking-wider">{pass.from} ✈ {pass.to}</h4>
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono">{pass.date}</p>
                </div>
                
                {/* Ticket side perforations effect */}
                <div className="absolute top-1/2 -left-2 w-4 h-4 bg-[#fdfaf6] rounded-full -translate-y-1/2 shadow-inner"></div>
                <div className="absolute top-1/2 -right-2 w-4 h-4 bg-[#fdfaf6] rounded-full -translate-y-1/2 shadow-inner"></div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

function ScatterLayer({ photos, onPhotoClick }) {
  if (photos.length === 0) return null;

  const sortedPhotos = [...photos].sort((a, b) => {
    if (!a.dateVisited) return -1;
    if (!b.dateVisited) return 1;
    return new Date(b.dateVisited) - new Date(a.dateVisited);
  });

  return (
    <div className="absolute inset-0 z-[60] pointer-events-auto bg-[#fdfaf6]/50 backdrop-blur-sm overflow-y-auto hide-scrollbar pt-32 pb-20 px-2 md:px-6">
      <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 w-full mx-auto">
        <AnimatePresence>
          {sortedPhotos.map((p, i) => {
            const rotation = (i % 2 === 0 ? 1 : -1) * (1 + (i * 7) % 6);
            return (
              <motion.div
                key={p.id}
                initial={{ y: 50, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, rotate: rotation, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: (i % 15) * 0.05 }}
                className="shadow-xl hover:shadow-2xl hover:z-10 transition-shadow duration-300"
              >
                 <Polaroid {...p} onClick={() => onPhotoClick(p)} />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Polaroid({ imageUrl, photos, title, name, type, onClick }) {
  return (
    <div 
      onClick={(e) => { if(onClick) { e.stopPropagation(); onClick(); } }}
      className={`w-48 bg-white p-3 pb-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)] cursor-pointer hover:scale-105 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:z-[70] transition-all duration-300 relative group`}
    >
      <div className={`w-full h-40 bg-gray-200 overflow-hidden shadow-inner`}>
        <img src={imageUrl || (photos && photos[0])} alt={title || name} loading="lazy" decoding="async" className={`w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all`} draggable="false" />
      </div>
      <div className="mt-3 text-center">
        <h4 className="font-handwriting text-2xl text-[#5d4a3a] leading-none">{title || name}</h4>
      </div>
    </div>
  )
}

function CustomPin({ icon: Icon, bgColor = "bg-[#9c6b53]", place, showPhoto = true, onClick }) {
  const hasPhoto = place && place.photos && place.photos.length > 0;
  const [imgLoaded, setImgLoaded] = React.useState(!hasPhoto);
  
  return (
    <g 
      className={`cursor-pointer ${!imgLoaded ? 'pointer-events-none' : ''}`} 
      onClick={onClick}
    >
      {/* Set bounding box such that bottom-center is exactly at the geographic (0,0) */}
      <foreignObject x="-50" y="-150" width="100" height="150" className="overflow-visible pointer-events-none">
        
        {/* Tight wrapper for precise hover hit-box. Only the pin and its children will trigger the hover. */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center group pointer-events-auto">
          
          {/* Permanent/Hover Mini Polaroid */}
          {place && (
            <div 
              className={`absolute bottom-6 z-20 transform rotate-3 transition-transform duration-200 hover:scale-110 ${showPhoto ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'}`}
              style={{ willChange: 'transform, opacity' }}
            >
               <div className="bg-[#fffdfa] p-1 pb-2 shadow-[0_4px_10px_rgba(0,0,0,0.3)] rounded-sm min-w-[3.5rem] flex flex-col items-center justify-center border border-[#e2cca4]">
                  {hasPhoto && (
                    <div className="w-12 h-10 bg-[#e5dfd3] overflow-hidden shadow-inner mb-1 relative">
                      {!imgLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>}
                      <img 
                        src={place.photos[0]} 
                        loading="lazy" 
                        decoding="async" 
                        onLoad={() => setImgLoaded(true)}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`} 
                        style={{ willChange: 'opacity' }}
                      />
                    </div>
                  )}
                  <span className="text-[7px] leading-tight font-handwriting text-[#5d4a3a] text-center tracking-tight px-1 max-w-[80px] whitespace-nowrap overflow-hidden text-ellipsis">{place.name}</span>
               </div>
            </div>
          )}
          
          {/* The Pin Circle */}
          <div className={`w-5 h-5 rounded-full ${bgColor} shadow-md border-[1.5px] border-white flex items-center justify-center transform transition-transform group-hover:scale-110 z-10 relative`}>
            <Icon size={10} color="white" strokeWidth={2.5} />
          </div>
          
          {/* The Pin Triangle / Needle */}
          <div className={`w-2 h-2.5 ${bgColor} rounded-sm rotate-45 z-0 -mt-1 transform group-hover:translate-y-[1px] transition-transform`} style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }}></div>
        </div>
      </foreignObject>
    </g>
  )
}

function ClusterPin({ count, onClick }) {
  return (
    <g className="cursor-pointer" onClick={onClick}>
      <foreignObject x="-75" y="-150" width="150" height="150" className="overflow-visible pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center group pointer-events-auto">
          
          {/* Hover Card */}
          <div className={`absolute bottom-8 z-20 transition-all origin-bottom duration-300 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transform group-hover:-translate-y-2`}>
             <div className="bg-white px-3 py-2 shadow-[0_10px_20px_rgba(0,0,0,0.2)] border border-[#e2cca4] rounded-lg min-w-[120px] flex flex-col items-center justify-center text-center relative">
                {/* Tooltip pointer */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-[#e2cca4] transform rotate-45"></div>
                
                <p className="font-handwriting text-lg text-[#8c5a45] leading-tight mb-0.5">Visited {count} Places</p>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Click to explore India</p>
             </div>
          </div>
          
          {/* Pin Body */}
          <div className={`w-7 h-7 rounded-full bg-[#9c6b53] shadow-md flex items-center justify-center relative z-10 border-2 border-white transition-transform duration-300 group-hover:scale-110`}>
             <span className="text-white font-bold text-xs">{count}</span>
          </div>
          <div className="w-1 h-4 bg-[#825743] rounded-b-full -mt-0.5 shadow-sm opacity-90"></div>
        </div>
      </foreignObject>
    </g>
  )
}
