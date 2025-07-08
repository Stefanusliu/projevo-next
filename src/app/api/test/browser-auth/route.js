// Endpoint to check current browser authentication state
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    console.log('\n🔍 === BROWSER AUTH STATE CHECK ===');
    
    // Get the authorization header or any cookies
    const authHeader = request.headers.get('authorization');
    const cookieStore = cookies();
    
    console.log('Authorization header:', authHeader || 'None');
    console.log('Cookies:', cookieStore.getAll());
    
    // Get URL for context
    const url = new URL(request.url);
    console.log('Request from:', url.origin);
    
    return NextResponse.json({
      authHeader: authHeader || null,
      cookies: cookieStore.getAll(),
      message: 'Browser auth state check completed',
      note: 'This endpoint cannot access Firebase Auth directly, but shows request context'
    });
    
  } catch (error) {
    console.error('Browser auth state check error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { action } = await request.json();
    
    if (action === 'clear-storage') {
      console.log('🧹 Clearing browser storage simulation...');
      
      // This is just for logging - we can't actually clear browser storage from server
      console.log('Note: Browser storage cannot be cleared from server-side');
      console.log('To clear storage, use browser DevTools: Application > Storage > Clear');
      
      return NextResponse.json({
        message: 'Storage clear simulation completed',
        instructions: [
          'Open browser DevTools',
          'Go to Application tab',
          'Click Storage in left sidebar',
          'Click "Clear site data"',
          'Or manually clear localStorage and sessionStorage'
        ]
      });
    }
    
    return NextResponse.json({
      message: 'Unknown action',
      supportedActions: ['clear-storage']
    });
    
  } catch (error) {
    console.error('Browser auth action error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
