# TravelEase — AI itinerary generator

Give it a destination, a budget and some dates, and it produces a day-by-day itinerary:
activities, places to stay and places to eat, chosen against those constraints rather
than pulled from a generic list. Live weather for the destination feeds into the plan.

The interesting part is constraint handling — a budget and a date range have to actually
bind the output, otherwise an LLM will happily suggest a itinerary nobody can afford or
fit into the trip.

## Features

- **Personalized Itinerary Generation**: Input destination, budget, and travel dates to receive customized travel itineraries.
  
- **AI-Powered Recommendations**: Utilizes machine learning algorithms to suggest activities, accommodations, and restaurants tailored to each user.

- **User-Friendly Interface**: Intuitive design and interactive elements ensure ease of use for travelers of all experience levels.

- **Weather Integration**: Provides real-time weather updates for planned destinations to enhance trip planning.

## Installation

1. **Node.js Installation**:
   Ensure Node.js is installed on your machine. Download and install it from [nodejs.org](https://nodejs.org/).

2. **Configuration**:
   Make sure `config.json` is properly configured with necessary settings.

3. **Start the Server**:
   Open the terminal and run the following command to start the server:
   ```bash
   npm start
   ```
