const { sql } = require("@vercel/postgres");
const { clean, ensureTables, isEmail, readBody, sendJson } = require("./_helpers");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  const body = readBody(req);

  if (clean(body.company)) {
    return sendJson(res, 200, { message: "Thank you. We received your enquiry." });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 180).toLowerCase();
  const product = clean(body.product, 160);
  const message = clean(body.message, 1500);

  if (!name || !isEmail(email) || !message) {
    return sendJson(res, 400, { error: "Please enter your name, a valid email, and a message." });
  }

  try {
    await ensureTables(sql);
    await sql`
      INSERT INTO customer_enquiries (name, email, product, message)
      VALUES (${name}, ${email}, ${product || null}, ${message})
    `;

    return sendJson(res, 201, { message: "Thank you. We received your enquiry." });
  } catch (error) {
    console.error("Failed to save enquiry", error);
    return sendJson(res, 500, { error: "We could not save your enquiry right now." });
  }
};
