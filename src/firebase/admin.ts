'use client';
import * as admin from 'firebase-admin';

let app: admin.app.App;

export function getFirebaseAdminApp() {
  if (app) {
    return app;
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT environment variable is not set.'
    );
  }

  const credential = admin.credential.cert(JSON.parse(serviceAccount));

  // The storageBucket URL is essential for Firebase Storage operations.
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!storageBucket) {
    throw new Error(
        'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET environment variable is not set.'
    );
  }

  app = admin.initializeApp({
    credential,
    storageBucket,
  });

  return app;
}
