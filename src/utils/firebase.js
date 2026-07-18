import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, arrayUnion } from "firebase/firestore";

// Firebase configuration keys.
// Replace the values below with your Firebase Config keys from console.firebase.google.com!
const firebaseConfig = {
  apiKey: "AIzaSyCfdozU_HP43lBywMdjjnpbGQQ4My2D3GI",
  authDomain: "cat-tracker-1538d.firebaseapp.com",
  projectId: "cat-tracker-1538d",
  storageBucket: "cat-tracker-1538d.firebasestorage.app",
  messagingSenderId: "448025945166",
  appId: "1:448025945166:web:44bfb7c558b79f31a3cf1f",
  measurementId: "G-VPEBJJWF8Y"
};
// Check if Firebase keys are configured
const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.apiKey !== "";

let app;
let auth;
let db;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

export { auth, db, isFirebaseConfigured };

// 1. Sign Up User (Creates Auth user and a matching profile document)
export const signUpUser = async (email, password, displayName) => {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured. Please follow the setup guide.");

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create profile doc in firestore
  const profileData = {
    uid: user.uid,
    displayName: displayName || email.split('@')[0],
    email: user.email,
    streak: 0,
    solvedQs: 0,
    friends: [],
    lastActive: new Date().toISOString()
  };

  await setDoc(doc(db, "profiles", user.uid), profileData);
  return user;
};

// 2. Log In User
export const logInUser = async (email, password) => {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured. Please follow the setup guide.");
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// 3. Log Out User
export const logOutUser = async () => {
  if (!isFirebaseConfigured) return;
  await signOut(auth);
};

// 4. Save Study Tracker data to Firestore
export const saveTrackerToCloud = async (userId, trackerState, studyPlanState, mocksState, streak, solvedQs) => {
  if (!isFirebaseConfigured || !userId) return;

  try {
    // Save checklist, studyplan, and mocks data
    await setDoc(doc(db, "trackers", userId), {
      tracker: trackerState,
      studyPlan: studyPlanState,
      mocks: mocksState,
      updatedAt: new Date().toISOString()
    });

    // Update matching profile stats
    await updateDoc(doc(db, "profiles", userId), {
      streak,
      solvedQs,
      lastActive: new Date().toISOString()
    });
  } catch (err) {
    console.error("Error saving tracker data to Cloud:", err);
  }
};

// 5. Load Study Tracker data from Firestore
export const loadTrackerFromCloud = async (userId) => {
  if (!isFirebaseConfigured || !userId) return null;
  try {
    const docSnap = await getDoc(doc(db, "trackers", userId));
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (err) {
    console.error("Error loading tracker from Cloud:", err);
  }
  return null;
};

// 6. Fetch single user profile
export const getUserProfile = async (userId) => {
  if (!isFirebaseConfigured || !userId) return null;
  try {
    const docSnap = await getDoc(doc(db, "profiles", userId));
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (err) {
    console.error("Error fetching user profile:", err);
  }
  return null;
};

// 7. Add a friend by email
export const addFriendByEmail = async (currentUserId, friendEmail) => {
  if (!isFirebaseConfigured || !currentUserId) throw new Error("Firebase not initialized.");

  if (friendEmail.trim() === "") throw new Error("Email cannot be empty.");

  // Check if we are trying to add ourselves
  const currentUserSnap = await getDoc(doc(db, "profiles", currentUserId));
  if (currentUserSnap.exists() && currentUserSnap.data().email === friendEmail) {
    throw new Error("You cannot add yourself as a friend.");
  }

  // Look up profile document with matching email
  const q = query(collection(db, "profiles"), where("email", "==", friendEmail));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error(`No user found with email ${friendEmail}`);
  }

  const friendDoc = querySnapshot.docs[0];
  const friendId = friendDoc.id;

  // Add friendId to current user's profile friends array
  await updateDoc(doc(db, "profiles", currentUserId), {
    friends: arrayUnion(friendId)
  });

  return friendDoc.data();
};

// 8. Fetch progress of all friends
export const fetchFriendsProgress = async (currentUserId) => {
  if (!isFirebaseConfigured || !currentUserId) return [];

  try {
    const userProfile = await getUserProfile(currentUserId);
    if (!userProfile || !userProfile.friends || userProfile.friends.length === 0) return [];

    const friendsStats = [];
    for (const friendId of userProfile.friends) {
      const profile = await getUserProfile(friendId);
      if (profile) {
        friendsStats.push({
          id: profile.uid,
          name: profile.displayName,
          avatar: profile.displayName.charAt(0).toUpperCase(),
          streak: profile.streak || 0,
          solvedQs: profile.solvedQs || 0,
          lastActive: "Just synced",
          message: `Solved ${profile.solvedQs || 0} questions total (Streak: ${profile.streak || 0})`
        });
      }
    }
    return friendsStats;
  } catch (err) {
    console.error("Error fetching friends progress:", err);
    return [];
  }
};
