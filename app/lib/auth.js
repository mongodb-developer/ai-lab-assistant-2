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
          // Use environment variables for admin credentials
          const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
          const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
          
          if (credentials.email === adminEmail && credentials.password === adminPassword) {
            console.log('Admin user authenticated successfully');
            return {
              id: '1',
              email: adminEmail,
              name: 'Admin User',
              isAdmin: true,
              role: 'admin'
            };
          }

          try {
            const { conn } = await connectToDatabase();
            const users = conn.connection.db.collection('users');

            // In production, verify against your database
            const user = await users.findOne({ email: credentials.email });
            if (!user) {
              console.log(`User not found: ${credentials.email}`);
              return null;
            }

            // In production, use proper password hashing
            if (user.password !== credentials.password) {
              console.log(`Invalid password for user: ${credentials.email}`);
              return null;
            }

            console.log(`User authenticated successfully: ${credentials.email}`);
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              isAdmin: user.isAdmin || false,
              role: user.isAdmin ? 'admin' : 'user'
            };
          } catch (dbError) {
            console.error('Database error during authentication:', dbError);
            // Fall back to admin credentials if database connection fails
            if (credentials.email === adminEmail && credentials.password === adminPassword) {
              console.log('Using admin credentials as fallback');
              return {
                id: '1',
                email: adminEmail,
                name: 'Admin User',
                isAdmin: true,
                role: 'admin'
              };
            }
            return null;
          }
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
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.isAdmin = token.isAdmin;
        session.user.role = token.role;
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
  debug: process.env.NODE_ENV === 'development',
}; 