import admin from "firebase-admin";

// Create a variable to hold the firestore instance
let dbAdmin = null;

if (!admin.apps.length) {
  try {
    const base64Key = process.env.FIREBASE_PRIVATE_KEY_BASE64;
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    // GATEKEEPER: Only initialize if all variables exist
    if (base64Key && projectId && clientEmail) {
      const decodedKey = Buffer.from(base64Key, 'base64').toString('utf8');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: decodedKey.replace(/\\n/g, '\n'),
        }),
      });

      console.log("✅ Firebase Admin successfully initialized via Base64");
      dbAdmin = admin.firestore();
    } else {
      console.warn("⚠️ Firebase Admin credentials missing. This is expected during some build phases.");
    }
  } catch (error) {
    console.error("❌ Firebase Admin Initialization Error:", error.message);
  }
} else {
  dbAdmin = admin.firestore();
}

export { dbAdmin };