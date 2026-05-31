/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { UserProfile, Task, Target, StudyGuide, CoinHistory, EmailLog } from './types';

export function useStudyQuestState() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [guides, setGuides] = useState<StudyGuide[]>([]);
  const [coinLog, setCoinLog] = useState<CoinHistory[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [customSubjects, setCustomSubjects] = useState<string[]>(['Mathematics', 'Physics', 'Chemistry', 'Biology']);

  // 1. Listen for authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (!authUser) {
        setProfile(null);
        setTasks([]);
        setTargets([]);
        setGuides([]);
        setCoinLog([]);
        setEmailLogs([]);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // 2. Load Firestore Data when authenticated
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const uid = user.uid;

    // A. Profile Listener
    const profileRef = doc(db, 'users', uid);
    const unsubProfile = onSnapshot(profileRef, async (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setProfile(data);
        if (data.gmail) {
          // If custom subjects are stored on user, update them. Let's merge standard subjects
        }
      } else {
        // Create initial default profile
        const newProfile: UserProfile = {
          uid,
          displayName: user.displayName || 'Hero Student',
          totalCoins: 100, // starting gift
          streak: 1,
          gmail: user.email || '',
          reminderTimes: ['08:00 AM'],
          remindersEnabled: true,
          recentInsights: 'No insights generated yet. Click "Analyze" on the dashboard to start!',
          createdAt: new Date().toISOString()
        };
        try {
          await setDoc(profileRef, newProfile);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    });

    // B. Tasks Listener
    const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', uid));
    const unsubTasks = onSnapshot(tasksQuery, (snap) => {
      const list: Task[] = [];
      snap.forEach((doc) => {
        list.push({ ...doc.data(), id: doc.id } as Task);
      });
      setTasks(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tasks');
    });

    // C. Targets Listener
    const targetsQuery = query(collection(db, 'targets'), where('userId', '==', uid));
    const unsubTargets = onSnapshot(targetsQuery, (snap) => {
      const list: Target[] = [];
      snap.forEach((doc) => {
        list.push({ ...doc.data(), id: doc.id } as Target);
      });
      setTargets(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'targets');
    });

    // D. Study Guides Listener
    const guidesQuery = query(collection(db, 'studyGuides'), where('userId', '==', uid));
    const unsubGuides = onSnapshot(guidesQuery, (snap) => {
      const list: StudyGuide[] = [];
      snap.forEach((doc) => {
        list.push({ ...doc.data(), id: doc.id } as StudyGuide);
      });
      setGuides(list.sort((a, b) => a.subject.localeCompare(b.subject)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'studyGuides');
    });

    // E. Coin History Listener
    const coinQuery = query(collection(db, 'coinHistory'), where('userId', '==', uid));
    const unsubCoins = onSnapshot(coinQuery, (snap) => {
      const list: CoinHistory[] = [];
      snap.forEach((doc) => {
        list.push({ ...doc.data(), id: doc.id } as CoinHistory);
      });
      setCoinLog(list.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'coinHistory');
    });

    // F. Email Logs Listener
    const emailsQuery = query(collection(db, 'emailLogs'), where('userId', '==', uid));
    const unsubEmails = onSnapshot(emailsQuery, (snap) => {
      const list: EmailLog[] = [];
      snap.forEach((doc) => {
        list.push({ ...doc.data(), id: doc.id } as EmailLog);
      });
      setEmailLogs(list.sort((a, b) => b.sentAt.localeCompare(a.sentAt)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'emailLogs');
    });

    return () => {
      unsubProfile();
      unsubTasks();
      unsubTargets();
      unsubGuides();
      unsubCoins();
      unsubEmails();
    };
  }, [user]);

  // ==========================================
  // ACTIONS / MUTATIONS
  // ==========================================

  // Update Profile Info
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;
    const profileRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(profileRef, updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  // Add a manually registered custom subject
  const addSubject = (subject: string) => {
    if (!customSubjects.includes(subject)) {
      setCustomSubjects([...customSubjects, subject]);
    }
  };

  // Create Task
  const createTask = async (name: string, subject: string, coins: number) => {
    if (!user) return;
    const taskId = 'task_' + Math.random().toString(36).substring(2, 11);
    const taskDoc: Task = {
      id: taskId,
      userId: user.uid,
      name,
      subject,
      coins,
      completed: false,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'tasks', taskId), taskDoc);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `tasks/${taskId}`);
    }
  };

  // Complete Task and Record Coins
  const completeTask = async (taskId: string) => {
    if (!user || !profile) return;
    const taskToComplete = tasks.find(t => t.id === taskId);
    if (!taskToComplete || taskToComplete.completed) return;

    try {
      // 1. Update task to completed
      await updateDoc(doc(db, 'tasks', taskId), {
        completed: true,
        completedAt: new Date().toISOString()
      });

      // 2. Add history log
      const histId = 'coin_' + Math.random().toString(36).substring(2, 11);
      const logEntry: CoinHistory = {
        id: histId,
        userId: user.uid,
        taskName: taskToComplete.name,
        coinsEarned: taskToComplete.coins,
        timestamp: new Date().toISOString()
      };
      await setDoc(doc(db, 'coinHistory', histId), logEntry);

      // 3. Update User profile with total coins & streak multiplier check
      const newTotal = profile.totalCoins + taskToComplete.coins;
      await updateDoc(doc(db, 'users', user.uid), {
        totalCoins: newTotal
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `tasks/${taskId}`);
    }
  };

  // Delete Task
  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tasks/${taskId}`);
    }
  };

  // Create Target
  const createTarget = async (title: string, dueDate: string) => {
    if (!user) return;
    const targetId = 'target_' + Math.random().toString(36).substring(2, 11);
    const targetDoc: Target = {
      id: targetId,
      userId: user.uid,
      title,
      dueDate,
      progress: 0,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'targets', targetId), targetDoc);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `targets/${targetId}`);
    }
  };

  // Update Target Progress
  const updateTargetProgress = async (targetId: string, progress: number) => {
    try {
      await updateDoc(doc(db, 'targets', targetId), { progress });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `targets/${targetId}`);
    }
  };

  // Update Target Week Breakdown
  const updateTargetBreakdown = async (targetId: string, breakdown: any[]) => {
    try {
      await updateDoc(doc(db, 'targets', targetId), { weekBreakdown: breakdown });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `targets/${targetId}`);
    }
  };

  // Delete Target
  const deleteTarget = async (targetId: string) => {
    try {
      await deleteDoc(doc(db, 'targets', targetId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `targets/${targetId}`);
    }
  };

  // Sync Study Guide
  const saveStudyGuide = async (subject: string, content: string, icon?: string) => {
    if (!user) return;
    
    // Find if subject study guide already exists
    const existingGuide = guides.find(g => g.subject.toLowerCase() === subject.toLowerCase());
    
    if (existingGuide) {
      try {
        await updateDoc(doc(db, 'studyGuides', existingGuide.id), {
          content,
          icon: icon || existingGuide.icon || 'Book',
          lastUpdated: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `studyGuides/${existingGuide.id}`);
      }
    } else {
      const guideId = 'guide_' + Math.random().toString(36).substring(2, 11);
      const newGuide: StudyGuide = {
        id: guideId,
        userId: user.uid,
        subject,
        content,
        icon: icon || 'Book',
        lastUpdated: new Date().toISOString()
      };
      try {
        await setDoc(doc(db, 'studyGuides', guideId), newGuide);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `studyGuides/${guideId}`);
      }
    }
  };

  // Delete Study Guide
  const deleteStudyGuide = async (guideId: string) => {
    try {
      await deleteDoc(doc(db, 'studyGuides', guideId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `studyGuides/${guideId}`);
    }
  };

  // Create Email Log (for simulated/sent daily digests)
  const addEmailLog = async (subject: string, body: string, recipient: string) => {
    if (!user) return;
    const logId = 'log_' + Math.random().toString(36).substring(2, 11);
    const logEntry: EmailLog = {
      id: logId,
      userId: user.uid,
      recipientEmail: recipient,
      subject,
      body,
      sentAt: new Date().toISOString(),
      status: 'Simulated'
    };
    try {
      await setDoc(doc(db, 'emailLogs', logId), logEntry);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `emailLogs/${logId}`);
    }
  };

  return {
    user,
    loading,
    profile,
    tasks,
    targets,
    guides,
    coinLog,
    emailLogs,
    customSubjects,
    addSubject,
    updateProfile,
    createTask,
    completeTask,
    deleteTask,
    createTarget,
    updateTargetProgress,
    updateTargetBreakdown,
    deleteTarget,
    saveStudyGuide,
    deleteStudyGuide,
    addEmailLog
  };
}
export type StudyQuestState = ReturnType<typeof useStudyQuestState>;
