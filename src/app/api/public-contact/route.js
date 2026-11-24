import contactHandler from '@/lib/public-contact.mjs';

export const runtime = 'nodejs';
export const maxDuration = 30;
export const POST = contactHandler.fetch;
