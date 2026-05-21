import { db, auth } from '@/constants/FirebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, increment, runTransaction } from 'firebase/firestore';
import { BioEconomy } from '@/constants/BioEconomy';
import { SynergyService } from './SynergyService';

export interface InventoryItem {
  id: string;
  name: string;
  type: 'equipment' | 'boost' | 'cosmetic' | 'recovery';
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  bonusValue?: number;
  bonusType?: 'hrv' | 'recovery' | 'ntk_multiplier';
  acquiredAt: number;
}

export class InventoryService {
  /**
   * Redeems an item using NTK or Rank requirements.
   */
  static async redeemItem(userId: string, item: Partial<InventoryItem>, costNtk: number, requiredRank?: string) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) throw new Error("Usuario no encontrado");
    const userData = userSnap.data();

    // Check Rank requirement
    if (requiredRank && userData.rank !== requiredRank) {
       throw new Error(`Se requiere rango ${requiredRank} para este ítem.`);
    }

    // Check Balance
    if ((userData.ntkBalance || 0) < costNtk) {
       throw new Error("Saldo de NTK insuficiente.");
    }

    await runTransaction(db, async (transaction) => {
      const uSnap = await transaction.get(userRef);
      if (!uSnap.exists()) return;

      const newBalance = (uSnap.data().ntkBalance || 0) - costNtk;
      const newItem: InventoryItem = {
        id: item.id || `itm_${Date.now()}`,
        name: item.name || 'Bio-Equipment',
        type: item.type || 'equipment',
        description: item.description || '',
        rarity: item.rarity || 'common',
        bonusValue: item.bonusValue,
        bonusType: item.bonusType,
        acquiredAt: Date.now()
      };

      transaction.update(userRef, {
        ntkBalance: newBalance,
        inventory: arrayUnion(newItem)
      });
    });

    await SynergyService.postAchievement(
      'redemption',
      `Ha adquirido el equipo táctico: ${item.name}.`,
      0 // No reward for spending
    );

    return true;
  }

  /**
   * Gets user inventory.
   */
  static async getInventory(userId: string): Promise<InventoryItem[]> {
    const userSnap = await getDoc(doc(db, 'users', userId));
    return userSnap.exists() ? (userSnap.data().inventory || []) : [];
  }
}
