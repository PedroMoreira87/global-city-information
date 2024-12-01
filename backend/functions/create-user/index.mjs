import AWS from 'aws-sdk';

const dynamo = new AWS.DynamoDB.DocumentClient();
const tableName = 'User'; // Use environment variable for table name

const logError = (error) => {
  console.error('Error:', JSON.stringify(error, null, 2));
};

const validateUserAttributes = (attributes) => {
  if (!attributes || !attributes.sub || !attributes.email || !attributes.name) {
    throw new Error('Invalid user attributes in the event.');
  }
};

export const handler = async (event) => {
  try {
    const userAttributes = event.request.userAttributes;
    validateUserAttributes(userAttributes);
    const userId = userAttributes.sub;
    // Check if the user already exists in DynamoDB
    const getParams = {
      TableName: tableName,
      Key: { id: userId },
    };
    const { Item } = await dynamo.get(getParams).promise();
    if (Item) {
      console.log(`User already exists in DynamoDB: ${userId}`);
    } else {
      const newItem = {
        id: userId,
        name: userAttributes.name,
        email: userAttributes.email,
        created_at: new Date().toISOString(),
      };
      const putParams = {
        TableName: tableName,
        Item: newItem,
      };
      await dynamo.put(putParams).promise();
      console.log(`User added to DynamoDB: ${userId}`);
    }
    return event;
  } catch (error) {
    logError(error);
    throw new Error(`Failed to process user data: ${error.message}`);
  }
};
