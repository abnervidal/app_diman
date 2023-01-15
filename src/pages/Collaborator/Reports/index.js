import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import { Container } from 'react-bootstrap';

export default function index() {
  return (
    <Card>
      <Card.Header className="d-print-none">
        <Container>
          <Nav variant="tabs" defaultActiveKey="#1">
            <Nav.Item>
              <Link
                className="text-decoration-none"
                to="/collaborator/reports/active"
              >
                <Nav.Link href="#1">Contratados</Nav.Link>
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link
                className="text-decoration-none"
                to="/collaborator/reports/effective"
              >
                <Nav.Link href="#2">Efetivo do dia</Nav.Link>
              </Link>
            </Nav.Item>
          </Nav>
        </Container>
      </Card.Header>
      <Container>
        <Card.Body>
          <Outlet className="d-print-block" />
        </Card.Body>
      </Container>
    </Card>
  );
}
