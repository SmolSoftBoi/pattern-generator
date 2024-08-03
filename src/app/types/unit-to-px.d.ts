declare module 'unit-to-px' {
  /**
   * Converts a length value with a unit to pixels (px).
   * @param length The length value with a unit.
   * @param element The optional element to use for calculating relative units.
   * @returns The converted value in pixels (px).
   * @throws {TypeError} If the length value is invalid or cannot be parsed.
   */
  function toPx(length: string, element?: HTMLElement): number;

  export default toPx;
}
