export interface AuthConfig {
    bearerToken?: string;
    basicUsername?: string;
    basicPassword?: string;
    apiKey?: string;
    apiKeyHeaderName?: string;
    apiKeyLocation?: 'header' | 'query';
}