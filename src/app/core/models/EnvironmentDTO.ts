import {EnvironmentVariable} from "@core/models/EnvironmentVariable";

export interface EnvironmentDTO {
    name: string;
    description?: string;
    variables: EnvironmentVariable[];
}