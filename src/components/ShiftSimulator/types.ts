export interface ShiftLog {
  hour: string;
  zone: string;
  impact: string;
  event: string;
  advisorResponse: string;
}

export interface SimulationResult {
  scorecard: {
    placementScore: number;
    revenue: number;
    revenueGoal: number;
    csat: number;
    memberships: number;
    creditCards: number;
    placementReview: string;
  };
  shiftLogs: ShiftLog[];
}
