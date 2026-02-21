export type InsuranceLine =
  | 'General Liability'
  | 'Business Owners Policy'
  | 'Workers Compensation'
  | 'Commercial Auto'
  | 'Commercial Property'
  | 'Umbrella / Excess'
  | 'Professional Liability'
  | 'Cyber Liability'
  | 'Directors & Officers'
  | 'Employment Practices';

export type SubmissionStatus = 'draft' | 'submitted' | 'quoting' | 'quoted' | 'bound' | 'declined';

export type QuoteStatus = 'pending' | 'quoted' | 'declined' | 'referred' | 'bound';

export interface BusinessInfo {
  name: string;
  dba?: string;
  industry: string;
  naicsCode: string;
  yearsInBusiness: number;
  annualRevenue: number;
  employeeCount: number;
  locations: number;
  state: string;
  city: string;
  zipCode: string;
  description: string;
}

export interface CoverageDetail {
  label: string;
  value: string;
}

export interface CarrierQuote {
  id: string;
  carrierName: string;
  carrierLogo?: string;
  line: InsuranceLine;
  status: QuoteStatus;
  annualPremium: number | null;
  monthlyPremium: number | null;
  deductible: number | null;
  coverageLimit: string | null;
  coverageDetails: CoverageDetail[];
  amBestRating: string;
  bindable: boolean;
  expiresAt: string | null;
  declineReason?: string;
  uwNotes?: string;
  quotedAt: string | null;
  carrierAppetite: 'preferred' | 'standard' | 'limited';
}

export interface Submission {
  id: string;
  business: BusinessInfo;
  requestedLines: InsuranceLine[];
  effectiveDate: string;
  status: SubmissionStatus;
  quotes: CarrierQuote[];
  selectedQuoteId?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface BrokerProfile {
  name: string;
  email: string;
  agency: string;
  licenseNumber: string;
  state: string;
  phone: string;
  preferredLines: InsuranceLine[];
  carrierAppointments: string[];
  totalSubmissions: number;
  totalBound: number;
  conversionRate: number;
}

export interface DashboardStats {
  activeSubmissions: number;
  quotesReceived: number;
  policiesBound: number;
  totalPremium: number;
  avgQuoteTime: string;
  conversionRate: number;
  carrierResponseRates: { carrier: string; rate: number; avgDays: number }[];
  lineBreakdown: { line: InsuranceLine; submissions: number; bound: number }[];
  monthlyActivity: { month: string; submissions: number; bound: number }[];
  recentQuotes: { carrier: string; business: string; line: string; premium: number; date: string }[];
}
