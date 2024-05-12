/**
 * This is the source code for the lambda function that is used to fetch events from the SeatGeek API.
 */
import axios from 'axios';
import aws from 'aws-sdk';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const secret_name = "seatGeek/apiSecret";

const clientId = "SEAT_GEEK_CLIENT_ID"

const client = new SecretsManagerClient({
  region: "us-east-1",
});

async function getEvents(queryString) {
    try {
      console.log("Query string: " + queryString);
      const response = await axios.get(`${queryString}`);
      console.log("Initial response**: " + response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      return null;
    }
}

export const handler = async (event) => {
  console.log(event);
  let query = null; 

  console.log(event.routeKey);
  console.log(event['routeKey']);

  // Route the request to the appropriate query
  if (event.routeKey === 'GET /search-p') {
    const performer = event.queryStringParameters.performer;
    query = `https://api.seatgeek.com/2/events?performer=${performer}&client_id=${clientId}&client_secret=ec910c4349543e80e3ac06ea95528598ddaa8994ffdf40c39adf865a225e60a3`;
  } else if (event.routeKey === 'GET /search-q') {
    const userQuery = event.queryStringParameters.q;
    console.log("q: " + userQuery);
    query = `https://api.seatgeek.com/2/events?q=${userQuery}&client_id=${clientId}&client_secret=ec910c4349543e80e3ac06ea95528598ddaa8994ffdf40c39adf865a225e60a3`;
    console.log("Query : " + query);
  } else if (event.routeKey === 'GET /search-g') {
    const lat = event.queryStringParameters.lat;
    const lon = event.queryStringParameters.lon;
    query = `https://api.seatgeek.com/2/events?lat=${lat}&lon=${lon}&range=100mi&client_id=${clientId}&client_secret=ec910c4349543e80e3ac06ea95528598ddaa8994ffdf40c39adf865a225e60a3`
  } else {
    console.log("Could not find routeKey in event");
  }
  
  console.log("Query: " + query);
  
  if (query === null) {
    console.log("Query could not be created");
    throw new Error; 
  }
  
  let secretResponse;

  try {
    secretResponse = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
      })
    );
  } catch (error) {
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    throw error;
  }
  
  const content = await getEvents(query);
  console.log("Content: " + content.data);
  
  return content;
};


