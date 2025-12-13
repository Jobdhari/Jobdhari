// src/lib/firebase/employerJobsService.ts
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type JobStatus = "active" | "closed" | "draft";

export type EmployerJob = {
  id: string;
  employerId: string;

  title: string;
  companyName: string;
  location: string;
  category: string;
  description: string;

  status: JobStatus;
  createdAt?: Timestamp;
};

export type CreateEmployerJobInput = Omit<
  EmployerJob,
  "id" | "createdAt"
>;

function mapJob(docData: DocumentData, id: string): EmployerJob {
  return {
    id,
    employerId: docData.employerId,
    title: docData.title ?? "",
    companyName: docData.companyName ?? "",
    location: docData.location ?? "",
    category: docData.category ?? "",
    description: docData.description ?? "",
    status: (docData.status ?? "draft") as JobStatus,
    createdAt: docData.createdAt,
  };
}

export async function createEmployerJob(input: CreateEmployerJobInput) {
  const ref = await addDoc(collection(db, "jobs"), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listEmployerJobs(params: {
  employerId: string;
  status?: JobStatus; // keep single-status filter for now (simpler + fewer indexes)
}) {
  const { employerId, status } = params;

  const base = [
    where("employerId", "==", employerId),
    orderBy("createdAt", "desc"),
  ] as const;

  const q = status
    ? query(collection(db, "jobs"), ...base, where("status", "==", status))
    : query(collection(db, "jobs"), ...base);

  const snap = await getDocs(q);
  return snap.docs.map((d) => mapJob(d.data(), d.id));
}
