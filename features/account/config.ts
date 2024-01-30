export enum RouteAccount {
  account = '/account',
  accountOption = '/account/option',
  accountSignin = '/account/signin',
  accountSignup = '/account/signup',
}

export enum QueryAccount {
  accountLogout = '@@account/logout',
  accountSignin = '@@account/signin',
  accountVerify = '@@account/verify',
}
