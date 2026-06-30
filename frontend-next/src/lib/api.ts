export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function reviewDocument(text: string, forceMode?: 'demo') {
  const payload: Record<string, string> = { documentText: text };
  if (forceMode === 'demo') {
    payload.forceMode = 'demo';
  }

  const res = await fetch(`${API_BASE_URL}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }

  return res.json();
}

export async function uploadDocument(file: File, forceMode?: 'demo') {
  const formData = new FormData();
  formData.append('document', file);
  if (forceMode === 'demo') {
    formData.append('forceMode', 'demo');
  }

  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Upload error: ${res.statusText}`);
  }

  return res.json();
}
