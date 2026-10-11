import api from './api';

/* ====================================
   TYPES
   ==================================== */

export interface DashboardStats {
  totalPredictions: number;
  highRiskCount: number;
  moderateRiskCount: number;
  lowRiskCount: number;
  averageRiskScore: number;
}

export interface RiskDistribution {
  low: number;
  moderate: number;
  high: number;
}

export interface MonthlyPrediction {
  month: string;
  count: number;
}

/* ====================================
   GET STATS
   ==================================== */

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const [totalRes, avgRes] = await Promise.all([
      api.get('/dashboard/total-predictions'),
      api.get('/dashboard/average-risk')
    ]);
    
    return {
      totalPredictions: totalRes.data.total || 0,
      highRiskCount: 0, // Backend doesn't provide this yet
      moderateRiskCount: 0,
      lowRiskCount: 0,
      averageRiskScore: (avgRes.data.averageRiskScore || 0) / 100 // Convert integer percentage to decimal
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    throw error;
  }
};

/* ====================================
   GET RISK DISTRIBUTION
   ==================================== */

export const getRiskDistribution = async (): Promise<RiskDistribution> => {
  return { low: 0, moderate: 0, high: 0 };
};

/* ====================================
   GET MONTHLY PREDICTIONS
   ==================================== */

export const getMonthlyPredictions = async (): Promise<MonthlyPrediction[]> => {
  try {
    const res = await api.get('/dashboard/risk-chart');
    const chartData = res.data || [];
    
    // Convert List<RiskChartItemResponse> {date, riskScore} to MonthlyPrediction format for now
    // Since backend returns daily risk scores, we group them or just show them as is
    return chartData.slice(0, 5).map((item: any, index: number) => ({
      month: item.date || `Jour ${index + 1}`,
      count: item.riskScore || 0
    }));
  } catch (error) {
    console.error("Monthly predictions error:", error);
    return [];
  }
};
