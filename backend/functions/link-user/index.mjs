import AWS from 'aws-sdk';

export const handler = async (event) => {
  const cognito = new AWS.CognitoIdentityServiceProvider();
  const userPoolId = event.userPoolId;
  const userEmail = event.request.userAttributes.email;
  try {
    // Search for existing users with the same email
    const params = {
      UserPoolId: userPoolId,
      Filter: `email = "${userEmail}"`,
      Limit: 10,
    };
    const existingUsers = await cognito.listUsers(params).promise();
    if (event.triggerSource === 'PreSignUp_SignUp') {
      // Handle Cognito (username/password) sign-up
      console.log('Trigger source: PreSignUp_SignUp');
      if (existingUsers.Users && existingUsers.Users.length > 0) {
        const externalUser = existingUsers.Users.find(
          (user) =>
            user.UserStatus === 'EXTERNAL_PROVIDER' &&
            !user.Username.startsWith('cognito'),
        );
        if (externalUser) {
          console.log(`External provider user exists with email: ${userEmail}`);
          // Prevent the sign-up and inform the user
          throw new Error(
            'An account already exists with this email. Please sign in using your social account.',
          );
        }
      }
      // Proceed with sign-up without auto-confirming
      console.log('No external provider account found. Proceeding with sign-up.');
      // You can choose to auto-confirm the user if you want
      // event.response.autoConfirmUser = true;
      // event.response.autoVerifyEmail = true;
    } else if (event.triggerSource === 'PreSignUp_ExternalProvider') {
      // Handle external provider sign-up
      console.log('Trigger source: PreSignUp_ExternalProvider');
      const userName = event.userName; // e.g., 'google_1234567890'
      // Extract providerName and providerUserId
      const [rawProviderName, providerUserId] = userName.split('_');
      // Adjust providerName to match the one configured in Cognito
      const providerName = rawProviderName.charAt(0).toUpperCase() + rawProviderName.slice(1).toLowerCase();
      if (existingUsers.Users && existingUsers.Users.length > 0) {
        const existingUser = existingUsers.Users[0];
        console.log(`Found existing user with username: ${existingUser.Username}`);
        // Attempt to link accounts
        const linkParams = {
          DestinationUser: {
            ProviderName: 'Cognito',
            ProviderAttributeValue: existingUser.Username,
          },
          SourceUser: {
            ProviderName: providerName,
            ProviderAttributeName: 'Cognito_Subject',
            ProviderAttributeValue: providerUserId,
          },
          UserPoolId: userPoolId,
        };
        try {
          await cognito.adminLinkProviderForUser(linkParams).promise();
          console.log(
            `Successfully linked provider ${providerName} to user with email: ${userEmail}`,
          );
          // Auto-confirm the user
          event.response.autoConfirmUser = true;
          event.response.autoVerifyEmail = true;
        } catch (linkError) {
          console.error('Error linking user:', linkError);
          // Handle specific error codes if needed
          throw linkError;
        }
      } else {
        // No existing user, proceed normally
        event.response.autoConfirmUser = true;
        event.response.autoVerifyEmail = true;
        console.log(
          `No existing user found for email: ${userEmail}. Proceeding with new sign-up.`,
        );
      }
    } else {
      console.log(
        `Trigger source '${event.triggerSource}' not handled. Proceeding without action.`,
      );
    }
  } catch (error) {
    console.error('Error in PreSignUp Lambda:', error);
    throw error; // Re-throw the error to prevent the sign-up
  }
  return event;
};
