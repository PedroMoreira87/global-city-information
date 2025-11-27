import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import "./MapWithGeocoding.scss";

const GoogleMapsAPIKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export interface CityCoordinates {
	lat: number;
	lng: number;
}

interface MapWithGeocodingProps {
	cityCoordinates: CityCoordinates | null;
}

const mapContainerStyle = {
	width: "50%",
	height: "28rem",
};

const MapWithGeocoding = ({ cityCoordinates }: MapWithGeocodingProps) => {
	if (!cityCoordinates) {
		return <div className="mapWithGeocoding">Loading map...</div>;
	}

	return (
		<div className="map-with-geocoding">
			<LoadScript googleMapsApiKey={GoogleMapsAPIKey}>
				<GoogleMap
					mapContainerStyle={mapContainerStyle}
					center={cityCoordinates}
					zoom={12}
				>
					<Marker position={cityCoordinates} />
				</GoogleMap>
			</LoadScript>
		</div>
	);
};

export default MapWithGeocoding;
