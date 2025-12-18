import {KeyValuePair} from "@core/models/KeyValuePair";
import {AuthConfig} from "@core/models/AuthConfig";
import {HttpMethod} from "@core/enums/HttpMethod";
import {BodyType} from "@core/enums/BodyType";
import {AuthType} from "@core/enums/AuthType";

export interface ExecuteRequest {
    url: string;
    method: HttpMethod;
    headers: KeyValuePair[];
    queryParams: KeyValuePair[];
    body?: string;
    bodyType: BodyType;
    authType: AuthType;
    authConfig?: AuthConfig;
    environmentId?: number;
    timeout?: number;
    followRedirects?: boolean;
    verifySsl?: boolean;
}