const { pool } = require('../config/db');

// Get all users with their registrations, optional filters
const getUsers = async ({ status, eventId } = {}) => {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (status) {
    conditions.push(`r.status = $${idx++}`);
    values.push(status.toUpperCase());
  }

  if (eventId) {
    conditions.push(`e.id = $${idx++}`);
    values.push(eventId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT
       u.id           AS user_id,
       u.name,
       u.email,
       u.phone,
       u.college,
       u.created_at,
       e.id           AS event_id,
       e.title        AS event_title,
       e.price,
       r.id           AS registration_id,
       r.status
     FROM registrations r
     JOIN users  u ON u.id = r.user_id
     JOIN events e ON e.id = r.event_id
     ${where}
     ORDER BY u.name ASC, e.title ASC`,
    values
  );

  return rows;
};

// Get registrations grouped by payment group
const getGroups = async ({ status, eventId, includeAll } = {}) => {
  // Step 1: Get payments with leader info.
  // includeAll=true (used for export) includes bare PENDING payments too.
  const statusFilter = includeAll ? '' : `WHERE p.status != 'PENDING'`;
  const { rows: payments } = await pool.query(
    `SELECT
       p.id           AS payment_id,
       p.reference_id,
       p.amount,
       p.status       AS payment_status,
       p.user_ids,
       p.user_id      AS leader_user_id,
       p.created_at,
       p.utr,
       u.name         AS leader_name,
       u.email        AS leader_email,
       u.phone        AS leader_phone,
       u.college      AS leader_college
     FROM payments p
     JOIN users u ON u.id = p.user_id
     ${statusFilter}
     ORDER BY p.created_at DESC`
  );

  if (!payments.length) return [];

  // Step 2: Collect all unique member user IDs across all groups
  const allUserIdSet = new Set();
  const paymentsWithMemberIds = payments.map((p) => {
    let memberIds = [];
    if (p.user_ids) {
      try { memberIds = JSON.parse(p.user_ids); } catch (_) {}
    }
    if (!memberIds.length) memberIds = [p.leader_user_id];
    memberIds.forEach((id) => allUserIdSet.add(id));
    return { ...p, memberIds };
  });

  // Step 3: Get all registrations for these users (with optional eventId filter)
  const allUserIds = [...allUserIdSet];
  const placeholders = allUserIds.map((_, i) => `$${i + 1}`).join(', ');
  const values = [...allUserIds];

  let regQuery = `
    SELECT
      u.id           AS user_id,
      u.name,
      u.email,
      u.phone,
      u.college,
      e.id           AS event_id,
      e.title        AS event_title,
      e.price,
      r.id           AS registration_id,
      r.status       AS reg_status,
      r.mode_of_participation
    FROM registrations r
    JOIN users  u ON u.id = r.user_id
    JOIN events e ON e.id = r.event_id
    WHERE r.user_id IN (${placeholders})
  `;
  if (eventId) {
    regQuery += ` AND e.id = $${values.length + 1}`;
    values.push(eventId);
  }

  const { rows: registrations } = await pool.query(regQuery, values);

  // Step 4: Index registrations and user info by user_id
  const regByUser = {};
  const userInfo  = {};
  registrations.forEach((r) => {
    if (!regByUser[r.user_id]) regByUser[r.user_id] = [];
    regByUser[r.user_id].push({
      registration_id:      r.registration_id,
      event_id:             r.event_id,
      event_title:          r.event_title,
      price:                r.price,
      status:               r.reg_status,
      mode_of_participation: r.mode_of_participation || '',
    });
    userInfo[r.user_id] = { name: r.name, email: r.email, phone: r.phone, college: r.college };
  });

  // Step 5: Build group objects and apply filters
  const groups = paymentsWithMemberIds.map((p) => {
    const members = p.memberIds.map((uid) => ({
      user_id:       uid,
      name:          userInfo[uid]?.name    || '—',
      email:         userInfo[uid]?.email   || '—',
      phone:         userInfo[uid]?.phone   || '—',
      college:       userInfo[uid]?.college || '—',
      registrations: regByUser[uid] || [],
    }));

    // If eventId filter is active, skip groups where no member has that event
    if (eventId && !members.some((m) => m.registrations.length > 0)) return null;

    // If status filter is active, skip groups where no member-registration matches
    if (status) {
      const upper = status.toUpperCase();
      if (!members.some((m) => m.registrations.some((r) => r.status === upper))) return null;
    }

    return {
      payment_id:     p.payment_id,
      reference_id:   p.reference_id,
      amount:         p.amount,
      payment_status: p.payment_status,
      utr:            p.utr || '—',
      created_at:     p.created_at,
      leader: {
        name:    p.leader_name,
        email:   p.leader_email,
        phone:   p.leader_phone,
        college: p.leader_college,
      },
      members,
    };
  }).filter(Boolean);

  return groups;
};

module.exports = { getUsers, getGroups };
