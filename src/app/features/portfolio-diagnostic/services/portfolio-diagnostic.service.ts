import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PortfolioDiagnosticDTO } from '../../../core/models/api.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PortfolioDiagnosticService {
    private apiUrl = `${environment.apiUrl}/api/v1/portfolio/diagnostic`;

    constructor(private http: HttpClient) { }

    /**
     * Fetch portfolio diagnostic analysis for the authenticated user.
     * @param includeAiSummary If true, uses AI for the summary (costs 1 LLM call). Default: false.
     */
    getDiagnostic(includeAiSummary: boolean = true): Observable<PortfolioDiagnosticDTO> {
        const params = new HttpParams().set('includeAiSummary', includeAiSummary.toString());
        return this.http.get<PortfolioDiagnosticDTO>(this.apiUrl, { params });
    }
}
