import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import uuid from 'react-uuid';

function NumberMarker(props) {
  const { index } = props;

  const markerStyle = {
    backgroundColor: 'pink',
    borderRadius: '50%',
    padding: '5px',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '14px',
    width: '40px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  return <div style={markerStyle}>{index + 1}</div>;
}

function Map(props) {
  const mapContainerStyle = {
    width: '600px',
    height: '500px',
  };

  // getting center as our usual lot and lon
  const center = {
    lat: 51.5072178,
    lng: -0.1275862,
  };

  const onLoad = (marker) => {
    console.log('marker: ', marker);
  };

  const mapOptions = {
    mapTypeId: 'satellite',
  };

  const markerIcon = {
    url: '',
    backgroundColor: 'pink',
    borderRadius: '50%',
    padding: '5px',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '14px',
    width: '40px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  return (
    <div>
      <LoadScript googleMapsApiKey="AIzaSyCJu0aTsRYKOQVPsETLeTvI84jxDZjRGAg">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={12}
        >
          {props.locations.map((location, index) => (
            <Marker
              key={uuid()}
              onLoad={onLoad}
              position={{
                lat: Number(location.latitude),
                lng: Number(location.longitude),
              }}
              options={mapOptions}
            ></Marker>
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default Map;
