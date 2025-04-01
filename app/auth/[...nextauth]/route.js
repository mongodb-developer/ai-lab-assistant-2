import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';

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

          // For development, allow a default admin user
          if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
            return {
              id: '1',
              email: 'admin@example.com',
              name: 'Admin User',
              isAdmin: true
            };
          }

          // In production, you would verify against your database
          const user = await users.findOne({ email: credentials.email });
          if (!user) return null;

          // In production, you would use proper password hashing
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 