import { Elysia } from 'elysia';
import { getHome } from '../controllers/homeController';

export const homeRoutes = (app: Elysia) => {
  app.get("/", getHome);
};
