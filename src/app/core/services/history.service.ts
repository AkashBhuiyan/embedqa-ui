import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '@env/environment';
import {ApiResult} from '@core/models/ApiResult';
import {HistoryEntry} from '@core/models/HistoryEntry';
import {HistoryStats} from "@core/models/HistoryStats";
import {PagedResult} from "@core/models/PagedResult";
import {HistoryFilter} from "@core/models/HistoryFilter";

@Injectable({
    providedIn: 'root'
})
export class HistoryService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/history`;

    getHistory(page: number = 0, size: number = 20, filter?: HistoryFilter): Observable<PagedResult<HistoryEntry>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (filter) {
            if (filter.method) {
                params = params.set('method', filter.method);
            }
            if (filter.statusCode) {
                params = params.set('statusCode', filter.statusCode.toString());
            }
            if (filter.search) {
                params = params.set('search', filter.search);
            }
            if (filter.fromDate) {
                params = params.set('fromDate', filter.fromDate);
            }
            if (filter.toDate) {
                params = params.set('toDate', filter.toDate);
            }
        }

        return this.http.get<PagedResult<HistoryEntry>>(this.baseUrl, {params});
    }

    getById(id: number): Observable<ApiResult<HistoryEntry>> {
        return this.http.get<ApiResult<HistoryEntry>>(`${this.baseUrl}/${id}`);
    }

    delete(id: number): Observable<ApiResult<void>> {
        return this.http.delete<ApiResult<void>>(`${this.baseUrl}/${id}`);
    }

    clearAll(): Observable<ApiResult<void>> {
        return this.http.delete<ApiResult<void>>(this.baseUrl);
    }

    getStats(): Observable<ApiResult<HistoryStats>> {
        return this.http.get<ApiResult<HistoryStats>>(`${this.baseUrl}/stats`);
    }
}
