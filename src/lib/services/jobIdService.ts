import { db } from "@/lib/firebase/auth";
import { doc, runTransaction } from "firebase/firestore";

/**
 * Generate a sequential human-readable JobDhari Job ID.
 *
 * Format: JD<YEAR>-<6 digit number>
 * Example: JD2025-000001
 */
export async function generateJobDhariId(): Promise<string> {
  const counterRef = doc(db, "counters", "jobPosts");
  const currentYear = new Date().getFullYear();

  const jobId = await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef);

    let lastNumber = 0;
    let year = currentYear;

    if (counterSnap.exists()) {
      const data = counterSnap.data() as any;
      const storedYear = data.year || currentYear;
      const storedLastNumber = data.lastNumber || 0;

      if (storedYear === currentYear) {
        // Same year: continue incrementing
        year = storedYear;
        lastNumber = storedLastNumber;
      } else {
        // New year: reset counter
        year = currentYear;
        lastNumber = 0;
      }
    }

    const newNumber = lastNumber + 1;

    // Update the counter document
    transaction.set(
      counterRef,
      {
        year,
        lastNumber: newNumber,
      },
      { merge: true }
    );

    // Build ID: JD2025-000001
    const padded = String(newNumber).padStart(6, "0");
    return `JD${year}-${padded}`;
  });

  return jobId;
}
