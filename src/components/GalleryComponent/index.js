import React, { useEffect, useState } from 'react';
import { Row, Col, Image as ImageBS } from 'react-bootstrap';
import { Gallery, Item, useGallery } from 'react-photoswipe-gallery';
import 'photoswipe/dist/photoswipe.css';

function getImageDemensions(imageSrc) {
  const image = new Image();
  return new Promise((resolve, reject) => {
    image.src = imageSrc;
    image.addEventListener(
      'load',
      () => {
        resolve(image);
      },
      false
    );
  });
}

function GalleryContent({ images }) {
  const smallItemStyles = {
    cursor: 'pointer',
    objectFit: 'cover',
    width: '100%',
    maxHeight: '100%',
  };

  const { open } = useGallery();

  // useEffect(() => {
  //   open(1); // you can open second slide by calling open(1) in useEffect
  // }, [open]);

  return (
    <Row className="d-flex align-items-center justify-content-center pb-3">
      {images.map((image, index) => (
        <Col xs="auto">
          <Item
            key={index}
            original={image.src}
            thumbnail={image.src}
            alt={image.filename}
            width={image.w}
            height={image.h}
          >
            {({ ref, open }) => (
              <ImageBS
                src={image.src}
                ref={ref}
                onClick={open}
                alt={image.filename}
                width="150"
                thumbnail
                style={{ cursor: 'zoom-in' }}
              />
            )}
          </Item>
        </Col>
      ))}
    </Row>
  );
}

export default function GalleryComponent({ images, hasDimensions = true }) {
  const [data, setData] = useState([]);

  // Define an array of images to be displayed

  async function imageDimensions() {
    // eslint-disable-next-line no-restricted-syntax
    for (const image of images) {
      // eslint-disable-next-line no-await-in-loop
      const dataImage = await getImageDemensions(image.src);
      image.w = dataImage.naturalWidth.toString();
      image.h = dataImage.naturalHeight.toString();
    }
    // setData(images);
    return images;
  }

  async function putDimensions() {
    const response = await imageDimensions();
    setData(response);
  }

  useEffect(() => {
    if (!hasDimensions) {
      putDimensions();
    } else {
      setData(images);
    }
  }, []);

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
    <Gallery
      withDownloadButton
      withCaption
      // options={options}
    >
      <GalleryContent images={data} />
    </Gallery>
  );
}
