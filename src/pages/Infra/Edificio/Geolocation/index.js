import React, { useMemo, useRef, useCallback, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  OverlayTrigger,
  Tooltip,
  Form as BootstrapForm,
} from 'react-bootstrap';
import './style.css';

const containerStyle = {
  width: '800px',
  height: '600px',
};

const onLoadMarker = (marker) => {
  console.log('marker: ', marker);
};

function MyComponent({ buildingData }) {
  const [position, setPosition] = useState({
    lat: -5.839692696223772,
    lng: -35.20156446349059,
  });
  const mapRef = useRef();

  const center = useMemo(
    () => ({
      lat: -5.839692696223772,
      lng: -35.20156446349059,
    }),
    []
  );

  const options = useMemo(
    () => ({
      mapId: 'ade80d771133503b',
      disableDefaultUI: true,
      clickableIcons: false,
    }),
    []
  );

  const setNewPosition = (lat, lng) => {
    setPosition({
      lat,
      lng,
    });
    console.log(lat, lng);
  };

  // eslint-disable-next-line no-return-assign
  const onLoad = useCallback((map) => (mapRef.current = map), []);

  return (
    <>
      <Container className="border">
        <Row>
          <Col xs="auto" className="pe-0">
            SUB-RIP:{' '}
          </Col>
          <Col>
            <span className="fw-bold ps-0">{buildingData?.subRip}</span>{' '}
          </Col>
        </Row>
        <Row>
          <Col xs="auto" className="pe-0">
            N INFRA:{' '}
          </Col>
          <Col>
            <span className="fw-bold ps-0">{buildingData?.numInfra}</span>{' '}
          </Col>
        </Row>
        <Row>
          <Col xs="auto" className="pe-0">
            INSTALAÇÃO:{' '}
          </Col>
          <Col>
            <span className="fw-bold ps-0">{buildingData?.name}</span>{' '}
          </Col>
        </Row>
        <Row>
          <Col xs="auto" className="pe-0">
            ÁREA:{' '}
          </Col>
          <Col xs="auto">
            <span className="fw-bold ps-0">{buildingData?.area}</span> m²
          </Col>
          <Col xs="auto" className="pe-0">
            PAVIMENTOS:{' '}
          </Col>
          <Col xs="auto">
            <span className="fw-bold ps-0">{buildingData?.floors}</span>{' '}
          </Col>
        </Row>
      </Container>
      <Container>
        <Row style={{ height: '70vh' }}>
          <LoadScript
            googleMapsApiKey={process.env.REACT_APP_BASE_GOOGLE_API_KEY}
            region="us"
            libraries={['geometry']}
          >
            <GoogleMap
              // mapContainerStyle={containerStyle}
              center={center}
              zoom={18}
              mapContainerClassName="map-container"
              options={options}
              onLoad={onLoad}
              onDblClick={(e) => {
                setNewPosition(e.latLng.lat(), e.latLng.lng());
              }}
            >
              {/* Child components, such as markers, info windows, etc. */}
              <Marker
                onLoad={onLoadMarker}
                position={position}
                options={{
                  label: {
                    text: 'Posição teste',
                    className: 'mb-4 pb-3',
                  },
                }}
              />
            </GoogleMap>
          </LoadScript>
        </Row>
      </Container>
    </>
  );
}

export default React.memo(MyComponent);
