import { create } from 'zustand';

interface GuestState {
  guestEmail: string | null;
  guestId: string | null;
  setGuest: (email: string, id: string) => void;
  clearGuest: () => void;
}

export const useStore = create<GuestState>((set) => {
  // Safe client-side checks for next.js SSR
  const isClient = typeof window !== 'undefined';
  const initialEmail = isClient ? localStorage.getItem('guestEmail') : null;
  const initialId = isClient ? localStorage.getItem('guestId') : null;

  return {
    guestEmail: initialEmail,
    guestId: initialId,
    setGuest: (email, id) => {
      if (isClient) {
        localStorage.setItem('guestEmail', email);
        localStorage.setItem('guestId', id);
      }
      set({ guestEmail: email, guestId: id });
    },
    clearGuest: () => {
      if (isClient) {
        localStorage.removeItem('guestEmail');
        localStorage.removeItem('guestId');
      }
      set({ guestEmail: null, guestId: null });
    },
  };
});
