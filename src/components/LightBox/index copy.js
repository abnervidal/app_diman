import React from 'react';
import LightGallery from 'lightgallery/react';

// import styles
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';

// If you want you can use SCSS instead of css
import 'lightgallery/scss/lightgallery.scss';
import 'lightgallery/scss/lg-zoom.scss';

// import plugins if you need
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';

export default function Index() {
  const onInit = () => {
    console.log('lightGallery has been initialized');
  };
  return (
    <div className="App">
      <LightGallery onInit={onInit} speed={500} plugins={[lgThumbnail, lgZoom]}>
        <a href="https://source.unsplash.com/1200x800/?water">
          <img alt="img1" src="https://source.unsplash.com/1200x800/?water" />
        </a>
        <a href="https://source.unsplash.com/1200x800/?asphalt">
          <img alt="img1" src="https://source.unsplash.com/1200x800/?asphalt" />
        </a>
        <a href="https://source.unsplash.com/1200x800/?energy">
          <img alt="img2" src="https://source.unsplash.com/1200x800/?energy" />
        </a>
        ...
      </LightGallery>
    </div>
  );
}
