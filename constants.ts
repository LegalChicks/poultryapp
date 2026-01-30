import { Bird, BirdStage, Breed, EggLogEntry, HealthEventType, HealthRecord, IncubationBatch, InventoryItem, Transaction, TransactionType, BreedProfile } from './types';

// Using picsum to simulate the user's specific bird types in the UI placeholders
export const RIR_IMAGE = "https://picsum.photos/id/1025/400/300"; // Placeholder for RIR
export const BA_IMAGE = "https://picsum.photos/id/237/400/300"; // Placeholder for Australorp (using generic animal placeholder)

export const DEFAULT_BREED_PROFILES: BreedProfile[] = [
  { id: 'bp-1', name: 'Rhode Island Red', code: 'RIR', gestationDays: 21, color: 'red', isSystem: true },
  { id: 'bp-2', name: 'Black Australorp', code: 'BA', gestationDays: 21, color: 'slate', isSystem: true },
  { id: 'bp-3', name: 'Other / Mixed', code: 'Mix', gestationDays: 21, color: 'gray', isSystem: true }
];

export const MOCK_BIRDS: Bird[] = [
  {
    id: '1',
    tagNumber: 'RIR-001',
    count: 1,
    breed: 'Rhode Island Red',
    stage: BirdStage.Hen,
    hatchDate: '2023-01-15',
    status: 'Active',
    notes: 'High producer'
  },
  {
    id: '2',
    tagNumber: 'BA-001',
    count: 1,
    breed: 'Black Australorp',
    stage: BirdStage.Hen,
    hatchDate: '2023-02-10',
    status: 'Active',
    notes: 'Broody often'
  },
  {
    id: '3',
    tagNumber: 'RIR-002',
    count: 1,
    breed: 'Rhode Island Red',
    stage: BirdStage.Rooster,
    hatchDate: '2023-01-15',
    status: 'Active'
  },
  {
    id: '4',
    tagNumber: 'Batch-A24',
    name: 'Spring Chicks',
    count: 15,
    breed: 'Black Australorp',
    stage: BirdStage.Chick,
    hatchDate: '2024-04-20',
    status: 'Active'
  },
   {
    id: '5',
    tagNumber: 'BA-003',
    count: 1,
    breed: 'Black Australorp',
    stage: BirdStage.Chick,
    hatchDate: '2024-04-20',
    status: 'Active'
  }
];

export const MOCK_EGG_LOG: EggLogEntry[] = Array.from({ length: 14 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  return {
    id: `log-${i}`,
    date: date.toISOString().split('T')[0],
    count: Math.floor(Math.random() * 5) + 10, // Random between 10 and 15
    damaged: Math.floor(Math.random() * 2),
  };
});

export const MOCK_INCUBATION: IncubationBatch[] = [
  {
    id: 'inc-1',
    startDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString().split('T')[0], // Started 10 days ago
    projectedHatchDate: new Date(new Date().setDate(new Date().getDate() + 11)).toISOString().split('T')[0],
    eggCount: 24,
    breed: 'Rhode Island Red',
    status: 'Incubating'
  },
  {
    id: 'inc-2',
    startDate: '2024-03-01',
    projectedHatchDate: '2024-03-22',
    eggCount: 12,
    breed: 'Black Australorp',
    fertileCount: 11,
    hatchedCount: 10,
    status: 'Hatched'
  }
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', name: 'Layer Pellets', category: 'Feed', quantity: 50, unit: 'kg', restockThreshold: 20, lastUpdated: '2024-05-10' },
  { id: 'inv-2', name: 'Chick Starter', category: 'Feed', quantity: 8, unit: 'kg', restockThreshold: 10, lastUpdated: '2024-05-12' },
  { id: 'inv-3', name: 'Electrolytes', category: 'Medicine', quantity: 5, unit: 'packs', restockThreshold: 2, lastUpdated: '2024-04-20' },
  { id: 'inv-4', name: 'Pine Shavings', category: 'Supplies', quantity: 15, unit: 'bales', restockThreshold: 5, lastUpdated: '2024-05-01' },
  { id: 'inv-5', name: 'Harvested Eggs', category: 'Product', quantity: 4, unit: 'dozens', restockThreshold: 0, lastUpdated: '2024-05-14' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', date: '2024-05-01', description: 'Feed Purchase', amount: 45.00, type: TransactionType.Expense, category: 'Feed' },
  { id: 'tx-2', date: '2024-05-02', description: 'Sold 3 Dozen Eggs', amount: 15.00, type: TransactionType.Income, category: 'Egg Sales' },
  { id: 'tx-3', date: '2024-05-05', description: 'Sold Pullets', amount: 100.00, type: TransactionType.Income, category: 'Bird Sales' },
];

export const MOCK_HEALTH_RECORDS: HealthRecord[] = [
  { 
    id: 'hr-1', 
    date: '2024-02-15', 
    type: HealthEventType.Vaccination, 
    subject: 'All Chicks', 
    breed: 'Rhode Island Red',
    description: 'Mareks Vaccination for new hatchlings', 
    treatment: 'Injection', 
    outcome: 'N/A', 
    cost: 25.00 
  },
  { 
    id: 'hr-2', 
    date: '2024-04-10', 
    type: HealthEventType.Injury, 
    subject: 'BA-001', 
    breed: 'Black Australorp',
    description: 'Minor leg injury from fence', 
    treatment: 'Cleaned and separated', 
    outcome: 'Recovered',
    notes: 'Keep isolated for 3 days' 
  },
  { 
    id: 'hr-3', 
    date: '2024-05-12', 
    type: HealthEventType.Checkup, 
    subject: 'Entire Flock', 
    description: 'Quarterly parasite check', 
    outcome: 'N/A',
    veterinarian: 'Dr. Smith' 
  }
];