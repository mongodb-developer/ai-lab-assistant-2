'use client';

import { createContext, useContext } from 'react';

// Mock session for development
const mockSession = {
  user: {
    email: 'dev@example.com',
    name: 'Developer',
    image: null
  }
};

const AuthContext = createContext(mockSession);

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  return (
    <AuthContext.Provider value={mockSession}>
      {children}
    </AuthContext.Provider>
  );
}
