import chroma, { Color } from 'chroma-js';
import trianglify, {
  Pattern as TrianglifyPattern,
  Options,
  SVGOptions,
} from 'trianglify';
import toPx from 'unit-to-px';

// import { getPoints } from './points';

export type PatternXColorOption = 'random' | 'palette';
export type PatternYColorOption = 'random' | 'match' | 'palette';
export type PatternForegroundColorOption = 'none' | 'color';
export type PatternXGradientType = 'linear' | 'radial';
export type PatternYGradientType = 'match' | 'linear' | 'radial';

export class PatternColor {
  private chromaColor: Color;

  constructor(color?: string | Color | PatternColor) {
    if (color === undefined) {
      this.chromaColor = chroma.random();
    } else if (color instanceof PatternColor) {
      this.chromaColor = color.chromaColor;
    } else {
      this.chromaColor = chroma(color);
    }
  }

  get color(): PatternColor {
    return this;
  }

  set color(color: string | chroma.Color) {
    this.chromaColor = chroma(color);
  }

  isDark(): boolean {
    return this.chromaColor.luminance() < 0.5;
  }

  isLight(): boolean {
    return this.chromaColor.luminance() >= 0.5;
  }

  setMinimumContrast(
    color: PatternColor,
    contrast = 4.5,
    value = 0.1
  ): PatternColor {
    if (chroma.contrast(this.chromaColor, color.chromaColor) < contrast) {
      let func: string;
      if (this.chromaColor.luminance() === color.chromaColor.luminance()) {
        func = this.isDark() ? 'darken' : 'lighten';
      } else {
        func =
          this.chromaColor.luminance() < color.chromaColor.luminance()
            ? 'darken'
            : 'lighten';
      }

      while (
        chroma.contrast(this.chromaColor, color.chromaColor) < contrast &&
        !(this.chromaColor.luminance() !== (this.isDark() ? 0 : 1))
      ) {
        switch (func) {
          case 'darken':
            this.chromaColor = this.color.darken(value).chromaColor;
            break;
          case 'lighten':
            this.chromaColor = this.color.brighten(value).chromaColor;
            break;
        }
      }
    }

    return this;
  }

  random(): PatternColor {
    return new PatternColor(chroma.random());
  }

  darken(value?: number): PatternColor {
    return new PatternColor(this.chromaColor.darken(value));
  }

  brighten(value?: number): PatternColor {
    return new PatternColor(this.chromaColor.brighten(value));
  }

  set(channel: string, value: number): PatternColor {
    return new PatternColor(this.chromaColor.set(channel, value));
  }

  contrast(color: PatternColor): number {
    return chroma.contrast(this.chromaColor, color.chromaColor);
  }

  css(): string {
    return this.chromaColor.css();
  }

  hex(): string {
    return this.chromaColor.hex();
  }
}

export class PatternPalette extends Array<PatternColor> {
  constructor(...colors: PatternColor[]) {
    super(...colors);
  }

  push(color?: PatternColor): number {
    if (color === undefined) {
      color = new PatternColor();
    }

    return super.push(color);
  }

  last(): PatternColor {
    return this[this.length - 1];
  }
}

export class PatternSize {
  private _width: number;
  private _height: number;
  private _minWidth?: number;
  private _minHeight?: number;

  constructor(
    width: number | string,
    height: number | string,
    minWidth?: number | string,
    minHeight?: number | string
  ) {
    this._minWidth = minWidth ? PatternSize.toPx(minWidth) : undefined;
    this._minHeight = minHeight ? PatternSize.toPx(minHeight) : undefined;
    this._width = PatternSize.toPx(width, this.minWidth);
    this._height = PatternSize.toPx(height, this.minHeight);
  }

  get width(): number {
    return this._width;
  }

  set width(width: number | string) {
    this._width = PatternSize.toPx(width, this.minWidth);
  }

  get height(): number {
    return this._height;
  }

  set height(height: number | string) {
    this._height = PatternSize.toPx(height, this.minHeight);
  }

  get minWidth(): number | undefined {
    return this._minWidth;
  }

  set minWidth(minWidth: number | string | undefined) {
    this._minWidth = minWidth ? PatternSize.toPx(minWidth) : undefined;
  }

  get minHeight(): number | undefined {
    return this._minHeight;
  }

  set minHeight(minHeight: number | string | undefined) {
    this._minHeight = minHeight ? PatternSize.toPx(minHeight) : undefined;
  }

  static toPx(value: number | string, minValue?: number | string): number {
    let px = Number(value);

    if (px === 0 || isNaN(px)) {
      px = toPx(`${value}`);

      if (px === 0) {
        1;
      }
    }

    if (minValue) {
      const minPx = PatternSize.toPx(minValue);

      return px < minPx ? minPx : px;
    }

    return px;
  }
}

export default class Pattern {
  private _size: PatternSize;
  private _variance: number;
  private _colorOptions: {
    x: PatternXColorOption;
    y: PatternYColorOption;
  };
  private _strokeWidth: number;
  private _strokeColor: PatternColor;
  private _palettes: {
    x: PatternPalette;
    y: PatternPalette;
  };
  private _foregroundColorOption: PatternForegroundColorOption;
  private _foregroundColor: PatternColor;
  private _contrast: number;
  private _hueShift: number;
  private _gradientTypes: {
    x: PatternXGradientType;
    y: PatternYGradientType;
  };
  private _seed?: string | number | null;
  private _pattern?: TrianglifyPattern;

  constructor(
    size: PatternSize = new PatternSize(600, 400),
    variance = 1,
    seed?: string | number | null,
    xColorOption: PatternXColorOption = 'random',
    yColorOption: PatternYColorOption = 'match',
    xPalette: PatternPalette = new PatternPalette(),
    yPalette: PatternPalette = new PatternPalette(),
    strokeWidth = 0.1,
    strokeColor: PatternColor = new PatternColor('black'),
    foregroundColorOption: PatternForegroundColorOption = 'none',
    foregroundColor: PatternColor = new PatternColor('white'),
    contrast: number = 4.5,
    hueShift: number = 120,
    xGradientType: PatternXGradientType = 'linear',
    yGradientType: PatternYGradientType = 'match'
  ) {
    this._size = size;
    this._variance = variance;
    this._colorOptions = {
      x: xColorOption,
      y: yColorOption,
    };
    this._strokeWidth = strokeWidth;
    this._strokeColor = strokeColor;
    this._palettes = {
      x: xPalette,
      y: yPalette,
    };
    this._foregroundColorOption = foregroundColorOption;
    this._foregroundColor = foregroundColor;
    this._contrast = contrast;
    this._hueShift = hueShift;
    this._gradientTypes = {
      x: xGradientType,
      y: yGradientType,
    };
    this._seed = seed;

    this.generate();
  }

  get size(): PatternSize {
    return this._size;
  }

  set size(size: PatternSize) {
    this._size = size;
    this.generate();
  }

  get variance(): number {
    return this._variance;
  }

  set variance(variance: number) {
    this._variance = variance;
    this.generate();
  }

  get seed(): string | number | null | undefined {
    return this._seed;
  }

  set seed(seed: string | number | null) {
    this._seed = seed;
    this.generate();
  }

  get xColorOption(): PatternXColorOption {
    return this._colorOptions.x;
  }

  set xColorOption(xColorOption: PatternXColorOption) {
    this._colorOptions.x = xColorOption;
    this.generate();
  }

  get yColorOption(): PatternYColorOption {
    return this._colorOptions.y;
  }

  set yColorOption(yColorOption: PatternYColorOption) {
    this._colorOptions.y = yColorOption;
    this.generate();
  }

  get xPalette(): PatternPalette {
    return this._palettes.x;
  }

  set xPalette(xPalette: PatternPalette) {
    this._palettes.x = xPalette;
  }

  get yPalette(): PatternPalette {
    return this._palettes.y;
  }

  set yPalette(yPalette: PatternPalette) {
    this._palettes.y = yPalette;
  }

  get strokeWidth(): number {
    return this._strokeWidth;
  }

  set strokeWidth(strokeWidth: number) {
    this._strokeWidth = Number(strokeWidth);
    this.generate();
  }

  get strokeColor(): PatternColor {
    return this._strokeColor;
  }

  set strokeColor(color: PatternColor) {
    this._strokeColor = color;
    this.generate();
  }

  get foregroundColorOption(): PatternForegroundColorOption {
    return this._foregroundColorOption;
  }

  set foregroundColorOption(
    foregroundColorOption: PatternForegroundColorOption
  ) {
    this._foregroundColorOption = foregroundColorOption;
    this.generate();
  }

  get foregroundColor(): PatternColor {
    return this._foregroundColor;
  }

  set foregroundColor(color: PatternColor) {
    this._foregroundColor = color;
    this.generate();
  }

  get contrast(): number {
    return this._contrast;
  }

  set contrast(contrast: number) {
    this._contrast = contrast;
    this.generate();
  }

  get hueShift(): number {
    return this._hueShift;
  }

  set hueShift(hueShift: number) {
    this._hueShift = hueShift;
    this.generate();
  }

  get xGradientType(): PatternXGradientType {
    return this._gradientTypes.x;
  }

  set xGradientType(xGradientType: PatternXGradientType) {
    this._gradientTypes.x = xGradientType;
    this.generate();
  }

  get yGradientType(): PatternYGradientType {
    return this._gradientTypes.y;
  }

  set yGradientType(yGradientType: PatternYGradientType) {
    this._gradientTypes.y = yGradientType;
    this.generate();
  }

  generate(): TrianglifyPattern {
    const config: Options = {
      width: this.size.width,
      height: this.size.height,
      variance: this.variance,
      seed: this.seed,
      xColors: this.xColorOption,
      yColors: this.yColorOption,
      strokeWidth: this.strokeWidth,
      /* points: getPoints(
        this.size.width,
        this.size.height,
        trianglify.defaultOptions.cellSize
      ), */
      // stroke_color: this.strokeColor.hex()
    };

    if (this.xColorOption === 'palette') {
      let xPalette = this.xPalette;

      if (xPalette.length === 0) {
        const palettes = Object.values(trianglify.utils.colorbrewer);
        const randomIndex = Math.floor(Math.random() * palettes.length);
        xPalette = new PatternPalette(
          ...palettes[randomIndex].map((color) => new PatternColor(color))
        );
      } else if (xPalette.length === 1) {
        const colorA = xPalette[0].set('lch.h', -Math.abs(this.hueShift));
        const colorB = xPalette[0].set('lch.h', Math.abs(this.hueShift));
        xPalette = new PatternPalette(colorA, xPalette[0], colorB);
      }

      if (this.foregroundColorOption === 'color') {
        for (const color of xPalette) {
          color.setMinimumContrast(this.foregroundColor, this.contrast);
        }
      }

      if (this.xGradientType === 'radial') {
        const xGradientPalette = new PatternPalette();
        for (let i = xPalette.length - 1; i >= 0; i--) {
          xGradientPalette.push(xPalette[i]);
        }
        for (let i = 1; i < xPalette.length; i++) {
          xGradientPalette.push(xPalette[i]);
        }
        xPalette = xGradientPalette;
      }

      config.xColors = xPalette.map((color) => color.hex());
    }

    if (this.yColorOption === 'palette') {
      let yPalette = this.yPalette;

      if (yPalette.length === 0) {
        const palettes = Object.values(trianglify.utils.colorbrewer);
        const randomIndex = Math.floor(Math.random() * palettes.length);
        yPalette = new PatternPalette(
          ...palettes[randomIndex].map((color) => new PatternColor(color))
        );
      } else if (yPalette.length === 1) {
        const colorA = yPalette[0].set('lch.h', -Math.abs(this.hueShift));
        const colorB = yPalette[0].set('lch.h', Math.abs(this.hueShift));
        yPalette = new PatternPalette(colorA, yPalette[0], colorB);
      }

      if (this.foregroundColorOption === 'color') {
        for (const color of yPalette) {
          color.setMinimumContrast(this.foregroundColor, this.contrast);
        }
      }

      let { yGradientType } = this;

      if (yGradientType === 'match') {
        yGradientType = this.xGradientType;
      }

      if (yGradientType === 'radial') {
        const yGradientPalette = new PatternPalette();
        for (let i = yPalette.length - 1; i >= 0; i--) {
          yGradientPalette.push(yPalette[i]);
        }
        for (let i = 1; i < yPalette.length; i++) {
          yGradientPalette.push(yPalette[i]);
        }
        yPalette = yGradientPalette;
      }

      config.yColors = yPalette.map((color) => color.hex());
    }

    this._pattern = trianglify(config);

    return this._pattern;

    /*if (this.xColorOption === 'random') {
      if (this.foregroundColorOption === 'color') {
        for (let color of this.xPalette) {
          color.setMinimumContrast(this.foregroundColor, this.contrast);
        }
      }

      config.xColors = this.xPalette.map((color) => color.hex());
    }

    if (this.yColorOption === 'random') {
      let yPalette = Array.isArray(this._pattern.opts.yColors) ? new PatternPalette(...this._pattern.opts.yColors.map(color => new PatternColor(color))) : new PatternPalette();

      if (this.foregroundColorOption === 'color') {
        for (let color of yPalette) {
          color.setMinimumContrast(this.foregroundColor, this.contrast);
        }
      }

      config.yColors = yPalette.map((color) => color.hex());
    }

    this._pattern = trianglify(config);

    return this._pattern;*/
  }

  canvas(element: HTMLCanvasElement): HTMLCanvasElement {
    return this._pattern!.toCanvas(element);
  }

  async png(): Promise<string> {
    // convert canvas to png
    return new Promise((resolve, reject) => {
      const canvas = this._pattern!.toCanvas();
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        } else {
          reject(new Error('Failed to convert canvas to PNG.'));
        }
      });
    });
  }

  svg(options?: SVGOptions) {
    return this._pattern!.toSVG(options);
  }
}
