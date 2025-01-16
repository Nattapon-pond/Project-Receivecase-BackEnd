// import { Elysia } from "elysia";
// import { branchesRoutes } from "../routes/branchesRoutes";
// import { employeesRoutes } from "../routes/employeeRoutes";
// import { imgcaseRoutes } from "../routes/imgcaseRoutes";
// import { mainCasesRoutes } from "../routes/maincaseRoutes";
// import { statusRoutes } from "../routes/statusRoutes";
// import { receiveCaseRoutes } from "../routes/receivecaseRoutes";
// import { teamsRoutes } from "../routes/teamRoutes";
// import { subCaseDataRoutes } from "../routes/subcasedataRoutes";
// import { levelUrgencyRoutes } from "../routes/levelurgencyRoutes";
// import { authRoutes } from "../routes/authRoutes";
// import { subcaseRoutes } from "../routes/subcaseRoutes";
// import bearer from "@elysiajs/bearer";
// import { serve } from "bun";
// import { homeRoutes } from "./home";
// import { authMiddleware } from "../middlewares/authMiddleware";
// // import { authMiddleware } from '../middlewares/authMiddleware';

// const SECRET_JWT = process.env.JWT_SECRET as string;

// export const registerRoutes = (app: Elysia) => {
//   // Public routes (no authentication required)
//   authRoutes(app);
//   homeRoutes(app);


//   // Authentication middleware
//     app.use(bearer()).onBeforeHandle(async ({ bearer }) => {
//       if (!bearer) throw new Error("Unauthorized");

//       // Validate the bearer token using your middleware
//       try {
//         const decoded = await authMiddleware.verifyToken(bearer, SECRET_JWT); // Adjust this call based on your actual middleware
//         if (!decoded) throw new Error("Unauthorized");
//       } catch (error: any) {
//         throw new Error("Unauthorized");
//       }
//     });

//   //  เพิ่มเส้นทาง routes
//   branchesRoutes(app);
//   employeesRoutes(app);
//   imgcaseRoutes(app);
//   mainCasesRoutes(app);
//   statusRoutes(app);
//   receiveCaseRoutes(app);
//   teamsRoutes(app);
//   subCaseDataRoutes(app);
//   levelUrgencyRoutes(app);
//   // userRoutes(app);
//   authRoutes(app);
//   subcaseRoutes(app);
// };
