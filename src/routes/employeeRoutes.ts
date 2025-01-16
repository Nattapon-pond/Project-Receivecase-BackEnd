import { Elysia } from "elysia";
import {
  addEmployee,
  deleteEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
} from "../controllers/employeeController";

//get All employess
export const employeesRoutes = (app: Elysia) => {
  // Route สำหรับดึงข้อมูลพนักงานทั้งหมด
  app.get("/employee", async () => {
    try {
      const employee = await getAllEmployees();
  
      // ตรวจสอบว่า employees เป็นอาเรย์และมีข้อมูล
      if (!Array.isArray(employee) || employee.length === 0) {
        return {
          status: 404,
          body: JSON.stringify({ error: "No employees found" }), // ส่งข้อมูลเป็น JSON
        };
      }
  
      // ส่งข้อมูลพนักงานทั้งหมด
      return {
        status: 200,
        body: employee, // ส่งข้อมูลพนักงานทั้งหมดในรูปแบบ array
      };
    } catch (error) {
      console.error("Error in GET /employees route:", error);
      return {
        status: 500,
        body: JSON.stringify({ error: "Failed to retrieve employees" }), // ส่งข้อผิดพลาด
      };
    }
  });

  app.get("/employee/:id", async (ctx) => {
    try {
      const id = parseInt(ctx.params.id, 10); // แปลง :id เป็นหมายเลข
      const employee = await getEmployeeById(id);

      if (employee.error) {
        return {
          status: 404,
          body: JSON.stringify({ error: employee.error }),
        };
      }

      return {
        status: 200,
        body: JSON.stringify(employee),
      };
    } catch (error) {
      console.error("Error in GET /employee/:id route:", error);
      return {
        status: 500,
        body: JSON.stringify({ error: "Failed to retrieve employee" }),
      };
    }
  });

  app.put("/employee/:id", async (context) => {
    try {
      const { params, body } = context; // รับค่า params และ body จาก context

      const { id } = params; // รับค่า id จาก URL

      // ตรวจสอบว่า body เป็นวัตถุหรือไม่
      if (!body || typeof body !== "object") {
        return {
          status: 400,
          body: JSON.stringify({ error: "Invalid request body" }),
        };
      }

      const updatedData = body; // ใช้ body ตรง ๆ เพราะ Elysia จัดการแปลง JSON ให้อัตโนมัติ

      // ตรวจสอบว่ามีการส่งข้อมูลอัปเดตหรือไม่
      if (Object.keys(updatedData).length === 0) {
        return {
          status: 400,
          body: JSON.stringify({ error: "No data provided for update" }),
        };
      }

      // เรียกฟังก์ชัน updateEmployee
      const result = await updateEmployee(Number(id), updatedData);

      if (result.error) {
        return {
          status: 404,
          body: JSON.stringify(result),
        };
      }

      return {
        status: 200,
        body: JSON.stringify(result),
      };
    } catch (error) {
      console.error("Error in PUT /employees/:id route:", error);
      return {
        status: 500,
        body: JSON.stringify({ error: "Failed to update employee" }),
      };
    }
  });

  app.delete("/employee/:id", async ({ params }) => {
    try {
      const { id } = params;

      // ตรวจสอบว่า id มีค่าที่ถูกต้อง
      if (!id || isNaN(Number(id))) {
        return {
          status: 400,
          body: JSON.stringify({ error: "Invalid employee ID" }),
        };
      }

      const result = await deleteEmployee(Number(id));

      if (result.error) {
        return {
          status: 404,
          body: JSON.stringify(result),
        };
      }

      return {
        status: 200,
        body: JSON.stringify(result),
      };
    } catch (error) {
      console.error("Error in DELETE /employees/:id route:", error);
      return {
        status: 500,
        body: JSON.stringify({ error: "Failed to delete employee" }),
      };
    }
  });

  app.post(
    "/employee",
    async (ctx: { body: { employee_id: number; employee_name: string } }) => {
      try {
        // อ่าน body จาก ctx
        const newEmployee = ctx.body;

        // ตรวจสอบข้อมูลที่ได้รับ
        if (!newEmployee.employee_id || !newEmployee.employee_name) {
          return new Response(
            JSON.stringify({
              error: "employee_id and employee_name are required",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        // เรียกฟังก์ชัน addEmployee เพื่อเพิ่มข้อมูลพนักงาน
        const result = await addEmployee(newEmployee);

        if (result.error) {
          return new Response(JSON.stringify(result), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(result), {
          status: 201, // 201 หมายถึง Created
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Error in POST /employee route:", error);
        return new Response("Failed to add employee", { status: 500 });
      }
    }
  );
};
