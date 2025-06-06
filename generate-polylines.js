const fs = require('fs').promises;
const { Client } = require('@googlemaps/google-maps-services-js');

// Initialize Google Maps client with your API key
const googleMapsClient = new Client({});

// Your Google Maps API key
const API_KEY = 'AIzaSyAOaOOOmmUKhhguhOxhyOjyUEP-dWcXJ0g';

// Path to your input and output JSON files
const INPUT_JSON_PATH = './bus-routes.json';
const OUTPUT_JSON_PATH = './bus-routes-updated.json';

// Function to fetch polyline for a route
async function fetchRoutePolyline(departureCoords, destinationCoords) {
  try {
    const response = await googleMapsClient.directions({
      params: {
        origin: `${departureCoords.lat},${departureCoords.lng}`,
        destination: `${destinationCoords.lat},${destinationCoords.lng}`,
        mode: 'driving',
        key: API_KEY,
      },
    });

    if (response.data.status === 'OK') {
      // Extract the encoded polyline from the first route
      const polyline = response.data.routes[0].overview_polyline;
      return polyline;
    } else {
      console.error(`Directions API error: ${response.data.status}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching polyline: ${error.message}`);
    return null;
  }
}

// Main function to process routes and update JSON
async function generatePolylines() {
  try {
    // Read the input JSON file
    const rawData = await fs.readFile(INPUT_JSON_PATH, 'utf8');
    const routes = JSON.parse(rawData);

    // Process each route
    const updatedRoutes = [];
    for (const route of routes) {
      console.log(`Processing route ${route.routeNumber}: ${route.departure} to ${route.destination}`);

      // Fetch polyline
      const polyline = await fetchRoutePolyline(route.departureCoords, route.destinationCoords);

      if (polyline) {
        // Add polyline to route object
        updatedRoutes.push({
          ...route,
          path: polyline,
        });
      } else {
        console.warn(`No polyline generated for route ${route.routeNumber}. Keeping original route.`);
        updatedRoutes.push(route);
      }

      // Optional: Add delay to avoid hitting API rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Write updated routes to output JSON file
    await fs.writeFile(OUTPUT_JSON_PATH, JSON.stringify(updatedRoutes, null, 2));
    console.log(`Updated routes saved to ${OUTPUT_JSON_PATH}`);
  } catch (error) {
    console.error(`Error processing routes: ${error.message}`);
  }
}

// Run the script
generatePolylines();