import { useEffect, useState } from 'react';
import { auth, db, storage } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Profile() {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setDisplayName(user?.displayName || '');
    setPhotoURL(user?.photoURL || '');
  }, [user]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
    const task = uploadBytesResumable(storageRef, file);
    setUploading(true);

    task.on('state_changed', (snap) => {
      const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
      setProgress(pct);
    }, (err) => {
      console.error('upload error', err);
      setUploading(false);
    }, async () => {
      const url = await getDownloadURL(task.snapshot.ref);
      setPhotoURL(url);
      setUploading(false);
      setProgress(0);
      // auto-save after upload
      await saveProfile(displayName, url);
    });
  };

  const saveProfile = async (name, photo) => {
    if (!user) return;
    try {
      await updateProfile(user, { displayName: name || null, photoURL: photo || null });

      // also save a small meta doc for the user
      await setDoc(doc(db, 'users', user.uid, 'meta', 'profile'), {
        displayName: name || null,
        photoURL: photo || null,
        updatedAt: serverTimestamp()
      });

      alert('Profile saved');
    } catch (err) {
      console.error('save profile failed', err);
      alert('Failed to save profile');
    }
  };

  return (
    <div className="app-container" style={styles.container}>
      <h1 style={styles.title}>Your profile</h1>

      <div style={styles.card}>
        <div style={{display:'flex', gap:16, alignItems:'center'}}>
          <div style={styles.avatarWrap}>
            {photoURL ? (
              <img src={photoURL} alt="avatar" style={styles.avatar} />
            ) : (
              <div style={styles.placeholder}>{(displayName || user?.email || 'U').slice(0,2).toUpperCase()}</div>
            )}
          </div>

          <div style={{flex:1}}>
            <label style={styles.label}>Display name</label>
            <input style={styles.input} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />

            <label style={{...styles.label, marginTop:12}}>Email</label>
            <div style={{color:'#555'}}>{user?.email || '(anonymous)'}</div>
          </div>
        </div>

        <div style={{marginTop:12, display:'flex', gap:8, alignItems:'center'}}>
          <input type="file" accept="image/*" onChange={handleFile} />
          {uploading && <div style={{fontSize:13}}>Uploading {progress}%</div>}
        </div>

        <div style={{display:'flex', gap:8, justifyContent:'flex-end', marginTop:18}}>
          <button style={styles.ghostBtn} onClick={() => { setDisplayName(user?.displayName || ''); setPhotoURL(user?.photoURL || ''); }}>Reset</button>
          <button style={styles.saveBtn} onClick={() => saveProfile(displayName, photoURL)}>Save</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', padding: 28, fontFamily: 'Inter, system-ui' },
  title: { textAlign: 'center' },
  card: { maxWidth: 720, margin: '18px auto 0', background: '#fff', padding: 18, borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.06)' },
  avatarWrap: { width: 84, height: 84, borderRadius: 12, overflow: 'hidden', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { fontSize: 20, color: '#666', fontWeight: 600 },
  label: { fontSize: 13, color: '#333', marginBottom: 6, display: 'block' },
  input: { width: '100%', padding: 10, borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)' },
  ghostBtn: { border: '1px solid rgba(0,0,0,0.08)', background: '#FFF', padding: '8px 12px', borderRadius: 10, cursor: 'pointer' },
  saveBtn: { border: 'none', background: '#111827', color: '#FFF', padding: '8px 14px', borderRadius: 10, cursor: 'pointer' }
};
