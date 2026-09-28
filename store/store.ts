import {create} from "zustand/react";

const useEmailStore = create((set) => ({
    email: '',
    setEmail: (email: string) => set({email}),
    clearEmail: () => set({email: ''})
}))

export default useEmailStore;