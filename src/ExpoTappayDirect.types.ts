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
