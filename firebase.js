// firebase.js (ES module)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore, getDoc, doc, setDoc, serverTimestamp, collection, addDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider,
  signInWithPopup, signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// --- CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyCnf-hKBJXqEkmwwdM29RWwvZjSAmTMGSE",
  authDomain: "ocsi-it-iventory-system.firebaseapp.com",
  projectId: "ocsi-it-iventory-system",
  storageBucket: "ocsi-it-iventory-system.firebasestorage.app",
  messagingSenderId: "941219752022",
  appId: "1:941219752022:web:f3214e808d36a4a53833f7",
  measurementId: "G-CM3P9CRX1K"
};

export const app  = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);

// Role helpers
export const SUPER_ADMIN_EMAIL = "micaelngoma@ocsi.org";
export const IT_EMAILS = ["micael@ocsi.school","support@ocsi.school"];

/**
 * NEW: Centralized Logging Function
 * Use this in every page to record actions.
 */
export async function logAudit(action, targetId, targetType, details) {
  try {
    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, "audits"), {
      userEmail: user.email,
      action: action,        // 'create', 'update', 'delete'
      targetId: targetId,    // e.g., "OCSI-202" 
      targetType: targetType,// e.g., "hardware" or "license"
      details: details,      // e.g., "Updated location to Room 201"
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.error("Audit Log Error:", err);
  }
}

export function roleBadgeClass(role){
  if(role === "admin") return "badge-admin";
  if(role === "it")    return "badge-it";
  return "badge-viewer";
}

export function setWhoBadge(whoEl, email, role){
  if(!whoEl) return;
  const cls = roleBadgeClass(role);
  whoEl.innerHTML = `${email} <span class="badge ${cls}">${role}</span>`;
}

export function watchAuth({allowedRoles=["admin","it","viewer"], whoEl, onReady} = {}){
  return onAuthStateChanged(auth, async user=>{
    if(!user){
      location.href = "login.html";
      return;
    }

    const userRef = doc(db,"users",user.uid);
    const snap    = await getDoc(userRef);
    let role = "viewer";

    if(snap.exists()){
      role = snap.data().role || "viewer";
    }else{
      const email = user.email || "";
      if(email === SUPER_ADMIN_EMAIL)       role = "admin";
      else if(IT_EMAILS.includes(email))    role = "it";

      await setDoc(userRef,{
        email,
        name: user.displayName || "",
        role,
        createdAt: serverTimestamp()
      },{merge:true});
      
      // Log the first-time user creation
      await logAudit("create", email, "user", "New user account auto-created.");
    }

    if(!allowedRoles.includes(role)){
      alert("Access denied.");
      location.href = "login.html";
      return;
    }

    if(whoEl) setWhoBadge(whoEl, user.email || "", role);
    if(onReady) onReady(user, role);
  });
}

export async function loginWithGoogle(){
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  // Log successful login
  await logAudit("login", result.user.email, "auth", "User logged in via Google.");
}

export async function doLogout(){
  const email = auth.currentUser?.email;
  if(email) await logAudit("logout", email, "auth", "User logged out.");
  await signOut(auth);
  location.href = "login.html";
}
