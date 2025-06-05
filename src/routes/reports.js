const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const { start_date, end_date, employee_id, department } = req.query;
  let sql = `SELECT * FROM reports WHERE 1=1`;
  const params = [];

  if (start_date) {
    sql += ` AND report_date >= ?`;
    params.push(start_date);
  }
  if (end_date) {
    sql += ` AND report_date <= ?`;
    params.push(end_date);
  }
  if (employee_id) {
    sql += ` AND employee_id = ?`;
    params.push(employee_id);
  }
  if (department) {
    sql += ` AND department = ?`;
    params.push(department);
  }

  sql += ` ORDER BY report_date DESC, created_at DESC`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM reports WHERE id = ?`, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }
    res.json(row);
  });
});

router.post('/', (req, res) => {
  const {
    employee_name,
    employee_id,
    department,
    report_date,
    work_content,
    achievements,
    issues,
    tomorrow_plan,
    remarks
  } = req.body;

  if (!employee_name || !employee_id || !department || !report_date || !work_content) {
    res.status(400).json({ error: '必須項目が入力されていません' });
    return;
  }

  const sql = `INSERT INTO reports 
    (employee_name, employee_id, department, report_date, work_content, 
     achievements, issues, tomorrow_plan, remarks) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [
    employee_name, employee_id, department, report_date, work_content,
    achievements, issues, tomorrow_plan, remarks
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: '日報を作成しました' });
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    employee_name,
    employee_id,
    department,
    report_date,
    work_content,
    achievements,
    issues,
    tomorrow_plan,
    remarks
  } = req.body;

  const sql = `UPDATE reports SET 
    employee_name = ?, employee_id = ?, department = ?, report_date = ?, 
    work_content = ?, achievements = ?, issues = ?, tomorrow_plan = ?, 
    remarks = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?`;

  db.run(sql, [
    employee_name, employee_id, department, report_date, work_content,
    achievements, issues, tomorrow_plan, remarks, id
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }
    res.json({ message: '日報を更新しました' });
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM reports WHERE id = ?`, [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }
    res.json({ message: '日報を削除しました' });
  });
});

router.get('/export/csv', (req, res) => {
  const { start_date, end_date } = req.query;
  let sql = `SELECT * FROM reports WHERE 1=1`;
  const params = [];

  if (start_date) {
    sql += ` AND report_date >= ?`;
    params.push(start_date);
  }
  if (end_date) {
    sql += ` AND report_date <= ?`;
    params.push(end_date);
  }

  sql += ` ORDER BY report_date DESC`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const fields = ['report_date', 'employee_name', 'employee_id', 'department', 'work_content', 'achievements', 'issues', 'tomorrow_plan', 'remarks'];
    const fieldNames = ['日付', '氏名', '社員ID', '部署', '業務内容', '成果', '課題', '明日の予定', '備考'];
    
    let csv = fieldNames.join(',') + '\n';
    
    rows.forEach(row => {
      const csvRow = fields.map(field => {
        const value = row[field] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csv += csvRow.join(',') + '\n';
    });

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.header('Content-Disposition', 'attachment; filename=reports.csv');
    res.send('\uFEFF' + csv);
  });
});

module.exports = router;