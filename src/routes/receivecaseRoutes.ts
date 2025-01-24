import { Context, Elysia } from "elysia";
import {
  addReceiveCase,
  getReceiveCaseById,
  updateReceiveCase,
  deleteReceiveCase,
  getReceivecaseJoin,
  getTogether,
  getSeparate,
} from "../controllers/receivecaseController";
import dbClient from "../db/index";

type ReceiveCasesResponse =
  | {
      error: string;
    }
  | {
      [key: string]: any;
      main_case_id: number;
      create_date: string;
    }[];

// Routes for managing receive cases
export const receiveCaseRoutes = (app: Elysia) => {
  // Add a new receive case
  interface ReceiveCase {
    main_case_id: number;
    branch_id: number;
    urgent_level_id: number;
    status_id: number;
    create_date: string;
    problem: string;
    start_date: string;
    end_date: string;
    team_id: number;
    employee_id: number;
    img_id: number;
    saev_em: string;
    correct: string;
    details: string;
  }

  app.post("/receive-case", async (ctx) => {
    try {
      const newReceiveCase = ctx.body as ReceiveCase;

      console.log(ctx.body);

      // กำหนดฟิลด์ที่ต้องใช้
      const requiredFields: string[] = [
        "main_case_id",
        "branch_id",
        "urgent_level_id",
        "status_id",
        "create_date",
        "problem",
        "team_id",
        "employee_id",
        // "correct",
        "details",
      ];

      // ตรวจสอบฟิลด์ที่จำเป็น
      for (const field of requiredFields) {
        if (
          !(field in newReceiveCase) ||
          newReceiveCase[field as keyof ReceiveCase] === undefined
        ) {
          return {
            status: 400,
            body: JSON.stringify({ error: `Field '${field}' is required` }),
          };
        }
      }

      // ส่งข้อมูลไปยัง addReceiveCase
      const result = await addReceiveCase(newReceiveCase);

      if (result.error) {
        return {
          status: 400,
          body: JSON.stringify(result),
        };
      }

      return {
        status: 201,
        body: JSON.stringify(result),
      };
    } catch (error) {
      console.error("Error in POST /receive-case:", error);
      return {
        status: 500,
        body: JSON.stringify({ error: "Failed to add receive case" }),
      };
    }
  });

  // Backend - app.get("/receivecase")
  app.get("/receive-case", async ({ query }: Context) => {
    const page = parseInt(query.page || "1");
    const search = query.search?.toLowerCase() || "";

    const itemsPerPage = 7; // Number of items per page
    const offset = (page - 1) * itemsPerPage;

    try {
      // Query to fetch data from the receive_case table with additional search for main_case_name
      const result = await dbClient.query(
        `SELECT 
           rc.receive_case_id,
           rc.create_date,
           rc.problem,
           rc.start_date,
           rc.end_date,
           rc.saev_em,
           rc.correct,
           b.branch_name,
           mc.main_case_name,
           lu.level_urgent_name,
           s.status_name,
           t.team_name,
           e.employee_name
         FROM 
           receive_case_project.receive_case AS rc
         JOIN 
           receive_case_project.branch AS b ON rc.branch_id = b.branch_id
         JOIN 
           receive_case_project.main_case AS mc ON rc.main_case_id = mc.main_case_id
         JOIN 
           receive_case_project.level_urgent AS lu ON rc.urgent_level_id = lu.level_urgent_id
         JOIN 
           receive_case_project.employee AS e ON rc.employee_id = e.employee_id
         JOIN 
           receive_case_project.status AS s ON rc.status_id = s.status_id
         JOIN 
           receive_case_project.team AS t ON rc.team_id = t.team_id
         WHERE 
           LOWER(rc.problem) LIKE $1
           OR LOWER(b.branch_name) LIKE $2
           OR LOWER(mc.main_case_name) LIKE $3
         ORDER BY rc.create_date DESC
         LIMIT $4 OFFSET $5`,
        [`%${search}%`, `%${search}%`, `%${search}%`, itemsPerPage, offset]
      );

      // Query to count total items
      const countResult = await dbClient.query(
        `SELECT COUNT(*) AS total 
        FROM receive_case_project.receive_case AS rc
        JOIN receive_case_project.branch AS b ON rc.branch_id = b.branch_id
        JOIN receive_case_project.main_case AS mc ON rc.main_case_id = mc.main_case_id
        JOIN receive_case_project.status AS s ON rc.status_id = s.status_id
        WHERE LOWER(rc.problem) LIKE $1
           OR LOWER(b.branch_name) LIKE $2
           OR LOWER(mc.main_case_name) LIKE $3
           OR LOWER(s.status_name) LIKE $4`,
        [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`]
      );

      const totalItems = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      return {
        cases: result.rows,
        totalPages,
      };
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error querying database:", err.message, err.stack);
      } else {
        console.error("Unknown error occurred during database query");
      }
      return { error: "ไม่สามารถดึงข้อมูลได้" };
    }
  }); 

  app.get("/receive-caseJoin", getReceivecaseJoin);

  // ดึงข้อมูลจากฐานข้อมูล Byid
  app.get("/receive-case/:id", async ({ params }) => {
    try {
      const id = parseInt(params.id, 10);
      const receiveCase = await getReceiveCaseById(id);

      if (receiveCase.error) {
        return new Response(
          JSON.stringify({ error: "Receive case not found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(JSON.stringify(receiveCase), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error in GET /receive-case/:id:", error);
      return new Response(
        JSON.stringify({ error: "Failed to retrieve receive case" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  });

  // อัพเดท  เข้าดำเนินการ
  app.put("/update-case", async ({ body }: Context) => {
    try {
      const { receive_case_id, status_id, correct, saev_em, start_date } =
        body as {
          receive_case_id: number;
          status_id: number;
          correct: string;
          saev_em: string;
          start_date: string; 
        };

      // Log ข้อมูลที่ได้รับ
      console.log("Received data:", {
        receive_case_id,
        status_id,
        correct,
        saev_em,
        start_date,
      });

      // Check for missing required fields
      if (
        !receive_case_id ||
        !status_id ||
        !correct ||
        !saev_em ||
        !start_date
      ) {
        return {
          status: 400,
          body: { error: "Missing required fields or incorrect format" },
        };
      }

      // Query to find employee by name or employee_id
      const employeeResult = await dbClient.query(
        `SELECT employee_id FROM receive_case_project.employee WHERE employee_id = $1`,
        [saev_em] // ใช้ employee_id แทน employee_name
      );

      // Log ค่าผลลัพธ์จากการค้นหาพนักงาน
      console.log("Employee search result:", employeeResult);

      // If employee not found, return error
      if (employeeResult.rowCount === 0) {
        return { status: 404, body: { error: "Employee not found" } };
      }

      // Extract employee ID
      const employee_id = employeeResult.rows[0].employee_id;

      // Log employee_id ที่ได้
      console.log("Employee ID:", employee_id);

      // Update the case in the database
      const result = await dbClient.query(
        `UPDATE receive_case_project.receive_case
       SET correct = $1, status_id = $2, saev_em = $3, start_date = $4
       WHERE receive_case_id = $5`,
        [correct, status_id, employee_id, start_date, receive_case_id] // เพิ่ม start_date ในการอัปเดต
      );

      // Log ผลลัพธ์ของการอัพเดท
      console.log("Update result:", result);

      // If case not found, return error
      if (result.rowCount === 0) {
        return { status: 404, body: { error: "Case not found" } };
      }

      // Return success response
      return { status: 200, body: { success: "Case updated successfully" } };
    } catch (error) {
      console.error("Error in update-case route:", error);
      return { status: 500, body: { error: "Internal server error" } };
    }
  });

  // ฟังก์ชันอัปเดตข้อมูลByid
  app.put("/receive-case/:id", async (ctx) => {
    try {
      const id = parseInt(ctx.params.id, 10);
      const { details } = ctx.body as { details: string }; // ตรวจสอบประเภทของ ctx.body

      console.log("Received ID in PUT /receive-case/:id:", id); // ล็อก ID ที่ได้รับ
      console.log("Received details:", details); // ล็อกรายละเอียดที่ได้รับ

      if (isNaN(id)) {
        return { status: 400, body: { error: "Invalid ID format" } };
      }

      const caseData = await dbClient.query(
        "SELECT * FROM receive_case_project.receive_case WHERE receive_case_id = $1",
        [id]
      );

      if (!caseData.rows.length) {
        console.log("Case not found for ID:", id); // ล็อกถ้าไม่มีข้อมูล
        return { status: 404, body: { error: "Case not found" } };
      }

      const updatedCase = await dbClient.query(
        "UPDATE receive_case_project.receive_case SET details = $1 WHERE receive_case_id = $2 RETURNING *",
        [details, id]
      );

      return { status: 200, body: updatedCase.rows[0] };
    } catch (error) {
      console.error("Error in PUT /receive-case/:id:", error); // ล็อกข้อผิดพลาด
      return { status: 500, body: { error: "Internal server error" } };
    }
  });
  // Delete receive case by ID
  app.delete("/receive-case/:id", async (ctx) => {
    try {
      const id = parseInt(ctx.params.id, 10);

      // เรียกฟังก์ชันลบข้อมูล
      const result = await deleteReceiveCase(id);

      if (result.error) {
        return {
          status: 404, // HTTP status 404: ไม่พบข้อมูล
          body: { error: result.error }, // ส่งข้อความข้อผิดพลาดกลับ
        };
      }

      return {
        status: 200, // HTTP status 200: ลบสำเร็จ
        body: {
          message: result.message, // ส่งข้อความสำเร็จ
          data: result.data, // ส่งข้อมูลที่ถูกลบกลับ (ถ้ามี)
        },
      };
    } catch (error) {
      console.error("Error in DELETE /receive-case/:id:", error);

      return {
        status: 500, // HTTP status 500: เกิดข้อผิดพลาดในเซิร์ฟเวอร์
        body: { error: "Failed to delete receive case" },
      };
    }
  });


  app.get("/receive-charts", async (req) => {
    try {
      const year = req.query.year || new Date().getFullYear(); // รับค่าปีจาก query params หรือใช้ปีปัจจุบัน
  
      const queryResult = await dbClient.query(
        `
        SELECT 
          TO_CHAR(rc.create_date, 'Month') AS month_name,
          COUNT(CASE WHEN st.status_name = 'ดำเนินการเสร็จสิ้น' THEN 1 END) AS completed_count,
          COUNT(CASE WHEN st.status_name = 'กำลังดำเนินการ' THEN 1 END) AS in_progress_count,
          COUNT(CASE WHEN st.status_name = 'รอดำเนินการ' THEN 1 END) AS pending_count
        FROM receive_case_project.receive_case AS rc
        JOIN receive_case_project.status AS st 
          ON rc.status_id = st.status_id
        WHERE EXTRACT(YEAR FROM rc.create_date) = $1
        GROUP BY TO_CHAR(rc.create_date, 'Month')
        ORDER BY MIN(rc.create_date)
        `,
        [year]
      );
  
      // ฟังก์ชันสร้างข้อมูลเดือนทั้งหมด
      const generateMonths = () => [
        { month_name: "January" },
        { month_name: "February" },
        { month_name: "March" },
        { month_name: "April" },
        { month_name: "May" },
        { month_name: "June" },
        { month_name: "July" },
        { month_name: "August" },
        { month_name: "September" },
        { month_name: "October" },
        { month_name: "November" },
        { month_name: "December" },
      ];
  
      const allMonths = generateMonths();
  
      // รวมข้อมูลเดือนทั้งหมดแม้ไม่มีข้อมูล
      const finalData = allMonths.map((month) => {
        const existingData = queryResult.rows.find((row) => row.month_name.trim() === month.month_name);
        return {
          month_name: month.month_name,
          completed_count: existingData?.completed_count || 0,
          in_progress_count: existingData?.in_progress_count || 0,
          pending_count: existingData?.pending_count || 0,
        };
      });
  
      return { status: 200, body: finalData };
    } catch (error) {
      console.error("Database query error:", error);
      return { status: 500, body: { error: "Failed to retrieve receive case" } };
    }
  });

  // Get combined data (together)
  app.get("/together", async (ctx) => {
    try {
      const result = await getTogether();
      if (result.error) {
        return { status: 404, body: result };
      }
      return { status: 200, body: result };
    } catch (error) {
      console.error("Error in GET /together:", error);
      return { status: 500, body: { error: "Failed to retrieve data" } };
    }
  });

  // Get separate data (separate)
  app.get("/separate", async (ctx) => {
    try {
      const result = await getSeparate();
      if (result.error) {
        return { status: 404, body: result };
      }
      return { status: 200, body: result };
    } catch (error) {
      console.error("Error in GET /separate:", error);
      return { status: 500, body: { error: "Failed to retrieve data" } };
    }
  });
};
