
export enum Breed {
  RIR = 'Rhode Island Red',
  BA = 'Black Australorp',
  Other = 'Other'
}

export interface BreedProfile {
  id: string;
  name: string; // Full name
  code: string; // Short code e.g. RIR
  gestationDays: number;
  color: string; // For UI identification
  isSystem?: boolean; // Prevent deletion of defaults
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
  breed: string; // Changed from Breed enum to string to support custom breeds
  stage: BirdStage;
  hatchDate: string;
  notes?: string;
  photoUrl?: string;
  status: 'Active' | 'Sold' | 'Deceased';
  feedInventoryId?: string; // ID of the feed inventory item this flock consumes
}

export interface EggLogEntry {
  id: string;
  date: string;
  count: number;
  damaged: number;
  notes?: string;
  breed?: string | 'Mixed'; // Changed from Breed enum
}

export interface IncubationBatch {
  id: string;
  startDate: string;
  projectedHatchDate: string;
  eggCount: number;
  breed: string; // Changed from Breed enum
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
  // Auto-consumption settings
  isAutoFeed?: boolean;
  dailyRatePerBird?: number;
  lastAutoDeductDate?: string;
}

export interface HealthRecord {
  id: string;
  date: string;
  type: HealthEventType;
  subject: string; // e.g., "All Flock", "RIR-001", "Black Australorps"
  breed?: string; // Changed from Breed enum
  description: string;
  treatment?: string;
  outcome?: 'Recovered' | 'Ongoing' | 'Deceased' | 'N/A';
  cost?: number;
  veterinarian?: string;
  notes?: string;
}

export interface ManualTask {
  id: string;
  description: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

export interface LoginLog {
  id: string;
  timestamp: string;
  ipAddress: string;
  deviceInfo: string;
  status: 'Success' | 'Failed';
}