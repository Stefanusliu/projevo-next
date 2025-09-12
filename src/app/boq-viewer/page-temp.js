'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MdAdd, MdClose, MdDelete, MdDragIndicator, MdFileDownload, MdSave, MdEdit, MdVisibility, MdArrowBack, MdMessage } from 'react-icons/md';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { firestoreService } from '../../hooks/useFirestore';
import { useAuth } from '../../contexts/AuthContext';
