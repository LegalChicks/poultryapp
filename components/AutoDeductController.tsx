import React, { useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import { Bird, InventoryItem } from '../types';

export const AutoDeductController: React.FC = () => {
  const [birds] = usePersistentState<Bird[]>('poultry_birds', []);
  const [inventory, setInventory] = usePersistentState<InventoryItem[]>('poultry_inventory', []);

  useEffect(() => {
    // Wait for data to be available
    if (!birds || !inventory) return;

    // Small delay to ensure app state is stable before calculating
    const timer = setTimeout(() => {
        const today = new Date().toISOString().split('T')[0];
        
        // 1. Calculate Total Active Birds
        const activeBirdCount = birds.reduce((acc, bird) => 
          acc + (bird.status === 'Active' ? bird.count : 0), 0
        );

        let hasChanges = false;
        
        const newInventory = inventory.map(item => {
            // 2. Check items configured for Auto-Feed
            if (item.isAutoFeed && item.dailyRatePerBird && item.dailyRatePerBird > 0) {
                
                // Initialize date if this is the first time running
                if (!item.lastAutoDeductDate) {
                    hasChanges = true;
                    return { ...item, lastAutoDeductDate: today };
                }

                // 3. Check if we need to deduct (if last run was not today)
                if (item.lastAutoDeductDate !== today) {
                    const lastDate = new Date(item.lastAutoDeductDate);
                    const currDate = new Date(today);
                    
                    // Use UTC to calculate difference in calendar days, ignoring DST/Timezones
                    const utc1 = Date.UTC(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
                    const utc2 = Date.UTC(currDate.getFullYear(), currDate.getMonth(), currDate.getDate());
                    const msPerDay = 1000 * 60 * 60 * 24;
                    const diffDays = Math.floor((utc2 - utc1) / msPerDay);
                    
                    if (diffDays > 0) {
                        let newQty = item.quantity;
                        
                        // Only deduct if we actually have birds to feed
                        if (activeBirdCount > 0) {
                            const consumption = parseFloat((diffDays * item.dailyRatePerBird * activeBirdCount).toFixed(2));
                            newQty = parseFloat(Math.max(0, item.quantity - consumption).toFixed(2));
                            
                            console.log(`[Auto-Deduct] ${item.name}: ${diffDays} days * ${activeBirdCount} birds * ${item.dailyRatePerBird} rate = ${consumption} consumed.`);
                        }
                        
                        // Update date regardless of bird count to prevent backlog accumulation
                        hasChanges = true;
                        return { 
                            ...item, 
                            quantity: newQty, 
                            lastAutoDeductDate: today,
                            lastUpdated: today
                        };
                    }
                }
            }
            return item;
        });

        if (hasChanges) {
            setInventory(newInventory);
        }
    }, 2000);

    return () => clearTimeout(timer);
  }, [birds, inventory, setInventory]);

  return null; // Invisible component
};