import { Context, Elysia } from "elysia";
import {
  addReceiveCase,
  getReceiveCaseById,
  updateReceiveCase,
  deleteReceiveCase,
  getReceivecaseJoin,
  getReceivecase,
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

      console.log(ctx.body)

      // กำหนดฟิลด์ที่ต้องใช้
      const requiredFields: string[] = [
        "main_case_id",
        "branch_id",
        "urgent_level_id",
        "status_id",
        "create_date",
        "problem",
        "start_date",
        "end_date",
        "team_id",
        "employee_id",
        "saev_em",
        "correct",
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
    const itemsPerPage = 5; // จำนวนข้อมูลต่อหน้า
    const offset = (page - 1) * itemsPerPage;

    try {
      // Query ดึงข้อมูลจากตาราง receive_case โดยใช้พารามิเตอร์สำหรับการค้นหา และเรียงลำดับจากวันที่ใหม่ที่สุด
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
     (LOWER(rc.problem) LIKE $1 OR LOWER(b.branch_name) LIKE $2 OR LOWER(s.status_name) LIKE $3)
   ORDER BY rc.receive_case_id DESC  -- การจัดเรียงตาม ID จากมากไปน้อย
   LIMIT $4 OFFSET $5`,
        [`%${search}%`, `%${search}%`, `%${search}%`, itemsPerPage, offset]
      );

      // Query จำนวนข้อมูลทั้งหมด
      const countResult = await dbClient.query(
        `SELECT COUNT(*) AS total 
         FROM receive_case_project.receive_case AS rc
         JOIN receive_case_project.branch AS b ON rc.branch_id = b.branch_id
         JOIN receive_case_project.status AS s ON rc.status_id = s.status_id
         WHERE 
           (LOWER(rc.problem) LIKE $1 OR LOWER(b.branch_name) LIKE $2 OR LOWER(s.status_name) LIKE $3)`,
        [`%${search}%`, `%${search}%`, `%${search}%`]
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
      const { receive_case_id, status_id, correct, selectedEmployees } = body as {
        receive_case_id: number;
        status_id: number;
        correct: string;
        selectedEmployees: number[];
      };

      if (!receive_case_id || !status_id || !correct || !Array.isArray(selectedEmployees)) {
        return { status: 400, body: { error: "Missing required fields or incorrect format" } };
      }

      const statuses = [
        { status_id: 1, status_name: "รอดำเนินการ" },
        { status_id: 2, status_name: "กำลังดำเนินการ" },
        { status_id: 3, status_name: "ดำเนินการเสร็จสิ้น" },
      ];

      const selectedStatus = statuses.find((status) => status.status_id === status_id);

      if (!selectedStatus) {
        return { status: 400, body: { error: "Invalid status_id" } };
      }

      await dbClient.query("BEGIN");

      const result = await dbClient.query(
        `UPDATE receive_case_project.receive_case
         SET correct = $1, status_id = $2
         WHERE receive_case_id = $3`,
        [correct, selectedStatus.status_id, receive_case_id]
      );

      if (result.rowCount === 0) {
        await dbClient.query("ROLLBACK");
        return { status: 404, body: { error: "Case not found" } };
      }

      await dbClient.query("COMMIT");

      return {
        status: 200,
        body: { success: "Case updated successfully", updatedStatusName: selectedStatus.status_name },
      };
    } catch (error) {
      await dbClient.query("ROLLBACK");
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


