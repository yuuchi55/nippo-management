const API_BASE = '/api/reports';
let currentMode = 'list';
let editingReportId = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    setToday();
    loadReports();
});

function initializeEventListeners() {
    document.getElementById('btnShowList').addEventListener('click', showListSection);
    document.getElementById('btnShowForm').addEventListener('click', showFormSection);
    document.getElementById('btnExport').addEventListener('click', exportToCSV);
    document.getElementById('btnFilter').addEventListener('click', loadReports);
    document.getElementById('btnClearFilter').addEventListener('click', clearFilters);
    document.getElementById('reportForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('btnCancel').addEventListener('click', showListSection);
    document.querySelector('.close').addEventListener('click', closeModal);
    
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal')) {
            closeModal();
        }
    });
}

function showListSection() {
    document.getElementById('listSection').classList.add('active');
    document.getElementById('formSection').classList.remove('active');
    document.getElementById('btnShowList').classList.add('active');
    document.getElementById('btnShowForm').classList.remove('active');
    currentMode = 'list';
    loadReports();
}

function showFormSection(reportId = null) {
    document.getElementById('listSection').classList.remove('active');
    document.getElementById('formSection').classList.add('active');
    document.getElementById('btnShowList').classList.remove('active');
    document.getElementById('btnShowForm').classList.add('active');
    currentMode = 'form';
    
    if (reportId) {
        editingReportId = reportId;
        document.getElementById('formTitle').textContent = '日報編集';
        loadReportForEdit(reportId);
    } else {
        editingReportId = null;
        document.getElementById('formTitle').textContent = '日報作成';
        document.getElementById('reportForm').reset();
        setToday();
    }
}

function setToday() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reportDate').value = today;
}

async function loadReports() {
    try {
        const params = new URLSearchParams();
        const startDate = document.getElementById('filterStartDate').value;
        const endDate = document.getElementById('filterEndDate').value;
        const employeeId = document.getElementById('filterEmployeeId').value;
        const department = document.getElementById('filterDepartment').value;
        
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        if (employeeId) params.append('employee_id', employeeId);
        if (department) params.append('department', department);
        
        const response = await fetch(`${API_BASE}?${params}`);
        const reports = await response.json();
        
        displayReports(reports);
    } catch (error) {
        console.error('Error loading reports:', error);
        showModal('エラー', '日報の読み込みに失敗しました');
    }
}

function displayReports(reports) {
    const reportList = document.getElementById('reportList');
    
    if (reports.length === 0) {
        reportList.innerHTML = `
            <div class="empty-state">
                <h3>日報がありません</h3>
                <p>新規作成ボタンから日報を作成してください</p>
            </div>
        `;
        return;
    }
    
    reportList.innerHTML = reports.map(report => `
        <div class="report-item">
            <div class="report-header">
                <div class="report-info">
                    <h3>${report.report_date} - ${report.employee_name}</h3>
                    <div class="report-meta">
                        社員ID: ${report.employee_id} | 部署: ${report.department}
                    </div>
                </div>
                <div class="report-actions">
                    <button class="btn btn-primary btn-small" onclick="showFormSection(${report.id})">編集</button>
                    <button class="btn btn-danger btn-small" onclick="deleteReport(${report.id})">削除</button>
                </div>
            </div>
            <div class="report-content">
                <h4>業務内容</h4>
                <p>${escapeHtml(report.work_content)}</p>
                ${report.achievements ? `<h4>本日の成果</h4><p>${escapeHtml(report.achievements)}</p>` : ''}
                ${report.issues ? `<h4>課題・問題点</h4><p>${escapeHtml(report.issues)}</p>` : ''}
                ${report.tomorrow_plan ? `<h4>明日の予定</h4><p>${escapeHtml(report.tomorrow_plan)}</p>` : ''}
                ${report.remarks ? `<h4>備考</h4><p>${escapeHtml(report.remarks)}</p>` : ''}
            </div>
        </div>
    `).join('');
}

async function loadReportForEdit(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`);
        const report = await response.json();
        
        document.getElementById('reportId').value = report.id;
        document.getElementById('reportDate').value = report.report_date;
        document.getElementById('employeeName').value = report.employee_name;
        document.getElementById('employeeId').value = report.employee_id;
        document.getElementById('department').value = report.department;
        document.getElementById('workContent').value = report.work_content;
        document.getElementById('achievements').value = report.achievements || '';
        document.getElementById('issues').value = report.issues || '';
        document.getElementById('tomorrowPlan').value = report.tomorrow_plan || '';
        document.getElementById('remarks').value = report.remarks || '';
    } catch (error) {
        console.error('Error loading report:', error);
        showModal('エラー', '日報の読み込みに失敗しました');
        showListSection();
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        employee_name: document.getElementById('employeeName').value,
        employee_id: document.getElementById('employeeId').value,
        department: document.getElementById('department').value,
        report_date: document.getElementById('reportDate').value,
        work_content: document.getElementById('workContent').value,
        achievements: document.getElementById('achievements').value,
        issues: document.getElementById('issues').value,
        tomorrow_plan: document.getElementById('tomorrowPlan').value,
        remarks: document.getElementById('remarks').value
    };
    
    try {
        const url = editingReportId ? `${API_BASE}/${editingReportId}` : API_BASE;
        const method = editingReportId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showModal('成功', result.message);
            showListSection();
        } else {
            showModal('エラー', result.error || '保存に失敗しました');
        }
    } catch (error) {
        console.error('Error saving report:', error);
        showModal('エラー', '保存に失敗しました');
    }
}

async function deleteReport(id) {
    if (!confirm('この日報を削除してもよろしいですか？')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showModal('成功', result.message);
            loadReports();
        } else {
            showModal('エラー', result.error || '削除に失敗しました');
        }
    } catch (error) {
        console.error('Error deleting report:', error);
        showModal('エラー', '削除に失敗しました');
    }
}

function clearFilters() {
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.getElementById('filterEmployeeId').value = '';
    document.getElementById('filterDepartment').value = '';
    loadReports();
}

async function exportToCSV() {
    try {
        const params = new URLSearchParams();
        const startDate = document.getElementById('filterStartDate').value;
        const endDate = document.getElementById('filterEndDate').value;
        
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        
        window.location.href = `${API_BASE}/export/csv?${params}`;
    } catch (error) {
        console.error('Error exporting CSV:', error);
        showModal('エラー', 'CSVエクスポートに失敗しました');
    }
}

function showModal(title, message) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `<h3>${title}</h3><p>${message}</p>`;
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}