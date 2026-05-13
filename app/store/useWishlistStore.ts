import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistItem {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
}

interface WishlistState {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: [],
      addToWishlist: (item) => set((state) => ({ wishlist: [...state.wishlist, item] })),
      removeFromWishlist: (id) => set((state) => ({ 
        wishlist: state.wishlist.filter((i) => i.id !== id) 
      })),
      isInWishlist: (id) => get().wishlist.some((i) => i.id === id),
    }),
    { name: 'wishlist-storage' }
  )
)