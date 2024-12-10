// backend/file-management.js
import { list, remove } from "aws-amplify/storage";
import { getCurrentUser } from "aws-amplify/auth";

// Fetch the signed-in user's email
export const fetchUserEmail = async () => {
  try {
    const { signInDetails } = await getCurrentUser();
    console.log("User Email:", signInDetails.loginId);
    return signInDetails.loginId;
  } catch (error) {
    console.error("Error fetching user email:", error);
    throw error;
  }
};

// List all files in the user's directory
export const listFiles = async (userEmail) => {
  try {
    const result = await list({
      path: `public/${userEmail}/`,
      options: { listAll: true },
    });

    // Extract and return file names from the result
    return result.items.map((item) => item.path.split("/").pop());
  } catch (error) {
    console.error("Error listing files:", error);
    throw error;
  }
};

// Remove a file from the user's directory
export const removeFile = async (userEmail, fileName) => {
  try {
    await remove({
      path: `public/${userEmail}/${fileName}`,
      bucket: "genescopefilesec991-dev", // Replace with your bucket name
    });
    console.log(`File "${fileName}" removed successfully.`);
  } catch (error) {
    console.error("Error removing file:", error);
    throw error;
  }
};
