import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors"; // นำเข้า plugin CORS
import { Client } from "pg";
import { env } from "process";
import { config } from "dotenv";
import { branchesRoutes } from "../routes/branchesRoutes";
import { employeesRoutes } from "../routes/employeeRoutes";
import { mainCasesRoutes } from "../routes/maincaseRoutes";
import { statusRoutes } from "../routes/statusRoutes";
import { receiveCaseRoutes } from "../routes/receivecaseRoutes";
import { teamsRoutes } from "../routes/teamRoutes";
import { subCaseDataRoutes } from "../routes/subcasedataRoutes";
import { levelUrgencyRoutes } from "../routes/levelurgencyRoutes";
import { authRoutes } from "../routes/authRoutes";
import { subcaseRoutes } from "../routes/subcaseRoutes";
import { imageUploadController } from "../routes/imgcaseRoutes";

config();

const dbClient = new Client({
  connectionString:
    // process.env.DATABASE_URL || // อ่านค่าจาก Environment Variable,
    // "postgresql://postgres:p@ssw0rd@192.168.200.146:5432/asrs_local?search_path=receive_case_project",
  "postgres://postgres:12345678@localhost:8000/project_receive_case", // ใช้ Default URL หากไม่มีใน Environment Variable

  // "postgres://postgres:12345678@localhost:8000/receive_case_project", // ใช้ Default URL หากไม่มีใน Environment Variable
});

// ลองเชื่อมต่อเพื่อทดสอบ
// dbClient
//   .connect()
//   .then(() => console.log("Connected to the database successfully"))
//   .catch((err) => console.error("Database connection failed:", err));

// "postgresql://postgres:p@ssw0rd@192.168.200.146:5432/asrs_local?search_path=receive_case_project",

// ฟังก์ชันเชื่อมต่อฐานข้อมูล
const connectDatabase = async () => {
  try {
    await dbClient.connect();
    console.log("Database connected successfully!");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Database connection error:", error.message);
    } else {
      console.error("Unknown error occurred during database connection");
    }
    process.exit(1);
  }
};
const app = new Elysia();

// เพิ่ม Middleware CORS  // เชื่อม หนัาบ้าน
app.use(
  cors({
    origin: "http://localhost:3033", // URL ของ Frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

branchesRoutes(app);
employeesRoutes(app);
mainCasesRoutes(app);
statusRoutes(app);
receiveCaseRoutes(app);
teamsRoutes(app);
subCaseDataRoutes(app);
levelUrgencyRoutes(app);
authRoutes(app);
subcaseRoutes(app);
imageUploadController(app);  // Register your image upload route

app
  .get("/", () => "Hello from Elysia with PostgreSQL!")
  .listen(3000, () => {
    console.log("Elysia is running on http://localhost:3000");
    connectDatabase();
  });

export default dbClient;
