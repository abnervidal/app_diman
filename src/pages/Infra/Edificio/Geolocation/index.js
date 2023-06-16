/* eslint-disable react/prop-types */
import React, {
  useMemo,
  useRef,
  useCallback,
  useState,
  useEffect,
} from 'react';
import { GoogleMap, LoadScript, Marker, latLng } from '@react-google-maps/api';
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
import { toast } from 'react-toastify';
import './style.css';

import axios from '../../../../services/axios';
import Loading from '../../../../components/Loading';

const containerStyle = {
  width: '800px',
  height: '600px',
};

const onLoadMarker = (marker) => {
  console.log('marker: ', marker);
};

function MyComponent({ buildingData }) {
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState();
  const [center, setCenter] = useState({
    lat: -5.839692696223772,
    lng: -35.20156446349059,
  });
  const mapRef = useRef();

  useEffect(() => {
    if (buildingData.geo) {
      const newPosition = {
        lat: buildingData.geo.coordinates[0],
        lng: buildingData.geo.coordinates[1],
      };
      console.log(buildingData.geo);
      setPosition(newPosition);
      // mapRef.current?.panTo(newPosition);
      setCenter(newPosition);
    }
  }, []);

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

  const handleStore = async (values) => {
    try {
      setIsLoading(true);

      const geo = {
        type: 'Point',
        coordinates: [values.lat, values.lng],
      };

      await axios.put(`/properties/buildings/${buildingData.subRip}`, { geo });

      toast.success(`Registro realizado com sucesso!`);
      setIsLoading(false);
    } catch (err) {
      // eslint-disable-next-line no-unused-expressions
      console.log(err);
      err.response?.data?.errors
        ? err.response.data.errors.map((error) => toast.error(error)) // errors -> resposta de erro enviada do backend (precisa se conectar com o back)
        : toast.error(err.message); // e.message -> erro formulado no front (é criado pelo front, não precisa de conexão)

      setIsLoading(false);
    }
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
        <Row style={{ height: '65vh' }}>
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
              {position ? (
                <Marker
                  onLoad={onLoadMarker}
                  position={position}
                  options={{
                    label: {
                      text: buildingData?.name,
                      className: 'marker badge bg-info text-white',
                    },
                  }}
                />
              ) : null}
            </GoogleMap>
          </LoadScript>
        </Row>
        <Row className="justify-content-center pt-2 pb-4">
          <Col xs="auto" className="text-center">
            <Button
              variant="success"
              type="submit"
              onClick={(e) => handleStore(position)}
            >
              Confirmar Localização
            </Button>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default React.memo(MyComponent);
