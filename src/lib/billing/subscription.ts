// src/lib/billing/subscription.ts
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export type Plan = "free" | "pro" | "enterprise";

export type SubscriptionDoc = {
  userId: string;
  plan: Plan;
  jobPostLimit: number;      // posts allowed per month
  postsThisMonth: number;    // used count
  lastReset?: string;        // ISO
  activeUntil?: string;      // ISO (optional for paid)
};

// Default FREE plan
export const defaultSub = (uid: string): SubscriptionDoc => ({
  userId: uid,
  plan: "free",
  jobPostLimit: 1,
  postsThisMonth: 0,
  lastReset: new Date().toISOString(),
});

// Ensure a subscription doc exists (id = uid)
export async function ensureSubscription(): Promise<SubscriptionDoc> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");
  const ref = doc(db, "subscriptions", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const sub = defaultSub(user.uid);
    await setDoc(ref, sub, { merge: true });
    return sub;
  }
  return snap.data() as SubscriptionDoc;
}

export async function getSubscription(): Promise<SubscriptionDoc> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");
  const ref = doc(db, "subscriptions", user.uid);
  const snap = await getDoc(ref);
  return (snap.exists() ? snap.data() : defaultSub(user.uid)) as SubscriptionDoc;
}

// Monthly reset if month changed
function needsReset(lastReset?: string) {
  if (!lastReset) return true;
  const d = new Date(lastReset);
  const n = new Date();
  return d.getUTCFullYear() !== n.getUTCFullYear() || d.getUTCMonth() !== n.getUTCMonth();
}

// Check if user can post a job right now (enforces plan limit)
export async function canPostJob(): Promise<{ ok: boolean; reason?: string; sub?: SubscriptionDoc }> {
  const user = auth.currentUser;
  if (!user) return { ok: false, reason: "Not logged in" };
  const ref = doc(db, "subscriptions", user.uid);
  const snap = await getDoc(ref);

  let sub: SubscriptionDoc = snap.exists() ? (snap.data() as SubscriptionDoc) : defaultSub(user.uid);

  if (needsReset(sub.lastReset)) {
    sub = { ...sub, postsThisMonth: 0, lastReset: new Date().toISOString() };
    await setDoc(ref, sub, { merge: true });
  }

  if ((sub.postsThisMonth ?? 0) >= (sub.jobPostLimit ?? 1)) {
    return { ok: false, reason: "limit_reached", sub };
  }

  return { ok: true, sub };
}

// Increment usage after successful post
export async function incrementPostCount() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");
  const ref = doc(db, "subscriptions", user.uid);
  const snap = await getDoc(ref);
  const sub = (snap.exists() ? (snap.data() as SubscriptionDoc) : defaultSub(user.uid));
  const next = {
    ...sub,
    postsThisMonth: (sub.postsThisMonth ?? 0) + 1,
    lastReset: sub.lastReset ?? new Date().toISOString(),
  };
  await setDoc(ref, next, { merge: true });
}

// Upgrade helper (dummy payment handled in UI)
export async function upgradePlan(plan: Plan) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");
  const ref = doc(db, "subscriptions", user.uid);

  let jobPostLimit = 1;
  if (plan === "pro") jobPostLimit = 10;
  if (plan === "enterprise") jobPostLimit = 100;

  await setDoc(
    ref,
    {
      userId: user.uid,
      plan,
      jobPostLimit,
      activeUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      lastReset: new Date().toISOString(),
    },
    { merge: true }
  );
}
