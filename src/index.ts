import * as ExpoTappayDirectTypes from "./ExpoTappayDirect.types";
import ExpoTappayDirectModule from "./ExpoTappayDirectModule";

export function getTheme(): string {
  return ExpoTappayDirectModule.getTheme();
}

export function setup({
  appId,
  appKey,
  serverType,
}: ExpoTappayDirectTypes.SetupConfig): void {
  return ExpoTappayDirectModule.setup(appId, appKey, serverType);
}

export function setCard({
  cardNumber,
  dueMonth,
  dueYear,
  ccv,
}: ExpoTappayDirectTypes.SetCardParams): void {
  return ExpoTappayDirectModule.setCard(cardNumber, dueMonth, dueYear, ccv);
}

export function removeCard(): void {
  return ExpoTappayDirectModule.removeCard();
}

export function getPrime(): Promise<{
  prime: string;
  bincode: string;
  lastfour: string;
  issuer: string;
  type: number;
  funding: number;
  cardidentifier: string;
}> {
  return ExpoTappayDirectModule.getPrime();
}
