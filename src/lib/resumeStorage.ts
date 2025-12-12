// src/lib/resumeStorage.ts
// Small helper around Firebase Storage just for candidate resumes.

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { firebaseApp } from "@/lib/firebase";

// Single storage instance for the app
const storage = getStorage(firebaseApp);

// All resumes will be stored under /resumes/{uid}/...
const RESUME_ROOT = "resumes";

/**
 * Upload a resume for a user and return the public download URL.
 */
export async function uploadResumeToStorage(
  userId: string,
  file: File
): Promise<string> {
  const safeName = file.name.replace(/\s+/g, "_");
  const path = `${RESUME_ROOT}/${userId}/${Date.now()}-${safeName}`;

  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);

  const url = await getDownloadURL(fileRef);
  return url;
}

/**
 * Delete an existing resume, if a URL is provided.
 * (We call this before uploading a new resume.)
 */
export async function deleteResumeFromStorage(
  existingUrl?: string | null
): Promise<void> {
  if (!existingUrl) return;

  try {
    // ref() can take a full download URL
    const fileRef = ref(storage, existingUrl);
    await deleteObject(fileRef);
  } catch (err) {
    // If delete fails, we just log – no need to block the user.
    console.warn("Could not delete old resume:", err);
  }
}
