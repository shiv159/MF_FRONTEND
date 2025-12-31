import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { ManualSelectionRequest, ManualSelectionResponse } from '../../../core/models/api.interface';

@Injectable({
    providedIn: 'root'
})
export class ManualSelectionService {
    private apiUrl = '/api/portfolio/manual-selection';

    constructor(private http: HttpClient) { }

    searchFunds(query: string): Observable<any[]> {
        if (!query || query.length < 3) return of([]);
        // Mock Search Response
        const mockFunds = [
            { id: '1', name: 'HDFC Top 100 Fund', isin: 'INF179K01BE2', amc: 'HDFC Mutual Fund' },
            { id: '2', name: 'Axis Bluechip Fund', isin: 'INF846K01234', amc: 'Axis Mutual Fund' },
            { id: '3', name: 'SBI Small Cap Fund', isin: 'INF200K01T28', amc: 'SBI Mutual Fund' },
            { id: '4', name: 'Parag Parikh Flexi Cap Fund', isin: 'INF879O01027', amc: 'PPFAS Mutual Fund' }
        ].filter(f => f.name.toLowerCase().includes(query.toLowerCase()));

        return of(mockFunds).pipe(delay(300));
    }

    submitSelection(request: ManualSelectionRequest): Observable<ManualSelectionResponse> {
        // Fetch Mock Data from public folder for demo purpose
        return this.http.get<ManualSelectionResponse>('/data/manual-selection.json').pipe(delay(800));
    }
}
