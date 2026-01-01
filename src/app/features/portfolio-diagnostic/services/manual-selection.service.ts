import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ManualSelectionRequest, ManualSelectionResponse } from '../../../core/models/api.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ManualSelectionService {
    private apiUrl = `${environment.apiUrl}/api/portfolio/manual-selection`;

    constructor(private http: HttpClient) { }

    searchFunds(query: string): Observable<any[]> {
        if (!query || query.length < 3) return of([]);

        return this.http.get<any[]>(`${environment.apiUrl}/api/funds`, {
            params: {
                query: query,
                limit: 20
            }
        });
    }

    submitSelection(request: ManualSelectionRequest): Observable<ManualSelectionResponse> {
        return this.http.post<ManualSelectionResponse>(this.apiUrl, request);
    }
}
