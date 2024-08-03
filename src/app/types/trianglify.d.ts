// Type definitions for trianglify 1.2
// Project: https://github.com/qrohlf/trianglify
// Definitions by: Daniel Perez Alvarez <https://github.com/unindented>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.2

declare module 'trianglify' {
  import chroma from 'chroma-js';

  declare namespace trianglify {
    type Point = [number, number];

    export type colorFunction = (
      opt?: number
    ) => (options: trianglify.ColorFunctionOptions) => chroma.Color;
    export type Points = Point[];

    interface DefaultOptions {
      /** Width of pattern */
      width: number;
      /** Height of pattern */
      height: number;
      /** Size of the cells used to generate a randomized grid */
      cellSize: number;
      /** how much to randomize the grid */
      variance: number;
      /** Seed for the RNG */
      seed: null;
      /** X color stops */
      xColors: string;
      /** Y color stops */
      yColors: string;
      /** Color space used for gradient construction & interpolation */
      colorSpace: string;
      /** Color function f(x, y) that returns a color specification that is consumable by chroma-js */
      colorFunction: colorFunction;
      /** Width of stroke. Defaults to 1.51 to fix an issue with canvas antialiasing. */
      strokeWidth: number;
      /** An array of [x,y] coordinates to trianglulate. Defaults to undefined, and points are generated. */
      points: null;
    }

    interface Options {
      /** Width of pattern */
      width?: number | undefined;
      /** Height of pattern */
      height?: number | undefined;
      /** Size of the cells used to generate a randomized grid */
      cellSize?: number | undefined;
      /** how much to randomize the grid */
      variance?: number | undefined;
      /** Seed for the RNG */
      seed?: number | string | null | undefined;
      /** X color stops */
      xColors?: false | string | string[] | undefined;
      /** Y color stops */
      yColors?: false | string | string[] | undefined;
      /** Color space used for gradient construction & interpolation */
      colorSpace?: string | undefined;
      /** Color function f(x, y) that returns a color specification that is consumable by chroma-js */
      colorFunction?: colorFunction;
      /** Width of stroke. Defaults to 1.51 to fix an issue with canvas antialiasing. */
      strokeWidth?: number | undefined;
      /** An array of [x,y] coordinates to trianglulate. Defaults to undefined, and points are generated. */
      points?: Points;
    }

    interface SVGOptions {
      includeNamespace: boolean;
    }

    interface Pattern {
      opts: Options;
      //polys: any;
      toSVG(opts?: SVGOptions): SVGElement;
      toCanvas(canvas?: HTMLCanvasElement): HTMLCanvasElement;
    }

    export const utils: {
      colorbrewer: {
        [key: string]: string[];
      };
    };

    export const defaultOptions: DefaultOptions;
    export const colorFunctions: {
      interpolateLinear: colorFunction;
      sparkle: colorFunction;
      shadows: colorFunction;
    };
  }

  declare function trianglify(opts?: trianglify.Options): trianglify.Pattern;

  export = trianglify;
}
