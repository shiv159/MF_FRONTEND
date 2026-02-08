// ============================================
// Risk Level Enum
// ============================================
export type RiskLevel = 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';

// ============================================
// Manual Selection Interfaces
// ============================================
export interface ManualSelectionRequest {
    selections: ManualSelectionItem[];
}

export interface ManualSelectionItem {
    fundId?: string;      // UUID (XOR with fundName)
    fundName?: string;    // XOR with fundId
    weightPct: number;    // 1-100
}

export type ManualSelectionStatus = 'RESOLVED_FROM_DB' | 'CREATED_FROM_ETL' | 'ERROR' | 'ENRICHED_FROM_ETL';

export interface ManualSelectionResponse {
    results: ManualSelectionResult[];
    portfolio: ManualSelectionPortfolio;
    analysis?: PortfolioHealthDTO;
}

export interface ManualSelectionResult {
    inputFundId: string | null;
    inputFundName: string | null;
    status: ManualSelectionStatus;
    fundId: string;
    fundName: string;
    isin: string;
    message: string;
}

export interface ManualSelectionPortfolio {
    summary: PortfolioSummary;
    holdings: ManualSelectionHolding[];
}

export interface PortfolioSummary {
    totalHoldings: number;
    totalWeightPct: number;
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
    fundMetadata?: FundMetadata;
}

// ============================================
// Top Holding Interfaces
// ============================================
export interface HoldingTrend {
    trend: number[];
}

export interface TopHolding {
    securityName: string;
    isin: string;
    ticker: string;
    sector: string;
    weighting: number;
    marketValue?: number;
    shareChange?: number;
    stockRating?: string;
    quantRating?: string;
    totalReturn1Year?: number;
    // Extended fields from JSON response
    secId?: string;
    country?: string;
    numberOfShare?: number;
    firstBoughtDate?: string;
    holdingTrend?: HoldingTrend;
    assessment?: 'Undervalued' | 'Fairly Valued' | 'Overvalued';
    susEsgRiskScore?: number | null;
    susEsgRiskCategory?: 'Low' | 'Medium' | 'High' | 'Severe' | null;
    susEsgRiskGlobes?: number | null;
    esgAsOfDate?: string | null;
}

// ============================================
// Fund Metadata & Risk Volatility
// ============================================
export interface RiskVolatilityPeriod {
    alpha: number | null;
    beta: number | null;
    rSquared: number | null;
    standardDeviation: number | null;
    sharpeRatio: number | null;
}

export interface RiskVolatilityByPeriod {
    endDate: string;
    for1Year: RiskVolatilityPeriod;
    for3Year: RiskVolatilityPeriod;
    for5Year: RiskVolatilityPeriod;
    for10Year: RiskVolatilityPeriod;
    for15Year: RiskVolatilityPeriod;
    forLongestTenure: RiskVolatilityPeriod | null;
    primaryIndexNameNew?: string;
    bestFitIndexName?: string | null;
    bestFitAlphaFor3Year?: number | null;
    bestFitBetaFor3Year?: number | null;
    bestFitRSquaredFor3Year?: number | null;
}

export interface ExtendedPerformanceData {
    ePUsedFor1YearFlag: boolean;
    ePUsedFor3YearFlag: boolean;
    ePUsedFor5YearFlag: boolean;
    ePUsedFor10YearFlag: boolean;
    ePUsedFor15YearFlag: boolean;
}

export interface RiskVolatilityData {
    fund_name: string | null;
    category_name: string;
    index_name: string;
    calculation_benchmark: string;
    extended_performance_data: ExtendedPerformanceData;
    fund_risk_volatility: RiskVolatilityByPeriod;
    category_risk_volatility: RiskVolatilityByPeriod;
    index_risk_volatility: RiskVolatilityByPeriod;
    currency: string;
}

export interface FundMetadata {
    name: string;
    alpha: number;
    fund_size: number;
    fund_size_currency: string;
    fund_size_as_of: string;
    beta: number;
    sharpe_ratio: number;
    stdev: number;
    is_index_fund: boolean;
    risk_volatility: RiskVolatilityData;
    nav_history: Record<string, number>;
}

// ============================================
// Portfolio Health Interfaces
// ============================================
export type ConcentrationLevel = 'High' | 'Balanced' | 'Low';
export type OverlapStatus = 'High' | 'Moderate' | 'Low';

export interface PortfolioHealthDTO {
    sectorConcentration: ConcentrationLevel;
    overlapStatus: OverlapStatus;
    diversificationScore: number;
    topOverlappingStocks: StockOverview[];
    fundSimilarities: FundSimilarity[];
    wealthProjection: WealthProjection;
    aggregateSectorAllocation: Record<string, number>;
    sectorOverlaps?: SectorOverlap[];
}

export interface SectorOverlap {
    sectorName: string;
    totalAllocation: number;
    fundContributions: FundContribution[];
}

export interface FundContribution {
    fundName: string;
    contribution: number;
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
    probabilityOfTarget?: number | null;
}

export interface YearProjection {
    year: number;
    optimisticAmount: number;
    expectedAmount: number;
    pessimisticAmount: number;
}

// ============================================
// Risk Profile Interfaces
// ============================================
export interface RiskProfileRequest {
    demographics: DemographicsData;
    financials: FinancialsData;
    behavioral: BehavioralData;
    goals: GoalsData;
    preferences?: PreferencesData;
}

export interface DemographicsData {
    age: number;
    incomeRange: string;
    dependents: number;
}

export interface FinancialsData {
    emergencyFundMonths: number;
    existingEmiForLoans: number;
    financialKnowledge: string;
    monthlyInvestmentAmount: number;
}

export interface BehavioralData {
    marketDropReaction: string;
    investmentPeriodExperience: string;
}

export interface GoalsData {
    primaryGoal: string;
    timeHorizonYears: number;
    targetAmount: number;
}

export interface PreferencesData {
    preferredInvestmentStyle: string;
    taxSavingNeeded: boolean;
}

export interface RiskProfile {
    score: number;
    level: RiskLevel;
    rationale: string;
}

export interface AssetAllocation {
    equity: number;
    debt: number;
    gold: number;
}

export interface RiskProfileResponse {
    riskProfile: RiskProfile;
    assetAllocation: AssetAllocation;
    recommendations: RecommendedAllocation[];
    portfolioHealth?: PortfolioHealthDTO;
}

export interface RecommendedAllocation {
    allocationCategory: string;
    allocationPercent: number;
    amount: number;
    funds: RecommendedFund[];
}

export interface RiskMetrics {
    alpha: number;
    beta: number;
    sharpeRatio: number;
    standardDeviation: number;
    rsquared: number;
}

export interface RecommendedFund {
    id: string;
    name: string;
    category: string;
    riskMetrics: RiskMetrics;
    sectorAllocation: Record<string, number>;
    topHoldings: TopHolding[];
    fundMetadata?: FundMetadata;
    reason?: string;
}

// ============================================
// NEW: Rolling Returns Interface
// ============================================
export interface RollingReturns {
    fundId: string;
    fundName: string;
    return1M: number | null;
    return3M: number | null;
    return6M: number | null;
    return1Y: number | null;
    return3Y: number | null;
    return5Y: number | null;
    sipReturn3Y: number | null;
    lumpSumReturn3Y: number | null;
    cagr: number | null;
    calculatedAsOf: string;
}

// ============================================
// NEW: Risk Insights Interface
// ============================================
export interface RiskInsights {
    fundId: string;
    fundName: string;
    alpha: number | null;
    beta: number | null;
    sharpeRatio: number | null;
    standardDeviation: number | null;
    alphaInsight: string;
    betaInsight: string;
    volatilityLevel: 'LOW' | 'MARKET_ALIGNED' | 'HIGH';
    overallRiskLabel: string;
}

// ============================================
// NEW: Portfolio Covariance Interface
// ============================================
export interface PortfolioCovariance {
    fundIds: string[];
    fundNames: string[];
    covarianceMatrix: number[][];
    correlationMatrix: number[][];
    portfolioVariance: number;
    portfolioStdDev: number;
    weightedAvgStdDev: number;
    diversificationBenefit: number;
    calculationMethod: string;
    monthsUsed: number;
}

// ============================================
// NEW: Covariance Request Interface
// ============================================
export interface CovarianceRequest {
    funds: FundWeight[];
}

export interface FundWeight {
    fundId: string;
    weight: number;
}
