// /composables/useTree.ts
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'

export const useTree = (treeId) => {
  const db = useFirestore()
  const tree = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Default tree structure
  const defaultTree = {
    name: '',
    slug: '',
    styles: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      buttonBackgroundColor: '#4f46e5',
      buttonTextColor: '#ffffff',
      fontFamily: 'sans-serif'
    },
    logoUrl: '',
    createdAt: null,
    updatedAt: null,
    createdBy: ''
  }

  // Fetch tree data
  const fetchTree = async () => {
    try {
      loading.value = true
      error.value = null
      
      const docRef = doc(db, 'trees', treeId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        tree.value = { ...defaultTree, ...docSnap.data() }
      } else {
        error.value = 'Tree not found'
        tree.value = { ...defaultTree }
      }
    } catch (err) {
      error.value = err.message
      console.error('Error fetching tree:', err)
      tree.value = { ...defaultTree }
    } finally {
      loading.value = false
    }
  }

  // Update tree data
  const updateTree = async (treeData) => {
    try {
      loading.value = true
      error.value = null
      
      const docRef = doc(db, 'trees', treeId)
      await updateDoc(docRef, {
        ...treeData,
        updatedAt: new Date()
      })

      return true
    } catch (err) {
      error.value = err.message
      console.error('Error updating tree:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Initialize
  fetchTree()

  return { tree, loading, error, updateTree }
}