export type ConnectorType = "CCS" | "CHAdeMO" | "Type 2" | "Tesla";
export type ChargingSpeed = "Slow" | "Fast" | "Ultra Fast";

export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance: number;
  connectorTypes: ConnectorType[];
  speed: ChargingSpeed;
  maxPower: number;
  price: number;
  availableChargers: number;
  totalChargers: number;
  rating: number;
  reviews: number;
  amenities: string[];
  operator: string;
  isOpen: boolean;
  openingHours: string;
}

export interface CarModel {
  id: string;
  brand: string;
  model: string;
  displayName: string;
  accent: string;
}

export interface ReservationEntry {
  id: string;
  stationId: string;
  reservedBy: string;
  createdAt: string;
}

export interface ActiveSession {
  stationId: string;
  stationName: string;
  startedAt: string;
  paymentMethod?: PaymentMethod;
  authorizedAmount?: number;
}

export interface SessionHistoryEntry {
  id: string;
  stationId: string;
  stationName: string;
  startedAt: string;
  endedAt: string;
  elapsedSec: number;
  progressPercent: number;
  energyAddedKwh: number;
  estimatedCost: number;
  paymentMethod: PaymentMethod;
}

export type TabKey = "Home" | "Maps" | "Favorites" | "Session" | "Profile";
export type PaymentMethod = "GCash" | "E-Wallet";
