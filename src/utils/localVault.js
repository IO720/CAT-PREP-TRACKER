/**
 * File System Access API Utility for Local Vault Folder Storage
 * Allows saving notes directly to a real local folder on the user's PC.
 */

const DB_NAME = 'catalyze_vault_db';
const STORE_NAME = 'vault_handles';

function openVaultDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB not supported'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function isFileSystemSupported() {
  return typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function';
}

export async function saveVaultDirectoryHandle(handle) {
  try {
    const db = await openVaultDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(handle, 'active_vault_handle');
    return new Promise(resolve => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('Could not store directory handle in IndexedDB', err);
    return false;
  }
}

export async function getSavedVaultDirectoryHandle() {
  try {
    const db = await openVaultDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get('active_vault_handle');
    return new Promise(resolve => {
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function pickVaultDirectory() {
  if (!isFileSystemSupported()) {
    throw new Error('File System Access API is not supported in this browser. Please use Chrome, Edge, or Brave.');
  }
  const dirHandle = await window.showDirectoryPicker({
    mode: 'readwrite',
    startIn: 'documents'
  });
  await saveVaultDirectoryHandle(dirHandle);
  return dirHandle;
}

export async function verifyPermission(dirHandle, readWrite = true) {
  const options = {};
  if (readWrite) {
    options.mode = 'readwrite';
  }
  if ((await dirHandle.queryPermission(options)) === 'granted') {
    return true;
  }
  if ((await dirHandle.requestPermission(options)) === 'granted') {
    return true;
  }
  return false;
}

export async function writeVaultFile(dirHandle, fileName, content) {
  const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

export async function readVaultFile(dirHandle, fileName) {
  try {
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: false });
    const file = await fileHandle.getFile();
    return await file.text();
  } catch (e) {
    return null;
  }
}
