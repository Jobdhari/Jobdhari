// src/lib/resumeStorage.ts

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

/**
 * Firebase Storage instance
 * Uses the default initialized Firebase app
 */
const storage = getStorage();

/**
 * Upload resume to Firebase Storage
 */
export async function uploadResume(
  uid: string,
  file: File
): Promise<string> {
  const resumeRef = ref(storage, `resumes/${uid}/${file.name}`);

  await uploadBytes(resumeRef, file);
  return await getDownloadURL(resumeRef);
}

/**
 * Delete resume from Firebase Storage
 */
export async function deleteResume(resumeUrl: string): Promise<void> {
  const resumeRef = ref(storage, resumeUrl);
  await deleteObject(resumeRef);
}
