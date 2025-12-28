import { Marker, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useState } from 'react';

const customIcon = L.divIcon({
  html: `<i class="ki-solid ki-geolocation text-2xl text-success"></i>`,
  className: 'leaflet-marker',
  iconAnchor: [20, 37],
  popupAnchor: [0, -37],
});

export const LocationSelector = ({ setLatLng }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      setLatLng({ lat, lng });
    },
  });

  return position ? (
    <Marker position={position} icon={customIcon}>
      <Popup>Selected Location</Popup>
    </Marker>
  ) : null;
};
