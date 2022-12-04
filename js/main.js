// TODO:
//   ~ sliders for selecting hue center and width
//   ? display multiple images

const mSketch = (p5s) => {
  let mImageOriginal;
  let mImageResized;
  let mImageResizedHue;
  let mImageColor;
  let mImageLoaded = false;
  let mImageColorVisible = true;
  let centerHue = 140;
  let deltaHue = 40;

  const resizeCanvas = () => {
    const menuHeight = $("#my-menu").outerHeight();
    const cWidth = p5s.windowWidth;
    const cHeight = p5s.windowHeight - menuHeight;
    p5s.resizeCanvas(cWidth, cHeight);
  };

  const resizeImage = () => {
    let nWidth = mImageOriginal.width;
    let nHeight = mImageOriginal.height;

    if (nWidth > p5s.width) {
      nWidth = p5s.width;
      nHeight = nWidth * mImageOriginal.height / mImageOriginal.width;
    }

    if (nHeight > p5s.height) {
      nHeight = p5s.height;
      nWidth = nHeight * mImageOriginal.width / mImageOriginal.height;
    }

    mImageResized = p5s.createImage(nWidth, nHeight);
    mImageColor = p5s.createImage(nWidth, nHeight);
    mImageResized.copy(mImageOriginal,
      0, 0, mImageOriginal.width, mImageOriginal.height,
      0, 0, mImageResized.width, mImageResized.height);
  };

  const getImageHue = (mImg) => {
    let mImageHue = [];
    mImg.loadPixels();
    for (let i = 0; i < mImg.width * mImg.height; i++) {
      const idx = 4 * i;
      const mColor = p5s.color(
        mImg.pixels[idx + 0],
        mImg.pixels[idx + 1],
        mImg.pixels[idx + 2]);
      mImageHue.push(p5s.hue(mColor));
    }
    return mImageHue;
  };

  const processImage = (mImageHue, centerHue, deltaHue) => {
    mImageColor.loadPixels();
    const minHue = p5s.max(centerHue - deltaHue, 0);
    const maxHue = p5s.min(centerHue + deltaHue, 360);

    for (let i = 0; i < mImageColor.width * mImageColor.height; i++) {
      const idx = 4 * i;
      mImageColor.pixels[idx + 0] = 0;
      mImageColor.pixels[idx + 1] = 255;
      mImageColor.pixels[idx + 2] = 0;
      mImageColor.pixels[idx + 3] = 0;

      if (mImageHue[i] > minHue && mImageHue[i] < maxHue) {
        mImageColor.pixels[idx + 3] = 255;
      }
    }
    mImageColor.updatePixels();
  };

  const loadImage = (filepath) => {
    p5s.loadImage(filepath, img => {
      mImageOriginal = img;
      mImageLoaded = true;
      resizeImage();
      mImageResizedHue = getImageHue(mImageResized);
      processImage(mImageResizedHue, centerHue, deltaHue);
    });
  };

  const setupMenu = () => {
    $('#my-img-file').change((event) => {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (readerEvent) => {
        const image = new Image();
        image.onload = (_) => {
          mImageOriginal.resize(image.width, image.height);
          mImageOriginal.drawingContext.drawImage(image, 0, 0);

          resizeImage();
          mImageResizedHue = getImageHue(mImageResized);
          processImage(mImageResizedHue, centerHue, deltaHue);
        }
        image.src = readerEvent.target.result;
      }
      reader.readAsDataURL(file);
    });

    $('#my-filter-toggle').click((event) => {
      event.target.classList.toggle('on');
      mImageColorVisible = !mImageColorVisible;
    });

    $('#my-hue-center-slider').on('input', (event, _) => {
      centerHue = event.target.value;
      processImage(mImageResizedHue, centerHue, deltaHue);
    });

    $('#my-hue-width-slider').on('input', (event, _) => {
      deltaHue = event.target.value;
      processImage(mImageResizedHue, centerHue, deltaHue);
    });
  };

  p5s.setup = () => {
    const mCanvas = p5s.createCanvas(0, 0);
    mCanvas.parent("my-canvas-container");
    mCanvas.id("canvas2d");
    resizeCanvas();
    p5s.setAttributes("antialias", true);
    p5s.smooth();
    p5s.pixelDensity(2);
    p5s.randomSeed(1010);
    p5s.frameRate(24);
    loadImage("./assets/img00.jpg");
    setupMenu();
  };

  p5s.draw = () => {
    p5s.clear();
    p5s.background(0, 0, 0);
    p5s.stroke(255);
    p5s.fill(16);

    if (mImageLoaded) {
      p5s.push();
      p5s.imageMode(p5s.CENTER);
      p5s.image(mImageResized, p5s.width / 2.0, p5s.height / 2.0);
      if (mImageColorVisible) {
        p5s.image(mImageColor, p5s.width / 2.0, p5s.height / 2.0);
      }
      p5s.pop();
    }
  };

  p5s.windowResized = () => {
    resizeCanvas();
    resizeImage();
    mImageResizedHue = getImageHue(mImageResized);
    processImage(mImageResizedHue, centerHue, deltaHue);
  };
};

const p52D = new p5(mSketch);
