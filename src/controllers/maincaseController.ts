import dbClient from "../db";

// เพิ่มข้อมูล main_case
export const addMainCase = async (mainCaseData: { main_case_id: number; main_case_name: string }) => {
  try {
    const { main_case_id, main_case_name } = mainCaseData;

    // ตรวจสอบว่า main_case_id และ main_case_name มีค่าหรือไม่
    if (!main_case_id || !main_case_name) {
      return { error: "Both main_case_id and main_case_name are required" };
    }

    const query = `
      INSERT INTO receive_case_project.main_case (main_case_id, main_case_name)
      VALUES ($1, $2)
      RETURNING *;
    `;

    const result = await dbClient.query(query, [main_case_id, main_case_name]);

    if (result.rowCount === 0) {
      return { error: "Failed to add main case: No rows inserted" };
    }

    return { message: "Main case added successfully", data: result.rows[0] };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Database query error in addMainCase:", error.message);
      return { error: `Failed to add main case: ${error.message}` };
    } else {
      console.error("Unknown error:", error);
      return { error: "Failed to add main case: Unknown error" };
    }
  }
};

// ดึงข้อมูลทั้งหมด
export const getAllMainCases = async (): Promise<any> => {
  try {
    const query = "SELECT * FROM receive_case_project.main_case";
    const result = await dbClient.query(query);

    if (result.rowCount === 0) {
      return { error: "No main cases found" };
    }

    return result.rows; // คืนค่าข้อมูลทั้งหมดในรูปแบบ Array
  } catch (error: any) { // กำหนดชนิดของ error
    console.error("Database query error:", error.message || error);
    return { error: "Failed to retrieve main cases" };
  }
};

// ดึงข้อมูลตาม ID
export const getMainCaseById = async (id: number) => {
  try {
    const query = "SELECT * FROM receive_case_project.main_case WHERE main_case_id = $1";
    const result = await dbClient.query(query, [id]);

    if (result.rowCount === 0) {
      return { error: "Main case not found" };
    }

    return result.rows[0];
  } catch (error) {
    console.error("Database query error:", error);
    return { error: "Failed to retrieve main case" };
  }
};

// อัพเดทข้อมูลตาม ID
export const updateMainCase = async (
  id: number,
  updatedData: { [key: string]: any }
) => {
  try {
    const checkQuery = "SELECT * FROM receive_case_project.main_case WHERE main_case_id = $1";
    const checkResult = await dbClient.query(checkQuery, [id]);

    if (checkResult.rowCount === 0) {
      return { error: "Main case not found" };
    }

    const columns = Object.keys(updatedData);
    const values = Object.values(updatedData);

    const setClause = columns.map((col, index) => `${col} = $${index + 2}`).join(", ");
    const query = `UPDATE receive_case_project.main_case SET ${setClause} WHERE main_case_id = $1 RETURNING *`;

    const result = await dbClient.query(query, [id, ...values]);

    return result.rows[0];
  } catch (error) {
    console.error("Database query error in updateMainCase:", error);
    return { error: "Failed to update main case" };
  }
};

// ลบข้อมูลตาม ID
export const deleteMainCase = async (id: number) => {
  try {
    const query = `
      DELETE FROM receive_case_project.main_case
      WHERE main_case_id = $1
      RETURNING *;
    `;
    const result = await dbClient.query(query, [id]);

    if (result.rowCount === 0) {
      return { error: "Main case not found" };
    }

    return { message: "Main case deleted successfully", data: result.rows[0] };
  } catch (error) {
    console.error("Database query error in deleteMainCase:", error);
    return { error: "Failed to delete main case" };
  }
};
