import { collection, doc, addDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot,writeBatch } from 'firebase/firestore'
import { useFirestore } from 'vuefire'

export const useTreeLinks = (treeId) => {
  const db = useFirestore()
  const links = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Fetch links
  const fetchLinks = async () => {
    try {
      loading.value = true
      error.value = null
      
      const q = query(
        collection(db, 'trees', treeId, 'links'),
        orderBy('order')
      )

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        links.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      })

      return unsubscribe
    } catch (err) {
      error.value = err.message
      console.error('Error fetching links:', err)
    } finally {
      loading.value = false
    }
  }

  // Add new link
  const addLink = async (linkData) => {
    try {
      loading.value = true
      error.value = null
      
      // Calculate order (last position)
      const order = links.value.length > 0 
        ? Math.max(...links.value.map(l => l.order)) + 1 
        : 0

      await addDoc(collection(db, 'trees', treeId, 'links'), {
        ...linkData,
        order,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    } catch (err) {
      error.value = err.message
      console.error('Error adding link:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update link
  const updateLink = async (link) => {
    try {
      loading.value = true
      error.value = null
      
      await updateDoc(doc(db, 'trees', treeId, 'links', link.id), {
        ...link,
        updatedAt: new Date()
      })
    } catch (err) {
      error.value = err.message
      console.error('Error updating link:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete link
  const deleteLink = async (linkId) => {
    try {
      loading.value = true
      error.value = null
      
      await deleteDoc(doc(db, 'trees', treeId, 'links', linkId))
    } catch (err) {
      error.value = err.message
      console.error('Error deleting link:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Reorder links
  const reorderLinks = async (updatedLinks) => {
    try {
      loading.value = true
      error.value = null
      
      const batch = writeBatch(db)
      
      updatedLinks.forEach(link => {
        const linkRef = doc(db, 'trees', treeId, 'links', link.id)
        batch.update(linkRef, { order: link.order })
      })
      
      await batch.commit()
    } catch (err) {
      error.value = err.message
      console.error('Error reordering links:', err)
      throw err
    } finally {
      loading.value = false
    }
  }


  // Initialize
  onMounted(fetchLinks)

  return { links, loading, error, addLink, updateLink, deleteLink, reorderLinks }
}