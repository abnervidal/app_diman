import React, { useState } from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import { Gallery, Item } from 'react-photoswipe-gallery';
import 'photoswipe/dist/photoswipe.css';

function GalleryComponent() {
  const smallItemStyles = {
    cursor: 'pointer',
    objectFit: 'cover',
    width: '100%',
    maxHeight: '100%',
  };

  // Define an array of images to be displayed
  const images = [
    {
      src: 'https://placeimg.com/640/480/nature',
      w: `640`,
      h: `480`,
      title: 'Nature',
    },
    {
      src: 'https://placeimg.com/640/480/arch',
      w: `640`,
      h: `480`,
      title: 'Architecture',
    },
    {
      src: 'https://placeimg.com/640/480/animals',
      w: `640`,
      h: `480`,
      title: 'Animals',
    },
  ];

  // Define state to keep track of the currently selected image
  const [currentIndex, setCurrentIndex] = useState(0);

  // Define a function to handle the thumbnail click event
  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  const options = {
    arrowPrev: true,
    arrowNext: true,
    zoom: true,
    close: true,
    counter: false,
    bgOpacity: 0.2,
    padding: { top: 20, bottom: 40, left: 100, right: 100 },
  };

  return (
    <Container fluid>
      <Row>
        <Gallery
          withDownloadButton
          withCaption
          // items={images}
          // options={options}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '240px 171px 171px',
              gridTemplateRows: '114px 114px',
              gridGap: 12,
            }}
          >
            {images.map((image, index) => (
              <Item
                original={image.src}
                thumbnail={image.src}
                alt={image.title}
                width={image.w}
                height={image.h}
              >
                {({ ref, open }) => (
                  <img
                    style={smallItemStyles}
                    src={image.src}
                    ref={ref}
                    onClick={open}
                    alt={image.title}
                  />
                )}
              </Item>
            ))}
          </div>
        </Gallery>
      </Row>
    </Container>
  );
}

export default GalleryComponent;
