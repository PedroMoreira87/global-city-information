import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient();
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = 'User';

export const handler = async (event) => {
  const userAttributes = event.request.userAttributes;
  const item = {
    id: userAttributes.sub,
    name: userAttributes.name,
    email: userAttributes.email,
    created_at: new Date().toISOString(),
  };
  const params = {
    TableName: tableName,
    Item: item,
  };
  try {
    const command = new PutCommand(params);
    await dynamo.send(command);
    console.log('User added to DynamoDB');
    return event;
  } catch (error) {
    console.error('Error adding user to DynamoDB:', error);
    throw new Error('Failed to save user data.');
  }
};
