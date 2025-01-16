import { Elysia } from "elysia";
import {
  getSubcase,
  getSubcaseJoin,
  getSubcaseGROUPBYJoin,
} from "../controllers/subcaseController";

export const subcaseRoutes = (app: Elysia) => {
  app.get("/sub-case", getSubcase);
  app.get("/sub_casejoin", getSubcaseJoin);
  app.get("/sub_casegroupby", getSubcaseGROUPBYJoin);
};
