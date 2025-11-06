import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient();
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = 'User';

// Helper for standard responses
const createResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Origin': 'https://d2u17pmw1fxael.cloudfront.net',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
  },
  body: JSON.stringify(body),
});

// Validate weather data
const validateWeatherData = (weather) => {
  const { place, temperature, feelsLike, description, humidity, latitude, longitude } = weather;
  if (
    !place ||
    place.city === undefined ||
    place.state === undefined ||
    place.country === undefined ||
    temperature === undefined ||
    feelsLike === undefined ||
    description === undefined ||
    humidity === undefined ||
    latitude === undefined ||
    longitude === undefined
  ) {
    throw new Error('All Weather attributes must be provided.');
  }
};

export const handler = async (event) => {
  try {
    const { httpMethod, path, pathParameters, body } = event;
    const parsedBody = body ? JSON.parse(body) : {};

    switch (httpMethod) {
      case 'PUT':
        if (pathParameters?.id && path.startsWith('/users')) {
          return await updateUser(pathParameters.id, parsedBody);
        }
        break;
      case 'GET':
        if (pathParameters?.id && path.startsWith('/users')) {
          return await getUser(pathParameters.id);
        }
        return await getAllUsers();
      case 'DELETE':
        if (pathParameters?.id && path.startsWith('/users')) {
          return await deleteUser(pathParameters.id);
        }
        break;
      default:
        return createResponse(405, { message: 'Method Not Allowed.' });
    }
  } catch (error) {
    console.error('Error handling request:', error.message);
    return createResponse(500, { message: 'Internal Server Error.' });
  }
};

const getUser = async (id) => {
  const params = {
    TableName: tableName,
    Key: { id },
  };
  try {
    const command = new GetCommand(params);
    const data = await dynamo.send(command);
    if (data.Item) {
      return createResponse(200, data.Item);
    } else {
      return createResponse(404, { message: 'User not found.' });
    }
  } catch (error) {
    console.error('Error retrieving user:', error.message);
    return createResponse(500, { message: 'Failed to retrieve user data.' });
  }
};

const getAllUsers = async () => {
  try {
    const command = new ScanCommand({ TableName: tableName });
    const data = await dynamo.send(command);
    if (data.Items) {
      return createResponse(200, data.Items);
    } else {
      return createResponse(404, { message: 'No users found.' });
    }
  } catch (error) {
    console.error('Error retrieving all users:', error.message);
    return createResponse(500, { message: 'Failed to retrieve users data.' });
  }
};

const updateUser = async (id, weather) => {
  try {
    validateWeatherData(weather);
    const weatherWithTimestamp = {
      ...weather,
      created_at: new Date().toISOString(),
    };
    const params = {
      TableName: tableName,
      Key: { id },
      UpdateExpression: 'SET #weather = list_append(if_not_exists(#weather, :empty_list), :new_weather)',
      ExpressionAttributeNames: {
        '#weather': 'weather',
      },
      ExpressionAttributeValues: {
        ':new_weather': [weatherWithTimestamp],
        ':empty_list': [],
      },
      ReturnValues: 'UPDATED_NEW',
    };
    const command = new UpdateCommand(params);
    await dynamo.send(command);
    return createResponse(200, { message: 'User updated successfully!' });
  } catch (error) {
    console.error('Error updating user:', error.message);
    return createResponse(400, { message: error.message });
  }
};

const deleteUser = async (id) => {
  const params = {
    TableName: tableName,
    Key: { id },
  };
  try {
    const command = new DeleteCommand(params);
    await dynamo.send(command);
    return createResponse(200, { message: 'User deleted successfully!' });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    return createResponse(500, { message: 'Failed to delete user.' });
  }
};
