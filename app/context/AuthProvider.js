'use client';

import { createContext, useContext } from 'react';
import { useSession } from 'next-auth/react';

const AuthContext = createContext(null);

export function useAuth() {
  const { data: session } = useSession();
  return session;
}

export default function AuthProvider({ children }) {
  const { data: session } = useSession();
  
  return (
    <AuthContext.Provider value={session}>
      {children}
    </AuthContext.Provider>
  );
}
