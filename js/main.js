// TODO:
//   - display info
//   - use low-res image for processing and blobing


const mSketch = (p5s) => {
  let mImageOriginal;
  let mImageResized;
  let mImageResizedHue;
  let mImageColor;
  let mImageLoaded = false;
  let mImageColorVisible = true;
  let minHue = 100;
  let maxHue = 140;

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

    mImageResizedHue = getImageHue(mImageResized);
    processImage(mImageResizedHue, minHue, maxHue);
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

      const mcHue = p5s.hue(mColor);
      const mcSaturation = p5s.saturation(mColor);
      const mcLightness = p5s.lightness(mColor);

      if ((mcSaturation > 10) && (mcLightness > 8) && (mcLightness < 65)) {
        mImageHue.push(mcHue);
      } else {
        mImageHue.push(400);
      }
    }
    return mImageHue;
  };

  const processImage = (mImageHue, _minHue, _maxHue) => {
    mImageColor.loadPixels();
    const minHue = p5s.min(_minHue, _maxHue);
    const maxHue = p5s.max(_minHue, _maxHue);
    const centerHue = Math.floor(minHue + (maxHue - minHue) / 2.0);
    const currentColor = p5s.color(`hsl(${centerHue}, 100%, 50%)`);

    for (let i = 0; i < mImageColor.width * mImageColor.height; i++) {
      const idx = 4 * i;
      currentColor.levels.forEach((v, ci) => mImageColor.pixels[idx + ci] = v);

      if (mImageHue[i] < minHue || mImageHue[i] > maxHue) {
        mImageColor.pixels[idx + 3] = 0;
      }
    }
    mImageColor.updatePixels();
  };

  const loadImage = (filepath) => {
    p5s.loadImage(filepath, img => {
      mImageOriginal = img;
      mImageLoaded = true;
      resizeImage();
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
        }
        image.src = readerEvent.target.result;
      }
      reader.readAsDataURL(file);
    });

    $('#my-filter-toggle').click((event) => {
      event.target.classList.toggle('on');
      mImageColorVisible = !mImageColorVisible;
    });

    $('#my-hue-min-picker').on('input', (event, _) => {
      minHue = parseInt(p5s.hue(p5s.color(event.target.value)));
      processImage(mImageResizedHue, minHue, maxHue);
    });

    $('#my-hue-max-picker').on('input', (event, _) => {
      maxHue = parseInt(p5s.hue(p5s.color(event.target.value)));
      processImage(mImageResizedHue, minHue, maxHue);
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
  };
};

const p52D = new p5(mSketch);
