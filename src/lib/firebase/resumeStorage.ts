import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from "./firebaseConfig";

// Correct bucket is automatically picked from firebaseConfig
const storage = getStorage(app);

// Upload resume
export async function uploadResumeToStorage(userId: string, file: File) {
  try {
    const filePath = `resumes/${userId}/${Date.now()}_${file.name}`;
    const resumeRef = ref(storage, filePath);

    // Upload the file
    const snapshot = await uploadBytes(resumeRef, file);

    // Get public download URL
    const url = await getDownloadURL(snapshot.ref);

    return url;
  } catch (error) {
    console.error("Resume upload error:", error);
    throw error;
  }
}

// Delete resume
export async function deleteResumeFromStorage(url: string) {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    console.error("Error deleting resume:", error);
  }
}
