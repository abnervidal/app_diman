/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import React, { useEffect, useContext } from 'react';
import { Button, Modal } from 'react-bootstrap';

// import EditCollaborator from '../../Add/index';

export default function ModalEdit(props) {
  const { show, handleSaveModal, handleCancelModal, data } = props;

  // Manipulando o botão de voltar do navegador para não sair da página de reserva
  useEffect(() => {
    // Add a fake history event so that the back button does nothing if pressed once
    window.history.pushState(
      'fake-route',
      document.title,
      window.location.href
    );

    addEventListener('popstate', handleCancelModal);

    // Here is the cleanup when this component unmounts
    return () => {
      removeEventListener('popstate', closeQuickView);
      // If we left without using the back button, aka by using a button on the page, we need to clear out that fake history event
      if (window.history.state === 'fake-route') {
        window.history.back();
      }
    };
  }, []);

  return (
    <Modal
      show={show}
      onHide={handleCancelModal}
      backdrop="static"
      keyboard={false}
      size="xl"
    >
      <Modal.Header closeButton>
        <Modal.Title>Edição</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* <EditCollaborator
          data={data}
          handleCancelModal={handleCancelModal}
          handleSaveModal={handleSaveModal}
        /> */}
      </Modal.Body>
      {/* <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary">Understood</Button>
      </Modal.Footer> */}
    </Modal>
  );
}
