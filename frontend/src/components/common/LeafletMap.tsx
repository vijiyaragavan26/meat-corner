import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface LeafletMapProps {
  storeLat: number;
  storeLng: number;
  storeName?: string;
  customerLat: number;
  customerLng: number;
  customerAddress?: string;
  riderLat?: number | null;
  riderLng?: number | null;
  riderName?: string;
  orderStatus?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  storeLat,
  storeLng,
  storeName = 'MEAT CORNER Store',
  customerLat,
  customerLng,
  customerAddress = 'Delivery Destination',
  riderLat,
  riderLng,
  riderName = 'Delivery Partner',
  orderStatus
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const riderMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([customerLat, customerLng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Custom Store Icon
      const storeIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `<div style="background-color: #C62828; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">🍗</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      // Custom Customer Home Icon
      const homeIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `<div style="background-color: #202020; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">🏠</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      L.marker([storeLat, storeLng], { icon: storeIcon })
        .addTo(map)
        .bindPopup(`<b>${storeName}</b><br/>Fresh Chicken Hub`);

      L.marker([customerLat, customerLng], { icon: homeIcon })
        .addTo(map)
        .bindPopup(`<b>Customer Location</b><br/>${customerAddress}`);

      // Route line between Store and Customer
      const latlngs: L.LatLngExpression[] = [
        [storeLat, storeLng],
        [customerLat, customerLng]
      ];
      L.polyline(latlngs, { color: '#C62828', weight: 4, dashArray: '6, 8', opacity: 0.7 }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Rider Marker
    if (riderLat && riderLng) {
      const bikeIcon = L.divIcon({
        className: 'custom-rider-icon',
        html: `<div style="background-color: #2E7D32; color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; border: 3px solid white; box-shadow: 0 4px 12px rgba(46,125,50,0.5); animation: pulse 1.5s infinite;">🏍️</div>`,
        iconSize: [42, 42],
        iconAnchor: [21, 21]
      });

      if (!riderMarkerRef.current) {
        riderMarkerRef.current = L.marker([riderLat, riderLng], { icon: bikeIcon })
          .addTo(map)
          .bindPopup(`<b>${riderName}</b><br/>Status: ${orderStatus || 'On the way'}`);
      } else {
        riderMarkerRef.current.setLatLng([riderLat, riderLng]);
        riderMarkerRef.current.setPopupContent(`<b>${riderName}</b><br/>Status: ${orderStatus || 'On the way'}`);
      }

      // Fit bounds to include store, customer, and rider
      const bounds = L.latLngBounds([
        [storeLat, storeLng],
        [customerLat, customerLng],
        [riderLat, riderLng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      // Keep map persistent
    };
  }, [storeLat, storeLng, customerLat, customerLng, riderLat, riderLng, orderStatus]);

  return (
    <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden shadow-inner border border-gray-200 relative">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-md border border-gray-200 text-xs font-semibold flex items-center space-x-2">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
        <span>Live GPS Order Tracking</span>
      </div>
    </div>
  );
};
