import AWS from 'aws-sdk';

export const handler = async (event) => {
  const dynamo = new AWS.DynamoDB.DocumentClient();
  const tableName = 'User';
  const userAttributes = event.request.userAttributes;
  const userId = userAttributes.sub;
  // Check if the user already exists in DynamoDB
  const getParams = {
    TableName: tableName,
    Key: { id: userId },
  };
  try {
    const data = await dynamo.get(getParams).promise();
    if (data.Item) {
      console.log('User already exists in DynamoDB');
      return event;
    } else {
      const item = {
        id: userId,
        name: userAttributes.name,
        email: userAttributes.email,
        created_at: new Date().toISOString(),
      };
      const putParams = {
        TableName: tableName,
        Item: item,
      };
      await dynamo.put(putParams).promise();
      console.log('User added to DynamoDB');
      return event;
    }
  } catch (error) {
    console.error('Error handling user in DynamoDB:', error);
    throw new Error('Failed to process user data.');
  }
};
