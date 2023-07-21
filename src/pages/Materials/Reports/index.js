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
                to="/materials/reports/inventory"
              >
                <Nav.Link href="#1">Inventário</Nav.Link>
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link
                className="text-decoration-none"
                to="/materials/reports/input"
              >
                <Nav.Link href="#2">Entradas</Nav.Link>
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link
                className="text-decoration-none"
                to="/materials/reports/output"
              >
                <Nav.Link href="#3">Saídas</Nav.Link>
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link
                className="text-decoration-none"
                to="/materials/reports/provisionfrequency"
              >
                <Nav.Link href="#4">Provisões</Nav.Link>
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link
                className="text-decoration-none"
                to="/materials/reports/consumefrequency"
              >
                <Nav.Link href="#5">Consumos</Nav.Link>
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link
                className="text-decoration-none"
                to="/materials/reports/maintenancebalanceoutput"
              >
                <Nav.Link href="#6">Balanço por Manutenção</Nav.Link>
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link
                className="text-decoration-none"
                to="/materials/reports/workerbymaterial"
              >
                <Nav.Link href="#7">Colaborador p/ Material</Nav.Link>
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Link
                className="text-decoration-none"
                to="/materials/reports/materialbyworker"
              >
                <Nav.Link href="#8">Material p/ Colaborador</Nav.Link>
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
