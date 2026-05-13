import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2,9)}`

export const useFamilyStore = create(
  persist(
    (set, get) => ({
      currentFamilyId: null,
      families: [],
      persons: [],
      currentUser: null,

      // family actions
      setCurrentFamily: (id) => set({ currentFamilyId: id }),

      addFamily: (data) => {
        const family = { ...data, id: generateId(), createdAt: new Date().toISOString(), members: [] }
        set((s) => ({ families: [...s.families, family], currentFamilyId: family.id }))
        return family
      },

      updateFamily: (id, updates) => set((s) => ({
        families: s.families.map(f => f.id === id ? { ...f, ...updates } : f)
      })),

      deleteFamily: (id) => set((s) => ({
        families: s.families.filter(f => f.id !== id),
        persons: s.persons.filter(p => p.familyId !== id),
        currentFamilyId: s.currentFamilyId === id ? null : s.currentFamilyId
      })),

      // person actions
      addPerson: (data) => {
        const person = {
          ...data,
          id: generateId(),
          familyId: get().currentFamilyId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((s) => ({ persons: [...s.persons, person] }))
        return person
      },

      updatePerson: (id, updates) => set((s) => ({
        persons: s.persons.map(p =>
          p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        )
      })),

      deletePerson: (id) => set((s) => ({
        // also clear parent references
        persons: s.persons
          .filter(p => p.id !== id)
          .map(p => ({
            ...p,
            fatherId: p.fatherId === id ? null : p.fatherId,
            motherId: p.motherId === id ? null : p.motherId,
            spouseId: p.spouseId === id ? null : p.spouseId,
          }))
      })),

      // user
      setCurrentUser: (user) => set({ currentUser: user }),

      // selectors (computed helpers)
      getPersonsByFamily: (familyId) => get().persons.filter(p => p.familyId === familyId),

      getCurrentPersons: () => {
        const fid = get().currentFamilyId
        return fid ? get().persons.filter(p => p.familyId === fid) : []
      },

      getCurrentFamily: () => {
        const fid = get().currentFamilyId
        return get().families.find(f => f.id === fid) || null
      },
    }),
    { name: 'jiapu-store-v2' }
  )
)
