import dbClient from "../db";

// เพิ่มข้อมูล SubCaseData
export const addSubCaseData = async (data: { sub_case_id: number; sub_case_name: string }) => {
  try {
    const { sub_case_id, sub_case_name } = data;

    if (!sub_case_id || !sub_case_name) {
      return { error: "Both sub_case_id and sub_case_name are required" };
    }

    const query = `
      INSERT INTO receive_case_project.sub_case (sub_case_id, sub_case_name)
      VALUES ($1, $2)
      RETURNING *;
    `;

    const result = await dbClient.query(query, [sub_case_id, sub_case_name]);

    if (result.rowCount === 0) {
      return { error: "Failed to add subcase: No rows inserted" };
    }

    return { message: "SubCaseData added successfully", data: result.rows[0] };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Database query error in addSubCaseData:", error.message);
      return { error: `Failed to add subcase: ${error.message}` };
    } else {
      console.error("Unknown error:", error);
      return { error: "Failed to add subcase: Unknown error" };
    }
  }
};

// ดึงข้อมูล SubCaseData ทั้งหมด
export const getAllSubCaseData = async () => {
  try {
    const query = "SELECT * FROM receive_case_project.sub_case";
    const result = await dbClient.query(query);

    if (result.rowCount === 0) {
      return { error: "No sub_case found" };
    }

    return result.rows;
  } catch (error) {
    console.error("Database query error in getAllSubCaseData:", error);
    return { error: "Failed to retrieve sub_case" };
  }
};

// ดึงข้อมูล SubCaseData โดยใช้ sub_case_id
export const getSubCaseDataById = async (id: number) => {
  try {
    const query = "SELECT * FROM receive_case_project.sub_case WHERE sub_case_id = $1";
    const result = await dbClient.query(query, [id]);

    if (result.rowCount === 0) {
      return { error: "SubCaseData not found" };
    }

    return result.rows[0];
  } catch (error) {
    console.error("Database query error in getSubCaseDataById:", error);
    return { error: "Failed to retrieve sub_case" };
  }
};

// อัปเดตข้อมูล SubCaseData
export const updateSubCaseData = async (
  id: number,
  updatedData: { [key: string]: any }
) => {
  try {
    const checkQuery = "SELECT * FROM receive_case_project.sub_case WHERE sub_case_id = $1";
    const checkResult = await dbClient.query(checkQuery, [id]);

    if (checkResult.rowCount === 0) {
      return { error: "SubCaseData not found" };
    }

    const columns = Object.keys(updatedData);
    const values = Object.values(updatedData);
    const setClause = columns
      .map((col, index) => `${col} = $${index + 2}`)
      .join(", ");

    const query = `
      UPDATE receive_case_project.sub_case
      SET ${setClause}
      WHERE sub_case_id = $1
      RETURNING *;
    `;

    const result = await dbClient.query(query, [id, ...values]);

    return result.rows[0];
  } catch (error) {
    console.error("Database query error in updateSubCaseData:", error);
    return { error: "Failed to update sub_case" };
  }
};

// ลบข้อมูล SubCaseData โดยใช้ sub_case_id
export const deleteSubCaseData = async (id: number) => {
  try {
    const query = `
      DELETE FROM receive_case_project.sub_case
      WHERE sub_case_id = $1
      RETURNING *;
    `;
    const result = await dbClient.query(query, [id]);

    if (result.rowCount === 0) {
      return { error: "SubCaseData not found" };
    }

    return { message: "SubCaseData deleted successfully", data: result.rows[0] };
  } catch (error) {
    console.error("Database query error in deleteSubCaseData:", error);
    return { error: "Failed to delete sub_case" };
  }
};
