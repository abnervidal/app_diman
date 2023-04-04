import React from 'react';
import {
  FaUser,
  FaUserEdit,
  FaCircle,
  FaUserPlus,
  FaSignOutAlt,
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Container, Nav, NavDropdown, Row, Col } from 'react-bootstrap';

import * as actions from '../../store/modules/auth/actions';
import { StyledNav, StyledNavbar } from './styled';

import { primaryDarkColor } from '../../config/colors';

import logoSisman from '../../assets/img/logo-sisman.png';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const usernameStored = useSelector((state) => state.auth.user.username);

  const handleLogout = (e) => {
    e.preventDefault();

    dispatch(actions.loginFailure());
    navigate('/', { replace: true });
    toast.success('Sessão encerrada');
  };

  return (
    <>
      {process.env?.REACT_APP_BASE_ENV === 'development' ? (
        <Row className="bg-warning">
          <Col className="text-center text-dark fw-bold font-monospace py-1">
            AMBIENTE DE DESENVOLVIMENTO
          </Col>
        </Row>
      ) : null}

      <StyledNav className="d-print-none" />

      <StyledNavbar
        collapseOnSelect
        expand="lg"
        className="border-bottom border-2 justify-content-center d-print-none"
        style={{ background: '#F8F9FA' }}
      >
        <Container>
          <StyledNavbar.Brand className="mt-1">
            <Link to="/Home">
              <img
                src={logoSisman}
                height="25"
                className="d-inline-block align-top"
                alt="Sisman logo"
              />
            </Link>
          </StyledNavbar.Brand>
          <StyledNavbar.Toggle aria-controls="responsive-StyledNavbar-nav" />
          <StyledNavbar.Collapse
            id="responsive-StyledNavbar-nav"
            clas="d-flex justify-content-between"
          >
            <Nav className="me-auto mt-2 px-2">
              {/* <Nav.Link href="#1" onClick={() => navigate('/collaborator')}>
                COLAB
              </Nav.Link> */}

              <NavDropdown title="COLABORADORES" id="collasible-nav-dropdown">
                <NavDropdown.Item // teste
                  href="#1"
                  onClick={() => navigate('/collaborator/frequency/manual')}
                >
                  Frequência
                </NavDropdown.Item>
                <NavDropdown.Item
                  href="#2"
                  onClick={() => navigate('/collaborator1/ocorrencia/')}
                >
                  Ocorrência
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  href="#3"
                  onClick={() => navigate('/collaborator/safety/risk')}
                >
                  Segurança
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  href="#4"
                  onClick={() => navigate('/collaborator/reports/active')}
                >
                  Relatórios
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  href="#5"
                  onClick={() => navigate('/collaborator/record/add')}
                >
                  Cadastro
                </NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="MATERIAL" id="collasible-nav-dropdown">
                <NavDropdown.Item // teste
                  href="#5"
                  onClick={() => navigate('/materials/in/sipac')}
                >
                  Entrada
                </NavDropdown.Item>
                <NavDropdown.Item
                  href="#6"
                  onClick={() => navigate('/materials/out/use')}
                >
                  Saída
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  href="#7"
                  onClick={() => navigate('/materials/internal/listreserves')}
                >
                  Operações Internas
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  href="#8"
                  onClick={() => navigate('/materials/reports/inventory')}
                >
                  Relatórios
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  href="#9"
                  onClick={() => navigate('/materials/record/list')}
                >
                  Cadastro
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  href="#10"
                  onClick={() =>
                    navigate('/materials/definitions/proccessflow')
                  }
                >
                  Definições
                </NavDropdown.Item>
              </NavDropdown>

              <Nav.Link href="#11" onClick={() => navigate('/equip')}>
                EQUIP
              </Nav.Link>

              <NavDropdown title="USADOS" id="collasible-nav-dropdown">
                <NavDropdown.Item // teste
                  href="#12"
                  onClick={() => navigate('/used/in/sipac')}
                >
                  Entrada
                </NavDropdown.Item>
                <NavDropdown.Item
                  href="#13"
                  onClick={() => navigate('/used/out/use')}
                >
                  Saída
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  href="#14"
                  onClick={() => navigate('/used/internal/listreserves')}
                >
                  Operações Internas
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  href="#15"
                  onClick={() => navigate('/used/reports/inventory')}
                >
                  Relatórios
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  href="#16"
                  onClick={() => navigate('/used/record/list')}
                >
                  Cadastro
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  href="#17"
                  onClick={() => navigate('/used/definitions/terminology')}
                >
                  Definições
                </NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="INFRA" id="collasible-nav-dropdown">
                <NavDropdown.Item
                  href="#18"
                  onClick={() => navigate('/infra/edificio/list')}
                >
                  Edifícios
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  href="#19"
                  onClick={() => navigate('/infra/eletrica')}
                >
                  Elétrica
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  href="#20"
                  onClick={() => navigate('/infra/agua')}
                >
                  Água
                </NavDropdown.Item>
                <NavDropdown.Item
                  href="#21"
                  onClick={() => navigate('/infra/esgoto')}
                >
                  Esgoto
                </NavDropdown.Item>
                <NavDropdown.Item
                  href="#22"
                  onClick={() => navigate('/infra/drenagem')}
                >
                  Drenagem
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  href="#23"
                  onClick={() => navigate('/infra/pavimento')}
                >
                  Pavimentação
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  href="#24"
                  onClick={() => navigate('/infra/deposito')}
                >
                  Depósito Infra
                </NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="FORNECEDORES" id="collasible-nav-dropdown">
                <NavDropdown.Item
                  href="#25"
                  onClick={() => navigate('/providers/record/list')}
                >
                  Cadastro
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  href="#26"
                  onClick={() => navigate('/providers/contracts/list')}
                >
                  Contratos
                </NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="FROTA" id="collasible-nav-dropdown">
                <NavDropdown.Item
                  href="#27"
                  onClick={() => navigate('/fleet/record/list')}
                >
                  Cadastro
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  href="#28"
                  onClick={() => navigate('/fleet/ocorrencia')}
                >
                  Ocorrência
                </NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="ADM" id="collasible-nav-dropdown">
                <NavDropdown.Item
                  href="#29"
                  onClick={() => navigate('/adm/users/list')}
                >
                  Usuários
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  href="#30"
                  onClick={() => navigate('/adm/unidades')}
                >
                  Unidades
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>

            <Nav className="me-0 mt-2">
              {isLoggedIn ? (
                <>
                  <Nav.Link>
                    <div className="text-nowrap flex-nowrap">
                      <FaCircle className="pb-0" size={14} color="#66ff33" />
                      <span className="ms-2">{usernameStored}</span>
                    </div>
                  </Nav.Link>
                  <Nav.Link>
                    <Link to="/logout">
                      <div className="text-nowrap flex-nowrap">
                        <FaSignOutAlt
                          className="pb-1"
                          size={18}
                          onClick={handleLogout}
                          style={{ color: primaryDarkColor }}
                        />
                      </div>
                    </Link>
                  </Nav.Link>
                  <Nav.Link href="#19">
                    <Link to="/register">
                      <div className="text-nowrap flex-nowrap">
                        <FaUserEdit
                          className="pb-1"
                          size={18}
                          style={{ color: primaryDarkColor }}
                        />
                      </div>
                    </Link>
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link href="#20">
                    <Link to="/login">
                      <div className="text-nowrap flex-nowrap">
                        <FaUser
                          className="pb-1"
                          size={18}
                          style={{ color: primaryDarkColor }}
                        />
                        <span className="ms-2" style={{ color: 'gray' }}>
                          Login
                        </span>
                      </div>
                    </Link>
                  </Nav.Link>
                  <Nav.Link href="#21">
                    <Link to="/register">
                      <div className="text-nowrap flex-nowrap">
                        <FaUserPlus
                          className="pb-1"
                          size={18}
                          style={{ color: primaryDarkColor }}
                        />
                        <span className="ms-2" style={{ color: 'gray' }}>
                          Registro
                        </span>
                      </div>
                    </Link>
                  </Nav.Link>
                </>
              )}
            </Nav>
          </StyledNavbar.Collapse>
        </Container>
      </StyledNavbar>
    </>
  );
}
