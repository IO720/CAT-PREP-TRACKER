import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  arrayUnion,
  arrayRemove,
  onSnapshot,
  addDoc,
  orderBy,
  limit
} from "firebase/firestore";

// Firebase configuration keys.
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

// Unique Aspirant ID Generator (#ASP-XXXXXX)
export const generateUniqueAspirantId = (seed = '') => {
  if (seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const num = (Math.abs(hash) % 900000) + 100000;
    return `ASP-${num}`;
  }
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `ASP-${randomNum}`;
};

export const getLocalAspirantId = () => {
  if (typeof window === 'undefined') return 'ASP-100001';
  let id = localStorage.getItem('aspiranto_unique_aspirant_id');
  if (!id) {
    id = generateUniqueAspirantId();
    localStorage.setItem('aspiranto_unique_aspirant_id', id);
  }
  return id;
};

// Color hash generator for avatar backgrounds
export const hashStringToColor = (str = '') => {
  const colors = [
    '#3b82f6', '#ec4899', '#10b981', '#8b5cf6', '#f59e0b', 
    '#06b6d4', '#6366f1', '#14b8a6', '#f97316', '#e11d48'
  ];
  if (!str) return colors[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// 1. Sign Up User (Creates Auth user and a matching profile document with Unique Aspirant ID)
export const signUpUser = async (email, password, displayName) => {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured. Please follow the setup guide.");

  const normalizedEmail = (email || '').trim().toLowerCase();
  const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
  const user = userCredential.user;

  const aspirantId = generateUniqueAspirantId(user.uid);

  // Create profile doc in firestore
  const profileData = {
    uid: user.uid,
    aspirantId: aspirantId,
    displayName: displayName || normalizedEmail.split('@')[0],
    username: normalizedEmail.split('@')[0],
    email: normalizedEmail,
    streak: 0,
    solvedQs: 0,
    friends: [],
    avatar: 'rocket',
    avatarBg: hashStringToColor(displayName || user.uid),
    bannerBg: '#1e1f22',
    bio: '',
    target: 'CAT 2025 (99.5+%ile • IIM-A Focus)',
    location: '',
    lastActive: new Date().toISOString()
  };

  await setDoc(doc(db, "profiles", user.uid), profileData);
  return user;
};

// 2. Log In User
export const logInUser = async (email, password) => {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured. Please follow the setup guide.");
  const normalizedEmail = (email || '').trim().toLowerCase();
  const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
  return userCredential.user;
};

// 3. Log Out User
export const logOutUser = async () => {
  if (!isFirebaseConfigured) return;
  if (auth?.currentUser) {
    await setUserOffline(auth.currentUser.uid);
  }
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
      streak: streak || 0,
      solvedQs: solvedQs || 0,
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

// 6. Fetch single user profile (Ensures persistent unique aspirantId)
export const getUserProfile = async (userId) => {
  if (!isFirebaseConfigured || !userId) return null;
  try {
    const docSnap = await getDoc(doc(db, "profiles", userId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Backfill aspirantId if not present
      if (!data.aspirantId) {
        const assignedId = generateUniqueAspirantId(userId);
        data.aspirantId = assignedId;
        await updateDoc(doc(db, "profiles", userId), { aspirantId: assignedId }).catch(() => {});
      }
      return data;
    }
  } catch (err) {
    console.error("Error fetching user profile:", err);
  }
  return null;
};

// 7. Find User Profile by Unique Aspirant ID, Email, or Username
export const findUserByIdentifier = async (rawIdentifier) => {
  if (!isFirebaseConfigured || !db) return null;
  const input = (rawIdentifier || '').trim();
  if (!input) return null;

  const normalizedInput = input.toLowerCase();
  const cleanId = input.replace(/^#/, '').toUpperCase();
  const numericId = cleanId.startsWith('ASP-') ? cleanId : `ASP-${cleanId}`;

  try {
    // 1. Check by formatted aspirantId (e.g. ASP-849201)
    let q = query(collection(db, "profiles"), where("aspirantId", "==", numericId));
    let snap = await getDocs(q);
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };

    // 2. Check by raw string aspirantId
    q = query(collection(db, "profiles"), where("aspirantId", "==", cleanId));
    snap = await getDocs(q);
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };

    // 3. Check by email
    q = query(collection(db, "profiles"), where("email", "==", normalizedInput));
    snap = await getDocs(q);
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };

    // 4. Check by username
    q = query(collection(db, "profiles"), where("username", "==", normalizedInput.replace(/^@/, '')));
    snap = await getDocs(q);
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };

    return null;
  } catch (err) {
    console.error("Error searching for user by identifier:", err);
    return null;
  }
};

// 8. Send Friend Request (Checks Unique ID / Email & notifies receiver)
export const sendFriendRequest = async (currentUser, targetIdentifier, currentUserProfile = null) => {
  if (!isFirebaseConfigured || !currentUser) throw new Error("Please sign in to send friend requests.");
  const input = (targetIdentifier || '').trim();
  if (!input) throw new Error("Please enter a Unique Aspirant ID or Email.");

  const targetUser = await findUserByIdentifier(input);
  if (!targetUser) {
    throw new Error(`No CAT aspirant found matching "${input}". Make sure your friend has an active Aspiranto account and check their Unique ID!`);
  }

  const targetUid = targetUser.uid || targetUser.id;
  if (targetUid === currentUser.uid) {
    throw new Error("You cannot add yourself as a friend!");
  }

  // Check if already friends
  const currentProfile = await getUserProfile(currentUser.uid);
  if (currentProfile?.friends && currentProfile.friends.includes(targetUid)) {
    throw new Error(`You are already study buddies with ${targetUser.displayName || 'this aspirant'}!`);
  }

  // Check if pending request already exists
  try {
    const qExisting = query(
      collection(db, "friend_requests"),
      where("fromUid", "==", currentUser.uid),
      where("toUid", "==", targetUid),
      where("status", "==", "pending")
    );
    const existingSnap = await getDocs(qExisting);
    if (!existingSnap.empty) {
      throw new Error("A friend request has already been sent to this aspirant and is awaiting their approval.");
    }
  } catch (err) {
    console.warn("Checking existing friend request error:", err);
  }

  const senderName = currentUserProfile?.displayName || currentUser.displayName || currentUser.email?.split('@')[0] || 'CAT Aspirant';
  const senderAvatar = currentUserProfile?.avatar || 'rocket';
  const senderAvatarBg = currentUserProfile?.avatarBg || '#5865f2';
  const senderAspirantId = currentUserProfile?.aspirantId || currentProfile?.aspirantId || generateUniqueAspirantId(currentUser.uid);
  const senderTarget = currentUserProfile?.target || 'CAT 2025 Focus';

  const requestDoc = {
    fromUid: currentUser.uid,
    fromName: senderName,
    fromEmail: currentUser.email || '',
    fromAvatar: senderAvatar,
    fromAvatarBg: senderAvatarBg,
    fromAspirantId: senderAspirantId,
    fromTarget: senderTarget,
    toUid: targetUid,
    toAspirantId: targetUser.aspirantId || '',
    toName: targetUser.displayName || 'Aspirant',
    status: 'pending',
    createdAt: Date.now()
  };

  const docRef = await addDoc(collection(db, "friend_requests"), requestDoc);
  return { id: docRef.id, ...requestDoc, targetUser };
};

// 9. Real-time Subscription to Incoming Friend Requests
export const subscribeToFriendRequests = (userId, onRequestsUpdate) => {
  if (!isFirebaseConfigured || !db || !userId) return () => {};

  try {
    const q = query(
      collection(db, "friend_requests"),
      where("toUid", "==", userId),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = [];
      snapshot.forEach((docSnap) => {
        requests.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      // Newest requests first
      requests.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      onRequestsUpdate(requests);
    }, (err) => {
      console.error("Friend requests subscription error:", err);
    });

    return unsubscribe;
  } catch (err) {
    console.error("Failed to initialize friend requests listener:", err);
    return () => {};
  }
};

// 10. Respond to Friend Request (Accept or Decline)
export const respondToFriendRequest = async (requestId, fromUid, toUid, action = 'accept') => {
  if (!isFirebaseConfigured || !requestId) return;

  try {
    if (action === 'accept') {
      // Mark accepted
      await updateDoc(doc(db, "friend_requests", requestId), {
        status: 'accepted',
        respondedAt: Date.now()
      });

      // Mutually link both profiles
      if (toUid && fromUid) {
        await updateDoc(doc(db, "profiles", toUid), {
          friends: arrayUnion(fromUid)
        }).catch(console.error);

        await updateDoc(doc(db, "profiles", fromUid), {
          friends: arrayUnion(toUid)
        }).catch(console.error);
      }
      return { success: true, action: 'accepted' };
    } else {
      // Decline request
      await updateDoc(doc(db, "friend_requests", requestId), {
        status: 'declined',
        respondedAt: Date.now()
      });
      return { success: true, action: 'declined' };
    }
  } catch (err) {
    console.error("Error responding to friend request:", err);
    throw err;
  }
};

// 11. Remove Friend from Buddy List
export const removeFriend = async (currentUserId, friendId) => {
  if (!isFirebaseConfigured || !currentUserId || !friendId) return;

  try {
    await updateDoc(doc(db, "profiles", currentUserId), {
      friends: arrayRemove(friendId)
    });
    await updateDoc(doc(db, "profiles", friendId), {
      friends: arrayRemove(currentUserId)
    }).catch(() => {});
    return true;
  } catch (err) {
    console.error("Error removing friend:", err);
    throw err;
  }
};

// 12. Add a friend directly by email or ID (Legacy mutual linking fallback)
export const addFriendByEmail = async (currentUserId, identifier) => {
  if (!isFirebaseConfigured || !currentUserId) throw new Error("Firebase not initialized.");

  const target = await findUserByIdentifier(identifier);
  if (!target) {
    throw new Error(`No user found with identifier "${identifier}". Please check their Unique ID or Email!`);
  }

  const friendId = target.uid || target.id;
  if (friendId === currentUserId) {
    throw new Error("You cannot add yourself as a friend.");
  }

  // Mutually link both profiles
  await updateDoc(doc(db, "profiles", currentUserId), {
    friends: arrayUnion(friendId)
  });
  await updateDoc(doc(db, "profiles", friendId), {
    friends: arrayUnion(currentUserId)
  }).catch(() => {});

  return target;
};

// 13. Update User Profile in Firestore & sync to presence
export const updateUserProfile = async (userId, profileData) => {
  if (!isFirebaseConfigured || !userId) return;

  try {
    const updatePayload = {
      displayName: profileData.displayName || '',
      username: profileData.username || '',
      avatar: profileData.avatar || '',
      avatarBg: profileData.avatarBg || hashStringToColor(profileData.displayName || userId),
      bannerBg: profileData.bannerBg || '#1e1f22',
      bio: profileData.bio || '',
      target: profileData.target || 'CAT 2025 (99.5+%ile)',
      location: profileData.location || '',
      aspirantId: profileData.aspirantId || generateUniqueAspirantId(userId),
      updatedAt: new Date().toISOString()
    };

    // Update in profiles collection
    await updateDoc(doc(db, "profiles", userId), updatePayload);

    // Also update current presence record with new profile info
    await setDoc(doc(db, "presence", userId), {
      name: updatePayload.displayName,
      displayName: updatePayload.displayName,
      username: updatePayload.username,
      aspirantId: updatePayload.aspirantId,
      avatar: updatePayload.avatar || updatePayload.displayName.charAt(0).toUpperCase(),
      avatarBg: updatePayload.avatarBg,
      bannerBg: updatePayload.bannerBg,
      bio: updatePayload.bio,
      target: updatePayload.target,
      location: updatePayload.location,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return true;
  } catch (err) {
    console.error("Error updating user profile:", err);
    throw err;
  }
};

// 14. Broadcast user's live presence & timer state to Firestore
export const updateUserPresence = async (user, timerState = null, streak = 0, solvedQs = 0, profileData = null) => {
  if (!isFirebaseConfigured || !user || !user.uid) return;

  const uid = user.uid;
  const name = profileData?.displayName || user.displayName || user.email?.split('@')[0] || 'CAT Aspirant';
  const isStudying = timerState && (timerState.isRunning || timerState.isPaused);
  
  let activity = null;
  if (isStudying) {
    const mins = Math.floor((timerState.secondsLeft || 0) / 60);
    const secs = (timerState.secondsLeft || 0) % 60;
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    activity = {
      type: 'TIMER',
      subject: timerState.subject || 'Quant',
      title: `${timerState.subject || 'Quant'} Focus Session`,
      taskDetails: timerState.sessionNotes || (timerState.mode === 'stopwatch' ? 'Stopwatch Session' : `${Math.round((timerState.totalSeconds || 1500) / 60)}m Focus Session`),
      timerRemaining: `${timeFormatted} left`,
      totalSeconds: timerState.totalSeconds || 1500,
      secondsLeft: timerState.secondsLeft || 1500,
      mode: timerState.mode || 'pomodoro',
      isRunning: !!timerState.isRunning,
      isPaused: !!timerState.isPaused,
      startTimeMs: timerState.startTimeMs || Date.now(),
      updatedMs: Date.now()
    };
  }

  const avatar = profileData?.avatar || user.avatar || name.charAt(0).toUpperCase();
  const avatarBg = profileData?.avatarBg || user.avatarBg || hashStringToColor(name);
  const bio = profileData?.bio || user.bio || '';
  const target = profileData?.target || user.target || 'CAT 2025 Aspirant';
  const location = profileData?.location || user.location || '';

  const presenceData = {
    uid: uid,
    id: uid,
    name: name,
    displayName: name,
    email: user.email || '',
    avatar: avatar,
    avatarBg: avatarBg,
    bio: bio,
    target: target,
    location: location,
    status: isStudying ? 'studying' : 'online',
    streak: streak || 0,
    solvedQs: solvedQs || 0,
    lastActive: 'Active now',
    activity: activity,
    lastHeartbeat: Date.now(),
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, "presence", uid), presenceData, { merge: true });
    // Also keep profile doc synced
    await updateDoc(doc(db, "profiles", uid), {
      status: presenceData.status,
      activity: activity,
      lastActive: presenceData.updatedAt
    }).catch(() => {});
  } catch (err) {
    console.error("Error updating presence:", err);
  }
};

// 10. Mark user offline in Firestore
export const setUserOffline = async (userId) => {
  if (!isFirebaseConfigured || !userId) return;
  try {
    await setDoc(doc(db, "presence", userId), {
      status: 'offline',
      activity: null,
      lastHeartbeat: Date.now(),
      lastActive: 'Recently offline',
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error("Error setting user offline:", err);
  }
};

// 11. Real-time Study Lounge Listener (Subscribes to live peers and timers)
export const subscribeToStudyLounge = (currentUserId, onPeersUpdate) => {
  if (!isFirebaseConfigured || !db) return () => {};

  try {
    const presenceCollection = collection(db, "presence");
    const unsubscribe = onSnapshot(presenceCollection, (snapshot) => {
      const now = Date.now();
      const peers = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // Ignore own record since local state handles "YOU"
        if (data.uid === currentUserId || data.id === currentUserId) return;

        // Consider online if heartbeat is within last 10 minutes and not explicitly offline
        const heartbeatAgeMs = now - (data.lastHeartbeat || 0);
        const isFresh = heartbeatAgeMs < 10 * 60 * 1000;

        let status = data.status || 'offline';
        if (!isFresh) {
          status = 'offline';
        }

        let activity = data.activity || null;
        if (activity && activity.isRunning && status === 'studying') {
          // Compute remaining time dynamically
          const elapsedSecs = Math.floor((now - (activity.updatedMs || now)) / 1000);
          const currentSecsLeft = Math.max(0, (activity.secondsLeft || 0) - elapsedSecs);
          const mins = Math.floor(currentSecsLeft / 60);
          const remSecs = currentSecsLeft % 60;
          activity = {
            ...activity,
            secondsLeft: currentSecsLeft,
            timerRemaining: `${String(mins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')} left`
          };
        }

        peers.push({
          id: data.uid || docSnap.id,
          uid: data.uid || docSnap.id,
          name: data.name || data.displayName || 'Study Peer',
          displayName: data.name || data.displayName || 'Study Peer',
          email: data.email || '',
          avatar: data.avatar || (data.name || data.displayName || 'P').charAt(0).toUpperCase(),
          avatarBg: data.avatarBg || hashStringToColor(data.name || docSnap.id),
          bio: data.bio || '',
          target: data.target || 'CAT 2025 Aspirant',
          location: data.location || '',
          status: status,
          streak: data.streak || 0,
          solvedQs: data.solvedQs || 0,
          lastActive: status === 'studying' || status === 'online' ? 'Active now' : 'Offline',
          progressToday: `${data.solvedQs || 0} Questions Solved`,
          message: status === 'studying' && activity 
            ? `${activity.title || 'Focus Session'} (${activity.timerRemaining || 'Live'})` 
            : (data.bio || `Active CAT Aspirant • ${data.streak || 0}d Streak`),
          activity: status === 'studying' ? activity : null
        });
      });

      // Sort: studying first, then online, then offline
      peers.sort((a, b) => {
        const order = { studying: 0, online: 1, offline: 2 };
        return (order[a.status] ?? 3) - (order[b.status] ?? 3);
      });

      onPeersUpdate(peers);
    }, (err) => {
      console.error("Study Lounge realtime subscription error:", err);
    });

    return unsubscribe;
  } catch (err) {
    console.error("Failed to initialize study lounge listener:", err);
    return () => {};
  }
};

// 12. Fetch progress of all friends (with fallback)
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
          avatar: profile.avatar || profile.displayName.charAt(0).toUpperCase(),
          avatarBg: profile.avatarBg || hashStringToColor(profile.displayName),
          bio: profile.bio || '',
          target: profile.target || 'CAT Aspirant',
          location: profile.location || '',
          streak: profile.streak || 0,
          solvedQs: profile.solvedQs || 0,
          lastActive: "Active now",
          message: profile.bio || `Solved ${profile.solvedQs || 0} questions total (Streak: ${profile.streak || 0})`
        });
      }
    }
    return friendsStats;
  } catch (err) {
    console.error("Error fetching friends progress:", err);
    return [];
  }
};

// 13. Send Live Study Lounge Chat Message
export const sendChatMessage = async (user, text, tag = 'GENERAL', userProfile = null) => {
  if (!isFirebaseConfigured || !user || !text.trim()) return null;

  try {
    const name = userProfile?.displayName || user.displayName || user.name || user.email?.split('@')[0] || 'Aspirant';
    const avatar = userProfile?.avatar || user.avatar || 'rocket';
    const avatarBg = userProfile?.avatarBg || user.avatarBg || '#5865f2';
    const location = userProfile?.location || user.location || '';
    const target = userProfile?.target || user.target || 'CAT 2025';

    const messageData = {
      userId: user.uid,
      senderName: name,
      senderEmail: user.email || '',
      avatar: avatar,
      avatarBg: avatarBg,
      location: location,
      target: target,
      text: text.trim(),
      tag: tag,
      timestamp: Date.now(),
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, "study_lounge_chat"), messageData);
    return { id: docRef.id, ...messageData };
  } catch (err) {
    console.error("Error sending chat message:", err);
    throw err;
  }
};

// 14. Real-time Subscription to Live Study Lounge Chat
export const subscribeToChatMessages = (onMessagesUpdate) => {
  if (!isFirebaseConfigured || !db) return () => {};

  try {
    const chatQuery = query(
      collection(db, "study_lounge_chat"),
      orderBy("timestamp", "desc"),
      limit(60)
    );

    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const messages = [];
      snapshot.forEach((docSnap) => {
        messages.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      // Reverse to chronological order (oldest -> newest for chat display)
      messages.reverse();
      onMessagesUpdate(messages);
    }, (err) => {
      console.error("Chat subscription error:", err);
    });

    return unsubscribe;
  } catch (err) {
    console.error("Failed to initialize chat listener:", err);
    return () => {};
  }
};


