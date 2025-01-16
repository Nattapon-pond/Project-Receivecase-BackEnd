// // src/server.ts
// import { Elysia } from "elysia";
// import { dbClient, connectDatabase } from "./db"; // ใช้ named import
// import { branchesRoutes } from "./routes/branchesRoutes";
// import { employeesRoutes } from "./routes/employeeRoutes";
// import { imgcaseRoutes } from "./routes/imgcaseRoutes";
// import { mainCasesRoutes } from "./routes/maincaseRoutes";
// import { statusRoutes } from "./routes/statusRoutes";
// import { receiveCaseRoutes } from "./routes/receivecaseRoutes";
// import { teamsRoutes } from "./routes/teamRoutes";
// import { subCaseDataRoutes } from "./routes/subcasedataRoutes";
// import { levelUrgencyRoutes } from "./routes/levelurgencyRoutes";
// import { authRoutes } from "./routes/authRoutes";

// // เรียกใช้งาน Elysia
// const app = new Elysia();

// // เพิ่มเส้นทางต่างๆ ที่จำเป็น
// branchesRoutes(app);
// employeesRoutes(app);
// imgcaseRoutes(app);
// mainCasesRoutes(app);
// statusRoutes(app);
// receiveCaseRoutes(app);
// teamsRoutes(app);
// subCaseDataRoutes(app);
// levelUrgencyRoutes(app);
// authRoutes(app);

// // เส้นทางหลัก
// app.get("/", () => "Hello from Elysia with PostgreSQL!");

// // เริ่มต้นเซิร์ฟเวอร์
// app.listen(3000, () => {
//   console.log("Elysia is running on http://localhost:3000");

//   // เชื่อมต่อฐานข้อมูลเมื่อเซิร์ฟเวอร์เริ่มทำงาน
//   connectDatabase();
// });
