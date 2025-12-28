import { Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
const customIcon = L.divIcon({
  html: `<i class="ki-solid ki-geolocation text-2xl text-success"></i>`,
  className: 'leaflet-marker',
  iconAnchor: [20, 37],
  popupAnchor: [0, -37],
});

export const LocationSelector = ({ setLatLng, initialPosition, branchName }) => {
  const [position, setPosition] = useState(initialPosition || null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      setLatLng({ branch_latitude: lat, branch_longitude: lng });
    },
  });

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition, branchName]);

  return position ? (
    <Marker position={position} icon={customIcon}>
      <Popup autoClose={false} closeOnClick={false} closeButton={false} autoPan={false}>
        <div className="flex flex-col items-center">
          <i className="ki-solid ki-geolocation text-primary text-2xl mb-1"></i>
          <p className="card-title font-semibold">
            {branchName ? branchName : "Selected Branch"}
          </p>
        </div>
      </Popup>
    </Marker>
  ) : null;
};

LocationSelector.propTypes = {
  setLatLng: PropTypes.func.isRequired,
  initialPosition: PropTypes.array,
  branchName: PropTypes.string,
};
