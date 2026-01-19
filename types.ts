
export interface FinancialMetric {
  label: string;
  current_year: number;
  previous_year: number;
  unit: string;
}

export interface FinancialData {
  company_name: string;
  reporting_year: string;
  currency: string;
  metrics: FinancialMetric[];
  investor_summary: string;
}

export interface LoadingState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}
