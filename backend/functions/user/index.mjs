import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient();
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = 'User';

export const handler = async (event) => {
  const { httpMethod, path, pathParameters, body } = event;
  const parsedBody = body ? JSON.parse(body) : {};
  switch (httpMethod) {
    case 'PUT':
      if (pathParameters && pathParameters.id && path.startsWith('/users')) {
        return await updateUser(pathParameters.id, parsedBody);
      }
      break;
    case 'GET':
      if (pathParameters && pathParameters.id && path.startsWith('/users')) {
        return await getUser(pathParameters.id);
      } else {
        return await getAllUsers();
      }
    case 'DELETE':
      if (pathParameters && pathParameters.id && path.startsWith('/users')) {
        return await deleteUser(pathParameters.id);
      }
      break;
    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method Not Allowed' }),
      };
  }
};

const getUser = async (id) => {
  const params = {
    TableName: tableName,
    Key: {
      id: id,
    },
  };
  try {
    const command = new GetCommand(params);
    const data = await dynamo.send(command);
    if (data.Item) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Origin': 'https://globalcityinformation.org',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
        },
        body: JSON.stringify(data.Item),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not found' }),
      };
    }
  } catch (error) {
    console.error('Error retrieving data from DynamoDB:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to retrieve user data.' }),
    };
  }
};

const getAllUsers = async () => {
  try {
    const command = new ScanCommand({ TableName: tableName });
    const data = await dynamo.send(command);
    if (data.Items) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Origin': 'https://globalcityinformation.org',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
        },
        body: JSON.stringify(data.Items),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Users not found' }),
      };
    }
  } catch (error) {
    console.error('Error retrieving data from DynamoDB:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to retrieve users data.' }),
    };
  }
};

const updateUser = async (id, data) => {
  const weather = data;
  const {
    place,
    temperature,
    feelsLike,
    description,
    humidity,
    latitude,
    longitude,
  } = weather;
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
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'All Weather attributes must be provided.' }),
    };
  }
  const weatherWithTimestamp = {
    ...weather,
    created_at: new Date().toISOString(),
  };
  const params = {
    TableName: tableName,
    Key: { id },
    UpdateExpression:
      'SET #weather = list_append(if_not_exists(#weather, :empty_list), :new_weather)',
    ExpressionAttributeNames: {
      '#weather': 'weather',
    },
    ExpressionAttributeValues: {
      ':new_weather': [weatherWithTimestamp],
      ':empty_list': [],
    },
    ReturnValues: 'UPDATED_NEW',
  };
  try {
    const command = new UpdateCommand(params);
    await dynamo.send(command);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': 'https://globalcityinformation.org',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
      },
      body: JSON.stringify({ message: 'User updated successfully!' }),
    };
  } catch (error) {
    console.error('Error updating user in DynamoDB:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to update user data.' }),
    };
  }
};

const deleteUser = async (id) => {
  const params = {
    TableName: tableName,
    Key: {
      id: id,
    },
  };
  try {
    const command = new DeleteCommand(params);
    await dynamo.send(command);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': 'https://globalcityinformation.org',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
      },
      body: JSON.stringify({ message: 'User deleted successfully!' }),
    };
  } catch (error) {
    console.error('Error deleting user from DynamoDB:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to delete user.' }),
    };
  }
};
