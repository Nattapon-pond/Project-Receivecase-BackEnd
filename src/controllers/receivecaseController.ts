import { Context } from "elysia";
import dbClient from "../db";

// Define the interface for the ReceiveCase data
interface ReceiveCase {
  main_case_id: number;
  branch_id: number;
  urgent_level_id: number;
  create_date: string;
  status_id: number;
  problem: string;
  employee_id: number;
  start_date: string;
  end_date: string;
  team_id: number;
  img_id: number;
  saev_em: string;
  correct: string;
  details: string;
}

// Define the interface for the data with JOINs (with additional info)
interface ReceiveCaseJoin extends ReceiveCase {
  branch_name: string;
  main_case_name: string;
  level_urgent_name: string;
  status_name: string;
  team_name: string;
  img_name: string;
  employee_name: string;
}
export const addReceiveCase = async (receiveCaseData: any) => {
  try {
    await dbClient.query("BEGIN");
    console.log("Transaction started");

    let { sub_case_ids } = receiveCaseData

    const {
      main_case_id,
      branch_id,
      urgent_level_id,
      status_id,
      create_date,
      problem,
 
      team_id,
      employee_id,
      // saev_em,
      correct,
      details,
      // sub_case_ids, // ใช้ array ของ sub_case_ids
      img_data_ids,
    } = receiveCaseData;

    let a = sub_case_ids.split(",").map((id: string) => parseInt(id, 10));

    
    sub_case_ids = a

    // Insert into receive_case
    const result = await dbClient.query(
      `
      INSERT INTO receive_case_project.receive_case 
      (main_case_id, branch_id, urgent_level_id, status_id, create_date, 
      problem, team_id, employee_id,details)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING receive_case_id;
    `,
      [
        main_case_id,
        branch_id,
        urgent_level_id,
        status_id,
        create_date,
        problem,
        team_id,
        employee_id,
        // correct,
        details,
        
      ]
    );
    console.log("result");

    console.log("Insert into receive_case successful:", result.rows[0]);
    console.log("Received data:", receiveCaseData);

    const newReceiveCaseId = result.rows[0].receive_case_id;

    if (Array.isArray(sub_case_ids) && sub_case_ids.length > 0) {

      for (const subCaseId of sub_case_ids) {
        await dbClient.query(
          `
          INSERT INTO receive_case_project.subcase (receive_case_id, sub_case_id)
          VALUES ($1, $2);
          `,
          [newReceiveCaseId, subCaseId]
        );
        console.log(
          "Inserted into receive_case_project.subcase with sub_case_id:",
          subCaseId
        );
      }
    } else if (sub_case_ids) {
      // กรณี sub_case_ids เป็นค่าเดี่ยว
      await dbClient.query(
        `
        INSERT INTO receive_case_project.subcase (receive_case_id, sub_case_id)
        VALUES ($1, $2);
        `,
        [newReceiveCaseId, sub_case_ids]
      );
      console.log(
        "Inserted into receive_case_project.subcase with single sub_case_id:",
        sub_case_ids
      );
    } else {
      console.warn("No sub_case_ids provided, skipping subcase insertion.");
    }

    if (Array.isArray(img_data_ids)) {
      for (const imgDataId of img_data_ids) {
        await dbClient.query(
          `
          INSERT INTO receive_case_project.img_data (receive_case_id, img_id)
          VALUES ($1, $2);
        `,
          [newReceiveCaseId, imgDataId]
        );
        console.log(
          "Inserted into receive_case_project.img_data with img_id:",
          imgDataId
        );
      }
    } else if (img_data_ids) {
      await dbClient.query(
        `
        INSERT INTO receive_case_project.img_data (receive_case_id, img_id)
        VALUES ($1, $2);
      `,
        [newReceiveCaseId, img_data_ids]
      );
      console.log(
        "Inserted into receive_case_project.img_data with single img_id:",
        img_data_ids
      );
    } else {
      await dbClient.query(
        `
        INSERT INTO receive_case_project.img_data (receive_case_id)
        VALUES ($1);
      `,
        [newReceiveCaseId]
      );
      console.log(
        "Inserted into receive_case_project.img_data without specifying img_id."
      );
    }

    await dbClient.query("COMMIT");

    

    return {
      message: "Receive case and img_data added successfully.",
      data: { receive_case_id: newReceiveCaseId },
    };
  } catch (error) {
    await dbClient.query("ROLLBACK");

    // การตรวจสอบประเภทของ error
    if (error instanceof Error) {
      console.error(
        "Error occurred in addReceiveCase:",
        error.message,
        error.stack
      );

      if (error.message.includes("relation")) {
        console.error("Relation does not exist");
      } else if (error.message.includes("foreign key")) {
        console.error("Foreign key violation");
      }
    } else {
      console.error("Unknown error occurred", error);
    }

    return { error: "Failed to add receive case" };
  }
};

// Function to get all receive cases
// Backend - ฟังก์ชันดึงข้อมูลจากฐานข้อมูล
export const getReceivecase = async (): Promise<ReceiveCase[]> => {
  try {
    const result = await dbClient.query<ReceiveCase>(
      "SELECT * FROM receive_case_project.receive_case"
    );

    if (result.rows.length === 0) {
      console.error("No cases found in database.");
    }
    return result.rows;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Database query error:", error.message); // แสดงข้อความข้อผิดพลาด
    } else {
      console.error("Unknown database error:", error); // แสดงข้อผิดพลาดที่ไม่รู้จัก
    }
    throw new Error("Failed to retrieve receive case");
  }
};



// Function to retrieve receive_case data with JOINs
export const getReceivecaseJoin = async () => {
  try {
    const query = `
      SELECT 
    rc.receive_case_id,
    rc.create_date,
    rc.problem,
    rc.start_date,
    rc.end_date,
    rc.saev_em,
    b.branch_name,
    mc.main_case_name,
    st.status_name,
    t.team_name,
    lu.level_urgent_name,
    e.employee_name,
    STRING_AGG(DISTINCT s.sub_case_name, ', ') AS combined_sub_case_names,  -- ใช้ DISTINCT เพื่อไม่ให้ข้อมูลซ้ำ
    rc.correct,
     rc.details
FROM receive_case_project.receive_case AS rc
LEFT JOIN receive_case_project.subcase AS sc 
    ON sc.receive_case_id = rc.receive_case_id
LEFT JOIN receive_case_project.sub_case AS s 
    ON sc.sub_case_id = s.sub_case_id
LEFT JOIN receive_case_project.branch AS b 
    ON rc.branch_id = b.branch_id
LEFT JOIN receive_case_project.main_case AS mc 
    ON rc.main_case_id = mc.main_case_id
LEFT JOIN receive_case_project.level_urgent AS lu 
    ON rc.urgent_level_id = lu.level_urgent_id
LEFT JOIN receive_case_project.employee AS e 
    ON rc.employee_id = e.employee_id
LEFT JOIN receive_case_project.team AS t 
    ON rc.team_id = t.team_id
LEFT JOIN receive_case_project.img_data AS i 
    ON rc.receive_case_id = i.receive_case_id
LEFT JOIN receive_case_project.status AS st 
    ON rc.status_id = st.status_id
GROUP BY 
    rc.receive_case_id, 
    rc.create_date, 
    rc.problem, 
    rc.start_date, 
    rc.end_date, 
    rc.saev_em, 
    b.branch_name, 
    mc.main_case_name, 
    st.status_name, 
    t.team_name, 
    lu.level_urgent_name, 
    e.employee_name, 
    rc.correct,
    rc.details
ORDER BY rc.receive_case_id DESC;
    `;

    const result = await dbClient.query<ReceiveCaseJoin>(query);

    if (result.rows.length === 0) {
      throw new Error("No receive case found");
    }

    return result.rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Failed to retrieve receive case");
  }
};

// Get receive case by ID
export const getReceiveCaseById = async (id: number) => {
  try {
    const query =
      "SELECT * FROM receive_case_project.receive_case WHERE receive_case_id = $1";
    const result = await dbClient.query(query, [id]);

    if (result.rowCount === 0) {
      return { error: "Receive case not found" };
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error in getReceiveCaseById:", error);
    return { error: "Failed to retrieve receive case" };
  }
};
// Update receive case by ID
export const updateReceiveCase = async (id: number, details: string) => {
  try {
    // ตรวจสอบว่ามีค่า details ส่งเข้ามาหรือไม่
    if (!details) {
      return { error: "Details field is required for update" };
    }

    // อัปเดตเฉพาะฟิลด์ details ในตาราง receive_case
    const query = `UPDATE receive_case_project.receive_case SET details = $2 WHERE receive_case_id = $1 RETURNING *`;
    const result = await dbClient.query(query, [id, details]);

    if (result.rowCount === 0) {
      return { error: "Receive case not found" };
    }

    console.log("Updated receive_case details:", result.rows[0]);

    return { success: true, message: "Receive case details updated successfully", data: result.rows[0] };
  } catch (error) {
    console.error("Error in updateReceiveCaseDetails:", error);
    return { error: "Failed to update receive case details" };
  }
};


export const updateCase = async ({ body }: Context) => {
  try {
    const { receive_case_id, status_id, correct, saev_em, selectedEmployees } = body as {
      receive_case_id: number;
      status_id: number;
      correct: string;
      saev_em: string;
      selectedEmployees: number[];
    };

    // Validate input
    if (!receive_case_id || !status_id || !correct || !Array.isArray(selectedEmployees)) {
      return { error: "Missing required fields or incorrect format" };
    }

    const statuses = [
      { status_id: 1, status_name: "รอดำเนินการ" },
      { status_id: 2, status_name: "กำลังดำเนินการ" },
      { status_id: 3, status_name: "ดำเนินการเสร็จสิ้น" },
    ];

    const selectedStatus = statuses.find((status) => status.status_id === status_id);
    if (!selectedStatus) {
      return { error: "Invalid status_id" };
    }

    const validStatusId = selectedStatus.status_id;

    // Begin Transaction
    await dbClient.query("BEGIN");

    // Update case
    const result = await dbClient.query(
      `UPDATE receive_case_project.receive_case
       SET correct = $1, status_id = $2
       WHERE receive_case_id = $3`,
      [correct, validStatusId, receive_case_id]
    );

    if (result.rowCount === 0) {
      throw new Error("Case not found");
    }

    // Update employees
    for (const employeeId of selectedEmployees) {
      await dbClient.query(
        `INSERT INTO receive_case_project.employee (receive_case_id, employee_id)
         VALUES ($1, $2)
         ON CONFLICT (receive_case_id, employee_id) DO NOTHING`,
        [receive_case_id, employeeId]
      );
    }

    // Commit Transaction
    await dbClient.query("COMMIT");

    return {
      success: "Case updated successfully",
      updatedStatusName: selectedStatus.status_name,
    };
  } catch (error) {
    await dbClient.query("ROLLBACK");
    console.error("Error in updateCase:", error);
    return { error: "Internal server error" };
  }
};

// Delete receive case by ID
export const deleteReceiveCase = async (id: number) => {
  try {
    // ลบข้อมูลในตาราง img_data
    await dbClient.query(
      "DELETE FROM receive_case_project.img_data WHERE receive_case_id = $1",
      [id]
    );
    console.log("Deleted associated img_data for receive_case_id:", id);

    // ลบข้อมูลในตาราง subcase
    await dbClient.query(
      "DELETE FROM receive_case_project.subcase WHERE receive_case_id = $1",
      [id]
    );
    console.log("Deleted associated subcases for receive_case_id:", id);

    // ลบข้อมูลในตาราง receive_case
    const query =
      "DELETE FROM receive_case_project.receive_case WHERE receive_case_id = $1 RETURNING *";
    const result = await dbClient.query(query, [id]);

    if (result.rowCount === 0) {
      return { error: "Receive case not found" }; // ส่งคืนข้อผิดพลาดถ้าหาไม่เจอ
    }

    return {
      message: "Receive case deleted successfully",
      data: result.rows[0], // ข้อมูลของรายการที่ถูกลบ
    };
  } catch (error) {
    console.error("Error in deleteReceiveCase:", error);
    return { error: "Failed to delete receive case" }; // ส่งคืนข้อผิดพลาดทั่วไป
  }
};




// นับรวม
export const getTogether = async () => { 
  try {
    const query = "SELECT SUM(1) AS total_sub_case_id FROM receive_case_project.subcase;";
    const result = await dbClient.query(query);

    if (result.rowCount === 0) {
      return { error: "No subcase found" }; // เปลี่ยนข้อความจาก "No main cases found" ให้ตรงกับข้อมูล
    }

    return result.rows[0]; // ส่งกลับข้อมูลแถวแรก
  } catch (error) {
    console.error("Database query error:", error);
    return { error: "Failed to retrieve subcases" };
  }
};

// นับแยก
// 1 โปรแกรม
// 2 ไฟฟ้า
// 3 เครื่องกล
// 4 บุคคล
// 5 ปัจจัยภายนอก
// 6 PLC
export const getSeparate = async () => {  
  try {
    const query = `SELECT 
  (SELECT SUM(1) FROM receive_case_project.subcase WHERE sub_case_id IN (1, 2, 15, 16)) AS total_program,
  (SELECT SUM(1) FROM receive_case_project.subcase WHERE sub_case_id IN (4, 5, 8, 9, 10, 17)) AS total_electricity,
  (SELECT SUM(1) FROM receive_case_project.subcase WHERE sub_case_id IN (20, 21)) AS total_mechanical,
  (SELECT SUM(1) FROM receive_case_project.subcase WHERE sub_case_id IN (18, 19, 6, 7)) AS total_person,
  (SELECT SUM(1) FROM receive_case_project.subcase WHERE sub_case_id IN (11, 14)) AS total_other,
  (SELECT SUM(1) FROM receive_case_project.subcase WHERE sub_case_id IN (3)) AS total_PLC;`; 
    const result = await dbClient.query(query);

    if (result.rowCount === 0) {
      return { error: "No subcase found" }; // เปลี่ยนข้อความจาก "No main cases found" ให้ตรงกับข้อมูล
    }

    return result.rows[0]; // ส่งกลับข้อมูลแถวแรก
  } catch (error) {
    console.error("Database query error:", error);
    return { error: "Failed to retrieve subcases" };
  }
};