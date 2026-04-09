import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase';

export interface UserProfile {
  displayName: string;
  username: string;
  city: string;
  avatarId: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile>({ displayName: '', username: '', city: '', avatarId: 'slate-minimal' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    getDoc(doc(db, 'users', uid)).then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setProfile({
          displayName: d.fullName || auth.currentUser?.displayName || '',
          username: d.username || '',
          city: d.city || '',
          avatarId: d.avatarId || 'slate-minimal',
        });
      }
      setLoading(false);
    });
  }, []);

  const saveProfile = async (data: UserProfile) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    setSaving(true);
    await setDoc(doc(db, 'users', uid), {
      fullName: data.displayName,
      city: data.city,
      avatarId: data.avatarId,
    }, { merge: true });
    if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: data.displayName });
    setProfile(data);
    setSaving(false);
  };

  return { profile, loading, saving, saveProfile };
};
