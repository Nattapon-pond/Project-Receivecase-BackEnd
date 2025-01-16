// // src/middlewares/authMiddleware.ts
import jwt from 'jsonwebtoken';

export const authMiddleware = {
  verifyToken: async (token: string, secret: string) => {
    try {
      // Verify the token
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (error) {
      // Token verification failed
      console.error('Token verification failed:', error);
      return null;
    }
  }
};
