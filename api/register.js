const { sql } = require("@vercel/postgres");
const { clean, ensureTables, isEmail, readBody, sendJson } = require("./_helpers");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  const body = readBody(req);

  if (clean(body.company)) {
    return sendJson(res, 200, { message: "Registration received." });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 180).toLowerCase();
  const phone = clean(body.phone, 40);
  const interest = clean(body.interest, 160);

  if (!name || !isEmail(email)) {
    return sendJson(res, 400, { error: "Please enter your name and a valid email." });
  }

  try {
    await ensureTables(sql);
    await sql`
      INSERT INTO customer_registrations (name, email, phone, interest)
      VALUES (${name}, ${email}, ${phone || null}, ${interest || null})
    `;

    return sendJson(res, 201, { message: "Registration received. Welcome to Northline." });
  } catch (error) {
    console.error("Failed to save registration", error);
    return sendJson(res, 500, { error: "We could not save your registration right now." });
  }
};
