import dbClient from "../db";

export const getSubcase = async () => {
  try {
    // ดึงข้อมูลทั้งหมดจากตาราง subcase
    const result = await dbClient.query("SELECT * FROM receive_case_project.subcase");
    
    // ส่งข้อมูลกลับในรูปแบบ JSON
    return { status: 200, body: result.rows };
  } catch (error) {
    console.error("Database query error:", error);
    return { status: 500, body: "Failed to retrieve subcase" };
  }
};

export const getSubcaseGROUPBYJoin = async () => {
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
        STRING_AGG(DISTINCT s.sub_case_name, ', ') AS combined_sub_case_names, 
        rc.correct
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

    // ดึงข้อมูลจากฐานข้อมูล
    const result = await dbClient.query(query);

    if (result.rows.length === 0) {
      return { status: 404, body: "No subcase items found" };
    }

    // ส่งข้อมูลกลับในรูปแบบ JSON
    return { status: 200, body: result.rows };
  } catch (error) {
    console.error("Database query error:", error);
    return { status: 500, body: "Failed to retrieve sub case" };
  }
};