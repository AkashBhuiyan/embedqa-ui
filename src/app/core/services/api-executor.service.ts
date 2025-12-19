import { Injectable } from '@angular/core';
import {environment} from "@env/environment";
import {HttpClient} from "@angular/common/http";
import {ExecuteRequest} from "@core/models/ExecuteRequest";
import {ApiResult} from "@core/models/ApiResult";
import {ApiResponse} from "@core/models/ApiResponse";
import {map, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ApiExecutorService {

    private readonly baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    executeRequest(request: ExecuteRequest): Observable<ApiResponse> {
        return this.http.post<ApiResult<ApiResponse>>(`${this.baseUrl}/execute`, request)
            .pipe(map(result => result.data));
    }
}
