export enum Breed {
  RIR = 'Rhode Island Red',
  BA = 'Black Australorp',
  Other = 'Other'
}

export enum BirdStage {
  Chick = 'Chick',
  Pullet = 'Pullet',
  Hen = 'Hen',
  Rooster = 'Rooster'
}

export enum TransactionType {
  Income = 'Income',
  Expense = 'Expense'
}

export enum HealthEventType {
  Vaccination = 'Vaccination',
  Disease = 'Disease',
  Injury = 'Injury',
  Checkup = 'Checkup',
  Other = 'Other'
}

export interface Bird {
  id: string;
  tagNumber: string;
  name?: string;
  count: number;
  breed: Breed;
  stage: BirdStage;
  hatchDate: string;
  notes?: string;
  photoUrl?: string;
  status: 'Active' | 'Sold' | 'Deceased';
}

export interface EggLogEntry {
  id: string;
  date: string;
  count: number;
  damaged: number;
  notes?: string;
}

export interface IncubationBatch {
  id: string;
  startDate: string;
  projectedHatchDate: string;
  eggCount: number;
  breed: Breed;
  fertileCount?: number;
  hatchedCount?: number;
  status: 'Incubating' | 'Hatched' | 'Failed';
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: 'Feed' | 'Medicine' | 'Equipment' | 'Egg Sales' | 'Bird Sales' | 'Other';
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Feed' | 'Medicine' | 'Supplies' | 'Product';
  quantity: number;
  unit: string;
  restockThreshold: number;
  lastUpdated?: string;
  notes?: string;
}

export interface HealthRecord {
  id: string;
  date: string;
  type: HealthEventType;
  subject: string; // e.g., "All Flock", "RIR-001", "Black Australorps"
  breed?: Breed;
  description: string;
  treatment?: string;
  outcome?: 'Recovered' | 'Ongoing' | 'Deceased' | 'N/A';
  cost?: number;
  veterinarian?: string;
  notes?: string;
}