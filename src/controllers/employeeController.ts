import dbClient from "../db";

// เพิ่มข้อมูล data
export const addEmployee = async (employeeData: { employee_id: number; employee_name: string }) => {
  try {
    const { employee_id, employee_name } = employeeData;

    // ตรวจสอบว่า employee_id และ employee_name มีค่าหรือไม่
    if (!employee_id || !employee_name) {
      return { error: "Both employee_id and employee_name are required" };
    }

    // SQL Query สำหรับเพิ่มข้อมูลพนักงาน
    const query = `
      INSERT INTO receive_case_project.employee (employee_id, employee_name)
      VALUES ($1, $2)
      RETURNING *;
    `;

    // คิวรีข้อมูลไปยังฐานข้อมูล
    const result = await dbClient.query(query, [employee_id, employee_name]);

    // ถ้าการเพิ่มข้อมูลสำเร็จ
    if (result.rowCount === 0) {
      return { error: "Failed to add employee: No rows inserted" }; // ถ้าไม่มีการเพิ่มข้อมูล
    }

    return { message: "Employee added successfully", data: result.rows[0] }; // ส่งข้อมูลที่เพิ่มได้

  } catch (error: unknown) { // กำหนดประเภทของ error เป็น unknown
    if (error instanceof Error) { // ตรวจสอบว่า error เป็น instance ของ Error หรือไม่
      console.error("Database query error in addEmployee:", error.message);
      return { error: `Failed to add employee: ${error.message}` }; // ข้อผิดพลาดจากฐานข้อมูล
    } else {
      console.error("Unknown error:", error);
      return { error: "Failed to add employee: Unknown error" }; // ข้อผิดพลาดจากฐานข้อมูล
    }
  }
};

// get All employees
export const getAllEmployees = async () => {
  try {
    // SQL Query เพื่อดึงข้อมูลทั้งหมดจากตาราง employees
    // const query = "SELECT * FROM receive_case_project.employee"; // เปลี่ยนชื่อ table ตามต้องการ
    const query = "SELECT * FROM receive_case_project.employee"; // เปลี่ยนชื่อ table ตามต้องการ
    const result = await dbClient.query(query);

    // ถ้าไม่มีข้อมูลในตาราง
    if (result.rowCount === 0) {
      return { error: "No employee found" };
    }

    // ส่งข้อมูลทั้งหมดที่ดึงมา
    return result.rows;
  } catch (error) {
    console.error("Database query error:", error);
    return { error: "Failed to retrieve employee" };
  }
};

// get By id employes
// Get employee by ID
export const getEmployeeById = async (id: number) => {
  try {
    const query =
      "SELECT * FROM receive_case_project.employee WHERE employee_id = $1";
    const result = await dbClient.query(query, [id]);

    if (result.rowCount === 0) {
      return { error: "Employee not found" };
    }
    return result.rows[0];
  } catch (error) {
    console.error("Database query error:", error);
    return { error: "Failed to retrieve employee" };
  }
};

// อัพเดท data byid
export const updateEmployee = async (
  id: number,
  updatedData: { [key: string]: any }
) => {
  try {
    // ตรวจสอบว่ามี employee ที่ต้องการอัปเดตหรือไม่
    const checkQuery =
      "SELECT * FROM receive_case_project.employee WHERE employee_id = $1";
    const checkResult = await dbClient.query(checkQuery, [id]);

    if (checkResult.rowCount === 0) {
      return { error: "Employee not found" }; // ถ้าไม่เจอ employee
    }

    // สร้าง dynamic SQL query สำหรับอัปเดตข้อมูล
    const columns = Object.keys(updatedData);
    const values = Object.values(updatedData);

    const setClause = columns
      .map((col, index) => `${col} = $${index + 2}`)
      .join(", ");
    const query = `UPDATE receive_case_project.employee SET ${setClause} WHERE employee_id = $1 RETURNING *`;

    // รัน query เพื่ออัปเดตข้อมูล
    const result = await dbClient.query(query, [id, ...values]);

    // ส่งข้อมูลที่ถูกอัปเดตกลับ
    return result.rows[0];
  } catch (error) {
    console.error("Database query error in updateEmployee:", error);
    return { error: "Failed to update employee" }; // ดักจับข้อผิดพลาด
  }
};

// ลบ By id
export const deleteEmployee = async (id: number) => {
  try {
    const query = `
      DELETE FROM receive_case_project.employee
      WHERE employee_id = $1
      RETURNING *;
    `;
    const result = await dbClient.query(query, [id]);

    // ตรวจสอบว่ามีแถวที่ถูกลบหรือไม่
    if (result.rowCount === 0) {
      return { error: "Employee not found" }; // ถ้าไม่พบพนักงาน
    }

    return { message: "Employee deleted successfully", data: result.rows[0] };
  } catch (error) {
    console.error("Database query error in deleteEmployee:", error);
    return { error: "Failed to delete employee" }; // ข้อผิดพลาดจากฐานข้อมูล
  }
};
