import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "@env/environment";
import {Collection} from "@core/models/Collection";
import {map, Observable} from "rxjs";
import {ApiResult} from "@core/models/ApiResult";
import {CollectionDTO} from "@core/models/CollectionDTO";

@Injectable({
  providedIn: 'root'
})
export class CollectionService {

    private readonly baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    getCollections(): Observable<Collection[]> {
        return this.http.get<ApiResult<Collection[]>>(`${this.baseUrl}/collections`)
            .pipe(map(result => result.data));
    }

    getCollection(id: number): Observable<Collection> {
        return this.http.get<ApiResult<Collection>>(`${this.baseUrl}/collections/${id}`)
            .pipe(map(result => result.data));
    }

    createCollection(collection: CollectionDTO): Observable<Collection> {
        return this.http.post<ApiResult<Collection>>(`${this.baseUrl}/collections`, collection)
            .pipe(map(result => result.data));
    }

    updateCollection(id: number, collection: CollectionDTO): Observable<Collection> {
        return this.http.put<ApiResult<Collection>>(`${this.baseUrl}/collections/${id}`, collection)
            .pipe(map(result => result.data));
    }

    deleteCollection(id: number): Observable<void> {
        return this.http.delete<ApiResult<void>>(`${this.baseUrl}/collections/${id}`)
            .pipe(map(() => undefined));
    }
}
