import dbClient from "../db";

// Get All
export const getbranch = async () => {
  try {
    // console.log("Executing query...");
    const result = await dbClient.query(
      "SELECT * FROM receive_case_project.branch"
    );
    // console.log("Query result:", result.rows);

    if (result.rows.length === 0) {
      console.log("No branch found in the database.");
      return new Response(
        JSON.stringify({ body: [] }), // ส่ง response ในรูปแบบที่มี body
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // ส่งข้อมูลในรูปแบบที่มี body
    return new Response(
      JSON.stringify({ body: result.rows }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in getbranch:", error);
    return new Response(
      JSON.stringify({ message: "Error retrieving branch data" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// Get By Id

export const getBranchById = async (branch_id: string) => {
  try {
    // Query ดึงข้อมูลจากฐานข้อมูลโดยใช้ branch_id
    const result = await dbClient.query(
      "SELECT * FROM receive_case_project.branch WHERE branch_id = $1",
      [branch_id]
    );

    // ตรวจสอบว่าพบข้อมูลหรือไม่
    if (result.rows.length === 0) {
      console.log(`No branch found with id: ${branch_id}`);
      return { error: `Branch with id ${branch_id} not found` };
    }

    // ส่งข้อมูล branch กลับ
    return result.rows[0];
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Failed to retrieve branch by id");
  }
};

// เพิ่ม ข้อมูล  ลง database
export const createBranch = async (branchData: {
  branch_id: string;
  branch_name: string;
}) => {
  try {
    const query =
      "INSERT INTO receive_case_project.branch (branch_id, branch_name) VALUES ($1, $2) RETURNING *";
    const values = [branchData.branch_id, branchData.branch_name];
    const result = await dbClient.query(query, values);

    if (result.rows.length === 0) {
      return { error: "Failed to create branch" };
    }

    return result.rows[0]; // ส่งข้อมูล branch ที่ถูกเพิ่ม
  } catch (error) {
    console.error("Database insert error:", error);
    return { error: "Database error" };
  }
};

export const updateBranch = async (branchData: {
  branch_id: string;
  branch_name: string;
}) => {
  try {
    const query = `
      UPDATE receive_case_project.branch
      SET branch_name = $2
      WHERE branch_id = $1
      RETURNING *`;
    const values = [branchData.branch_id, branchData.branch_name];

    const result = await dbClient.query(query, values);

    if (result.rowCount === 0) {
      return { error: "Branch not found or no changes made" };
    }

    return result.rows[0]; // ส่งข้อมูล branch ที่ถูกอัปเดต
  } catch (error) {
    console.error("Database update error:", error);
    return { error: "Failed to update branch" };
  }
};

// ลบ ข้อมูล ที่ละ id

export const deleteBranch = async (branch_id: string) => {
  try {
    // SQL Query สำหรับลบ branch ตาม branch_id
    const query =
      "DELETE FROM receive_case_project.branch WHERE branch_id = $1 RETURNING *";
    const result = await dbClient.query(query, [branch_id]);

    // ตรวจสอบว่าไม่พบข้อมูล
    if (result.rowCount === 0) {
      return { error: "Branch not found" };
    }

    return {
      message: "Branch deleted successfully",
      deletedBranch: result.rows[0],
    };
  } catch (error) {
    console.error("Database delete error:", error);
    return { error: "Failed to delete branch" };
  }
};

// export const getBranches = async () => {
//   try {
//     const result = await dbClient.query("SELECT * FROM receive_case_project.branch");
//     return new Response(JSON.stringify(result.rows), {
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Database query error:", error);
//     return new Response("Failed to retrieve branches", { status: 500 });
//   }
// };
