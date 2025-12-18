export enum AuthType {
    NONE = 'NONE',
    BEARER_TOKEN = 'BEARER_TOKEN',
    BASIC_AUTH = 'BASIC_AUTH',
    API_KEY = 'API_KEY',
    OAUTH2 = 'OAUTH2'
}

export const getAllAuthTypes = () => Object.values(AuthType);