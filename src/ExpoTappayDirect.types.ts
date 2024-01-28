export interface SetupConfig {
  appId: number;
  appKey: string;
  serverType: "sandbox" | "production";
}

export interface SetCardParams {
  cardNumber: string;
  dueMonth: string;
  dueYear: string;
  ccv: string;
}

export interface PrimeResult {
  prime: string;
  binCode: string;
  lastFour: string;
  issuer: string;
  type: number;
  funding: number;
  cardIdentifier: string;
}
