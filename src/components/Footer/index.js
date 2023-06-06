import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

import logoDiman from '../../assets/img/logo_infra_diman_gray.png';
import logoUFRN from '../../assets/img/logo_ufrn_gray.png';

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="bg-dark text-white d-print-none">
      <Container className="py-1 ps-4 mb-0">
        <Row className="d-flex justify-content-between align-items-center py-2">
          <Col>
            <span
              style={{
                fontSize: '0.7em',
                fontWeight: 'bold',
                letterSpacing: '2px',
              }}
            >
              SOBRE
            </span>
            <div>Sistema de gestão da manutenção predial</div>
          </Col>
          <Col>
            {' '}
            <span
              style={{
                fontSize: '0.7em',
                fontWeight: 'bold',
                letterSpacing: '2px',
              }}
            >
              DESENVOLVIMENTO
            </span>
            <div>
              <FaUserCircle /> Mykael Mello
            </div>
          </Col>
          <Col xs="auto" className="d-flex align-items-center">
            <img
              src={logoUFRN}
              height="40"
              className="pe-3 d-inline-block align-center"
              alt="Infra logo"
            />

            <img
              src={logoDiman}
              height="58"
              className="ps-3 d-inline-block align-top"
              alt="Infra logo"
            />
          </Col>
        </Row>
        <Row>
          <p className="text-center text-white py-1">
            Copyright &copy; SISMAN - 2022
          </p>
        </Row>
      </Container>
    </footer>
  );
}
