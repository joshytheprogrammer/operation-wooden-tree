import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'

export const useTrees = () => {
  const db = useFirestore()
  const trees = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchTrees = async () => {
    try {
      loading.value = true
      error.value = null
      const querySnapshot = await getDocs(collection(db, 'trees'))
      trees.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (err) {
      error.value = err.message
      console.error('Error fetching trees:', err)
    } finally {
      loading.value = false
    }
  }

  const deleteTree = async (treeId) => {
    try {
      loading.value = true
      await deleteDoc(doc(db, 'trees', treeId))
      trees.value = trees.value.filter(tree => tree.id !== treeId)
    } catch (err) {
      error.value = err.message
      console.error('Error deleting tree:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch trees on composable call
  fetchTrees()

  return { trees, loading, error, deleteTree }
}