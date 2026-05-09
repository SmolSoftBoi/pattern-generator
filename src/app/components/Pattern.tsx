'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';

import Pattern, {
  PatternColor,
  PatternForegroundColorOption,
  PatternPalette,
  PatternSize,
  PatternXColorOption,
  PatternXGradientType,
  PatternYColorOption,
  PatternYGradientType,
} from '../pattern';

import PatternColorDropdownComponent from './PatternColorDropdown';

import type { Pattern as TrianglifyPattern } from 'trianglify';

const trianglifySvgOptions = { includeNamespace: true };

type TrianglifyPreviewProps = {
  trianglifyPattern: TrianglifyPattern;
};

/**
 * Renders the Pattern editor UI and live Trianglify preview.
 *
 * Manages user-editable pattern state (size, palettes, gradients and foreground),
 * keeps the Trianglify output in sync with controls, and provides actions to
 * regenerate the pattern and download it as PNG or SVG.
 *
 * @returns The React element containing configuration controls and the preview.
 */
export default function PatternComponent() {
  const [pattern, setPattern] = useState<Pattern>(new Pattern());
  const [patternSize, setPatternSize] = useState<PatternSize>(
    new PatternSize(1440, 900, 600, 400)
  );
  const [patternXPalette, setPatternXPalette] = useState<PatternPalette>(
    new PatternPalette()
  );
  const [patternYPalette, setPatternYPalette] = useState<PatternPalette>(
    new PatternPalette()
  );
  const [patternForegroundColor, setPatternForegroundColor] =
    useState<PatternColor>(new PatternColor('white'));
  const [trianglifyPattern, setTrianglifyPattern] = useState<TrianglifyPattern>(
    pattern.generate()
  );
  const [name, setName] = useState<string>('');
  const [width, setWidth] = useState<string>(`${patternSize.width}`);
  const [height, setHeight] = useState<string>(`${patternSize.height}`);
  const [xColorOption, setXColorOption] =
    useState<PatternXColorOption>('random');
  const [yColorOption, setYColorOption] =
    useState<PatternYColorOption>('match');
  const [xGradientType, setXGradientType] =
    useState<PatternXGradientType>('linear');
  const [yGradientType, setYGradientType] =
    useState<PatternYGradientType>('match');
  const [foregroundColorOption, setForegroundColorOption] =
    useState<PatternForegroundColorOption>('none');
  const [xPalette, setXPalette] = useState<string[]>([
    ...patternXPalette.map((color) => color.hex()),
  ]);
  const [yPalette, setYPalette] = useState<string[]>([
    ...patternYPalette.map((color) => color.hex()),
  ]);
  const [foregroundColor, setForegroundColor] = useState<string>(
    patternForegroundColor.hex()
  );

  useEffect(() => {
    setTrianglifyPattern(pattern.generate());
  }, [pattern]);

  useEffect(() => {
    setPatternSize(
      new PatternSize(
        width || pattern.size.width,
        height || pattern.size.height,
        600,
        400
      )
    );
  }, [width, height]);

  useEffect(() => {
    setPatternXPalette(
      new PatternPalette(...xPalette.map((color) => new PatternColor(color)))
    );
  }, [xPalette]);

  useEffect(() => {
    setPatternYPalette(
      new PatternPalette(...yPalette.map((color) => new PatternColor(color)))
    );
  }, [yPalette]);

  useEffect(() => {
    setPatternForegroundColor(new PatternColor(foregroundColor));
  }, [foregroundColor]);

  useEffect(() => {
    setPattern(
      new Pattern(
        patternSize,
        pattern.variance,
        pattern.seed,
        xColorOption,
        yColorOption,
        patternXPalette,
        patternYPalette,
        pattern.strokeWidth,
        pattern.strokeColor,
        foregroundColorOption,
        patternForegroundColor,
        2,
        pattern.hueShift,
        xGradientType,
        yGradientType
      )
    );
  }, [
    patternSize,
    xColorOption,
    yColorOption,
    xGradientType,
    yGradientType,
    foregroundColorOption,
    pattern.variance,
    pattern.seed,
    xPalette,
    yPalette,
    pattern.strokeWidth,
    pattern.strokeColor,
    foregroundColor,
    pattern.contrast,
    pattern.hueShift,
    pattern.size.minWidth,
    pattern.size.minHeight,
    patternXPalette,
    patternYPalette,
    patternForegroundColor,
  ]);

  const handleSizeChange = (side: 'width' | 'height', value: string) => {
    if (side === 'width') {
      setWidth(value);
    } else {
      setHeight(value);
    }
  };

  const handleDownloadPng = async () => {
    const link = document.createElement('a');
    link.download = name === '' ? 'Pattern.png' : `${name} Pattern.png`;
    link.href = await pattern.png();
    link.click();
  };

  const handleDownloadSvg = () => {
    const link = document.createElement('a');
    link.download = name === '' ? 'Pattern.svg' : `${name} Pattern.svg`;
    const svg = pattern.svg();
    const xmlSerializer = new XMLSerializer();
    const svgString = xmlSerializer.serializeToString(svg);
    const base64 = btoa(svgString);
    link.href = `data:image/svg+xml;base64,${base64}`;
    link.click();
  };

  const handleAddPaletteColor = (axis: 'x' | 'y') => {
    if (axis === 'x') {
      setXPalette([...xPalette, new PatternColor().hex()]);
      setXColorOption('palette');
    } else {
      setYPalette([...yPalette, new PatternColor().hex()]);
      setYColorOption('palette');
    }
  };

  const handleRemovePaletteColor = (axis: 'x' | 'y') => {
    if (axis === 'x') {
      setXPalette(xPalette.slice(0, -1));
    } else {
      setYPalette(yPalette.slice(0, -1));
    }
  };

  const handlePaletteColorChange = (
    axis: 'x' | 'y',
    index: number,
    value: string
  ) => {
    if (axis === 'x') {
      const newXPalette = [...xPalette];
      newXPalette[index] = value;
      setXPalette(newXPalette);
    } else {
      const newYPalette = [...yPalette];
      newYPalette[index] = value;
      setYPalette(newYPalette);
    }
  };

  const handleForegroundColorChange = (value: string) => {
    setForegroundColor(value);
  };

  const handleGenerate = () => {
    setTrianglifyPattern(pattern.generate());
  };

  return (
    <Container fluid className="screen-full">
      <Row className="h-100">
        <Col sm={3} className="pt-3 pb-3 overflow-scroll">
          <h1>Pattern</h1>
          <Form>
            <Row className="form-row">
              <Form.Group as={Col}>
                <Form.Label htmlFor="name">Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Group>
            </Row>
            <hr />
            <Row className="form-row">
              <Form.Group as={Col}>
                <Form.Label htmlFor="width">Width</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Width"
                  value={width}
                  onChange={(e) => handleSizeChange('width', e.target.value)}
                />
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label htmlFor="height">Height</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Height"
                  value={height}
                  onChange={(e) => handleSizeChange('height', e.target.value)}
                />
              </Form.Group>
            </Row>
            <hr />
            <Form.Group>
              <Form.Label>X Colour Options</Form.Label>
              <div>
                <ToggleButtonGroup
                  type="radio"
                  name="xColorOption"
                  value={xColorOption}
                  onChange={setXColorOption}
                >
                  <ToggleButton
                    id="xColorOption-random"
                    variant="secondary"
                    value="random"
                  >
                    <span className="icon icon-shuffle">🔀</span> Random
                  </ToggleButton>
                  <ToggleButton
                    id="xColorOption-palette"
                    variant="secondary"
                    value="palette"
                  >
                    <span className="icon icon-colours">🎨</span> Palette
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
              <Form.Text className="text-muted">
                Click to edit colours.
              </Form.Text>
              <div>
                {xPalette.map((color, index) => (
                  <PatternColorDropdownComponent
                    key={index}
                    color={new PatternColor(color)}
                    handlePaletteColorChange={(color) =>
                      handlePaletteColorChange('x', index, color.hex())
                    }
                  />
                ))}
              </div>
              <Button variant="link" onClick={() => handleAddPaletteColor('x')}>
                <span className="icon icon-squared-plus">➕</span>
              </Button>
              <Button
                variant="link"
                onClick={() => handleRemovePaletteColor('x')}
                disabled={xPalette.length === 0}
              >
                <span className="icon icon-squared-minus">➖</span>
              </Button>
              <div>
                <ToggleButtonGroup
                  type="radio"
                  name="xGradientType"
                  value={xGradientType}
                  onChange={setXGradientType}
                  className="btn-group-sm"
                >
                  <ToggleButton
                    id="xGradientType-linear"
                    variant="secondary"
                    value="linear"
                  >
                    Linear
                  </ToggleButton>
                  <ToggleButton
                    id="xGradientType-radial"
                    variant="secondary"
                    value="radial"
                  >
                    Radial
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
            </Form.Group>
            <hr />
            <Form.Group>
              <Form.Label>Y Colour Options</Form.Label>
              <div>
                <ToggleButtonGroup
                  type="radio"
                  name="yColorOption"
                  value={yColorOption}
                  onChange={setYColorOption}
                >
                  <ToggleButton
                    id="yColorOption-match"
                    variant="secondary"
                    value="match"
                  >
                    <span className="icon icon-link">🔗</span> Match X
                  </ToggleButton>
                  <ToggleButton
                    id="yColorOption-random"
                    variant="secondary"
                    value="random"
                  >
                    <span className="icon icon-shuffle">🔀</span> Random
                  </ToggleButton>
                  <ToggleButton
                    id="yColorOption-palette"
                    variant="secondary"
                    value="palette"
                  >
                    <span className="icon icon-colours">🎨</span> Palette
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
              <Form.Text className="text-muted">
                Click to edit colours.
              </Form.Text>
              <div>
                {yPalette.map((color, index) => (
                  <PatternColorDropdownComponent
                    key={index}
                    color={new PatternColor(color)}
                    handlePaletteColorChange={(color) =>
                      handlePaletteColorChange('y', index, color.hex())
                    }
                  />
                ))}
              </div>
              <Button variant="link" onClick={() => handleAddPaletteColor('y')}>
                <span className="icon icon-squared-plus">➕</span>
              </Button>
              <Button
                variant="link"
                onClick={() => handleRemovePaletteColor('y')}
                disabled={yPalette.length === 0}
              >
                <span className="icon icon-squared-minus">➖</span>
              </Button>
              <div>
                <ToggleButtonGroup
                  type="radio"
                  name="yGradientType"
                  value={yGradientType}
                  onChange={setYGradientType}
                  className="btn-group-sm"
                >
                  <ToggleButton
                    id="yGradientType-match-x"
                    variant="secondary"
                    value="match"
                  >
                    <span className="icon icon-link">🔗</span> Match X
                  </ToggleButton>
                  <ToggleButton
                    id="yGradientType-linear"
                    variant="secondary"
                    value="linear"
                  >
                    Linear
                  </ToggleButton>
                  <ToggleButton
                    id="yGradientType-radial"
                    variant="secondary"
                    value="radial"
                  >
                    Radial
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
            </Form.Group>
            <hr />
            <Form.Group>
              <Form.Label>Foreground</Form.Label>
              <div>
                <ToggleButtonGroup
                  type="radio"
                  name="foregroundColorOption"
                  value={foregroundColorOption}
                  onChange={setForegroundColorOption}
                >
                  <ToggleButton
                    id="foregroundColorOption-none"
                    variant="secondary"
                    value="none"
                  >
                    None
                  </ToggleButton>
                  <ToggleButton
                    id="foregroundColorOption-color"
                    variant="secondary"
                    value="color"
                  >
                    Colour
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
              <Form.Text className="text-muted">
                Click to edit colour.
              </Form.Text>
              <PatternColorDropdownComponent
                color={patternForegroundColor}
                handlePaletteColorChange={(color) =>
                  handleForegroundColorChange(color.hex())
                }
              />
            </Form.Group>
            <div className="d-flex justify-content-around">
              <Button
                variant="primary"
                className="mt-3"
                onClick={handleGenerate}
              >
                <span className="icon icon-retweet">🔁</span> Regenerate
              </Button>
            </div>
            <div className="btn-toolbar justify-content-around" role="toolbar">
              <Button
                variant="secondary"
                className="mt-3"
                onClick={handleDownloadPng}
              >
                <span className="icon icon-image">💿</span> Download PNG
              </Button>
              <Button
                variant="secondary"
                className="mt-3"
                onClick={handleDownloadSvg}
              >
                <span className="icon icon-code">💿</span> Download SVG
              </Button>
            </div>
          </Form>
        </Col>

        <Col className="preview preview-inset flex-column overflow-scroll">
          <TrianglifyPreview trianglifyPattern={trianglifyPattern} />
        </Col>
      </Row>
    </Container>
  );
}

/**
 * Renders a live SVG preview for a Trianglify pattern inside a container element.
 *
 * Builds static SVG markup for the first render, updates the injected SVG whenever
 * `props.trianglifyPattern` changes, and removes the injected SVG on cleanup.
 *
 * @param props - `TrianglifyPreviewProps` containing the pattern used to generate
 * the SVG
 * @returns The React element that hosts the generated SVG preview
 */
function TrianglifyPreview(props: TrianglifyPreviewProps) {
  const { trianglifyPattern } = props;
  const previewRef = useRef<HTMLDivElement>(null);
  const svgMarkup = trianglifyPattern
    .toSVGTree(trianglifySvgOptions)
    .toString();

  useEffect(() => {
    const previewElement = previewRef.current;

    if (!previewElement) {
      return;
    }

    const svgElement = trianglifyPattern.toSVG(
      undefined,
      trianglifySvgOptions
    );
    previewElement.replaceChildren(svgElement);

    return () => {
      svgElement.remove();
    };
  }, [trianglifyPattern]);

  return (
    <div
      ref={previewRef}
      className="object-fit-contain mh-100 mw-100"
      aria-hidden="true"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}
