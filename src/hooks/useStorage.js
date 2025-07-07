// hooks/useStorage.js
'use client';

import { useState } from 'react';
import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  listAll
} from 'firebase/storage';
import { storage } from '../lib/firebase';

export const useStorage = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  // Upload file with progress tracking
  const uploadFile = async (file, path, options = {}) => {
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const storageRef = ref(storage, path);
      
      if (options.trackProgress) {
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              setError(error.message);
              setUploading(false);
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                setUploading(false);
                setUploadProgress(100);
                resolve(downloadURL);
              } catch (error) {
                setError(error.message);
                setUploading(false);
                reject(error);
              }
            }
          );
        });
      } else {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        setUploading(false);
        return downloadURL;
      }
    } catch (error) {
      setError(error.message);
      setUploading(false);
      throw error;
    }
  };

  // Upload multiple files
  const uploadMultipleFiles = async (files, basePath) => {
    setUploading(true);
    setError(null);

    try {
      const uploadPromises = files.map((file, index) => {
        const fileName = `${Date.now()}_${index}_${file.name}`;
        const path = `${basePath}/${fileName}`;
        return uploadFile(file, path);
      });

      const downloadURLs = await Promise.all(uploadPromises);
      setUploading(false);
      return downloadURLs;
    } catch (error) {
      setError(error.message);
      setUploading(false);
      throw error;
    }
  };

  // Delete file
  const deleteFile = async (path) => {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Get download URL
  const getFileURL = async (path) => {
    try {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // List files in a directory
  const listFiles = async (path) => {
    try {
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);
      
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const downloadURL = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            downloadURL
          };
        })
      );

      return files;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    getFileURL,
    listFiles,
    uploading,
    uploadProgress,
    error
  };
};
