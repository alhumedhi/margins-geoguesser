# Fashion History Game

A geography-based guessing game showcasing historical costumes from the Metropolitan Museum of Art's collection. Test your knowledge of fashion history by guessing the origin of costume pieces from around the world.

## Features

- Fetches authentic costume images from the MET Museum's public API
- Two guessing methods:
  - Select a country from a searchable list
  - Place a pin on an interactive 3D globe
- Scoring system based on geographical accuracy
- Detailed feedback after each guess
- Educational content about each costume piece
- Final summary with performance statistics

## Tech Stack

- **Next.js**: React framework for the frontend
- **TypeScript**: For type safety
- **Tailwind CSS**: For styling
- **Framer Motion**: For animations
- **react-globe.gl**: For the interactive 3D globe
- **MET Museum API**: For fetching costume data

## Getting Started

### Prerequisites

- Node.js 16.8.0 or later
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/fashion-history-game.git
cd fashion-history-game
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Play

1. You'll be shown an image of a historical costume piece from the MET Museum
2. Guess its country of origin by:
   - Selecting from the dropdown list, or
   - Placing a pin on the interactive globe
3. Submit your guess to see how close you were
4. Learn about the item's actual origin and historical context
5. Play through 5 rounds to get your final score

## Data Source

All images and data are from the [Metropolitan Museum of Art Collection API](https://metmuseum.github.io/), which provides open access to hundreds of thousands of images and data from the museum's collection.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- The Metropolitan Museum of Art for providing the API
- All contributors to the open source libraries used in this project
# margins-geoguesser
