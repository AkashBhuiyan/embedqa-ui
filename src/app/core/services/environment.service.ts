import { Injectable } from '@angular/core';
import {map, Observable} from "rxjs";
import {Environment} from "@core/models/Environment";
import {ApiResult} from "@core/models/ApiResult";
import {environment} from "@env/environment";
import {HttpClient} from "@angular/common/http";
import {EnvironmentDTO} from "@core/models/EnvironmentDTO";

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {

    private readonly baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    getEnvironments(): Observable<Environment[]> {
        return this.http.get<ApiResult<Environment[]>>(`${this.baseUrl}/environments`)
            .pipe(map(result => result.data));
    }

    getEnvironment(id: number): Observable<Environment> {
        return this.http.get<ApiResult<Environment>>(`${this.baseUrl}/environments/${id}`)
            .pipe(map(result => result.data));
    }

    createEnvironment(env: EnvironmentDTO): Observable<Environment> {
        return this.http.post<ApiResult<Environment>>(`${this.baseUrl}/environments`, env)
            .pipe(map(result => result.data));
    }

    updateEnvironment(id: number, env: EnvironmentDTO): Observable<Environment> {
        return this.http.put<ApiResult<Environment>>(`${this.baseUrl}/environments/${id}`, env)
            .pipe(map(result => result.data));
    }

    deleteEnvironment(id: number): Observable<void> {
        return this.http.delete<ApiResult<void>>(`${this.baseUrl}/environments/${id}`)
            .pipe(map(() => undefined));
    }
}
