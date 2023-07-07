import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import { Container } from 'react-bootstrap';

export default function index() {
  return (
    <Card>
      <Card.Header>
        <Container>
          <Nav variant="tabs" defaultActiveKey="#1">
            <Nav.Item>
              <Link
                className="text-decoration-none"
                to="/materials/internal/reserve"
              >
                <Nav.Link href="#1">Reservar</Nav.Link>
              </Link>
            </Nav.Item>

            <Nav.Item>
              <Link
                className="text-decoration-none"
                to="/materials/internal/listreserves"
              >
                <Nav.Link href="#2">Relação de Reservas</Nav.Link>
              </Link>
            </Nav.Item>

            <Nav.Item>
              <Link
                className="text-decoration-none"
                to="/materials/internal/restrict"
              >
                <Nav.Link href="#3">Restringir/Liberar</Nav.Link>
              </Link>
            </Nav.Item>

            <Nav.Item>
              <Link
                className="text-decoration-none"
                to="/materials/internal/initialQuantity"
              >
                <Nav.Link href="#4">Definir Saldo</Nav.Link>
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link
                className="text-decoration-none"
                to="/materials/internal/transformation"
              >
                <Nav.Link href="#5">Transformação</Nav.Link>
              </Link>
            </Nav.Item>
          </Nav>
        </Container>
      </Card.Header>
      <Container>
        <Card.Body>
          <Outlet />
        </Card.Body>
      </Container>
    </Card>
  );
}
