import { Context, Elysia } from "elysia";
import {
  addReceiveCase,
  getReceiveCaseById,
  updateReceiveCase,
  deleteReceiveCase,
  getReceivecaseJoin,
  getTogether,
  getSeparate,
  sendMessageCase,
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

  //  app.get("/APP", async (ctx) => {

  //   const a = await dbClient.query("SELECT team_name FROM  receive_case_project.team where team_id = 1")
  //   console.log(a.rows[0].team_name)
  //   return a
  //  });

  app.post("/receive-case", async (ctx) => {
    try {
      const newReceiveCase = ctx.body as ReceiveCase;

      // console.log(ctx.body);

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

      console.log("result", result)

      if (result.error) {
        return {
          status: 400,
          body: JSON.stringify(result),
        };
      }

    //   const url = "https://asrs-api.agilisplatform.com/admin/line"

    const [date, time] = newReceiveCase.create_date.split("T");

      const data = {
        type: 1,
        date: date,
        time: time,
        header: newReceiveCase.problem,
        reporter: result.data?.data2.empName?.employee_name,
        team: result.data?.data2.teamName?.team_name,
        branch: result.data?.data2.branchName?.branch_name,
        priority: result.data?.data2.priority?.level_urgent_name,
        detail: newReceiveCase.details,
        secret_key: "global888"
      }

    if (data.type === 1) {
      await sendMessageCase(data);
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
      // console.log("Update result:", result);

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
      const { startDate, endDate } = ctx.query; // รับค่า startDate และ endDate จาก query parameters
  
      // ตรวจสอบว่า startDate และ endDate มีค่าหรือไม่
      if (!startDate || !endDate) {
        return { status: 400, body: { error: "startDate and endDate are required" } };
      }
  
      // เรียกใช้งาน getTogether โดยส่ง startDate และ endDate
      const result = await getTogether(startDate, endDate);
  
      // หากไม่พบข้อมูล
      if (result.error) {
        return { status: 404, body: result };
      }
  
      // ส่งผลลัพธ์กลับ
      return { status: 200, body: result };
    } catch (error) {
      console.error("Error in GET /together:", error);
      return { status: 500, body: { error: "Failed to retrieve data" } };
    }
  });
  
  // Get separate data (separate)
  app.get("/separate", async (ctx) => {
    try {
      const { startDate, endDate } = ctx.query; // รับค่า startDate และ endDate จาก query parameters
  
      // ตรวจสอบว่า startDate และ endDate มีค่าหรือไม่
      if (!startDate || !endDate) {
        return { status: 400, body: { error: "startDate and endDate are required" } };
      }
  
      // เรียกใช้งาน getSeparate โดยส่ง startDate และ endDate
      const result = await getSeparate(startDate, endDate);
  
      // หากไม่พบข้อมูล
      if (result.error) {
        return { status: 404, body: result };
      }
  
      // ส่งผลลัพธ์กลับ
      return { status: 200, body: result };
    } catch (error) {
      console.error("Error in GET /separate:", error);
      return { status: 500, body: { error: "Failed to retrieve data" } };
    }
  });
  
    
  app.get("/charts", async (req) => {
    try {
      const startDate = req.query.startDate || `${new Date().getFullYear()}-01-01`; // เริ่มต้นที่ 1 มกราคม ปีปัจจุบัน
      const endDate = req.query.endDate || new Date().toISOString().split('T')[0]; // วันที่ปัจจุบัน
  
      const queryResult = await dbClient.query(
        `
        SELECT 
          TO_CHAR(rc.create_date, 'FMMonth') AS month_name,  
          COUNT(CASE WHEN st.sub_case_id IN (1, 2, 15, 16) THEN 1 END) AS total_program,
          COUNT(CASE WHEN st.sub_case_id IN (4, 5, 8, 9, 10, 17) THEN 1 END) AS total_electricity,
          COUNT(CASE WHEN st.sub_case_id IN (20, 21) THEN 1 END) AS total_mechanical,
          COUNT(CASE WHEN st.sub_case_id IN (18, 19, 6, 7) THEN 1 END) AS total_person,
          COUNT(CASE WHEN st.sub_case_id IN (11, 14) THEN 1 END) AS total_other,
          COUNT(CASE WHEN st.sub_case_id = 3 THEN 1 END) AS total_plc
        FROM receive_case_project.receive_case AS rc
        LEFT JOIN receive_case_project.subcase AS st 
          ON rc.receive_case_id = st.receive_case_id
        WHERE rc.create_date BETWEEN $1::DATE AND $2::DATE 
        GROUP BY TO_CHAR(rc.create_date, 'FMMonth')  
        ORDER BY MIN(rc.create_date);
        `,
        [startDate, endDate]
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
        const existingData = queryResult.rows.find((row) => row.month_name === month.month_name);
        return {
          month_name: month.month_name,
          total_program: existingData?.total_program || 0,
          total_electricity: existingData?.total_electricity || 0,
          total_mechanical: existingData?.total_mechanical || 0,
          total_person: existingData?.total_person || 0,
          total_other: existingData?.total_other || 0,
          total_PLC: existingData?.total_plc || 0,
        };
      });
  
      return { status: 200, body: finalData };
    } catch (error) {
      console.error("Database query error:", error);
      return { status: 500, body: { error: "Failed to retrieve receive case" } };
    }
  });

  app.get("/percentage-change", async (req) => {

    try {
      const startDate = req.query.startDate || `${new Date().getFullYear()}-01-01`; // เริ่มต้นที่ 1 มกราคม ปีปัจจุบัน
      const endDate = req.query.endDate || new Date().toISOString().split('T')[0]; // วันที่ปัจจุบัน
      
      // Query SQL เพื่อดึงข้อมูล
      const queryResult = await dbClient.query(
        `
        WITH monthly_counts AS (
          SELECT 
              TO_CHAR(DATE_TRUNC('month', rc.create_date), 'YYYY-MM') AS period,
              COUNT(*) AS case_count,
              'month' AS type
          FROM 
              receive_case_project.subcase sc
          JOIN 
              receive_case_project.receive_case rc
          ON 
              sc.receive_case_id = rc.receive_case_id
          WHERE 
              rc.create_date BETWEEN $1 AND $2
          GROUP BY 
              DATE_TRUNC('month', rc.create_date)
        ),
        yearly_counts AS (
          SELECT 
              TO_CHAR(DATE_TRUNC('year', rc.create_date), 'YYYY') AS period,
              COUNT(*) AS case_count,
              'year' AS type
          FROM 
              receive_case_project.subcase sc
          JOIN 
              receive_case_project.receive_case rc
          ON 
              sc.receive_case_id = rc.receive_case_id
          WHERE 
              rc.create_date BETWEEN $1 AND $2
          GROUP BY 
              DATE_TRUNC('year', rc.create_date)
        ),
        combined AS (
          SELECT * FROM monthly_counts
          UNION ALL
          SELECT * FROM yearly_counts
        )
        SELECT 
            current_period.period,
            current_period.case_count AS newValue,
            previous_period.case_count AS oldValue,
            CASE 
                WHEN previous_period.case_count IS NOT NULL AND previous_period.case_count != 0 THEN 
                    ((current_period.case_count - previous_period.case_count) / previous_period.case_count::FLOAT) * 100
                ELSE 
                    NULL
            END AS percentage_change,
            current_period.type
        FROM 
            combined current_period
        LEFT JOIN 
            combined previous_period
        ON 
            current_period.type = previous_period.type
            AND current_period.period = 
                TO_CHAR(TO_DATE(previous_period.period, 'YYYY-MM') + 
                (CASE WHEN current_period.type = 'month' THEN INTERVAL '1 month' ELSE INTERVAL '1 year' END), 'YYYY-MM')
        ORDER BY 
            current_period.type, current_period.period;
        `,
        [startDate, endDate]
      );
  
      // สร้างรายชื่อเดือนทั้งหมด
      const generateMonths = (year: number) => [
        { month_name: "January", period: `${year}-01` },
        { month_name: "February", period: `${year}-02` },
        { month_name: "March", period: `${year}-03` },
        { month_name: "April", period: `${year}-04` },
        { month_name: "May", period: `${year}-05` },
        { month_name: "June", period: `${year}-06` },
        { month_name: "July", period: `${year}-07` },
        { month_name: "August", period: `${year}-08` },
        { month_name: "September", period: `${year}-09` },
        { month_name: "October", period: `${year}-10` },
        { month_name: "November", period: `${year}-11` },
        { month_name: "December", period: `${year}-12` },
      ];
  
      // สร้างรายชื่อเดือนสำหรับปีปัจจุบัน
      const year = new Date().getFullYear();
      const allMonths = generateMonths(year);
  
      // จับคู่ข้อมูลที่ได้จาก SQL กับรายการเดือนที่สร้าง
      const finalData = allMonths.map((month) => {
        const existingData = queryResult.rows.find((row) => row.period === month.period);
  
        return {
          month_name: month.month_name,
          newValue: existingData?.newvalue || 0,
          oldValue: existingData?.oldvalue || 0,
          percentage_change: existingData?.percentage_change || 0,
        };
      });
  
      return { status: 200, body: finalData };
    } catch (error) {
      console.error("Database query error:", error);
      return { status: 500, body: { error: "Failed to retrieve receive case" } };
    }
  });
  
};
