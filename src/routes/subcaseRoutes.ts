import { Elysia } from 'elysia';
import { getSubcase,getSubcaseGROUPBYJoin } from '../controllers/subcaseController';

export const subcaseRoutes = (app: Elysia) => {
  app.get("/subcase",  getSubcase);
  app.get("/sub_casejoin",  getSubcaseGROUPBYJoin);
};