// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore, getDoc, doc, setDoc, serverTimestamp, collection, addDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider,
  signInWithPopup, signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

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

// Role settings
export const SUPER_ADMIN_EMAIL = "micaelngoma@ocsi.org";
export const IT_EMAILS = ["micael@ocsi.school","support@ocsi.school"];

/**
 * LOG AUDIT FUNCTION
 * Call this whenever a change is made: logAudit("update", "OCSI-101", "Changed status to Repair")
 */
export async function logAudit(action, targetId, details) {
  try {
    const user = auth.currentUser;
    if (!user) return;
    await addDoc(collection(db, "audits"), {
      userEmail: user.email,
      action: action.toLowerCase(), // create, update, delete, login
      targetId: targetId || "N/A",
      details: details || "",
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.error("Audit Logging Failed:", err);
  }
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
    } else {
      const email = user.email || "";
      if(email === SUPER_ADMIN_EMAIL) role = "admin";
      else if(IT_EMAILS.includes(email)) role = "it";

      await setDoc(userRef,{
        email,
        name: user.displayName || "",
        role,
        createdAt: serverTimestamp()
      },{merge:true});
      
      await logAudit("create", email, "New user profile initialized.");
    }

    if(!allowedRoles.includes(role)){
      alert("Access denied.");
      location.href = "login.html";
      return;
    }

    if(whoEl) whoEl.innerHTML = `${user.email} <span class="badge">${role}</span>`;
    if(onReady) onReady(user, role);
  });
}

export async function loginWithGoogle(){
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(auth, provider);
  await logAudit("login", res.user.email, "Logged in via Google");
}

export async function doLogout(){
  const email = auth.currentUser?.email;
  if(email) await logAudit("logout", email, "User logged out");
  await signOut(auth);
  location.href = "login.html";
}
