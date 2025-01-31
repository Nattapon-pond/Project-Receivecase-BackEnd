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
    // console.log("result");

    // console.log("Insert into receive_case successful:", result.rows[0]);
    // console.log("Received data:", receiveCaseData);

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

    const empName =  await dbClient.query(
        `
        SELECT employee_name FROM  receive_case_project.employee where employee_id = $1;
      `,
        [employee_id]
      );

        const teamName =  await dbClient.query(
        `
        SELECT team_name FROM  receive_case_project.team where team_id = $1;
      `,
        [team_id]
      );

      const branchName = await dbClient.query(`SELECT branch_name FROM  receive_case_project.branch where branch_id = $1;`, [branch_id])

      const priority = await dbClient.query(`SELECT level_urgent_name FROM  receive_case_project.level_urgent where level_urgent_id = $1;`, [urgent_level_id])

      console.log("priority" , priority.rows[0])
      const data2 = {
        empName: empName.rows[0],
        teamName: teamName.rows[0],
        branchName: branchName.rows[0],
        priority: priority.rows[0]
      }
    return {
      message: "Receive case and img_data added successfully.",
      data: { receive_case_id: newReceiveCaseId, data2 },
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
// นับรวม
export const getTogether = async (startDate: string, endDate: string) => { 
  try {
    const query = `
      SELECT 
        SUM(1) AS total_sub_case_id
      FROM 
        receive_case_project.subcase sc 
      JOIN 
        receive_case_project.receive_case rc
      ON 
        sc.receive_case_id = rc.receive_case_id
      WHERE 
        rc.create_date BETWEEN $1 AND $2;`; // ใช้ $1, $2 เพื่อป้องกัน SQL injection

    const result = await dbClient.query(query, [startDate, endDate]); // ส่งค่า startDate, endDate ใน query

    if (result.rowCount === 0) {
      return { error: "No subcase found" };
    }

    return result.rows[0]; 
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
export const getSeparate = async (startDate: string, endDate: string) => {  
  try {
    const query = `
SELECT 
  SUM(CASE WHEN sc.sub_case_id IN (1, 2, 15, 16) THEN 1 ELSE 0 END) AS total_program,
  SUM(CASE WHEN sc.sub_case_id IN (4, 5, 8, 9, 10, 17) THEN 1 ELSE 0 END) AS total_electricity,
  SUM(CASE WHEN sc.sub_case_id IN (20, 21) THEN 1 ELSE 0 END) AS total_mechanical,
  SUM(CASE WHEN sc.sub_case_id IN (18, 19, 6, 7) THEN 1 ELSE 0 END) AS total_person,
  SUM(CASE WHEN sc.sub_case_id IN (11, 14) THEN 1 ELSE 0 END) AS total_other,
  SUM(CASE WHEN sc.sub_case_id IN (3) THEN 1 ELSE 0 END) AS total_plc
FROM 
  receive_case_project.receive_case rc
JOIN 
  receive_case_project.subcase sc
ON 
  sc.receive_case_id = rc.receive_case_id
WHERE 
  rc.create_date BETWEEN $1 AND $2


    `; 
    const result = await dbClient.query(query, [startDate, endDate]);

    if (result.rowCount === 0) {
      return { error: "No subcase found" };
    }

    return result.rows[0]; 
  } catch (error) {
    console.error("Database query error:", error);
    return { error: "Failed to retrieve subcases" };
  }
};

export const sendMessageCase = async (messageData: any) => {
  const url = "https://api.line.me/v2/bot/message/push";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer qaBROSnoW/Ewr1SPwWGWO9zH9S1VLosoKV0+b8bqtdZnG1WBMw9YmvV7uVOCAbNvK2dWzirC2lJq2uU23Engke3PJVLgdNDzLRZRkkydP69VvkEGu3UlUWjkFdTiA/AhQpsVBbsXZJpkqNpQxB+rIAdB04t89/1O/w1cDnyilFU=`, // ใส่ Channel Access Token ของ LINE Messaging API
  };

  const data = {
    // to: "Cd4d4e2da5aa7ca636dcf2ba0f2cee25e", // ID ห้องasd
    // to: "C639be5989f3b564628539dacf123aed4", // ID ห้อง test
    to: "C3cd0ab80ed38bf8f859673b1e34f3bb9", // ID ห้อง ห้องหลัก
    messages: [
      {
        type: "flex",
        altText: "แจ้งปัญหา",
        contents: {
          type: "bubble",
          styles: {
            header: {
              backgroundColor: "#ffcccc",
            },
            body: {
              backgroundColor: "#ffffff",
            },
            footer: {
              backgroundColor: "#f0f0f0",
            },
          },
          header: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "แจ้งปัญหา",
                weight: "bold",
                size: "lg",
                color: "#ff5555",
              },
            ],
          },
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "text",
                    text: "เวลา:",
                    weight: "bold",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: `${messageData.date} ${messageData.time}`,
                    flex: 3,
                  },
                ],
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "text",
                    text: "สาขา:",
                    weight: "bold",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: `${messageData.branch}`,
                    flex: 3,
                  },
                ],
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "text",
                    text: "ปัญหา:",
                    weight: "bold",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: `${messageData.header}`,
                    flex: 3,
                  },
                ],
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "text",
                    text: "รายละเอียด:",
                    weight: "bold",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: `${messageData.detail}`,
                    flex: 3,
                    wrap: true,
                  },
                ],
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "text",
                    text: "ระดับความเร่งด่วน:",
                    weight: "bold",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: `${messageData.priority}`,
                    flex: 3,
                  },
                ],
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "text",
                    text: "ผู้รับแจ้ง:",
                    weight: "bold",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: `${messageData.reporter}`,
                    flex: 3,
                  },
                ],
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "text",
                    text: "ผู้แก้ไข:",
                    weight: "bold",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: `${messageData.team}`,
                    flex: 3,
                  },
                ],
              },
            ],
            spacing: "md",
          },
          footer: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "button",
                action: {
                  type: "uri",
                  label: "ดูรายละเอียดเพิ่มเติม",
                  uri: "https://project-receivecase.vercel.app/dashboard/",
                },
                style: "primary",
                color: "#ff5555",
              },
            ],
          },
        },
      },
    ],
  };

  console.log(JSON.stringify(data, null, 2));
  console.log(headers);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data, null, 2),
    });

    if (!response.ok) {
      // throw new Error(`LINE API Error: ${response.statusText}`);
      throw new Error(`LINE API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error sending reply:", error.message);
    return { error: error.message };
  }
};