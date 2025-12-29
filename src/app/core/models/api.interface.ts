export interface ManualSelectionRequest {
    selections: ManualSelectionItem[];
}

export interface ManualSelectionItem {
    fundId?: string;      // UUID (XOR with fundName)
    fundName?: string;    // XOR with fundId
    weightPct: number;    // 1-100
}

export interface ManualSelectionResponse {
    results: ManualSelectionResult[];
    portfolio: ManualSelectionPortfolio;
    analysis?: PortfolioHealthDTO;
}

export interface ManualSelectionResult {
    inputFundId: string | null;
    inputFundName: string | null;
    status: 'RESOLVED_FROM_DB' | 'CREATED_FROM_ETL' | 'ERROR' | 'ENRICHED_FROM_ETL';
    fundId: string;
    fundName: string;
    isin: string;
    message: string;
}

export interface ManualSelectionPortfolio {
    summary: {
        totalHoldings: number;
        totalWeightPct: number;
    };
    holdings: ManualSelectionHolding[];
}

export interface ManualSelectionHolding {
    fundId: string;
    fundName: string;
    isin: string;
    amcName: string;
    fundCategory: string;
    directPlan: boolean;
    currentNav: number;
    navAsOf: string;
    weightPct: number;
    sectorAllocation: Record<string, number> | null;
    topHoldings: TopHolding[] | null;
}

export interface TopHolding {
    symbol: string;
    company: string;
    weight: number;
}

export interface PortfolioHealthDTO {
    sectorConcentration: 'High' | 'Balanced' | 'Low';
    overlapStatus: 'High' | 'Moderate' | 'Low';
    diversificationScore: number;
    topOverlappingStocks: StockOverview[];
    fundSimilarities: FundSimilarity[];
    wealthProjection: WealthProjection;
    aggregateSectorAllocation: Record<string, number>;
}

export interface StockOverview {
    stockName: string;
    isin: string;
    totalWeight: number;
    fundCount: number;
    fundNames: string[];
}

export interface FundSimilarity {
    fundA: string;
    fundB: string;
    stockOverlapPct: number;
    sectorCorrelation: number;
}

export interface WealthProjection {
    projectedYears: number;
    totalInvestment: number;
    likelyScenarioAmount: number;
    pessimisticScenarioAmount: number;
    optimisticScenarioAmount: number;
    timeline: YearProjection[];
}

export interface YearProjection {
    year: number;
    optimisticAmount: number;
    expectedAmount: number;
    pessimisticAmount: number;
}

// Risk Profile Interfaces
export interface RiskProfileRequest {
    demographics: {
        age: number;
        incomeRange: string;
        dependents: number;
    };
    financials: {
        emergencyFundMonths: number;
        existingEmiForLoans: number;
        financialKnowledge: string;
        monthlyInvestmentAmount: number;
    };
    behavioral: {
        marketDropReaction: string;
        investmentPeriodExperience: string;
    };
    goals: {
        primaryGoal: string;
        timeHorizonYears: number;
        targetAmount: number;
    };
    preferences?: {
        preferredInvestmentStyle: string;
        taxSavingNeeded: boolean;
    };
}
