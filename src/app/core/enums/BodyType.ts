export enum BodyType {
    NONE = 'NONE',
    JSON = 'JSON',
    XML = 'XML',
    FORM_DATA = 'FORM_DATA',
    RAW = 'RAW',
    BINARY = 'BINARY'
}

export const getAllBodyTypes = () => Object.values(BodyType);