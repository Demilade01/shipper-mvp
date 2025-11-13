import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getUserFromToken } from '@/lib/auth';
import { getAccessTokenCookie } from '@/lib/cookies';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_FILE_TYPES];

/**
 * POST /api/upload
 * Upload a file
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user from token
    const accessToken = await getAccessTokenCookie();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentUser = await getUserFromToken(accessToken);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate file type (handle empty type and check extension as fallback)
    const fileType = file.type || '';
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv'];

    // Check if file type is in allowed list OR if extension is allowed (fallback for files without MIME type)
    const isTypeAllowed = ALLOWED_TYPES.includes(fileType) || (fileExtension && allowedExtensions.includes(fileExtension));

    if (!isTypeAllowed) {
      return NextResponse.json(
        { error: `File type not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')} or extensions: ${allowedExtensions.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = fileExtension || 'bin'; // Use 'bin' as default if no extension
    const fileName = `uploads/${timestamp}-${randomString}.${fileExt}`;

    // Upload file to Vercel Blob Storage
    // Note: FormData.get() returns a Blob in Node.js, which put() accepts directly
    const blob = await put(fileName, file, {
      access: 'public',
      contentType: file.type || 'application/octet-stream',
    });

    // Return blob URL and metadata
    return NextResponse.json({
      url: blob.url,
      name: file.name,
      type: file.type,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    // Return more detailed error message for debugging
    const errorMessage = error?.message || 'Internal server error';
    return NextResponse.json(
      { error: errorMessage, details: error?.stack },
      { status: 500 }
    );
  }
}
