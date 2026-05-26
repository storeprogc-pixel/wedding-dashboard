// Wedding Films Dashboard - Google Sheets Integration
// Sincronização bidirecional completa

const TASKS = [
    'Material baixado',
    'Backup',
    'Organizado',
    'Seleção de takes',
    'Sincronização',
    'Trilha sonora',
    'Corte principal',
    'Color grade',
    'Títulos/texto',
    'Exportação',
    'Entrega'
];

// Estado global
let projects = [];
let filter = 'todos';
let syncInProgress = false;
let autoSyncInterval = null;

// Configurações
const config = {
    sheetId: localStorage.getItem('sheetId') || '',
    apiKey: localStorage.getItem('apiKey') || '',
    autoSync: true,
    syncIntervalMinutes: 2
};

// ============================================
// GOOGLE SHEETS API
// ============================================

class GoogleSheetsSync {
    constructor(sheetId, apiKey) {
        this.sheetId = sheetId;
        this.apiKey = apiKey;
        this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
    }

    async readSheet() {
        if (!this.sheetId || !this.apiKey) {
            throw new Error('Configuração incompleta');
        }

        const range = 'Projetos!A2:P1000'; // Lê da linha 2 em diante
        const url = `${this.baseUrl}/${this.sheetId}/values/${range}?key=${this.apiKey}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error.message || 'Erro ao ler planilha');
            }

            const data = await response.json();
            return this.parseRows(data.values || []);
        } catch (error) {
            console.error('Erro ao ler planilha:', error);
            throw error;
        }
    }

    parseRows(rows) {
        return rows
            .filter(row => row[0]) // Ignora linhas vazias
            .map((row, index) => ({
                id: row[0] || `project-${index}`,
                nome: row[1] || '',
                data: row[2] || '',
                prazo: row[3] || '',
                status: row[4] || 'pendente',
                tasks: [
                    row[5] === 'TRUE',
                    row[6] === 'TRUE',
                    row[7] === 'TRUE',
                    row[8] === 'TRUE',
                    row[9] === 'TRUE',
                    row[10] === 'TRUE',
                    row[11] === 'TRUE',
                    row[12] === 'TRUE',
                    row[13] === 'TRUE',
                    row[14] === 'TRUE',
                    row[15] === 'TRUE'
                ],
                rowNumber: index + 2 // Linha na planilha (começa em 2)
            }));
    }

    async writeProject(project) {
        if (!this.sheetId || !this.apiKey) {
            throw new Error('Configuração incompleta');
        }

        const row = this.projectToRow(project);
        const range = `Projetos!A${project.rowNumber || 'append'}:P${project.rowNumber || ''}`;
        
        // Para adicionar novo projeto, usar append
        if (!project.rowNumber) {
            return this.appendProject(project);
        }

        // Para atualizar projeto existente
        const url = `${this.baseUrl}/${this.sheetId}/values/${range}?valueInputOption=RAW&key=${this.apiKey}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: [row]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error.message || 'Erro ao atualizar planilha');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao escrever projeto:', error);
            throw error;
        }
    }

    async appendProject(project) {
        const row = this.projectToRow(project);
        const range = 'Projetos!A:P';
        const url = `${this.baseUrl}/${this.sheetId}/values/${range}:append?valueInputOption=RAW&key=${this.apiKey}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: [row]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error.message || 'Erro ao adicionar projeto');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao adicionar projeto:', error);
            throw error;
        }
    }

    async deleteProject(rowNumber) {
        // Google Sheets API não tem endpoint direto para deletar linhas
        // Alternativa: limpar a linha
        const range = `Projetos!A${rowNumber}:P${rowNumber}`;
        const url = `${this.baseUrl}/${this.sheetId}/values/${range}:clear?key=${this.apiKey}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao deletar projeto');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao deletar projeto:', error);
            throw error;
        }
    }

    projectToRow(project) {
        return [
            project.id,
            project.nome,
            project.data || '',
            project.prazo || '',
            project.status,
            project.tasks[0] ? 'TRUE' : 'FALSE',
            project.tasks[1] ? 'TRUE' : 'FALSE',
            project.tasks[2] ? 'TRUE' : 'FALSE',
            project.tasks[3] ? 'TRUE' : 'FALSE',
            project.tasks[4] ? 'TRUE' : 'FALSE',
            project.tasks[5] ? 'TRUE' : 'FALSE',
            project.tasks[6] ? 'TRUE' : 'FALSE',
            project.tasks[7] ? 'TRUE' : 'FALSE',
            project.tasks[8] ? 'TRUE' : 'FALSE',
            project.tasks[9] ? 'TRUE' : 'FALSE',
            project.tasks[10] ? 'TRUE' : 'FALSE'
        ];
    }
}

// ============================================
// SYNC MANAGER
// ============================================

class SyncManager {
    constructor() {
        this.sheetsAPI = null;
        this.lastSyncTime = null;
        this.pendingChanges = [];
    }

    initialize() {
        if (config.sheetId && config.apiKey) {
            this.sheetsAPI = new GoogleSheetsSync(config.sheetId, config.apiKey);
            this.updateSyncStatus('connected', 'Conectado');
            
            if (config.autoSync) {
                this.startAutoSync();
            }
        } else {
            this.updateSyncStatus('error', 'Não configurado');
        }
    }

    async pullFromSheets() {
        if (!this.sheetsAPI) {
            throw new Error('Google Sheets não configurado');
        }

        this.updateSyncStatus('syncing', 'Sincronizando...');

        try {
            const sheetProjects = await this.sheetsAPI.readSheet();
            projects = sheetProjects;
            
            this.lastSyncTime = new Date();
            this.updateSyncStatus('connected', 'Sincronizado');
            this.updateLastSyncTime();
            
            return projects;
        } catch (error) {
            this.updateSyncStatus('error', 'Erro na sincronização');
            throw error;
        }
    }

    async pushToSheets(project) {
        if (!this.sheetsAPI) {
            // Se não está configurado, salva localmente
            this.pendingChanges.push(project);
            return;
        }

        this.updateSyncStatus('syncing', 'Salvando...');

        try {
            await this.sheetsAPI.writeProject(project);
            this.lastSyncTime = new Date();
            this.updateSyncStatus('connected', 'Salvo');
            this.updateLastSyncTime();
        } catch (error) {
            console.error('Erro ao salvar no Sheets:', error);
            this.pendingChanges.push(project);
            this.updateSyncStatus('error', 'Erro ao salvar');
        }
    }

    async deleteFromSheets(project) {
        if (!this.sheetsAPI || !project.rowNumber) {
            return;
        }

        try {
            await this.sheetsAPI.deleteProject(project.rowNumber);
            this.lastSyncTime = new Date();
            this.updateLastSyncTime();
        } catch (error) {
            console.error('Erro ao deletar do Sheets:', error);
        }
    }

    updateSyncStatus(type, message) {
        const indicator = document.getElementById('sync-indicator');
        const statusText = document.getElementById('sync-status-text');

        if (indicator) {
            indicator.className = 'sync-indicator';
            if (type === 'syncing') indicator.classList.add('syncing');
            if (type === 'error') indicator.classList.add('error');
        }

        if (statusText) {
            statusText.textContent = message;
        }
    }

    updateLastSyncTime() {
        const syncInfo = document.getElementById('sync-info');
        if (syncInfo && this.lastSyncTime) {
            const now = new Date();
            const diff = Math.floor((now - this.lastSyncTime) / 1000);
            
            let timeText;
            if (diff < 60) timeText = 'Agora';
            else if (diff < 3600) timeText = `${Math.floor(diff / 60)}min atrás`;
            else timeText = `${Math.floor(diff / 3600)}h atrás`;

            syncInfo.textContent = `Última sinc: ${timeText}`;
        }
    }

    startAutoSync() {
        if (autoSyncInterval) {
            clearInterval(autoSyncInterval);
        }

        autoSyncInterval = setInterval(() => {
            if (!syncInProgress) {
                this.pullFromSheets().then(() => {
                    render();
                }).catch(console.error);
            }
        }, config.syncIntervalMinutes * 60 * 1000);
    }

    stopAutoSync() {
        if (autoSyncInterval) {
            clearInterval(autoSyncInterval);
            autoSyncInterval = null;
        }
    }
}

const syncManager = new SyncManager();

// ============================================
// UI FUNCTIONS
// ============================================

function toggleAddForm() {
    const form = document.getElementById('add-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function addProject() {
    const nome = document.getElementById('inp-nome').value.trim();
    const data = document.getElementById('inp-data').value;
    const prazo = document.getElementById('inp-prazo').value;
    const status = document.getElementById('inp-status').value;

    if (!nome) {
        alert('Por favor, insira o nome do casal');
        return;
    }

    const newProject = {
        id: `project-${Date.now()}`,
        nome,
        data,
        prazo,
        status,
        tasks: Array(TASKS.length).fill(false)
    };

    projects.unshift(newProject);
    
    // Sincroniza com Google Sheets
    await syncManager.pushToSheets(newProject);
    
    render();

    // Limpa form
    document.getElementById('inp-nome').value = '';
    document.getElementById('inp-data').value = '';
    document.getElementById('inp-prazo').value = '';
    toggleAddForm();
}

function setFilter(f, btn) {
    filter = f;
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
}

async function toggleTask(id, i) {
    const p = projects.find(x => x.id === id);
    if (!p) return;

    p.tasks[i] = !p.tasks[i];
    
    if (p.tasks.every(t => t) && p.status !== 'entregue') {
        p.status = 'revisao';
    }

    await syncManager.pushToSheets(p);
    render();
}

async function setStatus(id, val) {
    const p = projects.find(x => x.id === id);
    if (!p) return;

    p.status = val;
    await syncManager.pushToSheets(p);
    render();
}

async function deleteProject(id) {
    if (!confirm('Tem certeza que deseja remover este projeto?')) {
        return;
    }

    const p = projects.find(x => x.id === id);
    if (p) {
        await syncManager.deleteFromSheets(p);
    }

    projects = projects.filter(x => x.id !== id);
    render();
}

function daysUntil(dateStr) {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr + 'T00:00:00');
    return Math.round((d - today) / (1000 * 60 * 60 * 24));
}

function deadlineLabel(days) {
    if (days === null) return { text: 'Sem prazo', cls: '' };
    if (days < 0) return { text: `${Math.abs(days)}d atrasado`, cls: 'urgente' };
    if (days === 0) return { text: 'Entrega hoje!', cls: 'urgente' };
    if (days <= 3) return { text: `${days}d restante${days > 1 ? 's' : ''}`, cls: 'urgente' };
    return { text: `${days}d restantes`, cls: 'ok' };
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function updateMetrics() {
    const total = projects.length;
    const editando = projects.filter(p => p.status === 'editando').length;
    const entregue = projects.filter(p => p.status === 'entregue').length;
    const urgente = projects.filter(p => {
        const d = daysUntil(p.prazo);
        return d !== null && d <= 3 && p.status !== 'entregue';
    }).length;

    document.getElementById('total-projects').textContent = total;
    document.getElementById('editing-count').textContent = editando;
    document.getElementById('urgent-count').textContent = urgente;
    document.getElementById('delivered-count').textContent = entregue;

    const completionRate = total > 0 ? Math.round((entregue / total) * 100) : 0;
    document.getElementById('completion-rate').textContent = completionRate + '%';
}

function renderProjects() {
    const list = document.getElementById('projects-list');
    const visible = filter === 'todos' ? projects : projects.filter(p => p.status === filter);

    if (!visible.length) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="ti ti-folder-off"></i>
                <p>Nenhum projeto encontrado</p>
            </div>
        `;
        return;
    }

    list.innerHTML = visible.map(p => {
        const done = p.tasks.filter(Boolean).length;
        const pct = Math.round(done / TASKS.length * 100);
        const dl = deadlineLabel(daysUntil(p.prazo));
        const statusLabels = {
            pendente: 'Pendente',
            editando: 'Editando',
            revisao: 'Revisão',
            entregue: 'Entregue'
        };
        const chips = TASKS.map((t, i) =>
            `<span class="task-chip${p.tasks[i] ? ' done' : ''}" onclick="toggleTask('${p.id}', ${i})">${t}</span>`
        ).join('');

        const dataFormatada = p.data ? new Date(p.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';

        return `
            <div class="project-card">
                <div class="project-top">
                    <div class="project-info">
                        <div class="project-name">
                            <i class="ti ti-heart" style="color: var(--accent-pink)"></i>
                            ${p.nome}
                        </div>
                        <div class="project-meta">
                            ${dataFormatada ? `<span class="project-date">Casamento: ${dataFormatada}</span>` : ''}
                            ${p.prazo ? `<span class="deadline ${dl.cls}"><i class="ti ti-calendar"></i>${dl.text}</span>` : ''}
                        </div>
                    </div>
                    <span class="badge ${p.status}">${statusLabels[p.status]}</span>
                </div>

                <div class="progress-container">
                    <div class="progress-bar-wrapper">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${pct}%"></div>
                        </div>
                        <span class="progress-percent">${pct}%</span>
                    </div>
                </div>

                <div class="task-chips">${chips}</div>

                <div class="project-actions">
                    <select class="status-select" onchange="setStatus('${p.id}', this.value)">
                        <option value="pendente"${p.status === 'pendente' ? ' selected' : ''}>Pendente</option>
                        <option value="editando"${p.status === 'editando' ? ' selected' : ''}>Editando</option>
                        <option value="revisao"${p.status === 'revisao' ? ' selected' : ''}>Revisão</option>
                        <option value="entregue"${p.status === 'entregue' ? ' selected' : ''}>Entregue</option>
                    </select>
                    <button class="btn-action delete" onclick="deleteProject('${p.id}')">
                        <i class="ti ti-trash"></i>
                        Remover
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function render() {
    updateMetrics();
    renderProjects();
    renderStatusChart();
}

// ============================================
// CHARTS
// ============================================

function initCharts() {
    // Productivity Chart
    const ctx = document.getElementById('productivityChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [{
                label: 'Projetos concluídos',
                data: [4, 6, 5, 8, 7, 9, 11, 8, 10, 12, 9, 5],
                borderColor: '#8b5cf6',
                backgroundColor: gradient,
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#8b5cf6',
                pointBorderColor: '#1e2433',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e2433',
                    titleColor: '#f8fafc',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(148, 163, 184, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748b' },
                    border: { display: false }
                },
                y: {
                    grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false },
                    ticks: { color: '#64748b', stepSize: 4 },
                    border: { display: false }
                }
            }
        }
    });
}

function renderStatusChart() {
    const statusCounts = {
        pendente: projects.filter(p => p.status === 'pendente').length,
        editando: projects.filter(p => p.status === 'editando').length,
        revisao: projects.filter(p => p.status === 'revisao').length,
        entregue: projects.filter(p => p.status === 'entregue').length
    };

    const statusCtx = document.getElementById('statusChart').getContext('2d');

    if (window.statusChartInstance) {
        window.statusChartInstance.destroy();
    }

    window.statusChartInstance = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
            labels: ['Pendente', 'Editando', 'Revisão', 'Entregue'],
            datasets: [{
                data: [statusCounts.pendente, statusCounts.editando, statusCounts.revisao, statusCounts.entregue],
                backgroundColor: ['#8b5cf6', '#3b82f6', '#ec4899', '#10b981'],
                borderWidth: 0,
                cutout: '75%'
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e2433',
                    titleColor: '#f8fafc',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(148, 163, 184, 0.1)',
                    borderWidth: 1,
                    padding: 12
                }
            }
        }
    });
}

// ============================================
// SETTINGS
// ============================================

function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    document.getElementById('sheet-id').value = config.sheetId;
    document.getElementById('api-key').value = config.apiKey;
    modal.classList.add('active');
}

function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('active');
}

function saveSettings() {
    const sheetId = document.getElementById('sheet-id').value.trim();
    const apiKey = document.getElementById('api-key').value.trim();

    if (!sheetId || !apiKey) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    config.sheetId = sheetId;
    config.apiKey = apiKey;

    localStorage.setItem('sheetId', sheetId);
    localStorage.setItem('apiKey', apiKey);

    syncManager.initialize();
    closeSettingsModal();

    // Faz primeira sincronização
    manualSync();
}

async function manualSync() {
    if (syncInProgress) return;

    syncInProgress = true;
    const btn = document.getElementById('sync-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="ti ti-loader"></i> Sincronizando...';

    try {
        await syncManager.pullFromSheets();
        render();
    } catch (error) {
        alert('Erro ao sincronizar: ' + error.message);
    } finally {
        syncInProgress = false;
        btn.disabled = false;
        btn.innerHTML = '<i class="ti ti-refresh"></i> Sincronizar';
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    syncManager.initialize();
    initCharts();

    // Tenta carregar dados do Sheets se configurado
    if (config.sheetId && config.apiKey) {
        manualSync();
    } else {
        // Se não configurado, mostra projetos demo
        projects = [
            {
                id: 'demo-1',
                nome: 'Maria & João',
                data: '2026-05-17',
                prazo: '2026-05-29',
                status: 'editando',
                tasks: [true, true, false, false, false, false, false, false, false, false, false]
            },
            {
                id: 'demo-2',
                nome: 'Carla & Pedro',
                data: '2026-05-10',
                prazo: '2026-05-24',
                status: 'editando',
                tasks: [true, true, true, true, true, false, false, false, false, false, false]
            }
        ];
        render();
    }

    // Atualiza tempo de sinc a cada minuto
    setInterval(() => {
        syncManager.updateLastSyncTime();
    }, 60000);
});
