// contexts/AuthContext.js
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
  reload
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    console.log('🔍 AuthContext: Setting up onAuthStateChanged listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔍 AuthContext: Auth state changed:', user ? `User ${user.uid}` : 'No user');
      
      if (user) {
        // Reload user to get latest verification status
        await reload(user);
        console.log('🔍 AuthContext: User reloaded, setting user data');
        
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          phoneNumber: user.phoneNumber,
        };
        
        setUser(userData);
        console.log('🔍 AuthContext: User state set, now fetching profile');

        // Fetch user profile from Firestore with retry logic
        const maxRetries = 3;
        let retryCount = 0;
        
        const fetchUserProfile = async () => {
          console.log(`🔍 AuthContext: Fetching user profile (attempt ${retryCount + 1})`);
          
          try {
            // Wait a bit for auth token to propagate
            if (retryCount > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
            
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              console.log('✅ AuthContext: User profile fetched successfully');
              const userData = userDoc.data();
              console.log('🔍 AuthContext: Raw user data from Firestore:', userData);
              
              // Check if data is nested under userData
              if (userData.userData) {
                console.log('🔍 AuthContext: Found nested userData, extracting...');
                const nestedData = userData.userData;
                const flatProfile = {
                  uid: user.uid,
                  email: userData.email || nestedData.email || user.email,
                  displayName: nestedData.displayName || userData.displayName || user.displayName,
                  accountType: nestedData.accountType || userData.accountType || '',
                  firstName: nestedData.firstName || userData.firstName,
                  lastName: nestedData.lastName || userData.lastName,
                  companyName: nestedData.companyName || userData.companyName || '',
                  npwp: nestedData.npwp || userData.npwp || '',
                  phoneNumber: nestedData.phoneNumber || userData.phoneNumber || user.phoneNumber,
                  userType: nestedData.userType || userData.userType || '',
                  emailVerified: userData.emailVerified || user.emailVerified,
                  phoneVerified: userData.phoneVerified || false,
                  profileComplete: userData.profileComplete || true,
                  createdAt: userData.createdAt,
                  updatedAt: userData.updatedAt,
                  status: userData.status || 'active'
                };
                console.log('🔍 AuthContext: Flattened profile data:', flatProfile);
                console.log('🔍 AuthContext: Final userType:', flatProfile.userType);
                setUserProfile(flatProfile);
              } else {
                // Data is already flat
                console.log('🔍 AuthContext: Using flat data structure:', userData);
                console.log('🔍 AuthContext: userType from flat data:', userData.userType);
                setUserProfile(userData);
              }
              return true;
            } else {
              console.warn('AuthContext: User profile document does not exist for:', user.uid);
              
              // Try to fetch from email-verifications collection
              console.log('AuthContext: Checking email-verifications collection...');
              try {
                const emailVerificationDoc = await getDoc(doc(db, 'email-verifications', user.email));
                if (emailVerificationDoc.exists()) {
                  console.log('AuthContext: Found user data in email-verifications collection');
                  const verificationData = emailVerificationDoc.data();
                  console.log('AuthContext: Email verification data:', verificationData);
                  
                  if (verificationData.userData) {
                    const userData = verificationData.userData;
                    const profile = {
                      uid: user.uid,
                      email: userData.email || user.email,
                      displayName: userData.displayName || user.displayName,
                      firstName: userData.firstName,
                      lastName: userData.lastName,
                      phoneNumber: userData.phoneNumber || user.phoneNumber,
                      userType: userData.userType || '',
                      companyName: userData.companyName || '',
                      emailVerified: verificationData.verified || user.emailVerified,
                      phoneVerified: false,
                      profileComplete: true,
                      createdAt: verificationData.createdAt,
                      updatedAt: verificationData.verifiedAt,
                      status: 'active'
                    };
                    console.log('AuthContext: Profile from email-verifications:', profile);
                    setUserProfile(profile);
                    
                    // Also save to users collection for future use
                    try {
                      await setDoc(doc(db, 'users', user.uid), profile);
                      console.log('AuthContext: Saved profile to users collection');
                    } catch (saveError) {
                      console.warn('AuthContext: Failed to save profile to users collection:', saveError);
                    }
                    
                    return true;
                  }
                }
              } catch (emailVerificationError) {
                console.warn('AuthContext: Failed to fetch from email-verifications:', emailVerificationError);
              }
              
              // Try to create a basic profile if document doesn't exist
              try {
                const basicProfile = {
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName || '',
                  firstName: user.displayName?.split(' ')[0] || '',
                  lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
                  phoneNumber: user.phoneNumber || '',
                  userType: '',
                  companyName: '',
                  emailVerified: user.emailVerified,
                  phoneVerified: false,
                  profileComplete: false,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                  status: 'active'
                };
                
                await setDoc(doc(db, 'users', user.uid), basicProfile);
                setUserProfile(basicProfile);
                console.log('Created basic user profile for existing user');
                return true;
              } catch (createError) {
                console.error('Failed to create basic profile:', createError);
                // Set basic profile in state without Firestore
                setUserProfile({
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName || '',
                  emailVerified: user.emailVerified,
                  phoneVerified: false,
                  profileComplete: false,
                  userType: ''
                });
                return false;
              }
            }
          } catch (error) {
            console.error(`Error fetching user profile (attempt ${retryCount + 1}):`, error);
            
            if (error.code === 'permission-denied') {
              // If direct Firestore access fails, try API fallback
              try {
                console.log('Trying API fallback for user profile...');
                const response = await fetch(`/api/user/profile?userId=${user.uid}`);
                if (response.ok) {
                  const profileData = await response.json();
                  setUserProfile(profileData.user);
                  console.log('Successfully fetched profile via API');
                  return true;
                } else if (response.status === 404) {
                  // User doesn't exist in Firestore, create via API
                  console.log('User not found, creating profile via API...');
                  const createResponse = await fetch('/api/user/update-profile', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      userId: user.uid,
                      email: user.email,
                      displayName: user.displayName || '',
                      firstName: user.displayName?.split(' ')[0] || '',
                      lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
                      phoneNumber: user.phoneNumber || '',
                      userType: '',
                      companyName: '',
                      emailVerified: user.emailVerified,
                      phoneVerified: false,
                      profileComplete: false,
                      status: 'active'
                    }),
                  });
                  
                  if (createResponse.ok) {
                    const createData = await createResponse.json();
                    setUserProfile(createData.user);
                    console.log('Successfully created profile via API');
                    return true;
                  }
                }
              } catch (apiError) {
                console.error('API fallback also failed:', apiError);
              }
              
              if (retryCount < maxRetries) {
                retryCount++;
                console.log(`Retrying user profile fetch in ${retryCount} second(s)...`);
                setTimeout(fetchUserProfile, 1000 * retryCount);
                return false;
              }
              
              // Set basic profile if all else fails
              console.warn('All profile fetch attempts failed, setting basic profile');
              setUserProfile({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || '',
                emailVerified: user.emailVerified,
                phoneVerified: false,
                profileComplete: false,
                userType: ''
              });
            }
            
            return false;
          }
        };
        
        await fetchUserProfile();
        console.log('🔍 AuthContext: Profile fetch completed, setting loading to false');
      } else {
        console.log('🔍 AuthContext: No user, clearing state');
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
      console.log('🔍 AuthContext: Loading state set to false');
    });

    return () => unsubscribe();
  }, []);

  // Enhanced Sign Up with user data saving
  const signUp = async (userData) => {
    console.log('AuthContext signUp called with userData:', userData);
    const { email, password, accountType, firstName, lastName, companyName, npwp, phoneNumber, userType } = userData;
    console.log('Extracted userType:', userType);
    console.log('Extracted accountType:', accountType);
    
    let userCredential = null;
    
    try {
      // Create user with email and password
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create display name based on account type
      const displayName = accountType === 'individu' 
        ? `${firstName} ${lastName}` 
        : companyName;

      // Update user profile
      await updateProfile(user, {
        displayName: displayName
      });

      // Wait a moment to ensure the user is fully authenticated
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save user data to Firestore
      try {
        const userDataToSave = {
          uid: user.uid,
          email: email,
          accountType: accountType, // 'individu' or 'perusahaan'
          firstName: accountType === 'individu' ? firstName : '',
          lastName: accountType === 'individu' ? lastName : '',
          companyName: accountType === 'perusahaan' ? companyName : '',
          npwp: accountType === 'perusahaan' ? npwp : '',
          displayName: displayName,
          phoneNumber: phoneNumber || '',
          userType: userType, // 'project-owner' or 'vendor'
          emailVerified: false,
          phoneVerified: false,
          profileComplete: true, // Set to true since we have all required data
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'active'
        };
        console.log('AuthContext signUp - Saving user data to Firestore:', userDataToSave);
        await setDoc(doc(db, 'users', user.uid), userDataToSave);
        console.log('AuthContext signUp - User document saved successfully to Firestore');
      } catch (firestoreError) {
        console.error('Failed to save user document to Firestore:', firestoreError);
        // Continue with the signup process even if Firestore save fails
        // The verify-otp route will create the document when needed
      }

      // Note: We use custom OTP verification instead of Firebase's default email verification
      // Custom OTP is handled in the signup page component
      
      return { user, needsEmailVerification: true };
    } catch (error) {
      console.error('Signup error:', error);
      
      // If Firestore save fails but user was created, still return the user
      if (userCredential && userCredential.user && 
          (error.code === 'permission-denied' || error.code === 'insufficient-permissions')) {
        console.warn('User created but profile data could not be saved to Firestore');
        
        // Note: Custom OTP verification is handled in the signup page component
        // We don't send Firebase's default email verification
        
        return { user: userCredential.user, needsEmailVerification: true, profileSaveError: true };
      }
      
      throw error;
    }
  };

  // Email/Password Sign In
  const signIn = async (email, password) => {
    console.log('AuthContext signIn called with email:', email);
    
    try {
      console.log('Attempting Firebase signInWithEmailAndPassword...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase sign in successful:', userCredential.user.uid);
      
      // Wait a moment for the auth state to fully propagate
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force token refresh to ensure we have proper permissions
      if (userCredential.user) {
        try {
          console.log('Refreshing auth token...');
          await userCredential.user.getIdToken(true);
          console.log('Token refresh successful');
        } catch (tokenError) {
          console.warn('Token refresh failed, but sign-in succeeded:', tokenError);
        }
      }
      
      console.log('Sign in completed successfully');
      return userCredential;
    } catch (error) {
      console.error('Sign in error in AuthContext:', error);
      throw error;
    }
  };

  // Google Sign In with data saving
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Try to check if user exists in Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
          // New user - save their data via API to avoid permission issues
          const [firstName, lastName] = user.displayName?.split(' ') || ['', ''];
          
          const profileData = {
            uid: user.uid,
            email: user.email,
            firstName: firstName,
            lastName: lastName || '',
            displayName: user.displayName,
            photoURL: user.photoURL,
            phoneNumber: user.phoneNumber || '',
            userType: '', // Will be set later
            companyName: '',
            emailVerified: user.emailVerified,
            phoneVerified: false,
            profileComplete: false,
            status: 'active',
            provider: 'google'
          };

          try {
            await setDoc(doc(db, 'users', user.uid), profileData);
            console.log('Google user profile saved directly to Firestore');
          } catch (firestoreError) {
            console.error('Direct Firestore save failed, using API:', firestoreError);
            
            // Fallback to API
            const response = await fetch('/api/user/update-profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(profileData),
            });

            if (!response.ok) {
              console.error('API profile creation also failed');
            } else {
              console.log('Google user profile saved via API');
            }
          }
        } else {
          // Existing user - update last login via API
          try {
            await updateDoc(doc(db, 'users', user.uid), {
              lastLoginAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          } catch (updateError) {
            console.error('Failed to update last login, using API:', updateError);
            
            // Use API fallback for updating login time
            await fetch('/api/user/update-profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: user.uid,
                lastLoginAt: new Date(),
              }),
            });
          }
        }
      } catch (error) {
        console.error('Error checking/creating Google user profile:', error);
        // Continue with sign-in even if profile creation fails
        // The profile will be created/fetched later in the auth state listener
      }

      return result;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  // Phone verification setup
  const setupRecaptcha = async (containerId) => {
    try {
      console.log(`Setting up reCAPTCHA for container: ${containerId}`);
      
      // Clear existing reCAPTCHA if any
      if (window.recaptchaVerifier) {
        console.log('Clearing existing reCAPTCHA...');
        try {
          window.recaptchaVerifier.clear();
        } catch (clearError) {
          console.warn('Error clearing existing reCAPTCHA:', clearError);
        }
        window.recaptchaVerifier = null;
      }
      
      // Wait a bit for DOM to be ready if needed
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Ensure container exists
      const container = document.getElementById(containerId);
      if (!container) {
        console.error(`Container with ID '${containerId}' not found in DOM`);
        console.log('Available elements with id:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
        throw new Error(`Container with ID '${containerId}' not found. Please try again.`);
      }
      
      console.log('Container found:', container);
      
      // Clear container content
      container.innerHTML = '';
      
      // Check if we're in development and Firebase auth is properly configured
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode - ensuring Firebase is ready');
        
        // Check if Firebase auth is ready
        if (!auth || !auth.app) {
          throw new Error('Firebase auth not properly initialized');
        }
        
        console.log('Firebase auth domain:', auth.app.options.authDomain);
      }
      
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'normal',
        callback: (response) => {
          console.log('reCAPTCHA solved successfully');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired, please refresh');
        },
        'error-callback': (error) => {
          console.error('reCAPTCHA error callback:', error);
        }
      });
      
      console.log('reCAPTCHA verifier created, attempting to render...');
      
      // Render the reCAPTCHA with error handling
      try {
        await window.recaptchaVerifier.render();
        console.log('reCAPTCHA rendered successfully');
      } catch (renderError) {
        console.error('reCAPTCHA render error:', renderError);
        
        // Clean up and re-throw with more context
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
          } catch (clearError) {
            console.warn('Error clearing failed reCAPTCHA:', clearError);
          }
          window.recaptchaVerifier = null;
        }
        
        throw new Error(`Failed to render reCAPTCHA: ${renderError.message}. Please check Firebase configuration.`);
      }
      
      console.log('reCAPTCHA setup complete');
      return window.recaptchaVerifier;
    } catch (error) {
      console.error('reCAPTCHA setup error:', error);
      
      // Clean up on any error
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (clearError) {
          console.warn('Error clearing reCAPTCHA during error handling:', clearError);
        }
        window.recaptchaVerifier = null;
      }
      
      throw error;
    }
  };

  // Send phone verification code
  const sendPhoneVerification = async (phoneNumber) => {
    try {
      // Check if we're in development mode and phone auth isn't configured
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_FIREBASE_PHONE_AUTH_DISABLED === 'true') {
        console.log('Development mode: Simulating phone verification for', phoneNumber);
        // Return a mock confirmation result for development
        return {
          confirm: async (code) => {
            if (code === '123456') {
              return { user: auth.currentUser };
            } else {
              throw new Error('Invalid verification code. Use 123456 for testing.');
            }
          }
        };
      }

      if (!window.recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized');
      }
      
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      return confirmationResult;
    } catch (error) {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      
      // Check if it's a Firebase configuration error
      if (error.code === 'auth/invalid-app-credential' || 
          error.code === 'auth/missing-app-credential' ||
          error.message?.includes('invalid-app-credential')) {
        throw new Error('FIREBASE_PHONE_AUTH_NOT_CONFIGURED');
      }
      
      throw error;
    }
  };

  // Verify phone number with code (enhanced for signup flow)
  const verifyPhoneCode = async (confirmationResult, code) => {
    try {
      const result = await confirmationResult.confirm(code);
      
      // Update user's phone verification status in Firestore
      if (result.user) {
        await updateDoc(doc(db, 'users', result.user.uid), {
          phoneVerified: true,
          phoneNumber: result.user.phoneNumber,
          updatedAt: serverTimestamp()
        });

        // Refresh user profile
        const updatedDoc = await getDoc(doc(db, 'users', result.user.uid));
        if (updatedDoc.exists()) {
          setUserProfile(updatedDoc.data());
        }
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Verify phone during signup (without linking to auth)
  const verifyPhoneForSignup = async (confirmationResult, code) => {
    try {
      // Just verify the code is correct
      const result = await confirmationResult.confirm(code);
      
      // Update current user's phone verification status
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          phoneVerified: true,
          updatedAt: serverTimestamp()
        });

        // Refresh user profile
        const updatedDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (updatedDoc.exists()) {
          setUserProfile(updatedDoc.data());
        }
      }
      
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Phone verification error:', error);
      throw error;
    }
  };

  // Add phone number to existing user
  const addPhoneNumber = async (phoneNumber, verificationCode, confirmationResult) => {
    try {
      const credential = await confirmationResult.confirm(verificationCode);
      
      // Update user profile in Firestore
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        phoneNumber: phoneNumber,
        phoneVerified: true,
        updatedAt: serverTimestamp()
      });

      return credential;
    } catch (error) {
      throw error;
    }
  };

  // Resend OTP verification (using custom OTP system)
  const resendEmailVerification = async () => {
    if (auth.currentUser) {
      // Call our custom OTP API
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: auth.currentUser.email,
          userId: auth.currentUser.uid
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend OTP');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      return true;
    }
    throw new Error('No user logged in');
  };

  // Verify custom OTP
  const verifyCustomOTP = async (otp) => {
    if (!auth.currentUser) {
      throw new Error('No user logged in');
    }

    try {
      // Call our custom OTP verification API
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: auth.currentUser.email,
          otp: otp,
          userId: auth.currentUser.uid
        }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Invalid OTP');
      }

      // Refresh user's Firebase Auth token to ensure they have proper access
      try {
        await auth.currentUser.reload();
        await auth.currentUser.getIdToken(true); // Force refresh token
        
        // Add a small delay to ensure server-side document creation is complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Use API endpoint to get verification status instead of direct Firestore access
        const statusResponse = await fetch(`/api/auth/verification-status?userId=${auth.currentUser.uid}`);
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          
          if (statusData.exists) {
            // Update profile with server data
            setUserProfile({
              uid: auth.currentUser.uid,
              email: auth.currentUser.email,
              displayName: statusData.displayName || auth.currentUser.displayName || '',
              emailVerified: statusData.emailVerified,
              phoneVerified: statusData.phoneVerified,
              profileComplete: statusData.profileComplete,
              userType: statusData.userType,
              phoneNumber: statusData.phoneNumber
            });
          } else {
            // If document doesn't exist yet, create a basic profile
            const basicProfile = {
              uid: auth.currentUser.uid,
              email: auth.currentUser.email,
              emailVerified: true,
              displayName: auth.currentUser.displayName || '',
              profileComplete: false
            };
            setUserProfile(basicProfile);
          }
        } else {
          throw new Error('Failed to fetch verification status');
        }
      } catch (profileError) {
        console.warn('Could not refresh user profile, but OTP verification succeeded:', profileError);
        // Don't throw error since OTP verification was successful
        // Just set basic verified status
        if (userProfile) {
          setUserProfile({
            ...userProfile,
            emailVerified: true
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      // Update Firebase Auth profile if display name changed
      if (profileData.displayName) {
        await updateProfile(user, {
          displayName: profileData.displayName
        });
      }

      try {
        // Try to update Firestore profile directly
        await updateDoc(doc(db, 'users', user.uid), {
          ...profileData,
          updatedAt: serverTimestamp()
        });

        // Refresh user profile
        const updatedDoc = await getDoc(doc(db, 'users', user.uid));
        if (updatedDoc.exists()) {
          setUserProfile(updatedDoc.data());
        }
      } catch (firestoreError) {
        console.error('Direct Firestore update failed, trying API:', firestoreError);
        
        // Fallback to API update
        const response = await fetch('/api/user/update-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.uid,
            ...profileData
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update profile via API');
        }

        const result = await response.json();
        if (result.success && result.user) {
          setUserProfile(result.user);
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // Set user type (for dashboard selection)
  const setUserType = async (userType) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      // Update user profile with the selected type
      await updateUserProfile({ 
        userType,
        profileComplete: true 
      });

      return true;
    } catch (error) {
      console.error('Error setting user type:', error);
      throw error;
    }
  };

  // Check email verification status
  const checkEmailVerification = async () => {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      
      if (auth.currentUser.emailVerified && userProfile && !userProfile.emailVerified) {
        // Update Firestore when email gets verified
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          emailVerified: true,
          updatedAt: serverTimestamp()
        });
        
        // Refresh user profile
        const updatedDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        setUserProfile(updatedDoc.data());
      }
      
      return auth.currentUser.emailVerified;
    }
    return false;
  };

  // Logout
  const logout = async () => {
    try {
      setUser(null);
      setUserProfile(null);
      
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  // Manual refresh user profile function
  const refreshUserProfile = async () => {
    if (!auth.currentUser) {
      console.warn('No authenticated user to refresh profile for');
      return;
    }

    try {
      // Try direct Firestore access first
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
        return true;
      }
    } catch (error) {
      console.error('Direct profile fetch failed, trying API:', error);
      
      // Fallback to API
      try {
        const response = await fetch(`/api/user/profile?userId=${auth.currentUser.uid}`);
        if (response.ok) {
          const profileData = await response.json();
          setUserProfile(profileData.user);
          return true;
        }
      } catch (apiError) {
        console.error('API profile fetch also failed:', apiError);
      }
    }
    
    return false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      signIn,
      signUp,
      signInWithGoogle,
      setupRecaptcha,
      sendPhoneVerification,
      verifyPhoneCode,
      verifyPhoneForSignup,
      addPhoneNumber,
      resendEmailVerification,
      verifyCustomOTP,
      updateUserProfile,
      setUserType,
      checkEmailVerification,
      logout,
      loading,
      refreshUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
