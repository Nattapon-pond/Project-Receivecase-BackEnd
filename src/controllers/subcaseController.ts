import dbClient from "../db";

export const getSubcase = async () => {
  try {
    const result = await dbClient.query(
      "SELECT * FROM receive_case_project.subcase"
    );
    return new Response(JSON.stringify(result.rows), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Database query error:", error);
    return new Response("Failed to retrieve subcase", { status: 500 });
  }
};

export const getSubcaseJoin = async () => {
  try {
    // สร้าง SQL query สำหรับการ JOIN ข้อมูล
    const query = `
    SELECT 
             sc.subcase_id, 
             rc.create_date,
             rc.problem,
             rc.start_date,
             rc.end_date,
             rc.saev_em,
			 b.branch_name,
             mc.main_case_name,
             st.status_name,
             t.team_name,
             i.img_name,
			 lu.level_urgent_name,
             e.employee_name,
             s.sub_case_name
FROM receive_case_project.subcase AS sc
JOIN receive_case_project.receive_case AS rc ON sc.receive_case_id = rc.receive_case_id
JOIN receive_case_project.sub_case AS s ON sc.sub_case_id = s.sub_case_id
JOIN receive_case_project.branch AS b ON rc.branch_id = b.branch_id
JOIN receive_case_project.main_case AS mc ON rc.main_case_id = mc.main_case_id
JOIN receive_case_project.level_urgent AS lu ON rc.urgent_level_id = lu.level_urgent_id
JOIN receive_case_project.employee AS e ON rc.employee_id = e.employee_id
JOIN receive_case_project.team AS t ON rc.team_id = t.team_id
JOIN receive_case_project.img AS i ON rc.img_id = i.img_id
JOIN receive_case_project.status AS st ON rc.status_id = st.status_id `;

    // Execute query
    const result = await dbClient.query(query);

    // ตรวจสอบผลลัพธ์และส่งคืนข้อมูล
    if (result.rows.length === 0) {
      return new Response("No subcase items found", { status: 404 });
    }

    return new Response(JSON.stringify(result.rows), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Database query error:", error);
    return new Response("Failed to retrieve sub case", { status: 500 });
  }
};

export const getSubcaseGROUPBYJoin = async () => {
  try {
    // สร้าง SQL query สำหรับการ JOIN ข้อมูล
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
    i.img_name,
    lu.level_urgent_name,
    e.employee_name,
    STRING_AGG(s.sub_case_name, ', ') AS combined_sub_case_names,
    rc.correct
FROM receive_case_project.subcase AS sc
JOIN receive_case_project.receive_case AS rc ON sc.receive_case_id = rc.receive_case_id
JOIN receive_case_project.sub_case AS s ON sc.sub_case_id = s.sub_case_id
JOIN receive_case_project.branch AS b ON rc.branch_id = b.branch_id
JOIN receive_case_project.main_case AS mc ON rc.main_case_id = mc.main_case_id
JOIN receive_case_project.level_urgent AS lu ON rc.urgent_level_id = lu.level_urgent_id
JOIN receive_case_project.employee AS e ON rc.employee_id = e.employee_id
JOIN receive_case_project.team AS t ON rc.team_id = t.team_id
JOIN receive_case_project.img AS i ON rc.img_id = i.img_id
JOIN receive_case_project.status AS st ON rc.status_id = st.status_id
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
    i.img_name, 
    lu.level_urgent_name, 
    e.employee_name, 
    rc.correct;
 `;

    // Execute query
    const result = await dbClient.query(query);

    // ตรวจสอบผลลัพธ์และส่งคืนข้อมูล
    if (result.rows.length === 0) {
      return new Response("No subcase items found", { status: 404 });
    }

    return new Response(JSON.stringify(result.rows), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Database query error:", error);
    return new Response("Failed to retrieve sub case", { status: 500 });
  }
};
