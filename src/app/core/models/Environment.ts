import {EnvironmentVariable} from "@core/models/EnvironmentVariable";

export interface Environment {
    id: number;
    name: string;
    description?: string;
    variables: EnvironmentVariable[];
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}