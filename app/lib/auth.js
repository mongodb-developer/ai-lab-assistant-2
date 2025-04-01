import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from './mongodb';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const { conn } = await connectToDatabase();
          const users = conn.connection.db.collection('users');

          // Use environment variables for admin credentials
          const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
          const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
          
          if (credentials.email === adminEmail && credentials.password === adminPassword) {
            return {
              id: '1',
              email: adminEmail,
              name: 'Admin User',
              isAdmin: true
            };
          }

          // In production, verify against your database
          const user = await users.findOne({ email: credentials.email });
          if (!user) return null;

          // In production, use proper password hashing
          if (user.password !== credentials.password) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
}; 