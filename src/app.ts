// import { Elysia } from "elysia";
// // import { branchesRoutes } from "./routes/branchesRoutes";
// // import { employeesRoutes } from "./routes/employeeRoutes";
// // import { imgcaseRoutes } from "./routes/imgcaseRoutes";
// // import { mainCasesRoutes } from "./routes/maincaseRoutes";
// // import { statusRoutes } from "./routes/statusRoutes";
// // import { receiveCaseRoutes } from "./routes/receivecaseRoutes";
// // import { teamsRoutes } from "./routes/teamRoutes";
// // import { subCaseDataRoutes } from "./routes/subcasedataRoutes";
// // import { levelUrgencyRoutes } from "./routes/levelurgencyRoutes";
// // import { authRoutes } from "./routes/authRoutes";
// // import { subcaseRoutes } from "./routes/subcaseRoutes";
// // import { notFoundHandler } from "./middlewares/notFoundHandler";
// import swagger from "@elysiajs/swagger";
// import { cors } from "@elysiajs/cors";
// import { registerRoutes } from "./routes";

// // เรียกใช้ Elysia
// const app = new Elysia().use(cors());
// const SECRET_JWT = process.env.JWT_SECRET;

// app.use(swagger());

// // app.use(
// //   jwt({
// //     name: "jwt",
// //     secret: "GBHIOLGUKFTJRTDFYVGUHBIJOIPKDIHOSUGAYFTYR687G9--/=3626",
// //     exp: "1h",
// //   })
// // );

// // เพิ่มเส้นทาง
// registerRoutes(app);
// // branchesRoutes(app);
// // employeesRoutes(app);
// // imgcaseRoutes(app);
// // mainCasesRoutes(app);
// // statusRoutes(app);
// // receiveCaseRoutes(app);
// // teamsRoutes(app);
// // subCaseDataRoutes(app);
// // levelUrgencyRoutes(app);
// // authRoutes(app);
// // subcaseRoutes(app);

// // app.get("/*", () => "Hello from Elysia with PostgreSQL!", notFoundHandler);

// export default app;
