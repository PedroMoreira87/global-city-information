export const awsConfig = {
  region: 'us-east-1',
  userPoolId: import.meta.env.VITE_USER_POOL_ID,
  userPoolWebClientId: import.meta.env.VITE_CLIENT_ID,
  oauthDomain: 'global-city-information.auth.us-east-1.amazoncognito.com',
  redirectSignIn: 'https://globalcityinformation.org/',
  redirectSignOut: 'https://globalcityinformation.org/',
};
