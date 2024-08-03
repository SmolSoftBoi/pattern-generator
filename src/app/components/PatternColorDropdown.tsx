'use client';

import React, { useEffect, useState } from 'react';
import { Dropdown, Fade, Form } from 'react-bootstrap';

import { PatternColor } from '../pattern';

interface PatternColorDropdownComponentProps {
  color: PatternColor;
  handlePaletteColorChange: (color: PatternColor) => void;
}

export default function PatternColorDropdownComponent(
  props: PatternColorDropdownComponentProps
) {
  const [patternColor, setPatternColor] = useState<PatternColor>(props.color);
  const [color, setColor] = useState(patternColor.hex());
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    props.handlePaletteColorChange(patternColor);
  }, [patternColor]);

  useEffect(() => {
    try {
      const patternColor = new PatternColor(color);
      patternColor.hex();
      setPatternColor(patternColor);
    } catch (error) {
      console.error(error);
    }
  }, [color]);

  const handleColorChange = (color: string) => {
    setColor(color);
  };

  return (
    <Fade in={open}>
      <Dropdown className="d-inline">
        <Dropdown.Toggle
          style={{
            backgroundColor: patternColor.hex(),
            borderColor: patternColor.darken().hex(),
          }}
          className="m-1"
        ></Dropdown.Toggle>
        <Dropdown.Menu>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Colour"
              value={color}
              onChange={(e) => handleColorChange(e.target.value)}
            />
          </Form.Group>
        </Dropdown.Menu>
      </Dropdown>
    </Fade>
  );
}
