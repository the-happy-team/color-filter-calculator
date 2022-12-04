// TODO:
//   - button to load new image
//   ? sliders for selecting green threshold
//   ? display multiple images

const mSketch = (p5s) => {
  let mImageOriginal;
  let mImageResized;
  let mImageColor;
  let mImageLoaded = false;

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

  const loadImage = (filepath) => {
    p5s.loadImage(filepath, img => {
      mImageOriginal = img;
      mImageLoaded = true;
      resizeImage();
      processImage();
    });
  };

  const getImageHue = () => {
    let mImageHue = [];
    mImageResized.loadPixels();
    for (let i = 0; i < mImageResized.width * mImageResized.height; i++) {
      const row = Math.floor(i / mImageColor.width);
      const col = i % mImageColor.width;
      const mColor = mImageResized.get(col, row);
      mImageHue.push(p5s.hue(p5s.color(mColor[0], mColor[1], mColor[2])));
    }
    return mImageHue;
  };

  const processImage = () => {
    mImageHue = getImageHue();
    mImageColor.loadPixels();
    for (let i = 0; i < mImageColor.width * mImageColor.height; i++) {
      const row = Math.floor(i / mImageColor.width);
      const col = i % mImageColor.width;

      if (mImageHue[i] > 100 && mImageHue[i] < 180) {
        mImageColor.set(col, row, p5s.color(0, 255, 0, 255));
      } else {
        mImageColor.set(col, row, p5s.color(0, 0, 0, 0));
      }
    }
    mImageColor.updatePixels();
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
      p5s.image(mImageColor, p5s.width / 2.0, p5s.height / 2.0);
      p5s.pop();
    }
  };

  p5s.windowResized = () => {
    resizeCanvas();
    resizeImage();
  };
};

const p52D = new p5(mSketch);
