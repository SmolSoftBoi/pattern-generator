# Pattern Generator

This is a [Next.js](https://nextjs.org/) project.

## Overview

Pattern Generator is a web application that allows users to generate and customize patterns using various color options, gradients, and sizes. The application leverages the `trianglify` library to create visually appealing patterns.

## Features

- Generate patterns with customizable sizes.
- Choose from different color options for X and Y axes.
- Apply linear or radial gradients.
- Download patterns in PNG or SVG formats.
- Interactive UI for real-time pattern customization.

## Getting Started

First, clone the repository:

```bash
git clone https://github.com/SmolSoftBoi/pattern-generator
cd pattern-generator
```

Install the dependencies:

```bash
yarn install
```

Run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Project Structure

- `src/app/components/Pattern.tsx`: Main component for pattern generation.
- `src/app/pattern.ts`: Contains the logic for pattern generation and customization.
- `src/app/page.tsx`: Entry point for the application.
- `src/app/layout.tsx`: Layout component for the application.
- `src/app/globals.scss`: Global styles for the application.
- `src/app/page.module.css`: CSS module for the main page.

## Customization

### Color Options

- **X Color Options**: Choose between random colors or a custom palette.
- **Y Color Options**: Match X colors, use random colors, or a custom palette.
- **Foreground Color**: Option to set a foreground color with minimum contrast.

### Gradient Types

- **X Gradient Type**: Linear or radial gradient for X axis.
- **Y Gradient Type**: Match X gradient, linear, or radial gradient for Y axis.

### Pattern Size

- Customize the width and height of the pattern.
- Set minimum width and height constraints.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes.

## Acknowledgements

- [trianglify](https://github.com/qrohlf/trianglify) for the pattern generation library.
- [chroma-js](https://gka.github.io/chroma.js/) for color manipulation.
- [react-bootstrap](https://react-bootstrap.github.io/) for UI components.
