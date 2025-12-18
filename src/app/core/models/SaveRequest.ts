import {KeyValuePair} from "@core/models/KeyValuePair";
import {AuthConfig} from "@core/models/AuthConfig";
import {HttpMethod} from "@core/enums/HttpMethod";
import {BodyType} from "@core/enums/BodyType";
import {AuthType} from "@core/enums/AuthType";

export interface SaveRequest {
    name: string;
    url: string;
    method: HttpMethod;
    description?: string;
    headers: KeyValuePair[];
    queryParams: KeyValuePair[];
    body?: string;
    bodyType: BodyType;
    authType: AuthType;
    authConfig?: AuthConfig;
    collectionId?: number;
}