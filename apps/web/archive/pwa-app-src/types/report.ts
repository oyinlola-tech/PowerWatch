import type { PowerStatus } from "./dashboard";

export interface ReportSubmission {
  status: PowerStatus;
  streetAddress: string; // e.g. "15 Olamide St"
  area: string; // e.g. "Adewole Estate, Ilorin"
}