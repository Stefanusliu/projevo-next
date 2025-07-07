// app/api/projects/route.js
import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '../../../lib/firebase-admin';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Get projects for the authenticated user
    const projectsRef = adminDb.collection('projects');
    const snapshot = await projectsRef
      .where('owner', '==', decodedToken.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const projects = [];
    snapshot.forEach(doc => {
      projects.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return NextResponse.json({ projects });

  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const { name, description, type, budget } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Create new project
    const projectData = {
      name,
      description: description || '',
      type: type || 'general',
      budget: budget || 0,
      owner: decodedToken.uid,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await adminDb.collection('projects').add(projectData);

    return NextResponse.json({
      success: true,
      projectId: docRef.id,
      project: { id: docRef.id, ...projectData }
    });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
