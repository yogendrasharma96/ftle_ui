import { auth } from "../firebase/firebase";

export async function authFetch(url, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken();

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

/**
 * Utility for public API calls that do not require authentication
 */
export const getPublicData = async (url, options = {}) => {
  const defaultOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Add any other public headers required by your backend here
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    // This is important: fetch doesn't throw on 404/500 errors, 
    // so we check response.ok manually.
    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(errorMsg || `Error: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error("Public Fetch Error:", error);
    throw error;
  }
};

export async function authDownload(url) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken();

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Download failed");
  }

  return response.blob();   // IMPORTANT
}