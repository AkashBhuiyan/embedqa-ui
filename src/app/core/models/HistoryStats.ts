export interface HistoryStats {
    totalRequests: number;
    successCount: number;
    errorCount: number;
    avgResponseTime: number;
    methodBreakdown: Record<string, number>;
}