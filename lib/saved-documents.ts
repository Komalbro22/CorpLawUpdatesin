export interface SavedDocument {
  id: string
  title: string
  slug: string
  content: string
  createdAt: string
}

const STORAGE_KEY = 'corplaw_saved_docs'

export function saveDocumentLocally(doc: Omit<SavedDocument, 'id' | 'createdAt'>): SavedDocument {
  if (typeof window === 'undefined') return {} as SavedDocument

  const existing = getSavedDocuments()
  const newDoc: SavedDocument = {
    ...doc,
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    createdAt: new Date().toISOString()
  }

  // Keep last 20 documents to prevent blowing up local storage
  const updated = [newDoc, ...existing].slice(0, 20)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  
  return newDoc
}

export function getSavedDocuments(): SavedDocument[] {
  if (typeof window === 'undefined') return []
  
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('Failed to parse saved documents', e)
    return []
  }
}

export function deleteSavedDocument(id: string) {
  if (typeof window === 'undefined') return
  
  const existing = getSavedDocuments()
  const updated = existing.filter(d => d.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}
