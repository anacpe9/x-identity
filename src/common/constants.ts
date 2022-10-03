// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version, name, description } = require('../../package.json');

// export APP_VERSION: string = version;
// export APP_NAME: string = name;
// export APP_DESCRIPTION: string = description;

export class Constants {
  static APP_VERSION: string = version;
  static APP_NAME: string = name;
  static APP_DESCRIPTION: string = description;
  static COOKIE_NAME: string = process.env.COOKIE_NAME || 'acl-token';
  static HEADER_NAME: string = process.env.HEADER_NAME || 'acl-token';
}
