// firebase.js  – shared Firebase setup for all pages

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
import {
  getFirestore,
  doc, getDoc, setDoc,
  collection, getDocs,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// ---- CONFIG -----------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyCnf-hKBJXqEkmwwdM29RWwvZjSAmTMGSE",
  authDomain: "ocsi-it-iventory-system.firebaseapp.com",
  projectId: "ocsi-it-iventory-system",
  storageBucket: "ocsi-it-iventory-system.firebasestorage.app",
  messagingSenderId: "941219752022",
  appId: "1:941219752022:web:f3214e808d36a4a53833f7",
  measurementId: "G-CM3P9CRX1K"
};

// ---- INITIALISE -------------------------------------------------

export const app       = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db        = getFirestore(app);
export const auth      = getAuth(app);

// ---- ROLES & HELPERS -------------------------------------------

const SUPER_ADMIN_EMAIL = "micaelngoma@ocsi.org";
const IT_EMAILS = [
  "micael@ocsi.school",
  "support@ocsi.school",
  SUPER_ADMIN_EMAIL
];

export const ALLOWED_ROLES = ["admin", "it", "viewer"];
export const EDIT_ROLES    = ["admin", "it"];

/** Ensure /users/{uid} exists with a role. */
export async function ensureUserDoc(user) {
  const ref  = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const email = (user.email || "").toLowerCase();

  let defaultRole = "viewer";
  if (email === SUPER_ADMIN_EMAIL.toLowerCase()) {
    defaultRole = "admin";
  } else if (IT_EMAILS.map(e => e.toLowerCase()).includes(email)) {
    defaultRole = "it";
  }

  if (!snap.exists()) {
    await setDoc(ref, {
      email,
      name: user.displayName || "",
      role: defaultRole,
      createdAt: serverTimestamp()
    });
    return defaultRole;
  }

  const data = snap.data() || {};
  return data.role || defaultRole;
}

export function roleBadge(role) {
  const cls =
    role === "admin" ? "badge badge-admin" :
    role === "it"    ? "badge badge-it"    :
                       "badge badge-viewer";
  return `<span class="${cls}">${role}</span>`;
}

/**
 * requireAuth(allowedRoles, callback)
 * callback receives: { user, role, badgeHtml }
 */
export function requireAuth(allowedRoles, callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      location.href = "login.html";
      return;
    }
    try {
      const role = await ensureUserDoc(user);

      if (Array.isArray(allowedRoles) &&
          allowedRoles.length &&
          !allowedRoles.includes(role)) {
        alert("Access denied.");
        location.href = "index.html";
        return;
      }

      const badgeHtml = roleBadge(role);
      callback({ user, role, badgeHtml });
    } catch (err) {
      console.error("Auth/role error:", err);
      alert("Unable to verify your permissions. Please try again.");
    }
  });
}

// ---- SMALL UTILITIES -------------------------------------------

export function toDate(val) {
  if (!val) return null;
  if (val.toDate) return val.toDate();
  return new Date(val);
}

export function escapeHtml(s) {
  if (!s) return "";
  return String(s).replace(/[&<>"']/g, c =>
    ({ "&":"&amp;","<":"&lt;","~":"&gt;","\"":"&quot;","'":"&#39;" }[c] || c)
  );
}

// ---- RE-EXPORT FIREBASE FNS SO PAGES IMPORT ONLY FROM HERE -----

export {
  // Firestore
  doc, getDoc, setDoc, collection, getDocs, serverTimestamp,
  // Auth
  onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut
};
