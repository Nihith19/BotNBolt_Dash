// BotNBolt Dashboard - Core Application Shell Logic
(function () {

  // Navigation Icons Configuration (Lucide key mappings)
  const navIcons = {
    overview: 'layout-dashboard',
    companies: 'building-2',
    dealers: 'users',
    ai_analytics: 'cpu',
    repair_analytics: 'activity',
    billing: 'credit-card',
    tickets: 'ticket',
    permissions: 'shield-alert',
    insights: 'bar-chart-3',
    materials: 'wrench',
    requests: 'camera',
    leads: 'contact',
    profile: 'user-cog',
    ai_errors: 'alert-triangle',
    monitoring: 'heart-pulse',
    infrastructure: 'server',
    system_errors: 'alert-octagon',
    revenue: 'trending-up',
    ai_cost: 'brain-circuit',
    model_performance: 'shield-check',
    company_detail: 'building-2',
    dealer_detail: 'store',
    ticket_detail: 'ticket'
  };

  // Nav labels
  const navLabels = {
    overview: 'Overview',
    companies: 'Companies',
    dealers: 'Dealers',
    ai_analytics: 'AI Repair Analytics',
    repair_analytics: 'Repair Analytics',
    billing: 'Billing & Subscriptions',
    tickets: 'Support Tickets',
    permissions: 'Roles & Permissions',
    insights: 'Customer Insights',
    materials: 'Materials Database',
    requests: 'Repair Requests (AI)',
    leads: 'Customer CRM Leads',
    profile: 'Dealer Profile',
    ai_errors: 'AI Error Reports',
    monitoring: 'Live Monitoring',
    infrastructure: 'Infrastructure',
    system_errors: 'System Errors',
    revenue: 'Revenue Overview',
    ai_cost: 'AI Cost Breakdown',
    model_performance: 'Model Performance',
    company_detail: 'Company Detail',
    dealer_detail: 'Dealer Detail',
    ticket_detail: 'Ticket Details'
  };

  // Profiles mapping by role
  const roleProfiles = {
    superAdmin: { name: 'Nihit Sharma', avatar: 'SA', label: 'Super Admin' },
    companyAdmin: { name: 'Apex HQ Manager', avatar: 'HQ', label: 'Company Admin (Apex)' },
    dealer: { name: 'Apex Toronto Staff', avatar: 'DL', label: 'Dealer Manager' },
    supportAdmin: { name: 'Sarah Connor', avatar: 'SP', label: 'Support Lead' }
  };

  class BotNBoltDashboard {
    constructor() {
      this.state = {
        activeRole: 'superAdmin',
        activeMenu: 'overview',
        theme: 'light',
        db: null,
        charts: {},
        searchQueries: {},
        dropdownFilters: {},
        pageSizes: {},
        pageIndices: {},
        checkedRows: {},
        selectedCompanyId: null,
        selectedDealerId: null
      };

      this.init();
    }

    init() {
      // Load from localStorage or mockData.js
      const savedState = localStorage.getItem('botnbolt_state');
      if (savedState) {
        try {
          this.state.db = JSON.parse(savedState);
          // Safety validation check to clear out incompatible versions
          if (!this.state.db.superAdmin ||
            !this.state.db.superAdmin.dealers ||
            !this.state.db.superAdmin.kpis ||
            !this.state.db.superAdmin.kpis.totalCompanies ||
            typeof this.state.db.superAdmin.kpis.totalCompanies !== 'object' ||
            !this.state.db.superAdmin.kpis.monthlyRevenue ||
            !this.state.db.companyAdmin ||
            !this.state.db.dealer) {
            throw new Error("Outdated or corrupted state schema");
          }

          // Migrate missing fields for safety
          if (this.state.db.dealer && !this.state.db.dealer.materialRecommendations) {
            this.state.db.dealer.materialRecommendations = JSON.parse(JSON.stringify(window.BotNBoltMockData.dealer.materialRecommendations));
            this.saveState();
          }
        } catch (e) {
          console.warn("Discarding saved state:", e.message);
          this.state.db = JSON.parse(JSON.stringify(window.BotNBoltMockData));
          this.saveState();
        }
      } else {
        this.state.db = JSON.parse(JSON.stringify(window.BotNBoltMockData));
      }

      // Check saved theme
      const savedTheme = localStorage.getItem('botnbolt_theme') || 'light';
      this.setTheme(savedTheme);

      // Expose globally
      window.BotNBoltApp = this;

      // Populate Sidebar & Render Page
      this.switchRole(this.state.activeRole);
    }

    saveState() {
      localStorage.setItem('botnbolt_state', JSON.stringify(this.state.db));
    }

    resetState() {
      localStorage.removeItem('botnbolt_state');
      this.state.db = JSON.parse(JSON.stringify(window.BotNBoltMockData));
      this.switchRole(this.state.activeRole);
      alert("Session storage has been reset to defaults.");
    }

    setTheme(theme) {
      this.state.theme = theme;
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('botnbolt_theme', theme);

      // Update toggle icon
      const themeIcon = document.getElementById('themeIcon');
      if (themeIcon) {
        themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
        lucide.createIcons();
      }

      // Trigger charts repaint with new gridcolors if needed
      this.updateChartsTheme();
    }

    toggleTheme() {
      this.setTheme(this.state.theme === 'light' ? 'dark' : 'light');
    }

    switchRole(role) {
      this.state.activeRole = role;
      this.state.activeMenu = 'overview';

      // Sync dropdown element
      const selector = document.getElementById('roleSelector');
      if (selector) selector.value = role;

      // Update User details in sidebar footer
      const profile = roleProfiles[role];
      document.getElementById('userAvatar').innerText = profile.avatar;
      document.getElementById('userName').innerText = profile.name;
      document.getElementById('userRoleBadge').innerText = profile.label;

      this.renderSidebar();
      this.renderCurrentView();
    }

    renderSidebar() {
      const container = document.getElementById('sidebarNav');
      container.innerHTML = '';

      let items = [];
      if (this.state.activeRole === 'superAdmin') {
        items = ['overview', 'companies', 'dealers', 'ai_analytics', 'billing', 'revenue', 'ai_cost', 'model_performance', 'infrastructure', 'system_errors', 'tickets', 'permissions'];
      } else if (this.state.activeRole === 'companyAdmin') {
        items = ['overview', 'dealers', 'repair_analytics', 'insights', 'materials', 'tickets'];
      } else if (this.state.activeRole === 'dealer') {
        items = ['overview', 'requests', 'materials', 'leads', 'tickets', 'profile'];
      } else if (this.state.activeRole === 'supportAdmin') {
        items = ['overview', 'tickets', 'companies', 'dealers', 'ai_errors', 'monitoring'];
      }

      items.forEach(item => {
        const activeClass = this.state.activeMenu === item ? 'active' : '';
        const icon = navIcons[item] || 'circle';
        const label = navLabels[item] || item;

        const navLink = document.createElement('div');
        navLink.className = `nav-link ${activeClass}`;
        navLink.innerHTML = `<i data-lucide="${icon}"></i> <span>${label}</span>`;
        navLink.onclick = () => this.navigate(item);
        container.appendChild(navLink);
      });

      lucide.createIcons();
    }

    navigate(menuItem) {
      this.state.activeMenu = menuItem;

      // Highlight sidebar
      const links = document.querySelectorAll('.nav-link');
      links.forEach(link => link.classList.remove('active'));

      // Find matching item and make active
      const index = Array.from(document.getElementById('sidebarNav').children).findIndex(child =>
        child.querySelector('span').innerText === (navLabels[menuItem] || menuItem)
      );
      if (index !== -1) {
        document.getElementById('sidebarNav').children[index].classList.add('active');
      }

      this.renderCurrentView();
    }

    navigateToCompany(companyId) {
      this.state.selectedCompanyId = companyId;
      this.state.selectedDealerId = null;
      this.navigate('company_detail');
    }

    navigateToDealer(dealerId) {
      this.state.selectedDealerId = dealerId;
      this.navigate('dealer_detail');
    }

    navigateToTicket(ticketId) {
      this.state.selectedTicketId = ticketId;
      this.navigate('ticket_detail');
    }

    toggleSidebar() {
      const sidebar = document.getElementById('sidebar');
      sidebar.classList.toggle('active');
    }

    renderCurrentView() {
      // Clean up previous charts
      this.destroyCharts();

      const canvas = document.getElementById('contentCanvas');
      const role = this.state.activeRole;
      const menu = this.state.activeMenu;

      // Update titles
      const pTitle = navLabels[menu] || 'Overview';
      document.getElementById('pageTitle').innerText = `${pTitle} (${roleProfiles[role].label})`;
      document.getElementById('pageSubtitle').innerText = `Workspace views & active records management`;

      // Main Render routing switcher
      if (menu === 'ticket_detail') {
        document.getElementById('pageTitle').innerText = `Ticket Details (${roleProfiles[role].label})`;
        document.getElementById('pageSubtitle').innerText = `Support Ticket Logs and Diagnostic Information`;
        this.renderTicketDetailView(canvas);
        lucide.createIcons();
        return;
      }

      if (role === 'superAdmin') {
        this.renderSuperAdminView(canvas, menu);
      } else if (role === 'companyAdmin') {
        this.renderCompanyAdminView(canvas, menu);
      } else if (role === 'dealer') {
        this.renderDealerView(canvas, menu);
      } else if (role === 'supportAdmin') {
        this.renderSupportAdminView(canvas, menu);
      }

      lucide.createIcons();
    }

    renderTicketDetailView(canvas) {
      const ticketId = this.state.selectedTicketId;
      
      // Safety checks and lookup
      if (!this.state.db.supportAdmin) {
        this.state.db.supportAdmin = JSON.parse(JSON.stringify(window.BotNBoltMockData.supportAdmin || {}));
      }
      if (!this.state.db.supportAdmin.tickets) {
        this.state.db.supportAdmin.tickets = JSON.parse(JSON.stringify((window.BotNBoltMockData && window.BotNBoltMockData.supportAdmin && window.BotNBoltMockData.supportAdmin.tickets) || []));
      }

      let tkt = this.state.db.supportAdmin.tickets.find(t => t.id === ticketId);
      let isCompanyAdminTicket = false;

      if (!tkt && this.state.db.companyAdmin && this.state.db.companyAdmin.supportTickets) {
        tkt = this.state.db.companyAdmin.supportTickets.find(t => t.id === ticketId);
        isCompanyAdminTicket = true;
      }

      if (!tkt) {
        canvas.innerHTML = `
          <div class="card" style="padding: 40px; text-align: center;">
            <i data-lucide="alert-circle" style="width: 48px; height: 48px; color: var(--danger); margin-bottom: 16px;"></i>
            <h3>Ticket Not Found</h3>
            <p style="color: var(--text-secondary); margin-bottom: 24px;">The ticket with ID <strong>${ticketId}</strong> could not be found in the active workspace database.</p>
            <button class="btn btn-primary" onclick="window.BotNBoltApp.navigate('tickets')">Back to Support Tickets</button>
          </div>
        `;
        return;
      }

      // Map values consistently (handling slightly different keys between stores)
      const id = tkt.id;
      const category = tkt.issueType || tkt.problem || 'System Issue';
      const customer = tkt.customerName || tkt.raisedBy || 'Store Representative';
      const companyName = tkt.company || 'Home hardware';
      const dealerName = tkt.dealer || 'HQ Admin';
      const cityLoc = tkt.city || 'N/A';
      const priorityVal = tkt.priority || 'Medium';
      const statusVal = tkt.status || 'Open';
      const assignedAgent = tkt.assignedTo || tkt.assigned || 'Unassigned';
      const respTime = tkt.responseTime || '15 min';
      const resolTime = tkt.resolutionTime || 'Pending';
      const dateCreated = tkt.date || '2026-07-07 10:30 AM';

      // Generate a detailed problem log
      let issueDescriptionText = '';
      const catLower = category.toLowerCase();
      if (catLower.includes('detection') || catLower.includes('wrong') || catLower.includes('ai') || catLower.includes('scratch')) {
        issueDescriptionText = `The local automated hardware scan recommended parts mismatches for a critical repair. Specifically, the neural scan model classified surface rust corrosion as structural fatigue. This created incorrect cost estimates for the repair category. Requesting remote diagnostic logs override and model alignment review.`;
      } else if (catLower.includes('login') || catLower.includes('auth') || catLower.includes('access')) {
        issueDescriptionText = `Dealer store agents reported recurring authorization timeouts during shifts. The session cookies are expired prematurely. This causes repeated prompt verification blocks. Logs show authorization errors code BB-AUTH-403 under the dealer portal workspace.`;
      } else if (catLower.includes('billing') || catLower.includes('dispute') || catLower.includes('pricing') || catLower.includes('invoice')) {
        issueDescriptionText = `Billing dispute on transactional calculation tiers. The automated pipeline calculated bulk tier pricing using base unit rules, resulting in an invoice discrepancy. Requesting billing adjustments and manual account reviews.`;
      } else if (catLower.includes('api') || catLower.includes('failure') || catLower.includes('timeout')) {
        issueDescriptionText = `Sync API synchronization endpoints returned 504 Gateway Timeout responses during peak traffic hours. Payload sizes averaged 14.2 KB. Initial health indicators show heavy API thread locking and network connection lag.`;
      } else if (catLower.includes('widget') || catLower.includes('integration') || catLower.includes('connection')) {
        issueDescriptionText = `External API handshake failed. The host server refused the connection because authorization tokens were missing in the outbound client headers. Verified domain whitelist rules are active.`;
      } else {
        issueDescriptionText = `The partner brand raised an escalation regarding general scanner platform instability during high-volume diagnostic sync cycles. No custom error trace was returned. Internal monitoring logs have been compiled for review.`;
      }

      // Priority and Status badge colors
      const priorityBadgeClass = priorityVal === 'High' ? 'badge-danger' : priorityVal === 'Medium' ? 'badge-warning' : 'badge-info';
      const statusBadgeClass = statusVal === 'Open' ? 'badge-danger' : statusVal === 'Resolved' ? 'badge-success' : 'badge-warning';

      canvas.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:24px; animation: fadeIn 0.3s ease;">
          
          <!-- Back navigation & Main Action Header -->
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
            <div style="display:flex; align-items:center; gap:16px;">
              <button class="btn btn-secondary btn-sm flex-center" onclick="window.BotNBoltApp.navigate('tickets')" style="padding: 8px 12px; height: auto;">
                <i data-lucide="arrow-left" style="width: 16px; height: 16px; margin-right: 6px;"></i> Back to Queue
              </button>
              <h3 style="margin:0; font-size:1.4rem; font-weight:800; color:var(--text-primary);">Ticket #${id}</h3>
              <span class="badge ${statusBadgeClass}" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 9999px;">${statusVal}</span>
            </div>
            <div style="display:flex; gap:12px;">
            </div>
          </div>

          <!-- Metrical Summary Panel Grid -->
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px;">
            
            <!-- Column 1: Ticket Info -->
            <div class="card" style="padding: 20px; border-left: 4px solid var(--primary); display:flex; flex-direction:column; gap:12px;">
              <h4 style="margin:0; font-size:0.95rem; font-weight:700; color:var(--text-primary); text-transform:uppercase; letter-spacing:0.05em;">Issue Identity</h4>
              <div>
                <span style="font-size:0.75rem; color:var(--text-secondary); display:block;">Category</span>
                <strong style="font-size:0.9rem; color:var(--text-primary);">${category}</strong>
              </div>
              <div>
                <span style="font-size:0.75rem; color:var(--text-secondary); display:block;">Priority Classification</span>
                <span class="badge ${priorityBadgeClass}" style="margin-top:4px;">${priorityVal} Priority</span>
              </div>
              <div>
                <span style="font-size:0.75rem; color:var(--text-secondary); display:block;">Submitted Date/Time</span>
                <span style="font-size:0.88rem; font-weight:600; color:var(--text-primary);">${dateCreated}</span>
              </div>
            </div>

            <!-- Column 2: Customer & Store Location -->
            <div class="card" style="padding: 20px; border-left: 4px solid var(--success); display:flex; flex-direction:column; gap:12px;">
              <h4 style="margin:0; font-size:0.95rem; font-weight:700; color:var(--text-primary); text-transform:uppercase; letter-spacing:0.05em;">Entity Information</h4>
              <div>
                <span style="font-size:0.75rem; color:var(--text-secondary); display:block;">Raised By (Customer)</span>
                <strong style="font-size:0.9rem; color:var(--text-primary);">${customer}</strong>
              </div>
              <div>
                <span style="font-size:0.75rem; color:var(--text-secondary); display:block;">Partner Brand / Company</span>
                <span style="font-size:0.88rem; font-weight:600; color:var(--text-primary);">${companyName}</span>
              </div>
              <div>
                <span style="font-size:0.75rem; color:var(--text-secondary); display:block;">Dealer Outlet & City</span>
                <span style="font-size:0.88rem; font-weight:600; color:var(--text-primary);">${dealerName} (${cityLoc})</span>
              </div>
            </div>

            <!-- Column 3: SLA & Assignment -->
            <div class="card" style="padding: 20px; border-left: 4px solid var(--warning); display:flex; flex-direction:column; gap:12px;">
              <h4 style="margin:0; font-size:0.95rem; font-weight:700; color:var(--text-primary); text-transform:uppercase; letter-spacing:0.05em;">SLA & Assignment</h4>
              <div>
                <span style="font-size:0.75rem; color:var(--text-secondary); display:block;">Response SLA Goal</span>
                <strong style="font-size:0.9rem; color:var(--primary);">${respTime}</strong>
              </div>
              <div>
                <span style="font-size:0.75rem; color:var(--text-secondary); display:block;">Assigned Support Agent</span>
                <strong style="font-size:0.9rem; color:var(--text-primary);">${assignedAgent}</strong>
              </div>
              <div>
                <span style="font-size:0.75rem; color:var(--text-secondary); display:block;">Resolution Duration</span>
                <span style="font-size:0.88rem; font-weight:600; color:var(--text-primary);">${resolTime}</span>
              </div>
            </div>

          </div>

          <!-- Split Details Section: Description vs Audit History Timeline -->
          <div style="display:grid; grid-template-columns: 3fr 2fr; gap:24px;">
            
            <!-- Left Split: Issue Log Description and Diagnostics JSON -->
            <div style="display:flex; flex-direction:column; gap:24px;">
              
              <!-- Issue Log Details -->
              <div class="card" style="padding: 24px;">
                <h4 style="margin:0 0 16px 0; font-size:1.1rem; font-weight:700; color:var(--text-primary);">Ticket Description & Issue Narrative</h4>
                <p style="font-size:0.9rem; line-height:1.6; color:var(--text-secondary); margin:0;">${issueDescriptionText}</p>
                <div style="margin-top:20px; padding: 12px; background: rgba(37,99,235,0.05); border-radius: var(--radius-sm); font-size: 0.8rem; color: var(--primary);">
                  <strong>Note:</strong> Initial client sync response has been flagged. Standard triage rules matched this queue automatically.
                </div>
              </div>

              <!-- Technical System Diagnostics -->
              <div class="card" style="padding: 24px;">
                <h4 style="margin:0 0 16px 0; font-size:1.1rem; font-weight:700; color:var(--text-primary);">System Diagnostic Payload</h4>
                <pre style="background:var(--bg-app); border:1px solid var(--border-color); padding:16px; border-radius:var(--radius-md); font-family:monospace; font-size:0.8rem; color:var(--text-primary); overflow-x:auto; margin:0;">{
  "system_OS": "OS X 10.15.7 (Mac)",
  "browser_agent": "Chrome 124.0.0.0 (zsh/shell)",
  "API_endpoint": "https://api.botnbolt.com/v1/scans/sync",
  "payload_size": "14.2 KB",
  "error_code": "BB-AUTH-403",
  "diagnostics_timestamp": "${dateCreated}",
  "assigned_representative": "${assignedAgent}",
  "auto_classification_priority": "${priorityVal}"
}</pre>
              </div>

            </div>

            <!-- Right Split: Interactive Audit Trail Timeline -->
            <div class="card" style="padding: 24px;">
              <h4 style="margin:0 0 20px 0; font-size:1.1rem; font-weight:700; color:var(--text-primary);">Ticket Audit Trail Timeline</h4>
              <div style="display:flex; flex-direction:column; gap:20px; position:relative; padding-left:24px;">
                
                <!-- Center vertical line -->
                <div style="position:absolute; left:6px; top:8px; bottom:8px; width:2px; background:var(--border-color);"></div>

                <!-- Step 1 -->
                <div style="position:relative;">
                  <div style="position:absolute; left:-24px; top:4px; width:12px; height:12px; border-radius:50%; background:var(--primary); border:2px solid var(--bg-card); z-index:2;"></div>
                  <div style="font-size:0.75rem; color:var(--text-secondary); font-weight:600;">10:30 AM — Ticket Created</div>
                  <div style="font-weight:700; font-size:0.85rem; color:var(--text-primary); margin-top:2px;">Ticket Log Created</div>
                  <p style="font-size:0.78rem; color:var(--text-secondary); margin:2px 0 0 0;">Submitted via brand API endpoint. Ticket ID allocated.</p>
                </div>

                <!-- Step 2 -->
                <div style="position:relative;">
                  <div style="position:absolute; left:-24px; top:4px; width:12px; height:12px; border-radius:50%; background:var(--warning); border:2px solid var(--bg-card); z-index:2;"></div>
                  <div style="font-size:0.75rem; color:var(--text-secondary); font-weight:600;">10:32 AM — System Classified</div>
                  <div style="font-weight:700; font-size:0.85rem; color:var(--text-primary); margin-top:2px;">Automated Priority Triaging</div>
                  <p style="font-size:0.78rem; color:var(--text-secondary); margin:2px 0 0 0;">Priority auto-classified as <strong>${priorityVal}</strong> based on category classification.</p>
                </div>

                <!-- Step 3 -->
                <div style="position:relative;">
                  <div style="position:absolute; left:-24px; top:4px; width:12px; height:12px; border-radius:50%; background:var(--success); border:2px solid var(--bg-card); z-index:2;"></div>
                  <div style="font-size:0.75rem; color:var(--text-secondary); font-weight:600;">10:45 AM — Agent Assigned</div>
                  <div style="font-weight:700; font-size:0.85rem; color:var(--text-primary); margin-top:2px;">Representative Allocated</div>
                  <p style="font-size:0.78rem; color:var(--text-secondary); margin:2px 0 0 0;">Assigned to support executive <strong>${assignedAgent}</strong>.</p>
                </div>

                <!-- Step 4 -->
                <div style="position:relative;">
                  <div style="position:absolute; left:-24px; top:4px; width:12px; height:12px; border-radius:50%; background:var(--info); border:2px solid var(--bg-card); z-index:2;"></div>
                  <div style="font-size:0.75rem; color:var(--text-secondary); font-weight:600;">10:50 AM — SLA Action</div>
                  <div style="font-weight:700; font-size:0.85rem; color:var(--text-primary); margin-top:2px;">Response SLA Acknowledged</div>
                  <p style="font-size:0.78rem; color:var(--text-secondary); margin:2px 0 0 0;">First-contact SLA benchmark verified at <strong>${respTime}</strong> target.</p>
                </div>

                <!-- Step 5 (Optional conditional resolution) -->
                ${statusVal === 'Resolved' ? `
                  <div style="position:relative;">
                    <div style="position:absolute; left:-24px; top:4px; width:12px; height:12px; border-radius:50%; background:var(--success); border:2px solid var(--bg-card); z-index:2;"></div>
                    <div style="font-size:0.75rem; color:var(--success); font-weight:600;">Audit Complete</div>
                    <div style="font-weight:700; font-size:0.85rem; color:var(--text-primary); margin-top:2px;">Status Updated: Resolved</div>
                    <p style="font-size:0.78rem; color:var(--text-secondary); margin:2px 0 0 0;">Marked resolved in database. Resolution logged.</p>
                  </div>
                ` : ''}

              </div>
            </div>

          </div>

        </div>
      `;
    }

    destroyCharts() {
      Object.keys(this.state.charts).forEach(key => {
        if (this.state.charts[key]) {
          this.state.charts[key].destroy();
        }
      });
      this.state.charts = {};
    }

    updateChartsTheme() {
      // Repaint charts if views are loaded
      this.renderCurrentView();
    }

    getChartColors() {
      const isDark = this.state.theme === 'dark';
      return {
        grid: isDark ? '#1f2937' : '#e2e8f0',
        text: isDark ? '#9ca3af' : '#64748b',
        primary: '#2563eb',
        primaryGlow: 'rgba(37, 99, 235, 0.15)',
        secondary: '#60a5fa',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444'
      };
    }

    // ----------------------------------------------------
    // SUPER ADMIN VIEWS
    // ----------------------------------------------------
    renderSuperAdminView(canvas, menu) {
      const db = this.state.db.superAdmin;

      if (menu === 'overview') {
        canvas.innerHTML = `
          <!-- Full-Width 10 KPI Cards Grid Row at the Top -->
          <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap: 20px; margin-bottom: 24px;">
            
            <!-- Active Companies → navigate to companies -->
            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.navigate('companies')" style="padding: 16px; border-left: 4px solid var(--primary); display:flex; justify-content:space-between; align-items:center; background: linear-gradient(135deg, var(--bg-card) 0%, rgba(37, 99, 235, 0.05) 100%); cursor:pointer; transition: transform 0.15s, box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 24px rgba(37,99,235,0.15)'" onmouseleave="this.style.transform=''; this.style.boxShadow=''">
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Active Companies</div>
                <strong style="font-size:1.4rem; color:var(--text-primary); font-family:var(--font-family);">${db.kpis.totalCompanies.value}</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="building-2" style="color: var(--primary); width: 20px; height: 20px; margin-bottom:4px;"></i>
                <span style="color:var(--success); font-size:0.7rem; font-weight:600; background:rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px;">+0 New</span>
              </div>
            </div>
            
            <!-- Total Dealers → navigate to dealers -->
            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.navigate('dealers')" style="padding: 16px; border-left: 4px solid var(--success); display:flex; justify-content:space-between; align-items:center; background: linear-gradient(135deg, var(--bg-card) 0%, rgba(16, 185, 129, 0.05) 100%); cursor:pointer; transition: transform 0.15s, box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 24px rgba(16,185,129,0.15)'" onmouseleave="this.style.transform=''; this.style.boxShadow=''">
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Total Dealers</div>
                <strong style="font-size:1.4rem; color:var(--text-primary); font-family:var(--font-family);">${db.kpis.totalDealers.value}</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="store" style="color: var(--success); width: 20px; height: 20px; margin-bottom:4px;"></i>
                <span style="color:var(--success); font-size:0.7rem; font-weight:600; background:rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px;">+4 New</span>
              </div>
            </div>
            
            <!-- AI Inferences → navigate to ai_analytics -->
            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.navigate('ai_analytics')" style="padding: 16px; border-left: 4px solid var(--warning); display:flex; justify-content:space-between; align-items:center; background: linear-gradient(135deg, var(--bg-card) 0%, rgba(245, 158, 11, 0.05) 100%); cursor:pointer; transition: transform 0.15s, box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 24px rgba(245,158,11,0.15)'" onmouseleave="this.style.transform=''; this.style.boxShadow=''">
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">AI Inferences</div>
                <strong style="font-size:1.4rem; color:var(--text-primary); font-family:var(--font-family);">${db.kpis.totalRepairScans.value}</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="cpu" style="color: var(--warning); width: 20px; height: 20px; margin-bottom:4px;"></i>
                <span style="color:var(--success); font-size:0.7rem; font-weight:600; background:rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px;">+12% wk</span>
              </div>
            </div>
            
            <!-- Est. Revenue → revenue (dedicated page) -->
            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.navigate('revenue')" style="padding: 16px; border-left: 4px solid var(--danger); display:flex; justify-content:space-between; align-items:center; background: linear-gradient(135deg, var(--bg-card) 0%, rgba(239, 68, 68, 0.05) 100%); cursor:pointer; transition: transform 0.15s, box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 24px rgba(239,68,68,0.15)'" onmouseleave="this.style.transform=''; this.style.boxShadow=''">
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Est. Revenue</div>
                <strong style="font-size:1.4rem; color:var(--text-primary); font-family:var(--font-family);">${db.kpis.monthlyRevenue.value}</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="banknote" style="color: var(--danger); width: 20px; height: 20px; margin-bottom:4px;"></i>
                <span style="color:var(--success); font-size:0.7rem; font-weight:600; background:rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px;">+8.4%</span>
              </div>
            </div>
            
            <!-- Expiring Licenses → navigate to billing -->
            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.navigate('billing')" style="padding: 16px; border-left: 4px solid #f59e0b; display:flex; justify-content:space-between; align-items:center; background: linear-gradient(135deg, var(--bg-card) 0%, rgba(245, 158, 11, 0.05) 100%); cursor:pointer; transition: transform 0.15s, box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 24px rgba(245,158,11,0.2)'" onmouseleave="this.style.transform=''; this.style.boxShadow=''">
              <div>
                <div style="font-size:0.7rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Expiring Licenses</div>
                <strong style="font-size:1.4rem; color:var(--text-primary); font-family:var(--font-family);">${db.kpis.subscriptionExpiryAlerts.value} Warning</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="alert-circle" style="color: #f59e0b; width: 20px; height: 20px; margin-bottom:4px;"></i>
                <span style="color:var(--warning); font-size:0.7rem; font-weight:600; background:rgba(245, 158, 11, 0.1); padding: 2px 6px; border-radius: 4px;">30 Days</span>
              </div>
            </div>
            
            <!-- AWS Infra Cost → navigate to infrastructure (dedicated page) -->
            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.navigate('infrastructure')" style="padding: 16px; border-left: 4px solid #a855f7; display:flex; justify-content:space-between; align-items:center; background: linear-gradient(135deg, var(--bg-card) 0%, rgba(168, 85, 247, 0.05) 100%); cursor:pointer; transition: transform 0.15s, box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 24px rgba(168,85,247,0.15)'" onmouseleave="this.style.transform=''; this.style.boxShadow=''">
              <div>
                <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">AWS Infra Cost</div>
                <strong style="font-size:1.4rem; color:var(--text-primary); font-family:var(--font-family);">${db.kpis.awsCost.value}</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="server" style="color: #a855f7; width: 20px; height: 20px; margin-bottom:4px;"></i>
                <span style="color:var(--success); font-size:0.7rem; font-weight:600; background:rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px;">+4.2%</span>
              </div>
            </div>

            <!-- AI Cost → ai_cost (dedicated page) -->
            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.navigate('ai_cost')" style="padding: 16px; border-left: 4px solid #06b6d4; display:flex; justify-content:space-between; align-items:center; background: linear-gradient(135deg, var(--bg-card) 0%, rgba(6, 182, 212, 0.05) 100%); cursor:pointer; transition: transform 0.15s, box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 24px rgba(6,182,212,0.15)'" onmouseleave="this.style.transform=''; this.style.boxShadow=''">
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">AI Cost</div>
                <strong style="font-size:1.4rem; color:var(--text-primary); font-family:var(--font-family);">${db.kpis.aiCost.value}</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="brain-circuit" style="color: #06b6d4; width: 20px; height: 20px; margin-bottom:4px;"></i>
                <span style="color:var(--success); font-size:0.7rem; font-weight:600; background:rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px;">+1.8%</span>
              </div>
            </div>

            <!-- Avg Response → navigate to infrastructure (dedicated page) -->
            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.navigate('infrastructure')" style="padding: 16px; border-left: 4px solid #3b82f6; display:flex; justify-content:space-between; align-items:center; background: linear-gradient(135deg, var(--bg-card) 0%, rgba(59, 130, 246, 0.05) 100%); cursor:pointer; transition: transform 0.15s, box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 24px rgba(59,130,246,0.15)'" onmouseleave="this.style.transform=''; this.style.boxShadow=''">
              <div>
                <div style="font-size:0.71rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Avg Response</div>
                <strong style="font-size:1.4rem; color:var(--text-primary); font-family:var(--font-family);">${db.kpis.avgResponseTime.value}</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="zap" style="color: #3b82f6; width: 20px; height: 20px; margin-bottom:4px;"></i>
                <span style="color:var(--success); font-size:0.6rem; font-weight:600; background:rgba(16, 185, 129, 0.1); padding: 2px 4px; border-radius: 4px;">99.9% Up</span>
              </div>
            </div>

            <!-- AI Model Accuracy → model_performance (dedicated page) -->
            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.navigate('model_performance')" style="padding: 16px; border-left: 4px solid #10b981; display:flex; justify-content:space-between; align-items:center; background: linear-gradient(135deg, var(--bg-card) 0%, rgba(16, 185, 129, 0.05) 100%); cursor:pointer; transition: transform 0.15s, box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 24px rgba(16,185,129,0.15)'" onmouseleave="this.style.transform=''; this.style.boxShadow=''">
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Model Accuracy</div>
                <strong style="font-size:1.4rem; color:var(--text-primary); font-family:var(--font-family);">${db.kpis.avgRepairAccuracy.value}</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="shield-check" style="color: #10b981; width: 20px; height: 20px; margin-bottom:4px;"></i>
                <span style="color:var(--success); font-size:0.6rem; font-weight:600; background:rgba(16, 185, 129, 0.1); padding: 2px 4px; border-radius: 4px;">+0.8% accuracy</span>
              </div>
            </div>

            <!-- Today's Errors → navigate to system_errors (dedicated page) -->
            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.navigate('system_errors')" style="padding: 16px; border-left: 4px solid #f43f5e; display:flex; justify-content:space-between; align-items:center; background: linear-gradient(135deg, var(--bg-card) 0%, rgba(244, 63, 94, 0.05) 100%); cursor:pointer; transition: transform 0.15s, box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 24px rgba(244,63,94,0.15)'" onmouseleave="this.style.transform=''; this.style.boxShadow=''">
              <div>
                <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Today's Errors</div>
                <strong style="font-size:1.4rem; color:var(--text-primary); font-family:var(--font-family);">${db.kpis.todayErrors.value}</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="alert-octagon" style="color: #f43f5e; width: 20px; height: 20px; margin-bottom:4px;"></i>
                <span style="color:var(--success); font-size:0.7rem; font-weight:600; background:rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px;">-12% drop</span>
              </div>
            </div>
            
          </div>

          <!-- Premium Split Layout -->
          <div class="layout-split" style="grid-template-columns: 2fr 1fr; gap: 24px;">
            
            <!-- LEFT COLUMN: Key Summaries and Charts -->
            <div style="display:flex; flex-direction:column; gap:24px;">
              
              <!-- User Growth & AI Scan Inferences Trends -->
              <div class="card" style="padding: 24px;">
                <div class="card-header" style="padding: 0 0 16px 0; border-bottom: 1px solid var(--border-color); margin-bottom: 20px;">
                  <span class="card-title" style="font-size: 1rem; font-weight: 700; color: var(--text-primary);">User Growth & AI Scan Inferences Trends</span>
                </div>
                <div style="height: 280px;"><canvas id="growthChart"></canvas></div>
              </div>

              <!-- Investment vs Net Profit Trend -->
              <div class="card" style="padding: 24px;">
                <div class="card-header" style="padding: 0 0 16px 0; border-bottom: 1px solid var(--border-color); margin-bottom: 20px;">
                  <span class="card-title" style="font-size: 1rem; font-weight: 700; color: var(--text-primary);">Monthly Investment vs Net Profit Growth</span>
                </div>
                <div style="height: 280px;"><canvas id="investmentVsProfitChart"></canvas></div>
              </div>

              <!-- Revenue Growth Rate Chart -->
              <div class="card" style="padding: 24px;">
                <div class="card-header" style="padding: 0 0 16px 0; border-bottom: 1px solid var(--border-color); margin-bottom: 20px;">
                  <span class="card-title" style="font-size: 1rem; font-weight: 700; color: var(--text-primary);">Revenue Growth month-over-month (%)</span>
                </div>
                <div style="height: 280px;"><canvas id="revenueGrowthChart"></canvas></div>
              </div>

              <!-- Total Application Usage Graph -->
              <div class="card" style="padding: 24px;">
                <div class="card-header" style="padding: 0 0 16px 0; border-bottom: 1px solid var(--border-color); margin-bottom: 20px;">
                  <span class="card-title" style="font-size: 1rem; font-weight: 700; color: var(--text-primary);">Total Application Usage (Monthly Sessions)</span>
                </div>
                <div style="height: 280px;"><canvas id="appUsageChart"></canvas></div>
              </div>

            </div>

            <!-- RIGHT COLUMN: Circular SVG meters, Activity logs, Integration status -->
            <div style="display:flex; flex-direction:column; gap:24px;">
              
              <!-- Circular Progress 1: Sales Conversion Ratio -->
              <div class="card" style="text-align:center; padding:20px;">
                <div class="card-header" style="justify-content:center; padding:0 0 12px 0; border-bottom:1px solid var(--border-color); margin-bottom:16px;">
                  <span class="card-title">Sales Conversion Ratio</span>
                </div>
                <div style="position:relative; width:130px; height:130px; margin:16px auto;">
                  <svg width="130" height="130" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="45" stroke="var(--bg-app)" stroke-width="8" fill="transparent" />
                    <circle cx="60" cy="60" r="45" stroke="#a855f7" stroke-width="8" fill="transparent"
                            stroke-dasharray="283" stroke-dashoffset="70" stroke-linecap="round" />
                  </svg>
                  <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center;">
                    <div style="font-size:1.3rem; font-weight:700; color:var(--text-primary);">75%</div>
                    <div style="font-size:0.65rem; color:var(--text-secondary);">Conversion</div>
                  </div>
                </div>
                <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:12px;">42 customer converted to checkout page</p>
              </div>

              <!-- Circular Progress 2: Company Health Status -->
              <div class="card" style="text-align:center; padding:20px;">
                <div class="card-header" style="justify-content:center; padding:0 0 12px 0; border-bottom:1px solid var(--border-color); margin-bottom:16px;">
                  <span class="card-title">Company Health Status</span>
                </div>
                <div style="position:relative; width:130px; height:130px; margin:16px auto;">
                  <svg width="130" height="130" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="45" stroke="var(--bg-app)" stroke-width="8" fill="transparent" />
                    <circle cx="60" cy="60" r="45" stroke="#10b981" stroke-width="8" fill="transparent"
                            stroke-dasharray="283" stroke-dashoffset="28" stroke-linecap="round" />
                  </svg>
                  <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center;">
                    <div style="font-size:1.3rem; font-weight:700; color:var(--text-primary);">90%</div>
                    <div style="font-size:0.65rem; color:var(--text-secondary);">Active</div>
                  </div>
                </div>
                <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:12px;">5 active companies / 34 active dealer outlets running healthy. 2 offline.</p>
              </div>

              <!-- Doughnut Chart: Categories Distribution -->
              <div class="card" style="padding:20px;">
                <div class="card-header" style="padding:0 0 12px 0; border-bottom:1px solid var(--border-color); margin-bottom:16px;">
                  <span class="card-title">Repair Category Shares</span>
                </div>
                <div style="height: 190px;"><canvas id="categoriesChart"></canvas></div>
              </div>

              <!-- Beautiful Timeline Activity feed -->
              <div class="card" style="padding: 24px;">
                <div class="card-header" style="padding: 0 0 16px 0; border-bottom: 1px solid var(--border-color); margin-bottom: 20px;">
                  <span class="card-title" style="font-size: 1rem; font-weight: 700; color: var(--text-primary);">Latest System Activities</span>
                </div>
                
                <div style="position:relative; padding-left: 24px; display:flex; flex-direction:column; gap:20px;">
                  <!-- Vertical timeline line -->
                  <div style="position:absolute; left: 7px; top: 8px; bottom: 8px; width: 2px; background: var(--border-color);"></div>
                  
                  <div style="position:relative; display:flex; gap:16px;">
                    <div style="position:absolute; left: -22px; top: 4px; width: 12px; height: 12px; border-radius:50%; background: var(--primary); border: 2.5px solid var(--bg-card); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);"></div>
                    <div style="flex-grow:1;">
                      <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <strong style="font-size:0.85rem; color:var(--text-primary);">Admin Password Reset</strong>
                        <small style="color:var(--text-muted); font-size:0.75rem;">Today, 2:14 PM</small>
                      </div>
                      <p style="font-size:0.8rem; color:var(--text-secondary); margin:0;">Super Admin reset API credential security tokens for Rona 03 - Calgary terminal.</p>
                    </div>
                  </div>

                  <div style="position:relative; display:flex; gap:16px;">
                    <div style="position:absolute; left: -22px; top: 4px; width: 12px; height: 12px; border-radius:50%; background: var(--success); border: 2.5px solid var(--bg-card); box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);"></div>
                    <div style="flex-grow:1;">
                      <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <strong style="font-size:0.85rem; color:var(--text-primary);">New Dealer Outlet Active</strong>
                        <small style="color:var(--text-muted); font-size:0.75rem;">Today, 1:02 PM</small>
                      </div>
                      <p style="font-size:0.8rem; color:var(--text-secondary); margin:0;">Home hardware 01 - Toronto registered and integrated the local model widget successfully.</p>
                    </div>
                  </div>

                  <div style="position:relative; display:flex; gap:16px;">
                    <div style="position:absolute; left: -22px; top: 4px; width: 12px; height: 12px; border-radius:50%; background: var(--warning); border: 2.5px solid var(--bg-card); box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);"></div>
                    <div style="flex-grow:1;">
                      <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <strong style="font-size:0.85rem; color:var(--text-primary);">Config Rule Altered</strong>
                        <small style="color:var(--text-muted); font-size:0.75rem;">Yesterday, 5:45 PM</small>
                      </div>
                      <p style="font-size:0.8rem; color:var(--text-secondary); margin:0;">Ontario base repair labor rate multiplier adjusted dynamically (+10.5% adjustment).</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        `;

        // Render charts
        const colors = this.getChartColors();

        // Growth line chart
        const ctxGrowth = document.getElementById('growthChart').getContext('2d');
        this.state.charts.growth = new Chart(ctxGrowth, {
          type: 'line',
          data: {
            labels: db.charts.userGrowth.labels,
            datasets: [
              {
                label: 'Registered End Users',
                data: db.charts.userGrowth.data,
                borderColor: colors.primary,
                backgroundColor: colors.primaryGlow,
                fill: true,
                tension: 0.4
              },
              {
                label: 'AI Scan Requests',
                data: [4200, 4900, 6100, 7800, 8100, 8420],
                borderColor: colors.success,
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                fill: true,
                tension: 0.4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { grid: { color: colors.grid }, ticks: { color: colors.text } },
              y: { grid: { color: colors.grid }, ticks: { color: colors.text } }
            }
          }
        });

        // Investment vs Net Profit Growth Chart
        const ctxInvProf = document.getElementById('investmentVsProfitChart').getContext('2d');
        this.state.charts.investmentVsProfit = new Chart(ctxInvProf, {
          type: 'bar',
          data: {
            labels: db.charts.investmentVsProfit.labels,
            datasets: [
              {
                label: 'Monthly Investment ($)',
                data: db.charts.investmentVsProfit.investment,
                backgroundColor: colors.primary,
                borderRadius: 4
              },
              {
                label: 'Monthly Net Profit ($)',
                data: db.charts.investmentVsProfit.profit,
                backgroundColor: colors.success,
                borderRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { grid: { color: colors.grid }, ticks: { color: colors.text } },
              y: { grid: { color: colors.grid }, ticks: { color: colors.text } }
            }
          }
        });

        // Revenue Growth Rate Chart
        const ctxRev = document.getElementById('revenueGrowthChart').getContext('2d');
        this.state.charts.revenueGrowth = new Chart(ctxRev, {
          type: 'bar',
          data: {
            labels: db.charts.revenueGrowth.labels,
            datasets: [{
              label: 'Growth Rate (%)',
              data: db.charts.revenueGrowth.growthRate,
              backgroundColor: colors.primary,
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { grid: { color: colors.grid }, ticks: { color: colors.text } },
              y: { grid: { color: colors.grid }, ticks: { color: colors.text } }
            }
          }
        });

        // Total Application Usage sessions Graph
        const ctxUsage = document.getElementById('appUsageChart').getContext('2d');
        this.state.charts.appUsage = new Chart(ctxUsage, {
          type: 'line',
          data: {
            labels: db.charts.appUsage.labels,
            datasets: [{
              label: 'Total Sessions',
              data: db.charts.appUsage.sessions,
              borderColor: colors.warning,
              backgroundColor: 'rgba(245, 158, 11, 0.05)',
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { grid: { color: colors.grid }, ticks: { color: colors.text } },
              y: { grid: { color: colors.grid }, ticks: { color: colors.text } }
            }
          }
        });

        // Categories Doughnut
        const ctxCat = document.getElementById('categoriesChart').getContext('2d');
        this.state.charts.categories = new Chart(ctxCat, {
          type: 'doughnut',
          data: {
            labels: db.charts.repairCategories.labels,
            datasets: [{
              data: db.charts.repairCategories.data,
              backgroundColor: [colors.primary, colors.success, colors.warning, colors.danger]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: colors.text } } }
          }
        });

      } else if (menu === 'companies') {
        const tableKey = 'companies';
        const searchQuery = (this.state.searchQueries[tableKey] || '').toLowerCase();
        const pageSize = this.state.pageSizes[tableKey] || 5;
        const pageIndex = this.state.pageIndices[tableKey] || 0;

        const filters = this.state.dropdownFilters[tableKey] || {};
        const filterIndustry = filters.industry || '';
        const filterPlan = filters.plan || '';
        const filterStatus = filters.status || '';

        // Filter rows
        const filtered = db.companies.filter(co => {
          const matchesSearch = co.name.toLowerCase().includes(searchQuery) ||
            co.id.toLowerCase().includes(searchQuery) ||
            co.industryType.toLowerCase().includes(searchQuery) ||
            co.subscriptionPlan.toLowerCase().includes(searchQuery);

          const matchesIndustry = !filterIndustry || co.industryType === filterIndustry;
          const matchesPlan = !filterPlan || co.subscriptionPlan === filterPlan;
          const matchesStatus = !filterStatus || co.status === filterStatus;

          return matchesSearch && matchesIndustry && matchesPlan && matchesStatus;
        });

        // Paginate rows
        const paginated = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
        const totalPages = Math.ceil(filtered.length / pageSize) || 1;
        const allRowIds = filtered.map(c => c.id);
        const checked = this.state.checkedRows[tableKey] || [];

        canvas.innerHTML = `
          <!-- Companies Analytics Header -->
          <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-bottom:24px;">
            <div class="card" style="padding:20px; border-left:4px solid var(--primary); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(37,99,235,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Total Companies</div>
              <strong style="font-size:1.8rem; color:var(--text-primary);">${db.companies.length}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Registered in platform</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid var(--success); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Active</div>
              <strong style="font-size:1.8rem; color:var(--success);">${db.companies.filter(c => c.status === 'Active').length}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Running without issues</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #f43f5e; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(244,63,94,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Expiring Soon</div>
              <strong style="font-size:1.8rem; color:#f43f5e;">${db.companies.filter(c => { const d = new Date(c.expiryDate); const now = new Date(); const diff = (d - now) / (1000 * 60 * 60 * 24); return diff < 60 && diff > 0; }).length}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Within 60 days</div>
            </div>
          </div>

          <!-- Per-Company Health Row -->
          <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:16px; margin-bottom:24px;">
            ${db.companies.map(co => {
          const dealers = db.dealers.filter(d => d.company === co.name);
          const activeDealers = dealers.filter(d => d.status === 'Active').length;
          const totalScans = dealers.reduce((s, d) => s + d.monthlyRequests, 0);
          const statusColor = co.status === 'Active' ? '#10b981' : co.status === 'Trial' ? '#f59e0b' : '#f43f5e';
          return `
                <div class="card" onclick="window.BotNBoltApp.navigateToCompany('${co.id}')" style="padding:16px; border-top:3px solid ${statusColor}; cursor:pointer; transition:transform 0.15s, box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 28px rgba(0,0,0,0.12)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                    <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,${statusColor},${statusColor}88);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.85rem;color:#fff;">${co.logo}</div>
                    <span class="badge ${co.status === 'Active' ? 'badge-success' : co.status === 'Trial' ? 'badge-warning' : 'badge-danger'}" style="font-size:0.65rem;">${co.status}</span>
                  </div>
                  <div style="font-weight:700;font-size:0.9rem;color:var(--text-primary);margin-bottom:6px;">${co.name}</div>
                  <div style="font-size:0.72rem;color:var(--text-secondary); margin-bottom:8px;">${co.subscriptionPlan}</div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:0.7rem;">
                    <div style="background:var(--bg-primary);padding:6px 8px;border-radius:6px;text-align:center;">
                      <div style="font-weight:700;color:var(--text-primary);">${activeDealers}/${co.totalDealers}</div>
                      <div style="color:var(--text-secondary);">Dealers</div>
                    </div>
                    <div style="background:var(--bg-primary);padding:6px 8px;border-radius:6px;text-align:center;">
                      <div style="font-weight:700;color:var(--text-primary);">${totalScans}</div>
                      <div style="color:var(--text-secondary);">Scans/mo</div>
                    </div>
                  </div>
                  <div style="font-size:0.68rem;color:var(--text-secondary);margin-top:8px;">Expires: ${co.expiryDate}</div>
                  <div style="margin-top:10px;font-size:0.72rem;font-weight:700;color:${statusColor};display:flex;align-items:center;gap:4px;">View Dealers <span>→</span></div>
                </div>
              `;
        }).join('')}
          </div>

          <!-- Companies Listing Table -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">Registered Companies</span>
              <button class="btn btn-primary btn-sm flex-center" onclick="window.BotNBoltApp.openAddCompanyModal()">
                <i data-lucide="plus-circle"></i> Add Company
              </button>
            </div>
            
            <!-- Table Header Action Controls -->
            <div class="table-header-actions" style="padding: 0 24px; margin-top: 10px;">
              <div class="table-actions-left" style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
                <div class="search-wrapper">
                  <i data-lucide="search"></i>
                  <input type="text" class="form-control search-input" id="search-${tableKey}" placeholder="Search companies..." value="${this.state.searchQueries[tableKey] || ''}" oninput="window.BotNBoltApp.handleTableSearch('${tableKey}', this.value)">
                </div>

                <!-- Industry Filter -->
                <select class="form-control dropdown-filter" style="width: 150px; font-size: 0.85rem; padding: 4px 8px; height: 32px;" onchange="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'industry', this.value)">
                  <option value="">All Industries</option>
                  <option value="Hardware Retail" ${filterIndustry === 'Hardware Retail' ? 'selected' : ''}>Hardware Retail</option>
                  <option value="Home Improvement" ${filterIndustry === 'Home Improvement' ? 'selected' : ''}>Home Improvement</option>
                  <option value="Home Improvement Retail" ${filterIndustry === 'Home Improvement Retail' ? 'selected' : ''}>Home Improvement Retail</option>
                  <option value="Hardware & Lumber" ${filterIndustry === 'Hardware & Lumber' ? 'selected' : ''}>Hardware & Lumber</option>
                  <option value="Building Supplies" ${filterIndustry === 'Building Supplies' ? 'selected' : ''}>Building Supplies</option>
                </select>

                <!-- Plan Filter -->
                <select class="form-control dropdown-filter" style="width: 150px; font-size: 0.85rem; padding: 4px 8px; height: 32px;" onchange="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'plan', this.value)">
                  <option value="">All Plans</option>
                  <option value="Enterprise Gold" ${filterPlan === 'Enterprise Gold' ? 'selected' : ''}>Enterprise Gold</option>
                  <option value="Premium Standard" ${filterPlan === 'Premium Standard' ? 'selected' : ''}>Premium Standard</option>
                  <option value="Enterprise Platinum" ${filterPlan === 'Enterprise Platinum' ? 'selected' : ''}>Enterprise Platinum</option>
                </select>

                <!-- Status Filter -->
                <select class="form-control dropdown-filter" style="width: 130px; font-size: 0.85rem; padding: 4px 8px; height: 32px;" onchange="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', this.value)">
                  <option value="">All Statuses</option>
                  <option value="Active" ${filterStatus === 'Active' ? 'selected' : ''}>Active</option>
                  <option value="Suspended" ${filterStatus === 'Suspended' ? 'selected' : ''}>Suspended</option>
                </select>
                
                <!-- Bulk Actions Dropdown -->
                <select class="bulk-actions-select" id="bulk-${tableKey}" style="${checked.length > 0 ? 'display:block;' : 'display:none;'}" onchange="window.BotNBoltApp.triggerBulkAction('${tableKey}', this.value)">
                  <option value="">Bulk Actions (${checked.length} Selected)</option>
                  <option value="suspend">Suspend Selected</option>
                  <option value="export">Export Selected</option>
                  <option value="delete">Delete Selected</option>
                </select>
              </div>
              
              <div class="table-actions-right">
                <button class="btn btn-secondary btn-sm flex-center" onclick="window.BotNBoltApp.exportCompaniesCsv('${tableKey}')" title="Export Current List to CSV">
                  <i data-lucide="download"></i> Export CSV
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 40px; padding-left: 24px;">
                      <input type="checkbox" id="chk-all-${tableKey}" style="width:16px; height:16px; cursor:pointer;" ${checked.length === allRowIds.length && allRowIds.length > 0 ? 'checked' : ''} onchange="window.BotNBoltApp.handleSelectAllChange('${tableKey}', this.checked, ${JSON.stringify(allRowIds).replace(/"/g, '&quot;')})">
                    </th>
                    <th>Company Name</th>
                    <th>ID</th>
                    <th>Industry</th>
                    <th>Plan</th>
                    <th>Locations</th>
                    <th>Contract Expiry</th>
                    <th>Branding</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="companiesTableBody">
                  ${paginated.length === 0 ? `
                    <tr>
                      <td colspan="10" style="text-align:center; padding: 32px; color: var(--text-secondary);">No records match your search filter.</td>
                    </tr>
                  ` : paginated.map(co => `
                    <tr>
                      <td style="padding-left: 24px;">
                        <input type="checkbox" id="chk-${tableKey}-${co.id}" style="width:16px; height:16px; cursor:pointer;" ${checked.includes(co.id) ? 'checked' : ''} onchange="window.BotNBoltApp.handleCheckboxChange('${tableKey}', '${co.id}', this.checked)">
                      </td>
                      <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                          <div class="user-avatar flex-center" style="background-color: var(--primary); font-size: 0.75rem; width: 28px; height: 28px;">${co.logo}</div>
                          <div>
                            <strong>${co.name}</strong>
                            <div style="font-size: 0.75rem; color: var(--text-secondary);">${co.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><code>${co.id}</code></td>
                      <td>${co.industryType}</td>
                      <td><span class="badge badge-info">${co.subscriptionPlan}</span></td>
                      <td>${co.totalDealers} Dealers</td>
                      <td>${co.expiryDate}</td>
                      <td>
                        <div style="display: flex; gap: 4px;">
                          ${co.customBranding ? '<span class="badge badge-success" style="font-size:0.6rem;">Branding</span>' : ''}
                          ${co.whiteLabel ? '<span class="badge badge-warning" style="font-size:0.6rem;">WhiteLabel</span>' : ''}
                        </div>
                      </td>
                      <td><span class="badge ${co.status === 'Active' ? 'badge-success' : co.status === 'Suspended' ? 'badge-danger' : 'badge-warning'}">${co.status}</span></td>
                      <td>
                        <div class="table-actions">
                          <button class="action-icon-btn" onclick="window.BotNBoltApp.editCompany('${co.id}')" title="Edit Company Details"><i data-lucide="edit-3"></i></button>
                          <button class="action-icon-btn" onclick="window.BotNBoltApp.toggleCompanyStatus('${co.id}')" title="${co.status === 'Active' ? 'Suspend' : 'Activate'} Company"><i data-lucide="${co.status === 'Active' ? 'slash' : 'play'}"></i></button>
                          <button class="action-icon-btn" onclick="window.BotNBoltApp.manageSubscriptionModal('${co.id}')" title="Manage subscription & limits"><i data-lucide="sliders"></i></button>
                          <button class="action-icon-btn" onclick="window.BotNBoltApp.resetCompanyPassword('${co.id}')" title="Reset Admin Password"><i data-lucide="key-round"></i></button>
                          <button class="action-icon-btn" onclick="window.BotNBoltApp.navigateToCompany('${co.id}')" title="View Dealers"><i data-lucide="users-2"></i></button>
                          <button class="action-icon-btn" onclick="window.BotNBoltApp.navigateToCompany('${co.id}')" title="View Analytics"><i data-lucide="bar-chart-3"></i></button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Table Pagination Footer -->
            <div class="table-footer-pagination">
              <div>
                Showing <strong>${filtered.length === 0 ? 0 : pageIndex * pageSize + 1}</strong> to 
                <strong>${Math.min((pageIndex + 1) * pageSize, filtered.length)}</strong> of 
                <strong>${filtered.length}</strong> companies
              </div>
              <div class="pagination-controls">
                <span style="margin-right:8px;">Rows per page:</span>
                <select class="rows-selector" style="margin-right:16px;" onchange="window.BotNBoltApp.handleTablePageSizeChange('${tableKey}', this.value)">
                  <option value="5" ${pageSize === 5 ? 'selected' : ''}>5</option>
                  <option value="10" ${pageSize === 10 ? 'selected' : ''}>10</option>
                  <option value="25" ${pageSize === 25 ? 'selected' : ''}>25</option>
                </select>
                <button class="pagination-btn" ${pageIndex === 0 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex - 1})" title="Previous Page"><i data-lucide="chevron-left" style="width:14px; height:14px;"></i></button>
                <span style="font-weight:600; margin:0 8px;">Page ${pageIndex + 1} of ${totalPages}</span>
                <button class="pagination-btn" ${pageIndex >= totalPages - 1 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex + 1})" title="Next Page"><i data-lucide="chevron-right" style="width:14px; height:14px;"></i></button>
              </div>
            </div>

          </div>
        `;
      } else if (menu === 'dealers') {
        const tableKey = 'dealers_sa';
        const searchQuery = (this.state.searchQueries[tableKey] || '').toLowerCase();
        const pageSize = this.state.pageSizes[tableKey] || 5;
        const pageIndex = this.state.pageIndices[tableKey] || 0;

        const filters = this.state.dropdownFilters[tableKey] || {};
        const filterCompany = filters.company || '';
        const filterCity = filters.city || '';
        const filterProvince = filters.province || '';
        const filterStatus = filters.status || '';

        // Filter rows
        const filtered = db.dealers.filter(dl => {
          const matchesSearch = dl.name.toLowerCase().includes(searchQuery) ||
            dl.id.toLowerCase().includes(searchQuery) ||
            dl.province.toLowerCase().includes(searchQuery) ||
            dl.city.toLowerCase().includes(searchQuery) ||
            dl.manager.toLowerCase().includes(searchQuery);

          const matchesCompany = !filterCompany || dl.company === filterCompany;
          const matchesCity = !filterCity || dl.city === filterCity;
          const matchesProvince = !filterProvince || dl.province === filterProvince;
          const matchesStatus = !filterStatus || dl.status === filterStatus;

          return matchesSearch && matchesCompany && matchesCity && matchesProvince && matchesStatus;
        });

        // Paginate rows
        const paginated = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
        const totalPages = Math.ceil(filtered.length / pageSize) || 1;
        const allRowIds = filtered.map(d => d.id);
        const checked = this.state.checkedRows[tableKey] || [];

        canvas.innerHTML = `
          <!-- Dealers Analytics Header -->
          <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-bottom:24px;">
            <div class="card" style="padding:20px; border-left:4px solid var(--primary); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(37,99,235,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Total Dealers</div>
              <strong style="font-size:1.8rem; color:var(--text-primary);">${db.dealers.length}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Across all companies</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid var(--success); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Active Dealers</div>
              <strong style="font-size:1.8rem; color:var(--success);">${db.dealers.filter(d => d.status === 'Active').length}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Fully operational</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #f43f5e; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(244,63,94,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Disabled</div>
              <strong style="font-size:1.8rem; color:#f43f5e;">${db.dealers.filter(d => d.status === 'Disabled' || d.status === 'Inactive').length}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Needs attention</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #f59e0b; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Avg Monthly Scans</div>
              <strong style="font-size:1.8rem; color:#f59e0b;">${Math.round(db.dealers.reduce((s, d) => s + d.monthlyRequests, 0) / db.dealers.length)}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Per dealer / month</div>
            </div>
          </div>

          <!-- Top Dealers + Company Breakdown Row -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:24px;">
            <!-- Top 5 Dealers by Monthly Scans -->
            <div class="card" style="padding:24px;">
              <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:16px;">
                <span class="card-title">Top Dealers by Monthly Scans</span>
              </div>
              ${[...db.dealers].sort((a, b) => b.monthlyRequests - a.monthlyRequests).slice(0, 5).map((d, i) => {
          const maxScans = Math.max(...db.dealers.map(x => x.monthlyRequests));
          const pct = Math.round((d.monthlyRequests / maxScans) * 100);
          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#f43f5e'];
          return `
                  <div style="margin-bottom:14px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:0.72rem; font-weight:800; color:${colors[i]}; width:16px;">#${i + 1}</span>
                        <span style="font-size:0.82rem; font-weight:600; color:var(--text-primary);">${d.name}</span>
                      </div>
                      <span style="font-size:0.78rem; font-weight:700; color:var(--text-primary);">${d.monthlyRequests}</span>
                    </div>
                    <div style="height:8px; background:var(--border-color); border-radius:4px; overflow:hidden;">
                      <div style="height:100%; width:${pct}%; background:${colors[i]}; border-radius:4px;"></div>
                    </div>
                    <div style="font-size:0.68rem; color:var(--text-secondary); margin-top:3px;">${d.company} · ${d.city}, ${d.province}</div>
                  </div>
                `;
        }).join('')}
            </div>

            <!-- Dealers by Company Breakdown -->
            <div class="card" style="padding:24px;">
              <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:16px;">
                <span class="card-title">Dealers by Company</span>
              </div>
              ${db.companies.map(co => {
          const compDealers = db.dealers.filter(d => d.company === co.name);
          const active = compDealers.filter(d => d.status === 'Active').length;
          const totalScans = compDealers.reduce((s, d) => s + d.monthlyRequests, 0);
          const maxTotal = Math.max(...db.companies.map(c => db.dealers.filter(d => d.company === c.name).reduce((s, d) => s + d.monthlyRequests, 0)));
          const pct = maxTotal > 0 ? Math.round((totalScans / maxTotal) * 100) : 0;
          return `
                  <div style="margin-bottom:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,var(--primary),#7c3aed);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.7rem;color:#fff;">${co.logo}</div>
                        <div>
                          <div style="font-size:0.82rem; font-weight:700; color:var(--text-primary);">${co.name}</div>
                          <div style="font-size:0.68rem; color:var(--text-secondary);">${active}/${compDealers.length} active · ${totalScans} scans/mo</div>
                        </div>
                      </div>
                      <span class="badge ${co.status === 'Active' ? 'badge-success' : co.status === 'Trial' ? 'badge-warning' : 'badge-danger'}" style="font-size:0.65rem;">${co.status}</span>
                    </div>
                    <div style="height:7px;background:var(--border-color);border-radius:4px;overflow:hidden;">
                      <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--primary),#7c3aed);border-radius:4px;"></div>
                    </div>
                  </div>
                `;
        }).join('')}
            </div>
          </div>

          <!-- Dealers Listing Table -->
          <div class="card">
            <div class="card-header"><span class="card-title">All System Dealers Across Companies</span></div>
            
            <!-- Table Header Action Controls -->
            <div class="table-header-actions" style="padding: 0 24px; margin-top: 10px;">
              <div class="table-actions-left" style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
                <div class="search-wrapper">
                  <i data-lucide="search"></i>
                  <input type="text" class="form-control search-input" id="search-${tableKey}" placeholder="Search dealers..." value="${this.state.searchQueries[tableKey] || ''}" oninput="window.BotNBoltApp.handleTableSearch('${tableKey}', this.value)">
                </div>

                <!-- Company Filter -->
                <select class="form-control dropdown-filter" style="width: 140px; font-size: 0.85rem; padding: 4px 8px; height: 32px;" onchange="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'company', this.value)">
                  <option value="">All Companies</option>
                  <option value="Home hardware" ${filterCompany === 'Home hardware' ? 'selected' : ''}>Home hardware</option>
                  <option value="My Depot" ${filterCompany === 'My Depot' ? 'selected' : ''}>My Depot</option>
                  <option value="Rona" ${filterCompany === 'Rona' ? 'selected' : ''}>Rona</option>
                  <option value="BMR Group" ${filterCompany === 'BMR Group' ? 'selected' : ''}>BMR Group</option>
                  <option value="Tottens" ${filterCompany === 'Tottens' ? 'selected' : ''}>Tottens</option>
                </select>

                <!-- City Filter -->
                <select class="form-control dropdown-filter" style="width: 130px; font-size: 0.85rem; padding: 4px 8px; height: 32px;" onchange="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'city', this.value)">
                  <option value="">All Cities</option>
                  <option value="Toronto" ${filterCity === 'Toronto' ? 'selected' : ''}>Toronto</option>
                  <option value="Montreal" ${filterCity === 'Montreal' ? 'selected' : ''}>Montreal</option>
                  <option value="Calgary" ${filterCity === 'Calgary' ? 'selected' : ''}>Calgary</option>
                  <option value="Edmonton" ${filterCity === 'Edmonton' ? 'selected' : ''}>Edmonton</option>
                  <option value="Ottawa" ${filterCity === 'Ottawa' ? 'selected' : ''}>Ottawa</option>
                  <option value="Winnipeg" ${filterCity === 'Winnipeg' ? 'selected' : ''}>Winnipeg</option>
                  <option value="Mississauga" ${filterCity === 'Mississauga' ? 'selected' : ''}>Mississauga</option>
                  <option value="Vancouver" ${filterCity === 'Vancouver' ? 'selected' : ''}>Vancouver</option>
                  <option value="Brampton" ${filterCity === 'Brampton' ? 'selected' : ''}>Brampton</option>
                </select>

                <!-- Province Filter -->
                <select class="form-control dropdown-filter" style="width: 130px; font-size: 0.85rem; padding: 4px 8px; height: 32px;" onchange="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'province', this.value)">
                  <option value="">All Provinces</option>
                  <option value="Ontario" ${filterProvince === 'Ontario' ? 'selected' : ''}>Ontario</option>
                  <option value="Quebec" ${filterProvince === 'Quebec' ? 'selected' : ''}>Quebec</option>
                  <option value="British Columbia" ${filterProvince === 'British Columbia' ? 'selected' : ''}>British Columbia</option>
                  <option value="Alberta" ${filterProvince === 'Alberta' ? 'selected' : ''}>Alberta</option>
                  <option value="Manitoba" ${filterProvince === 'Manitoba' ? 'selected' : ''}>Manitoba</option>
                </select>

                <!-- Status Filter -->
                <select class="form-control dropdown-filter" style="width: 120px; font-size: 0.85rem; padding: 4px 8px; height: 32px;" onchange="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', this.value)">
                  <option value="">All Statuses</option>
                  <option value="Active" ${filterStatus === 'Active' ? 'selected' : ''}>Active</option>
                  <option value="Disabled" ${filterStatus === 'Disabled' ? 'selected' : ''}>Disabled</option>
                </select>
                
                <select class="bulk-actions-select" id="bulk-${tableKey}" style="${checked.length > 0 ? 'display:block;' : 'display:none;'}" onchange="window.BotNBoltApp.triggerBulkAction('${tableKey}', this.value)">
                  <option value="">Bulk Actions (${checked.length} Selected)</option>
                  <option value="disable">Disable Selected</option>
                  <option value="export">Export Selected</option>
                  <option value="delete">Delete Selected</option>
                </select>
              </div>
              
              <div class="table-actions-right">
                <button class="btn btn-secondary btn-sm flex-center" onclick="window.BotNBoltApp.exportDealersCsv('${tableKey}')" title="Export Current List to CSV">
                  <i data-lucide="download"></i> Export CSV
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 40px; padding-left: 24px;">
                      <input type="checkbox" id="chk-all-${tableKey}" style="width:16px; height:16px; cursor:pointer;" ${checked.length === allRowIds.length && allRowIds.length > 0 ? 'checked' : ''} onchange="window.BotNBoltApp.handleSelectAllChange('${tableKey}', this.checked, ${JSON.stringify(allRowIds).replace(/"/g, '&quot;')})">
                    </th>
                    <th>Dealer Name</th>
                    <th>Company</th>
                    <th>City</th>
                    <th>Province</th>
                    <th>Manager</th>
                    <th>Avg Score</th>
                    <th>Monthly Scans</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${paginated.length === 0 ? `
                    <tr>
                      <td colspan="11" style="text-align:center; padding: 32px; color: var(--text-secondary);">No records match your search filter.</td>
                    </tr>
                  ` : paginated.map(dl => `
                    <tr>
                      <td style="padding-left: 24px;">
                        <input type="checkbox" id="chk-${tableKey}-${dl.id}" style="width:16px; height:16px; cursor:pointer;" ${checked.includes(dl.id) ? 'checked' : ''} onchange="window.BotNBoltApp.handleCheckboxChange('${tableKey}', '${dl.id}', this.checked)">
                      </td>
                      <td><strong>${dl.name}</strong><br><small>${dl.email}</small></td>
                      <td>${dl.company}</td>
                      <td>${dl.city}</td>
                      <td>${dl.province}</td>
                      <td>${dl.manager}</td>
                      <td><strong>${dl.rating || 'N/A'}</strong> / 5.0</td>
                      <td>${dl.monthlyRequests} scans</td>
                      <td><span class="badge ${dl.status === 'Active' ? 'badge-success' : 'badge-danger'}">${dl.status}</span></td>
                      <td>
                        <div class="table-actions">
                          <button class="action-icon-btn" onclick="window.BotNBoltApp.toggleDealerStatus('${dl.id}')" title="${dl.status === 'Active' ? 'Deactivate' : 'Activate'} Dealer"><i data-lucide="${dl.status === 'Active' ? 'slash' : 'play'}"></i></button>
                          <button class="action-icon-btn" onclick="window.BotNBoltApp.assignDealerAdmin('${dl.id}')" title="Assign Admin"><i data-lucide="user-plus"></i></button>
                          <button class="action-icon-btn" onclick="window.BotNBoltApp.navigate('ai_analytics')" title="View Dealer Analytics"><i data-lucide="bar-chart-3"></i></button>
                          <button class="action-icon-btn" onclick="window.BotNBoltApp.editDealerPermissions('${dl.id}')" title="Edit Permissions"><i data-lucide="key"></i></button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Table Pagination Footer -->
            <div class="table-footer-pagination">
              <div>
                Showing <strong>${filtered.length === 0 ? 0 : pageIndex * pageSize + 1}</strong> to 
                <strong>${Math.min((pageIndex + 1) * pageSize, filtered.length)}</strong> of 
                <strong>${filtered.length}</strong> dealers
              </div>
              <div class="pagination-controls">
                <span style="margin-right:8px;">Rows per page:</span>
                <select class="rows-selector" style="margin-right:16px;" onchange="window.BotNBoltApp.handleTablePageSizeChange('${tableKey}', this.value)">
                  <option value="5" ${pageSize === 5 ? 'selected' : ''}>5</option>
                  <option value="10" ${pageSize === 10 ? 'selected' : ''}>10</option>
                  <option value="25" ${pageSize === 25 ? 'selected' : ''}>25</option>
                </select>
                <button class="pagination-btn" ${pageIndex === 0 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex - 1})" title="Previous Page"><i data-lucide="chevron-left" style="width:14px; height:14px;"></i></button>
                <span style="font-weight:600; margin:0 8px;">Page ${pageIndex + 1} of ${totalPages}</span>
                <button class="pagination-btn" ${pageIndex >= totalPages - 1 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex + 1})" title="Next Page"><i data-lucide="chevron-right" style="width:14px; height:14px;"></i></button>
              </div>
            </div>

          </div>
        `;
        lucide.createIcons();
      } else if (menu === 'ai_analytics') {
        const totalInferences = db.dealers.reduce((s, d) => s + d.monthlyRequests, 0);
        const topDealerByScans = [...db.dealers].sort((a, b) => b.monthlyRequests - a.monthlyRequests)[0];
        const topCompanyByScans = db.companies.map(co => ({ name: co.name, total: db.dealers.filter(d => d.company === co.name).reduce((s, d) => s + d.monthlyRequests, 0) })).sort((a, b) => b.total - a.total)[0];
        canvas.innerHTML = `
          <!-- AI Inferences KPI Header -->
          <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-bottom:24px;">
            <div class="card" style="padding:20px; border-left:4px solid #f59e0b; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Total AI Inferences</div>
              <strong style="font-size:1.8rem; color:var(--text-primary);">${db.kpis.totalRepairScans.value}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">${db.kpis.totalRepairScans.change} from last month</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #3b82f6; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(59,130,246,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Daily Avg Inferences</div>
              <strong style="font-size:1.8rem; color:var(--text-primary);">${Math.round(totalInferences / 30)}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Per day this month</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #10b981; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Top Company</div>
              <strong style="font-size:1.1rem; color:var(--text-primary); line-height:1.3;">${topCompanyByScans.name}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">${topCompanyByScans.total} scans this month</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #a855f7; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(168,85,247,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Top Dealer</div>
              <strong style="font-size:1rem; color:var(--text-primary); line-height:1.3;">${topDealerByScans.name}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">${topDealerByScans.monthlyRequests} scans this month</div>
            </div>
          </div>

          <!-- Inference Trend Chart + Per-Dealer Breakdown -->
          <div style="display:grid; grid-template-columns:2fr 1fr; gap:24px; margin-bottom:24px;">
            <div class="card" style="padding:24px;">
              <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:16px;">
                <span class="card-title">AI Inference Trend (6 Months)</span>
              </div>
              <div style="height:220px;"><canvas id="inferenceTrendChart"></canvas></div>
            </div>
            <div class="card" style="padding:24px; overflow-y:auto; max-height:290px;">
              <div class="card-header" style="padding:0 0 12px 0; border-bottom:1px solid var(--border-color); margin-bottom:12px;">
                <span class="card-title">Inferences by Dealer</span>
              </div>
              ${[...db.dealers].sort((a, b) => b.monthlyRequests - a.monthlyRequests).map(d => {
          const maxScans = Math.max(...db.dealers.map(x => x.monthlyRequests));
          const pct = Math.round((d.monthlyRequests / maxScans) * 100);
          return `
                  <div style="margin-bottom:10px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                      <span style="font-size:0.75rem;color:var(--text-primary);font-weight:600;">${d.name}</span>
                      <span style="font-size:0.75rem;color:var(--text-secondary);">${d.monthlyRequests}</span>
                    </div>
                    <div style="height:6px;background:var(--border-color);border-radius:3px;overflow:hidden;">
                      <div style="height:100%;width:${pct}%;background:#f59e0b;border-radius:3px;"></div>
                    </div>
                  </div>
                `;
        }).join('')}
            </div>
          </div>

          <div class="card" style="margin-bottom: 24px;">
            <div class="card-header"><span class="card-title">Global AI Engine Consumption Metrics</span></div>
            <div class="form-row" style="margin-bottom: 0;">
              <div class="form-group">
                <label class="form-label">Filter By Company</label>
                <select class="form-control" onchange="alert('Filter applied')">
                  <option>All Companies</option>
                  ${this.state.db.superAdmin.companies.map(c => `<option>${c.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Filter By Dealer</label>
                <select class="form-control" onchange="alert('Filter applied')">
                  <option>All Dealers</option>
                  ${this.state.db.companyAdmin.dealers.map(d => `<option>${d.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Filter By Province</label>
                <select class="form-control" onchange="alert('Filter applied')">
                  <option>All Provinces</option>
                  <option>Ontario</option>
                  <option>Quebec</option>
                  <option>British Columbia</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Filter By Repair Category</label>
                <select class="form-control" onchange="alert('Filter applied')">
                  <option>All Categories</option>
                  <option>Drywall Crack</option>
                  <option>Blueprint Plan</option>
                  <option>Deck Wood Crack</option>
                  <option>Plaster Cavity</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Filter By Time</label>
                <select class="form-control" onchange="alert('Filter applied')">
                  <option>All Time</option>
                  <option>Last 24 Hours</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
            </div>
          </div>

          <div class="charts-grid">
            <div class="card">
              <div class="card-header"><span class="card-title">AI Token & Request Consumption</span></div>
              <div style="height: 250px;"><canvas id="tokenUsageChart"></canvas></div>
            </div>
            <div class="card">
              <div class="card-header"><span class="card-title">AI Engine Accuracy Margin</span></div>
              <div style="height: 250px;"><canvas id="accuracyChart"></canvas></div>
            </div>
          </div>
        `;
        const colors = this.getChartColors();
        const ctxToken = document.getElementById('tokenUsageChart').getContext('2d');
        this.state.charts.token = new Chart(ctxToken, {
          type: 'line',
          data: {
            labels: db.charts.aiUsageTrends.labels,
            datasets: [{
              label: 'Tokens / Requests Used',
              data: db.charts.aiUsageTrends.requests,
              borderColor: colors.primary,
              backgroundColor: colors.primaryGlow,
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { grid: { color: colors.grid }, ticks: { color: colors.text } },
              y: { grid: { color: colors.grid }, ticks: { color: colors.text } }
            }
          }
        });

        const ctxAcc = document.getElementById('accuracyChart').getContext('2d');
        this.state.charts.accuracy = new Chart(ctxAcc, {
          type: 'line',
          data: {
            labels: db.charts.aiUsageTrends.labels,
            datasets: [{
              label: 'Detection Confidence Accuracy %',
              data: db.charts.aiUsageTrends.successRate,
              borderColor: colors.success,
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { grid: { color: colors.grid }, ticks: { color: colors.text } },
              y: { min: 80, max: 100, grid: { color: colors.grid }, ticks: { color: colors.text } }
            }
          }
        });

        // Render inference trend chart
        const itCtx = document.getElementById('inferenceTrendChart');
        if (itCtx) {
          const c = this.getChartColors();
          new Chart(itCtx.getContext('2d'), {
            type: 'line',
            data: {
              labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
              datasets: [{
                label: 'AI Inferences',
                data: db.charts.aiUsageTrends.monthlyScans || [8200, 9100, 9800, 10400, 11200, 12350],
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245,158,11,0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#f59e0b'
              }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: c.grid }, ticks: { color: c.text } }, y: { grid: { color: c.grid }, ticks: { color: c.text } } } }
          });
        }

      } else if (menu === 'billing') {
        const now = new Date();
        const expiring = db.companies.filter(co => {
          const d = new Date(co.expiryDate);
          const diff = (d - now) / (1000 * 60 * 60 * 24);
          return diff < 60 && diff > 0;
        });
        const totalMonthlyRevenue = db.companies.reduce((s, co) => {
          const planMap = { 'Enterprise Gold': 1499, 'Enterprise Platinum': 1899, 'Premium Standard': 899 };
          return s + (planMap[co.subscriptionPlan] || 499);
        }, 0);

        canvas.innerHTML = `
          <!-- Billing KPI Header -->
          <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-bottom:24px;">
            <div class="card" style="padding:20px; border-left:4px solid var(--success); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Monthly Revenue</div>
              <strong style="font-size:1.8rem; color:var(--success);">$${totalMonthlyRevenue.toLocaleString()}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Across all subscriptions</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #3b82f6; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(59,130,246,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Active Subscriptions</div>
              <strong style="font-size:1.8rem; color:#3b82f6;">${db.companies.filter(c => c.status === 'Active').length}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Fully paid companies</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #f59e0b; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Expiring &lt; 60 Days</div>
              <strong style="font-size:1.8rem; color:#f59e0b;">${expiring.length}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Require renewal action</div>
            </div>
          </div>

          <!-- Expiry Alert Banner -->
          ${expiring.length > 0 ? `
          <div style="background:linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.06)); border:1px solid rgba(245,158,11,0.35); border-radius:12px; padding:16px 20px; margin-bottom:24px; display:flex; align-items:center; gap:14px;">
            <i data-lucide="alert-triangle" style="color:#f59e0b; width:22px; height:22px; flex-shrink:0;"></i>
            <div>
              <strong style="color:#f59e0b; font-size:0.9rem;">⚠ ${expiring.length} subscription${expiring.length > 1 ? 's' : ''} expiring within 60 days</strong>
              <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:3px;">${expiring.map(c => `${c.name} (${c.expiryDate})`).join(' · ')}</div>
            </div>
          </div>
          ` : ''}

          <!-- Subscription Plan Summary Cards -->
          <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px;">
            ${[
            { plan: 'Enterprise Platinum', price: '$1,899', color: '#a855f7' },
            { plan: 'Enterprise Gold', price: '$1,499', color: '#f59e0b' },
            { plan: 'Premium Standard', price: '$899', color: '#3b82f6' }
          ].map(p => {
            const count = db.companies.filter(c => c.subscriptionPlan === p.plan).length;
            return `
                <div class="card" style="padding:16px; text-align:center; border-top:3px solid ${p.color};">
                  <div style="font-size:1.5rem; font-weight:800; color:${p.color};">${count}</div>
                  <div style="font-size:0.72rem; font-weight:700; color:var(--text-primary); margin:4px 0;">${p.plan}</div>
                  <div style="font-size:0.75rem; color:var(--text-secondary);">${p.price}/mo</div>
                </div>
              `;
          }).join('')}
          </div>

          <div class="card">
            <div class="card-header"><span class="card-title">Subscription Billing Details</span>
              <button class="btn btn-secondary btn-sm flex-center" onclick="alert('Exporting billing CSV...')"><i data-lucide="download"></i> Export CSV</button>
            </div>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Plan Type</th>
                    <th>Monthly/Yearly</th>
                    <th>API Credits</th>
                    <th>Extra Usage Charges</th>
                    <th>Invoice History</th>
                    <th>Payment Status</th>
                    <th>Renewal Date</th>
                    <th>GST/VAT Details</th>
                  </tr>
                </thead>
                <tbody>
                  ${db.companies.map(co => `
                    <tr>
                      <td><strong>${co.name}</strong></td>
                      <td><span class="badge badge-info">${co.subscriptionPlan}</span></td>
                      <td>Monthly</td>
                      <td><strong>${co.apiLimit - 450}</strong> / ${co.apiLimit} units</td>
                      <td><span style="color:var(--danger); font-weight:600;">$12.50</span></td>
                      <td><button class="btn btn-secondary btn-sm flex-center" onclick="alert('Downloading invoice PDF for ${co.name}...')"><i data-lucide="download" style="width:12px; height:12px;"></i> PDF</button></td>
                      <td><span class="badge badge-success">Paid</span></td>
                      <td>${co.expiryDate}</td>
                      <td><code>GST-890124-CA</code></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else if (menu === 'tickets') {
        const tableKey = 'tickets_sa';
        const ticketsList = this.state.db.supportAdmin.tickets;
        const searchQuery = (this.state.searchQueries[tableKey] || '').toLowerCase();
        const pageSize = this.state.pageSizes[tableKey] || 5;
        const pageIndex = this.state.pageIndices[tableKey] || 0;

        const filters = this.state.dropdownFilters[tableKey] || {};
        const filterCompany = filters.company || '';
        const filterCity = filters.city || '';
        const filterPriority = filters.priority || '';
        const filterStatus = filters.status || '';

        // Filter rows
        const filtered = ticketsList.filter(tkt => {
          const matchesSearch = tkt.id.toLowerCase().includes(searchQuery) ||
            (tkt.customerName || tkt.raisedBy || '').toLowerCase().includes(searchQuery) ||
            tkt.company.toLowerCase().includes(searchQuery) ||
            tkt.issueType.toLowerCase().includes(searchQuery) ||
            tkt.priority.toLowerCase().includes(searchQuery) ||
            tkt.assignedTo.toLowerCase().includes(searchQuery);

          const matchesCompany = !filterCompany || tkt.company === filterCompany;
          const matchesCity = !filterCity || (tkt.city || tkt.dealer || '') === filterCity;
          const matchesPriority = !filterPriority || tkt.priority === filterPriority;
          const matchesStatus = !filterStatus || tkt.status === filterStatus;

          return matchesSearch && matchesCompany && matchesCity && matchesPriority && matchesStatus;
        });

        // Paginate rows
        const paginated = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
        const totalPages = Math.ceil(filtered.length / pageSize) || 1;
        const allRowIds = filtered.map(t => t.id);
        const checked = this.state.checkedRows[tableKey] || [];

        canvas.innerHTML = `
          <!-- Support Tickets KPI Header -->
          <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-bottom:24px;">
            <div class="card" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', '')" style="padding:20px; border-left:4px solid var(--primary); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(37,99,235,0.07) 100%); cursor:pointer; transition:transform 0.15s, box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 28px rgba(0,0,0,0.12)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Total Tickets</div>
              <strong style="font-size:1.8rem; color:var(--text-primary);">${ticketsList.length}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">All reported issues</div>
            </div>
            <div class="card" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Open')" style="padding:20px; border-left:4px solid var(--danger); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(239,68,68,0.07) 100%); cursor:pointer; transition:transform 0.15s, box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 28px rgba(0,0,0,0.12)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Open Tickets</div>
              <strong style="font-size:1.8rem; color:var(--danger);">${ticketsList.filter(t => t.status === 'Open').length}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Awaiting response</div>
            </div>
            <div class="card" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'In Progress')" style="padding:20px; border-left:4px solid #f59e0b; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.07) 100%); cursor:pointer; transition:transform 0.15s, box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 28px rgba(0,0,0,0.12)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">In Progress</div>
              <strong style="font-size:1.8rem; color:#f59e0b;">${ticketsList.filter(t => t.status === 'In Progress').length}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Being investigated</div>
            </div>
            <div class="card" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Resolved')" style="padding:20px; border-left:4px solid var(--success); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.07) 100%); cursor:pointer; transition:transform 0.15s, box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 28px rgba(0,0,0,0.12)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Resolved</div>
              <strong style="font-size:1.8rem; color:var(--success);">${ticketsList.filter(t => t.status === 'Resolved').length}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Completed tickets</div>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><span class="card-title">Active Support Tickets Register</span></div>
            
            <!-- Table Header Action Controls -->
            <div class="table-header-actions" style="padding: 0 24px; margin-top: 10px;">
              <div class="table-actions-left" style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
                <div class="search-wrapper">
                  <i data-lucide="search"></i>
                  <input type="text" class="form-control search-input" id="search-${tableKey}" placeholder="Search tickets..." value="${this.state.searchQueries[tableKey] || ''}" oninput="window.BotNBoltApp.handleTableSearch('${tableKey}', this.value)">
                </div>

                <!-- Company Filter -->
                <select class="form-control dropdown-filter" style="width: 140px; font-size: 0.85rem; padding: 4px 8px; height: 32px;" onchange="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'company', this.value)">
                  <option value="">All Companies</option>
                  <option value="Home hardware" ${filterCompany === 'Home hardware' ? 'selected' : ''}>Home hardware</option>
                  <option value="My Depot" ${filterCompany === 'My Depot' ? 'selected' : ''}>My Depot</option>
                  <option value="Rona" ${filterCompany === 'Rona' ? 'selected' : ''}>Rona</option>
                  <option value="BMR Group" ${filterCompany === 'BMR Group' ? 'selected' : ''}>BMR Group</option>
                  <option value="Tottens" ${filterCompany === 'Tottens' ? 'selected' : ''}>Tottens</option>
                </select>

                <!-- City Filter -->
                <select class="form-control dropdown-filter" style="width: 130px; font-size: 0.85rem; padding: 4px 8px; height: 32px;" onchange="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'city', this.value)">
                  <option value="">All Cities</option>
                  <option value="Toronto" ${filterCity === 'Toronto' ? 'selected' : ''}>Toronto</option>
                  <option value="Montreal" ${filterCity === 'Montreal' ? 'selected' : ''}>Montreal</option>
                  <option value="Calgary" ${filterCity === 'Calgary' ? 'selected' : ''}>Calgary</option>
                  <option value="Edmonton" ${filterCity === 'Edmonton' ? 'selected' : ''}>Edmonton</option>
                  <option value="Ottawa" ${filterCity === 'Ottawa' ? 'selected' : ''}>Ottawa</option>
                  <option value="HQ Admin" ${filterCity === 'HQ Admin' ? 'selected' : ''}>HQ Admin</option>
                </select>

                <!-- Priority Filter -->
                <select class="form-control dropdown-filter" style="width: 120px; font-size: 0.85rem; padding: 4px 8px; height: 32px;" onchange="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'priority', this.value)">
                  <option value="">All Priorities</option>
                  <option value="High" ${filterPriority === 'High' ? 'selected' : ''}>High</option>
                  <option value="Medium" ${filterPriority === 'Medium' ? 'selected' : ''}>Medium</option>
                  <option value="Low" ${filterPriority === 'Low' ? 'selected' : ''}>Low</option>
                </select>

                <!-- Status Filter -->
                <select class="form-control dropdown-filter" style="width: 120px; font-size: 0.85rem; padding: 4px 8px; height: 32px;" onchange="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', this.value)">
                  <option value="">All Statuses</option>
                  <option value="Open" ${filterStatus === 'Open' ? 'selected' : ''}>Open</option>
                  <option value="In Progress" ${filterStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
                  <option value="Resolved" ${filterStatus === 'Resolved' ? 'selected' : ''}>Resolved</option>
                </select>
                
                <select class="bulk-actions-select" id="bulk-${tableKey}" style="${checked.length > 0 ? 'display:block;' : 'display:none;'}" onchange="window.BotNBoltApp.triggerBulkAction('${tableKey}', this.value)">
                  <option value="">Bulk Actions (${checked.length} Selected)</option>
                  <option value="export">Export Selected</option>
                  <option value="delete">Delete Selected</option>
                </select>
              </div>
              
              <div class="table-actions-right">
                <button class="btn btn-secondary btn-sm flex-center" onclick="window.BotNBoltApp.exportTicketsCsv('${tableKey}')" title="Export Current List to CSV">
                  <i data-lucide="download"></i> Export CSV
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 40px; padding-left: 24px;">
                      <input type="checkbox" id="chk-all-${tableKey}" style="width:16px; height:16px; cursor:pointer;" ${checked.length === allRowIds.length && allRowIds.length > 0 ? 'checked' : ''} onchange="window.BotNBoltApp.handleSelectAllChange('${tableKey}', this.checked, ${JSON.stringify(allRowIds).replace(/"/g, '&quot;')})">
                    </th>
                    <th>Ticket ID</th>
                    <th>Customer Name</th>
                    <th>Company</th>
                    <th>Dealer</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Assigned</th>
                    <th>SLA Time</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${paginated.length === 0 ? `
                    <tr>
                      <td colspan="12" style="text-align:center; padding: 32px; color: var(--text-secondary);">No records match your search filter.</td>
                    </tr>
                  ` : paginated.map(tkt => `
                    <tr style="cursor:pointer;" onclick="window.BotNBoltApp.navigateToTicket('${tkt.id}')" onmouseenter="this.style.backgroundColor='var(--bg-primary)'" onmouseleave="this.style.backgroundColor=''">
                      <td style="padding-left: 24px;" onclick="event.stopPropagation();">
                        <input type="checkbox" id="chk-${tableKey}-${tkt.id}" style="width:16px; height:16px; cursor:pointer;" ${checked.includes(tkt.id) ? 'checked' : ''} onchange="window.BotNBoltApp.handleCheckboxChange('${tableKey}', '${tkt.id}', this.checked)">
                      </td>
                      <td onclick="event.stopPropagation();"><a href="#" style="font-weight:700; color:var(--primary); text-decoration:none;" onclick="event.preventDefault(); window.BotNBoltApp.navigateToTicket('${tkt.id}')"><code>${tkt.id}</code></a></td>
                      <td>${tkt.customerName || tkt.raisedBy || 'N/A'}</td>
                      <td>${tkt.company}</td>
                      <td>${tkt.dealer || 'N/A'}</td>
                      <td>${tkt.issueType}</td>
                      <td><span class="badge ${tkt.priority === 'High' ? 'badge-danger' : 'badge-warning'}">${tkt.priority}</span></td>
                      <td>${tkt.assignedTo}</td>
                      <td>${tkt.responseTime}</td>
                      <td><span class="badge ${tkt.status === 'Open' ? 'badge-danger' : tkt.status === 'Resolved' ? 'badge-success' : 'badge-warning'}">${tkt.status}</span></td>
                      <td>${tkt.date}</td>
                      <td onclick="event.stopPropagation();">
                        <button class="btn btn-secondary btn-sm" onclick="window.BotNBoltApp.navigateToTicket('${tkt.id}')">View Details</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Table Pagination Footer -->
            <div class="table-footer-pagination">
              <div>
                Showing <strong>${filtered.length === 0 ? 0 : pageIndex * pageSize + 1}</strong> to 
                <strong>${Math.min((pageIndex + 1) * pageSize, filtered.length)}</strong> of 
                <strong>${filtered.length}</strong> tickets
              </div>
              <div class="pagination-controls">
                <span style="margin-right:8px;">Rows per page:</span>
                <select class="rows-selector" style="margin-right:16px;" onchange="window.BotNBoltApp.handleTablePageSizeChange('${tableKey}', this.value)">
                  <option value="5" ${pageSize === 5 ? 'selected' : ''}>5</option>
                  <option value="10" ${pageSize === 10 ? 'selected' : ''}>10</option>
                  <option value="25" ${pageSize === 25 ? 'selected' : ''}>25</option>
                </select>
                <button class="pagination-btn" ${pageIndex === 0 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex - 1})" title="Previous Page"><i data-lucide="chevron-left" style="width:14px; height:14px;"></i></button>
                <span style="font-weight:600; margin:0 8px;">Page ${pageIndex + 1} of ${totalPages}</span>
                <button class="pagination-btn" ${pageIndex >= totalPages - 1 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex + 1})" title="Next Page"><i data-lucide="chevron-right" style="width:14px; height:14px;"></i></button>
              </div>
            </div>

          </div>
        `;
        lucide.createIcons();
      } else if (menu === 'permissions') {
        canvas.innerHTML = `
          <div class="card">
            <div class="card-header"><span class="card-title">Roles & Access Control Policies</span></div>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:20px;">Configure granular feature access policies for all active workspace member levels.</p>
            
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Workspace Role</th>
                    <th>View Metrics</th>
                    <th>Edit Content</th>
                    <th>Delete Records</th>
                    <th>Export Data</th>
                    <th>Billing Admin</th>
                    <th>AI Config Access</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Super Admin</strong></td>
                    <td><input type="checkbox" checked style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" checked style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" checked style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" checked style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" checked style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" checked style="width:16px; height:16px;"></td>
                  </tr>
                  <tr>
                    <td><strong>Support Admin</strong></td>
                    <td><input type="checkbox" checked style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" checked style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" checked style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" style="width:16px; height:16px;"></td>
                  </tr>
                  <tr>
                    <td><strong>Company Admin (HQ)</strong></td>
                    <td><input type="checkbox" checked style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" checked style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" checked style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" checked style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" style="width:16px; height:16px;"></td>
                  </tr>
                  <tr>
                    <td><strong>Dealer Manager</strong></td>
                    <td><input type="checkbox" checked style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" checked style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" checked style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" style="width:16px; height:16px;"></td>
                  </tr>
                  <tr>
                    <td><strong>Dealer Staff</strong></td>
                    <td><input type="checkbox" checked style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" style="width:16px; height:16px;"></td>
                    <td><input type="checkbox" style="width:16px; height:16px;"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div style="margin-top:20px; text-align:right;">
              <button class="btn btn-primary" onclick="alert('Access policy tables deployed successfully.')">Save Access Policies</button>
            </div>
          </div>
        `;
      } else if (menu === 'infrastructure') {
        const lm = this.state.db.supportAdmin.liveMonitoring;
        canvas.innerHTML = `
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;">
            <div class="card" style="padding:20px; border-left:4px solid #a855f7; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(168,85,247,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">AWS Infra Cost</div>
              <strong style="font-size:1.8rem; color:var(--text-primary);">${db.kpis.awsCost.value}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">This billing cycle · +4.2% vs last month</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #3b82f6; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(59,130,246,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Avg Response Time</div>
              <strong style="font-size:1.8rem; color:var(--text-primary);">${db.kpis.avgResponseTime.value}</strong>
              <div style="font-size:0.75rem; color:var(--success); margin-top:4px;">99.9% Uptime this month</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #10b981; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Active Sessions</div>
              <strong style="font-size:1.8rem; color:var(--text-primary);">${lm.activeSessions}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Live right now across all dealers</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #f43f5e; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(244,63,94,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Failed Requests</div>
              <strong style="font-size:1.8rem; color:var(--text-primary);">${lm.failedRequests}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Out of ~24K total API calls today</div>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:24px;">
            <div class="card" style="padding:24px;">
              <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:20px;">
                <span class="card-title">Server Health — Live</span>
                <span class="badge badge-success">All Systems Operational</span>
              </div>
              ${[{ label: 'CPU Usage', val: lm.serverHealth.cpu, color: '#3b82f6' }, { label: 'RAM Usage', val: lm.serverHealth.ram, color: '#a855f7' }, { label: 'Storage Used', val: lm.serverHealth.storage, color: '#10b981' }].map(m => `
                <div style="margin-bottom:18px;">
                  <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                    <span style="font-size:0.82rem;font-weight:600;color:var(--text-primary);">${m.label}</span>
                    <span style="font-size:0.82rem;font-weight:700;color:${m.val > 80 ? 'var(--danger)' : m.val > 60 ? 'var(--warning)' : 'var(--success)'};">${m.val}%</span>
                  </div>
                  <div style="height:10px;background:var(--border-color);border-radius:6px;overflow:hidden;">
                    <div style="height:100%;width:${m.val}%;background:${m.color};border-radius:6px;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="card" style="padding:24px;">
              <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:20px;">
                <span class="card-title">Integration Health</span>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;text-align:center;margin-bottom:20px;">
                <div style="padding:16px;background:rgba(16,185,129,0.08);border-radius:12px;border:1px solid rgba(16,185,129,0.2);">
                  <div style="font-size:2rem;font-weight:800;color:var(--success);">${lm.integrationStats.active}</div>
                  <div style="font-size:0.72rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;margin-top:4px;">Active</div>
                </div>
                <div style="padding:16px;background:rgba(244,63,94,0.08);border-radius:12px;border:1px solid rgba(244,63,94,0.2);">
                  <div style="font-size:2rem;font-weight:800;color:var(--danger);">${lm.integrationStats.error}</div>
                  <div style="font-size:0.72rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;margin-top:4px;">Errors</div>
                </div>
                <div style="padding:16px;background:rgba(100,116,139,0.08);border-radius:12px;border:1px solid rgba(100,116,139,0.2);">
                  <div style="font-size:2rem;font-weight:800;color:var(--text-secondary);">${lm.integrationStats.inactive}</div>
                  <div style="font-size:0.72rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;margin-top:4px;">Inactive</div>
                </div>
              </div>
              <div style="font-size:0.82rem;color:var(--text-secondary);">System API Status: <strong style="color:var(--success);">${lm.apiStatus}</strong></div>
            </div>
          </div>

          <div class="card" style="padding:24px;">
            <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:20px;">
              <span class="card-title">AWS Cost Breakdown by Service — July 2026</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
              ${[{ s: 'EC2 Compute', c: '$2,140', p: 52, col: '#f59e0b', i: 'cpu' }, { s: 'S3 Storage', c: '$640', p: 15, col: '#3b82f6', i: 'hard-drive' }, { s: 'CloudFront CDN', c: '$430', p: 10, col: '#10b981', i: 'globe' }, { s: 'Lambda + API GW', c: '$960', p: 23, col: '#a855f7', i: 'zap' }].map(sv => `
                <div style="padding:16px;background:rgba(0,0,0,0.03);border-radius:12px;border:1px solid var(--border-color);">
                  <i data-lucide="${sv.i}" style="color:${sv.col};width:20px;height:20px;margin-bottom:8px;"></i>
                  <div style="font-size:1.4rem;font-weight:800;color:var(--text-primary);">${sv.c}</div>
                  <div style="font-size:0.72rem;color:var(--text-secondary);font-weight:600;margin-top:2px;">${sv.s}</div>
                  <div style="margin-top:8px;height:6px;background:var(--border-color);border-radius:4px;overflow:hidden;">
                    <div style="height:100%;width:${sv.p}%;background:${sv.col};border-radius:4px;"></div>
                  </div>
                  <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:4px;">${sv.p}% of total</div>
                </div>
              `).join('')}
            </div>
            <div style="height:220px;"><canvas id="infraCostChart"></canvas></div>
          </div>
        `;
        const ctx = document.getElementById('infraCostChart');
        if (ctx) {
          const c = this.getChartColors();
          this.state.charts.infraCost = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
              labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
              datasets: [
                { label: 'AWS Cost ($)', data: [3800, 3900, 4050, 4100, 3980, 4170], borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#a855f7' },
                { label: 'Avg Response (ms)', data: [130, 128, 124, 121, 126, 124], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', fill: false, tension: 0.4, borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#3b82f6', yAxisID: 'y2' }
              ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { color: c.text, font: { size: 11 } } } }, scales: { x: { grid: { color: c.grid }, ticks: { color: c.text } }, y: { grid: { color: c.grid }, ticks: { color: c.text, callback: v => '$' + v } }, y2: { position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#3b82f6', callback: v => v + 'ms' } } } }
          });
        }

      } else if (menu === 'system_errors') {
        if (!this.state.db.superAdmin.systemErrors) {
          this.state.db.superAdmin.systemErrors = [
            { id: 'ERR-701', time: 'Today 03:42 PM', dealer: 'Home hardware 01 - Toronto', type: 'AI Inference Timeout', message: 'Image analysis API exceeded 30s threshold. Model returned null.', severity: 'High', status: 'Open', count: 3, trace: 'Traceback (most recent call last):\n  File "/app/ai/inference.py", line 42, in process_image\n    res = client.predict(image_bytes, timeout=30.0)\n  File "/usr/local/lib/python3.10/site-packages/grpc/_channel.py", line 986, in __call__\n    raise grpc.RpcError("Deadline Exceeded")\ngrpc.RpcError: Deadline Exceeded (30.0s limit reached)' },
            { id: 'ERR-702', time: 'Today 02:18 PM', dealer: 'My Depot 02 - Montreal', type: 'Authentication Failure', message: 'JWT token expired mid-session. Auto-refresh failed due to expired refresh token.', severity: 'Medium', status: 'Auto-Resolved', count: 1, trace: 'Error: Unauthorized\n    at verifyToken (/app/auth/jwt.js:18:12)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at async authMiddleware (/app/routes/api.js:45:5)' },
            { id: 'ERR-703', time: 'Today 01:55 PM', dealer: 'Tottens 08 - Vancouver', type: 'Image Upload Error', message: 'S3 multipart upload failed — file exceeded 15MB limit. User not notified.', severity: 'Medium', status: 'Open', count: 2, trace: 'AWS.S3.UploadError: EntityTooLarge (Your proposed upload exceeds the maximum allowed size)\n    at Request.extractError (/app/node_modules/aws-sdk/lib/services/s3.js:711:28)\n    at Request.callListeners (/app/node_modules/aws-sdk/lib/sequential_executor.js:106:20)' },
            { id: 'ERR-704', time: 'Today 12:30 PM', dealer: 'Rona 03 - Calgary', type: 'API Rate Limit Hit', message: 'Company exceeded 500 requests/hour. Requests queued for 12 minutes.', severity: 'High', status: 'Resolved', count: 1, trace: 'RateLimitExceeded: IP 192.168.1.45 hit hard ceiling of 500 requests/hr.\n    at RateLimiter.consume (/app/middleware/ratelimit.js:29:15)\n    at async handleRequest (/app/app.js:88:9)' },
            { id: 'ERR-705', time: 'Today 11:10 AM', dealer: 'BMR Group 04 - Edmonton', type: 'Widget Load Failure', message: 'Widget script failed to initialise — missing CORS header on company domain.', severity: 'Low', status: 'Resolved', count: 4, trace: 'Access to script at "https://cdn.botnbolt.com/widget.js" from origin "https://bmrgroup-edmonton.ca" has been blocked by CORS policy: No "Access-Control-Allow-Origin" header is present on the requested resource.' },
            { id: 'ERR-706', time: 'Today 09:45 AM', dealer: 'Home hardware 05 - Ottawa', type: 'Database Failover', message: 'RDS read-replica experienced brief failover. Queries queued for 8 seconds.', severity: 'High', status: 'Resolved', count: 1, trace: 'KnexTimeoutError: Knex: Timeout acquiring a connection. The pool is probably full.\n    at ConnectionPool.acquire (/app/node_modules/knex/lib/client.js:321:12)' },
            { id: 'ERR-707', time: 'Today 08:22 AM', dealer: 'Tottens 05 - Ottawa', type: 'AI Low Confidence', message: 'Damage detection returned <60% confidence on 2 consecutive images. Flagged.', severity: 'Low', status: 'Open', count: 2, trace: 'ConfidenceScoreWarning: Classification returned confidence 0.582 (threshold 0.60)\n    at Pipeline.classify (/app/ai/classifier.js:114:9)\n    at async runInference (/app/routes/scan.js:32:21)' },
            { id: 'ERR-708', time: 'Today 07:30 AM', dealer: 'My Depot 05 - Vancouver', type: 'Email Notification Fail', message: 'SMTP relay rejected outbound email for quote notification. Fallback SMS sent.', severity: 'Low', status: 'Auto-Resolved', count: 1, trace: 'SMTPError: 554 5.7.1 Service unavailable; Client host [x.x.x.x] blocked using Zen Spamhaus\n    at SMTPConnection._actionMail (/app/node_modules/nodemailer/lib/smtp-connection/index.js:788:28)' },
            { id: 'ERR-709', time: 'Yesterday 11:58 PM', dealer: 'Rona 01 - Toronto', type: 'Billing Webhook Fail', message: 'Stripe webhook payload verification failed — payment delayed by 4 hours.', severity: 'High', status: 'Resolved', count: 1, trace: 'StripeSignatureVerificationError: No signatures found matching the expected signature for payload.\n    at Webhooks.verifySignature (/app/node_modules/stripe/lib/Webhooks.js:52:12)' },
            { id: 'ERR-710', time: 'Yesterday 10:12 PM', dealer: 'Home hardware 08 - Vancouver', type: 'Session Crash', message: 'Frontend JS uncaught exception during cost calculation. Session terminated.', severity: 'Medium', status: 'Resolved', count: 2, trace: 'TypeError: Cannot read properties of undefined (reading "toFixed")\n    at calculateEstimate (https://dealer.botnbolt.com/js/dashboard.js:42:19)\n    at HTMLButtonElement.onclick (https://dealer.botnbolt.com/dashboard:1:1)' }
          ];
          this.saveState();
        }

        const allErrors = this.state.db.superAdmin.systemErrors;
        const activeFilter = this.state.errorFilter || 'all';

        // Filter the errors list
        let errors = allErrors;
        if (activeFilter === 'open') {
          errors = allErrors.filter(e => e.status === 'Open');
        } else if (activeFilter === 'high') {
          errors = allErrors.filter(e => e.severity === 'High');
        } else if (activeFilter === 'resolved') {
          errors = allErrors.filter(e => e.status !== 'Open');
        }

        const openErrors = allErrors.filter(e => e.status === 'Open').length;
        const highErrors = allErrors.filter(e => e.severity === 'High').length;
        const resolvedErrors = allErrors.filter(e => e.status !== 'Open').length;
        const totalOccurrences = allErrors.reduce((s, e) => s + e.count, 0);

        canvas.innerHTML = `
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:24px;">
            <!-- Open Errors Card -->
            <div class="card" onclick="window.BotNBoltApp.handleErrorFilterChange('${activeFilter === 'open' ? 'all' : 'open'}')" style="padding:20px;border-left:4px solid #f43f5e;background:linear-gradient(135deg,var(--bg-card) 0%,rgba(244,63,94,0.07) 100%);cursor:pointer;transition:transform 0.15s, box-shadow 0.15s, outline 0.15s;${activeFilter === 'open' ? 'outline:2px solid #f43f5e;transform:translateY(-4px);box-shadow:0 8px 24px rgba(244,63,94,0.15);' : ''}" onmouseenter="this.style.transform='translateY(-4px)'" onmouseleave="if('${activeFilter}'!=='open')this.style.transform=''">
              <div style="font-size:0.72rem;text-transform:uppercase;color:var(--text-secondary);font-weight:600;margin-bottom:6px;">Open Errors</div>
              <strong style="font-size:2rem;color:#f43f5e;">${openErrors}</strong>
              <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:4px;">Need immediate attention</div>
            </div>
            
            <!-- High Severity Card -->
            <div class="card" onclick="window.BotNBoltApp.handleErrorFilterChange('${activeFilter === 'high' ? 'all' : 'high'}')" style="padding:20px;border-left:4px solid #f59e0b;background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.07) 100%);cursor:pointer;transition:transform 0.15s, box-shadow 0.15s, outline 0.15s;${activeFilter === 'high' ? 'outline:2px solid #f59e0b;transform:translateY(-4px);box-shadow:0 8px 24px rgba(245,158,11,0.15);' : ''}" onmouseenter="this.style.transform='translateY(-4px)'" onmouseleave="if('${activeFilter}'!=='high')this.style.transform=''">
              <div style="font-size:0.72rem;text-transform:uppercase;color:var(--text-secondary);font-weight:600;margin-bottom:6px;">High Severity</div>
              <strong style="font-size:2rem;color:#f59e0b;">${highErrors}</strong>
              <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:4px;">Critical priority errors</div>
            </div>
            
            <!-- Resolved Today Card -->
            <div class="card" onclick="window.BotNBoltApp.handleErrorFilterChange('${activeFilter === 'resolved' ? 'all' : 'resolved'}')" style="padding:20px;border-left:4px solid #10b981;background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.07) 100%);cursor:pointer;transition:transform 0.15s, box-shadow 0.15s, outline 0.15s;${activeFilter === 'resolved' ? 'outline:2px solid #10b981;transform:translateY(-4px);box-shadow:0 8px 24px rgba(16,185,129,0.15);' : ''}" onmouseenter="this.style.transform='translateY(-4px)'" onmouseleave="if('${activeFilter}'!=='resolved')this.style.transform=''">
              <div style="font-size:0.72rem;text-transform:uppercase;color:var(--text-secondary);font-weight:600;margin-bottom:6px;">Resolved Today</div>
              <strong style="font-size:2rem;color:var(--success);">${resolvedErrors}</strong>
              <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:4px;">Including auto-resolved</div>
            </div>
            
            <!-- Total Occurrences Card -->
            <div class="card" onclick="window.BotNBoltApp.handleErrorFilterChange('all')" style="padding:20px;border-left:4px solid #3b82f6;background:linear-gradient(135deg,var(--bg-card) 0%,rgba(59,130,246,0.07) 100%);cursor:pointer;transition:transform 0.15s, box-shadow 0.15s, outline 0.15s;${activeFilter === 'all' ? 'outline:2px solid #3b82f6;transform:translateY(-4px);box-shadow:0 8px 24px rgba(59,130,246,0.15);' : ''}" onmouseenter="this.style.transform='translateY(-4px)'" onmouseleave="if('${activeFilter}'!=='all')this.style.transform=''">
              <div style="font-size:0.72rem;text-transform:uppercase;color:var(--text-secondary);font-weight:600;margin-bottom:6px;">Total Occurrences</div>
              <strong style="font-size:2rem;color:#3b82f6;">${totalOccurrences}</strong>
              <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:4px;">Across all error types today</div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <span class="card-title">Today's System Error Log</span>
              <div style="display:flex;gap:8px;">
                <span class="badge badge-danger">${allErrors.filter(e => e.status === 'Open').length} Open</span>
                <span class="badge badge-success">${allErrors.filter(e => e.status !== 'Open').length} Resolved</span>
              </div>
            </div>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Error ID</th>
                    <th>Time</th>
                    <th>Dealer / Location</th>
                    <th>Error Type</th>
                    <th>Description</th>
                    <th>Severity</th>
                    <th>Count</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${errors.length === 0 ? `
                    <tr>
                      <td colspan="9" style="text-align:center; padding: 32px; color: var(--text-secondary);">No records match your active KPI filter.</td>
                    </tr>
                  ` : errors.map(e => `
                    <tr style="cursor:pointer;" onclick="window.BotNBoltApp.inspectErrorModal('${e.id}')" onmouseenter="this.style.backgroundColor='var(--bg-primary)'" onmouseleave="this.style.backgroundColor=''">
                      <td><code style="font-size:0.75rem;">${e.id}</code></td>
                      <td style="font-size:0.75rem;color:var(--text-secondary);white-space:nowrap;">${e.time}</td>
                      <td style="font-size:0.8rem;">${e.dealer}</td>
                      <td><span class="badge ${e.severity === 'High' ? 'badge-danger' : e.severity === 'Medium' ? 'badge-warning' : 'badge-info'}" style="font-size:0.65rem;">${e.type}</span></td>
                      <td style="font-size:0.75rem;color:var(--text-secondary);max-width:240px;">${e.message}</td>
                      <td>
                        <span style="display:inline-flex;align-items:center;gap:4px;font-size:0.75rem;font-weight:700;color:${e.severity === 'High' ? '#f43f5e' : e.severity === 'Medium' ? '#f59e0b' : '#64748b'};">
                          <span style="width:7px;height:7px;border-radius:50%;background:${e.severity === 'High' ? '#f43f5e' : e.severity === 'Medium' ? '#f59e0b' : '#64748b'};"></span>
                          ${e.severity}
                        </span>
                      </td>
                      <td style="text-align:center;font-weight:700;color:var(--text-primary);">${e.count}</td>
                      <td><span class="badge ${e.status === 'Open' ? 'badge-danger' : e.status === 'Auto-Resolved' ? 'badge-warning' : 'badge-success'}">${e.status}</span></td>
                      <td onclick="event.stopPropagation();"><button class="btn btn-secondary btn-sm" onclick="window.BotNBoltApp.inspectErrorModal('${e.id}')">Inspect</button></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else if (menu === 'revenue') {
        const planMap = { 'Enterprise Gold': 1499, 'Enterprise Platinum': 1899, 'Premium Standard': 899, 'Basic Trial': 299 };
        const revenueRows = db.companies.map(co => ({
          ...co,
          monthlyFee: planMap[co.subscriptionPlan] || 499,
          usageCharges: db.dealers.filter(d => d.company === co.name).reduce((s, d) => s + d.monthlyRequests, 0) * 0.015,
          dealers: db.dealers.filter(d => d.company === co.name).length
        }));
        const totalRevenue = revenueRows.reduce((s, r) => s + r.monthlyFee + r.usageCharges, 0);
        const avgRevenue = Math.round(totalRevenue / revenueRows.length);
        const topEarner = [...revenueRows].sort((a, b) => (b.monthlyFee + b.usageCharges) - (a.monthlyFee + a.usageCharges))[0];
        const ytdRevenue = totalRevenue * 7;

        canvas.innerHTML = `
          <!-- Revenue KPI Summary -->
          <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-bottom:24px;">
            <div class="card" style="padding:20px; border-left:4px solid var(--danger); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(239,68,68,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Total Monthly Revenue</div>
              <strong style="font-size:1.8rem; color:var(--text-primary);">$${Math.round(totalRevenue).toLocaleString()}</strong>
              <div style="font-size:0.75rem; color:var(--success); margin-top:4px;">↑ +8.3% vs last month</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #3b82f6; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(59,130,246,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Avg Revenue / Company</div>
              <strong style="font-size:1.8rem; color:var(--text-primary);">$${avgRevenue.toLocaleString()}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Subscriptions + usage</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #10b981; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Top Earner</div>
              <strong style="font-size:1rem; color:var(--text-primary); line-height:1.3;">${topEarner.name}</strong>
              <div style="font-size:0.75rem; color:var(--success); margin-top:4px;">$${Math.round(topEarner.monthlyFee + topEarner.usageCharges).toLocaleString()}/mo</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #f59e0b; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">YTD Revenue (2026)</div>
              <strong style="font-size:1.8rem; color:var(--text-primary);">$${Math.round(ytdRevenue).toLocaleString()}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Jan – Jul 2026</div>
            </div>
          </div>

          <!-- Revenue Trend + Per-Company Bars -->
          <div style="display:grid; grid-template-columns:2fr 1fr; gap:24px; margin-bottom:24px;">
            <div class="card" style="padding:24px;">
              <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:16px;">
                <span class="card-title">Monthly Revenue Trend (2026)</span>
              </div>
              <div style="height:220px;"><canvas id="revenueTrendChart"></canvas></div>
            </div>
            <div class="card" style="padding:24px;">
              <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:16px;">
                <span class="card-title">Revenue by Company</span>
              </div>
              ${revenueRows.map(r => {
          const total = Math.round(r.monthlyFee + r.usageCharges);
          const maxRev = Math.max(...revenueRows.map(x => x.monthlyFee + x.usageCharges));
          const pct = Math.round((total / maxRev) * 100);
          return `
                  <div style="margin-bottom:14px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                      <span style="font-size:0.8rem;font-weight:600;color:var(--text-primary);">${r.name}</span>
                      <span style="font-size:0.8rem;font-weight:700;color:var(--danger);">$${total.toLocaleString()}</span>
                    </div>
                    <div style="height:8px;background:var(--border-color);border-radius:4px;overflow:hidden;">
                      <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--danger),#f59e0b);border-radius:4px;"></div>
                    </div>
                    <div style="font-size:0.68rem;color:var(--text-secondary);margin-top:3px;">${r.subscriptionPlan} · ${r.dealers} dealers</div>
                  </div>
                `;
        }).join('')}
            </div>
          </div>

          <!-- Revenue Breakdown Table -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">Detailed Revenue Breakdown</span>
              <button class="btn btn-secondary btn-sm flex-center" onclick="alert('Exporting revenue report...')"><i data-lucide="download"></i> Export</button>
            </div>
            <div class="table-responsive">
              <table class="data-table">
                <thead><tr>
                  <th>Company</th><th>Plan</th><th>Dealers</th><th>Monthly Fee</th>
                  <th>API Usage Charges</th><th>Total MRR</th><th>Payment Status</th><th>Renewal</th>
                </tr></thead>
                <tbody>
                  ${revenueRows.map(r => `
                    <tr>
                      <td><strong>${r.name}</strong></td>
                      <td><span class="badge badge-info" style="font-size:0.65rem;">${r.subscriptionPlan}</span></td>
                      <td>${r.dealers}</td>
                      <td style="font-weight:600;">$${r.monthlyFee.toLocaleString()}</td>
                      <td style="color:var(--danger); font-weight:600;">$${r.usageCharges.toFixed(2)}</td>
                      <td><strong style="color:var(--danger); font-size:1rem;">$${Math.round(r.monthlyFee + r.usageCharges).toLocaleString()}</strong></td>
                      <td><span class="badge ${r.status === 'Active' ? 'badge-success' : r.status === 'Trial' ? 'badge-warning' : 'badge-danger'}">Paid</span></td>
                      <td style="font-size:0.8rem;">${r.expiryDate}</td>
                    </tr>
                  `).join('')}
                  <tr style="background:rgba(239,68,68,0.06); font-weight:700;">
                    <td colspan="5" style="text-align:right; color:var(--text-secondary);">Total Monthly Revenue</td>
                    <td style="color:var(--danger); font-size:1.1rem; font-weight:800;">$${Math.round(totalRevenue).toLocaleString()}</td>
                    <td colspan="2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        `;
        const rvCtx = document.getElementById('revenueTrendChart');
        if (rvCtx) {
          const c = this.getChartColors();
          new Chart(rvCtx.getContext('2d'), {
            type: 'bar',
            data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
              datasets: [
                { label: 'Subscription Revenue', data: [14200, 14800, 15100, 15600, 15900, 16200, 16800], backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 4 },
                { label: 'Usage Revenue', data: [1200, 1400, 1600, 1900, 2100, 2300, 2700], backgroundColor: 'rgba(245,158,11,0.7)', borderRadius: 4 }
              ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { color: c.text, font: { size: 11 } } } }, scales: { x: { stacked: true, grid: { color: c.grid }, ticks: { color: c.text } }, y: { stacked: true, grid: { color: c.grid }, ticks: { color: c.text, callback: v => '$' + v.toLocaleString() } } } }
          });
        }

      } else if (menu === 'ai_cost') {
        const totalAICost = parseFloat((db.kpis.aiCost.value || '$2,340').replace(/[$,]/g, ''));
        const totalInf = db.dealers.reduce((s, d) => s + d.monthlyRequests, 0);
        const costPerInf = (totalAICost / totalInf).toFixed(4);
        const aiCostRows = db.companies.map(co => {
          const compInf = db.dealers.filter(d => d.company === co.name).reduce((s, d) => s + d.monthlyRequests, 0);
          const compCost = (compInf / totalInf) * totalAICost;
          return { ...co, inferences: compInf, cost: compCost };
        });

        canvas.innerHTML = `
          <!-- AI Cost KPI Header -->
          <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-bottom:24px;">
            <div class="card" style="padding:20px; border-left:4px solid #06b6d4; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(6,182,212,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Total AI Cost (Jul)</div>
              <strong style="font-size:1.8rem; color:var(--text-primary);">${db.kpis.aiCost.value}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">${db.kpis.aiCost.change} vs last month</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #f59e0b; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Cost Per Inference</div>
              <strong style="font-size:1.8rem; color:var(--text-primary);">$${costPerInf}</strong>
              <div style="font-size:0.75rem; color:var(--success); margin-top:4px;">↓ -3.1% vs last month</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #10b981; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Total Inferences Billed</div>
              <strong style="font-size:1.8rem; color:var(--text-primary);">${totalInf.toLocaleString()}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">This billing cycle</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #a855f7; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(168,85,247,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Cost Saved (Caching)</div>
              <strong style="font-size:1.8rem; color:#a855f7;">$${Math.round(totalAICost * 0.18).toLocaleString()}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">18% saved via response cache</div>
            </div>
          </div>

          <!-- AI Cost by Model + Trend -->
          <div style="display:grid; grid-template-columns:1fr 1.5fr; gap:24px; margin-bottom:24px;">
            <div class="card" style="padding:24px;">
              <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:16px;">
                <span class="card-title">Cost by BotNBolt AI Engine</span>
              </div>
              ${[
            { model: 'BotNBolt Vision Engine (Image Damage Detection)', pct: 58, cost: Math.round(totalAICost * 0.58), color: '#06b6d4' },
            { model: 'BotNBolt Reasoner (Repair Recommendation Logic)', pct: 24, cost: Math.round(totalAICost * 0.24), color: '#a855f7' },
            { model: 'BotNBolt NaturalNLP (Widget Conversation Engine)', pct: 12, cost: Math.round(totalAICost * 0.12), color: '#f59e0b' },
            { model: 'BotNBolt Fallback Engine (Safeguards & Moderation)', pct: 6, cost: Math.round(totalAICost * 0.06), color: '#3b82f6' }
          ].map(m => `
                <div style="margin-bottom:16px;">
                  <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                    <span style="font-size:0.8rem;font-weight:600;color:var(--text-primary);">${m.model}</span>
                    <span style="font-size:0.8rem;font-weight:700;color:${m.color};">$${m.cost}</span>
                  </div>
                  <div style="height:9px;background:var(--border-color);border-radius:5px;overflow:hidden;">
                    <div style="height:100%;width:${m.pct}%;background:${m.color};border-radius:5px;"></div>
                  </div>
                  <div style="font-size:0.68rem;color:var(--text-secondary);margin-top:3px;">${m.pct}% of total AI spend</div>
                </div>
              `).join('')}
            </div>
            <div class="card" style="padding:24px;">
              <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:16px;">
                <span class="card-title">AI Cost Trend (6 Months)</span>
              </div>
              <div style="height:220px;"><canvas id="aiCostTrendChart"></canvas></div>
            </div>
          </div>

          <!-- AI Cost by Company + Optimisation Recommendations -->
          <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:24px; margin-bottom:24px;">
            <div class="card">
              <div class="card-header"><span class="card-title">AI Cost Breakdown by Company</span></div>
              <div class="table-responsive">
                <table class="data-table">
                  <thead><tr><th>Company</th><th>Inferences</th><th>AI Cost</th><th>Cost/Inference</th><th>% of Total</th></tr></thead>
                  <tbody>
                    ${aiCostRows.sort((a, b) => b.cost - a.cost).map(r => `
                      <tr>
                        <td><strong>${r.name}</strong></td>
                        <td>${r.inferences.toLocaleString()}</td>
                        <td style="font-weight:700;color:#06b6d4;">$${r.cost.toFixed(2)}</td>
                        <td style="font-size:0.8rem;">$${(r.cost / r.inferences).toFixed(4)}</td>
                        <td>
                          <div style="display:flex;align-items:center;gap:8px;">
                            <div style="flex:1;height:6px;background:var(--border-color);border-radius:3px;overflow:hidden;">
                              <div style="height:100%;width:${Math.round((r.inferences / totalInf) * 100)}%;background:#06b6d4;border-radius:3px;"></div>
                            </div>
                            <span style="font-size:0.75rem;font-weight:600;">${Math.round((r.inferences / totalInf) * 100)}%</span>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
            <div class="card" style="padding:24px;">
              <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:16px;">
                <span class="card-title">Cost Optimisation Tips</span>
              </div>
              ${[
            { icon: 'zap', title: 'Increase Cache TTL', desc: 'Extend response cache from 15min to 60min. Estimated saving: $320/mo', color: '#10b981' },
            { icon: 'image', title: 'Compress Input Images', desc: 'Auto-resize images to 1024px max before Vision API call. Saves ~12% cost.', color: '#f59e0b' },
            { icon: 'layers', title: 'Batch Low-Priority Requests', desc: 'Queue non-urgent scans in batch mode at 60% cost vs real-time.', color: '#3b82f6' },
            { icon: 'sliders', title: 'Model Routing', desc: 'Route simple damage queries to Gemini Flash instead of GPT-4o.', color: '#a855f7' }
          ].map(t => `
                <div style="display:flex;gap:12px;padding:12px;background:var(--bg-primary);border-radius:10px;margin-bottom:10px;">
                  <i data-lucide="${t.icon}" style="color:${t.color};width:18px;height:18px;margin-top:2px;flex-shrink:0;"></i>
                  <div>
                    <div style="font-size:0.82rem;font-weight:700;color:var(--text-primary);margin-bottom:3px;">${t.title}</div>
                    <div style="font-size:0.72rem;color:var(--text-secondary);">${t.desc}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        const acCtx = document.getElementById('aiCostTrendChart');
        if (acCtx) {
          const c = this.getChartColors();
          new Chart(acCtx.getContext('2d'), {
            type: 'line',
            data: {
              labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
              datasets: [
                { label: 'AI Cost ($)', data: [1890, 2050, 2180, 2290, 2220, 2340], borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#06b6d4' },
                { label: 'Inferences (00s)', data: [82, 91, 98, 104, 112, 124], borderColor: '#f59e0b', backgroundColor: 'transparent', tension: 0.4, borderWidth: 2, borderDash: [4, 4], pointRadius: 3, yAxisID: 'y2' }
              ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { color: c.text, font: { size: 11 } } } }, scales: { x: { grid: { color: c.grid }, ticks: { color: c.text } }, y: { grid: { color: c.grid }, ticks: { color: c.text, callback: v => '$' + v } }, y2: { position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#f59e0b', callback: v => v * 100 + '' } } } }
          });
        }

      } else if (menu === 'model_performance') {
        const categories = [
          { name: 'AI Repair and Analysis', icon: 'wrench', accuracy: 94.2, samples: 4820, falsePos: 2.1, color: '#3b82f6' },
          { name: 'Renovation', icon: 'home', accuracy: 91.8, samples: 3150, falsePos: 3.4, color: '#10b981' },
          { name: 'Build', icon: 'file-text', accuracy: 88.5, samples: 2280, falsePos: 5.2, color: '#f59e0b' }
        ];
        const totalSamples = categories.reduce((s, c) => s + c.samples, 0);
        const avgPrecision = 92.8, avgRecall = 91.4, avgF1 = 92.1;

        canvas.innerHTML = `
          <!-- Model Performance KPI Header -->
          <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-bottom:24px;">
            <div class="card" style="padding:20px; border-left:4px solid #10b981; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Overall Accuracy</div>
              <strong style="font-size:1.8rem; color:var(--success);">${db.kpis.avgRepairAccuracy.value}</strong>
              <div style="font-size:0.75rem; color:var(--success); margin-top:4px;">${db.kpis.avgRepairAccuracy.change} vs last month</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #3b82f6; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(59,130,246,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Avg Precision</div>
              <strong style="font-size:1.8rem; color:var(--text-primary);">${avgPrecision}%</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Positive predictive value</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #a855f7; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(168,85,247,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Avg Recall</div>
              <strong style="font-size:1.8rem; color:var(--text-primary);">${avgRecall}%</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Sensitivity rating</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #f59e0b; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Samples Evaluated</div>
              <strong style="font-size:1.8rem; color:var(--text-primary);">${totalSamples.toLocaleString()}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">This billing cycle</div>
            </div>
          </div>

          <!-- Category Accuracy + Trend -->
          <div style="display:grid; grid-template-columns:1fr 1.4fr; gap:24px; margin-bottom:24px;">
            <!-- Accuracy by Category -->
            <div class="card" style="padding:24px;">
              <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:16px;">
                <span class="card-title">Accuracy by Repair Category</span>
              </div>
              ${categories.map(cat => `
                <div style="margin-bottom:18px;">
                  <div style="display:flex;align-items:center;gap:10px;margin-bottom:7px;">
                    <i data-lucide="${cat.icon}" style="color:${cat.color};width:16px;height:16px;flex-shrink:0;"></i>
                    <span style="font-size:0.82rem;font-weight:700;color:var(--text-primary);flex:1;">${cat.name}</span>
                    <span style="font-size:0.9rem;font-weight:800;color:${cat.color};">${cat.accuracy}%</span>
                  </div>
                  <div style="height:10px;background:var(--border-color);border-radius:5px;overflow:hidden;">
                    <div style="height:100%;width:${cat.accuracy}%;background:linear-gradient(90deg,${cat.color},${cat.color}aa);border-radius:5px;"></div>
                  </div>
                  <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:0.68rem;color:var(--text-secondary);">
                    <span>${cat.samples.toLocaleString()} samples</span>
                    <span>False Pos: ${cat.falsePos}%</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Monthly Accuracy Trend -->
            <div class="card" style="padding:24px;">
              <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:16px;">
                <span class="card-title">Model Accuracy Trend (6 Months)</span>
              </div>
              <div style="height:240px;"><canvas id="modelAccuracyChart"></canvas></div>
            </div>
          </div>

          <!-- Per-Company Model Performance + Low Confidence Log -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
            <div class="card">
              <div class="card-header"><span class="card-title">Per-Company Model Performance</span></div>
              <div class="table-responsive">
                <table class="data-table">
                  <thead><tr><th>Company</th><th>Inferences</th><th>Accuracy</th><th>Low Conf.</th><th>Status</th></tr></thead>
                  <tbody>
                    ${db.companies.map((co, i) => {
          const compInf = db.dealers.filter(d => d.company === co.name).reduce((s, d) => s + d.monthlyRequests, 0);
          const accuracy = (90 + (i * 1.3)).toFixed(1);
          const lowConf = Math.max(1, Math.round(compInf * 0.025));
          return `
                        <tr>
                          <td><strong>${co.name}</strong></td>
                          <td>${compInf.toLocaleString()}</td>
                          <td>
                            <div style="display:flex;align-items:center;gap:8px;">
                              <div style="flex:1;height:6px;background:var(--border-color);border-radius:3px;overflow:hidden;">
                                <div style="height:100%;width:${accuracy}%;background:${accuracy >= 93 ? '#10b981' : accuracy >= 90 ? '#f59e0b' : '#f43f5e'};border-radius:3px;"></div>
                              </div>
                              <span style="font-size:0.78rem;font-weight:700;">${accuracy}%</span>
                            </div>
                          </td>
                          <td style="color:var(--warning);font-weight:600;">${lowConf}</td>
                          <td><span class="badge ${accuracy >= 93 ? 'badge-success' : accuracy >= 90 ? 'badge-warning' : 'badge-danger'}">${accuracy >= 93 ? 'Excellent' : accuracy >= 90 ? 'Good' : 'Needs Review'}</span></td>
                        </tr>
                      `;
        }).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Low Confidence Log -->
            <div class="card" style="padding:24px;">
              <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:16px;">
                <span class="card-title">Recent Low-Confidence Inferences</span>
                <span class="badge badge-warning">Flagged for Review</span>
              </div>
              ${[
            { id: 'INF-4821', dealer: 'Home hardware 01 - Toronto', category: 'Build', conf: 54, time: 'Today 3:18 PM' },
            { id: 'INF-4809', dealer: 'Tottens 05 - Ottawa', category: 'Renovation', conf: 58, time: 'Today 1:45 PM' },
            { id: 'INF-4798', dealer: 'My Depot 03 - Ottawa', category: 'AI Repair and Analysis', conf: 56, time: 'Today 12:02 PM' },
            { id: 'INF-4781', dealer: 'Rona 02 - Calgary', category: 'Build', conf: 52, time: 'Today 9:33 AM' },
            { id: 'INF-4760', dealer: 'BMR Group 01 - Quebec City', category: 'AI Repair and Analysis', conf: 59, time: 'Yesterday 4:55 PM' },
            { id: 'INF-4744', dealer: 'Home hardware 06 - Winnipeg', category: 'Renovation', conf: 55, time: 'Yesterday 2:10 PM' }
          ].map(log => `
                <div style="display:flex;gap:12px;padding:12px;background:var(--bg-primary);border-radius:10px;margin-bottom:8px;border-left:3px solid #f59e0b;">
                  <div style="flex:1;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <code style="font-size:0.72rem;color:var(--primary);">${log.id}</code>
                      <span style="font-size:0.7rem;color:var(--text-secondary);">${log.time}</span>
                    </div>
                    <div style="font-size:0.78rem;font-weight:600;color:var(--text-primary);margin:3px 0;">${log.dealer}</div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-size:0.7rem;color:var(--text-secondary);">${log.category}</span>
                      <span style="font-size:0.78rem;font-weight:700;color:#f59e0b;">Conf: ${log.conf}%</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        const maCtx = document.getElementById('modelAccuracyChart');
        if (maCtx) {
          const c = this.getChartColors();
          new Chart(maCtx.getContext('2d'), {
            type: 'line',
            data: {
              labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
              datasets: [
                { label: 'AI Repair and Analysis', data: [91.2, 91.8, 92.4, 93.1, 93.7, 94.2], borderColor: '#3b82f6', fill: false, tension: 0.4, borderWidth: 2, pointRadius: 3 },
                { label: 'Renovation', data: [88.5, 89.4, 90.1, 90.9, 91.4, 91.8], borderColor: '#10b981', fill: false, tension: 0.4, borderWidth: 2, pointRadius: 3 },
                { label: 'Build', data: [84.2, 85.1, 86.3, 87.0, 87.8, 88.5], borderColor: '#f59e0b', fill: false, tension: 0.4, borderWidth: 2, pointRadius: 3 }
              ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { color: c.text, font: { size: 10 }, boxWidth: 12 } } }, scales: { x: { grid: { color: c.grid }, ticks: { color: c.text } }, y: { min: 82, max: 98, grid: { color: c.grid }, ticks: { color: c.text, callback: v => v + '%' } } } }
          });
        }
      } else if (menu === 'company_detail') {
        const co = db.companies.find(c => c.id === this.state.selectedCompanyId);
        if (!co) { canvas.innerHTML = `<div class="card" style="padding:40px;text-align:center;"><p>Company not found. <a href="#" onclick="window.BotNBoltApp.navigate('companies')">Go back</a></p></div>`; return; }
        const compDealers = db.dealers.filter(d => d.company === co.name);
        const activeDealers = compDealers.filter(d => d.status === 'Active');
        const totalScans = compDealers.reduce((s, d) => s + d.monthlyRequests, 0);
        const totalSales = compDealers.reduce((s, d) => s + d.materialSales, 0);
        const avgRating = compDealers.filter(d => d.rating > 0).reduce((s, d, _, a) => s + d.rating / a.length, 0).toFixed(1);
        const planMap = { 'Enterprise Gold': 1499, 'Enterprise Platinum': 1899, 'Premium Standard': 899, 'Basic Trial': 299 };
        const monthlyRevenue = planMap[co.subscriptionPlan] || 499;
        const statusColor = co.status === 'Active' ? '#10b981' : co.status === 'Trial' ? '#f59e0b' : '#f43f5e';

        canvas.innerHTML = `
          <!-- Breadcrumb -->
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;font-size:0.82rem;color:var(--text-secondary);">
            <a href="#" onclick="window.BotNBoltApp.navigate('companies')" style="color:var(--primary);text-decoration:none;font-weight:600;">Companies</a>
            <span>›</span>
            <span style="color:var(--text-primary);font-weight:700;">${co.name}</span>
          </div>

          <!-- Company Header Banner -->
          <div class="card" style="padding:28px;margin-bottom:24px;background:linear-gradient(135deg,var(--bg-card) 0%,rgba(37,99,235,0.06) 100%);border-left:5px solid ${statusColor};">
            <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
              <div style="width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,${statusColor},${statusColor}88);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1.4rem;color:#fff;flex-shrink:0;">${co.logo}</div>
              <div style="flex:1;">
                <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:6px;">
                  <h2 style="font-size:1.5rem;font-weight:800;color:var(--text-primary);margin:0;">${co.name}</h2>
                  <span class="badge ${co.status === 'Active' ? 'badge-success' : co.status === 'Trial' ? 'badge-warning' : 'badge-danger'}">${co.status}</span>
                  <span class="badge badge-info" style="font-size:0.65rem;">${co.subscriptionPlan}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:16px;font-size:0.78rem;color:var(--text-secondary);">
                  <span>🏭 ${co.industryType}</span>
                  <span>📍 ${co.address}, ${co.province}</span>
                  <span>🌐 <a href="${co.website}" style="color:var(--primary);">${co.website}</a></span>
                  <span>📞 ${co.phone}</span>
                  <span>✉️ ${co.email}</span>
                </div>
              </div>
              <div style="text-align:right;font-size:0.78rem;color:var(--text-secondary);">
                <div>Support: <strong style="color:var(--text-primary);">${co.supportManager}</strong></div>
                <div style="margin-top:4px;">Contract: ${co.contractStart} → ${co.expiryDate}</div>
                <div style="margin-top:4px;">Storage: ${co.storageUsage}</div>
                <div style="margin-top:4px;">API Limit: ${co.apiLimit.toLocaleString()} req/mo</div>
              </div>
            </div>
          </div>

          <!-- Company KPI Cards -->
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-bottom:24px;">
            <div class="card" style="padding:18px;border-left:4px solid #3b82f6;">
              <div style="font-size:0.68rem;text-transform:uppercase;color:var(--text-secondary);font-weight:600;margin-bottom:4px;">Total Dealers</div>
              <strong style="font-size:1.6rem;color:var(--text-primary);">${compDealers.length}</strong>
              <div style="font-size:0.7rem;color:var(--success);margin-top:3px;">${activeDealers.length} active</div>
            </div>
            <div class="card" style="padding:18px;border-left:4px solid #f59e0b;">
              <div style="font-size:0.68rem;text-transform:uppercase;color:var(--text-secondary);font-weight:600;margin-bottom:4px;">Monthly Scans</div>
              <strong style="font-size:1.6rem;color:var(--text-primary);">${totalScans.toLocaleString()}</strong>
              <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:3px;">Across all dealers</div>
            </div>
            <div class="card" style="padding:18px;border-left:4px solid #10b981;">
              <div style="font-size:0.68rem;text-transform:uppercase;color:var(--text-secondary);font-weight:600;margin-bottom:4px;">Material Sales</div>
              <strong style="font-size:1.6rem;color:var(--text-primary);">$${totalSales.toLocaleString()}</strong>
              <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:3px;">This month</div>
            </div>
            <div class="card" style="padding:18px;border-left:4px solid #a855f7;">
              <div style="font-size:0.68rem;text-transform:uppercase;color:var(--text-secondary);font-weight:600;margin-bottom:4px;">Avg Rating</div>
              <strong style="font-size:1.6rem;color:var(--text-primary);">${avgRating} ⭐</strong>
              <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:3px;">Dealer satisfaction</div>
            </div>
            <div class="card" style="padding:18px;border-left:4px solid #f43f5e;">
              <div style="font-size:0.68rem;text-transform:uppercase;color:var(--text-secondary);font-weight:600;margin-bottom:4px;">MRR</div>
              <strong style="font-size:1.6rem;color:var(--text-primary);">$${monthlyRevenue.toLocaleString()}</strong>
              <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:3px;">Subscription plan</div>
            </div>
          </div>

          <!-- Dealers Grid -->
          <div class="card" style="padding:24px;">
            <div class="card-header" style="padding:0 0 16px 0;border-bottom:1px solid var(--border-color);margin-bottom:20px;">
              <span class="card-title">All Dealers — ${co.name}</span>
              <span style="font-size:0.8rem;color:var(--text-secondary);">${compDealers.length} dealers · ${activeDealers.length} active</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
              ${compDealers.map(d => {
          const dColor = d.status === 'Active' ? '#10b981' : '#f43f5e';
          const stars = d.rating > 0 ? '★'.repeat(Math.round(d.rating)) + '☆'.repeat(5 - Math.round(d.rating)) : 'N/A';
          return `
                  <div class="card" onclick="window.BotNBoltApp.navigateToDealer('${d.id}')" style="padding:18px;border-top:3px solid ${dColor};cursor:pointer;transition:transform 0.15s,box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 28px rgba(0,0,0,0.13)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
                      <div>
                        <div style="font-weight:800;font-size:0.92rem;color:var(--text-primary);">${d.name}</div>
                        <div style="font-size:0.72rem;color:var(--text-secondary);margin-top:2px;">📍 ${d.city}, ${d.province}</div>
                      </div>
                      <span class="badge ${d.status === 'Active' ? 'badge-success' : 'badge-danger'}" style="font-size:0.65rem;">${d.status}</span>
                    </div>
                    <div style="font-size:0.72rem;color:var(--text-secondary);margin-bottom:10px;">👤 ${d.manager} &nbsp;|&nbsp; 📞 ${d.phone}</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;">
                      <div style="background:var(--bg-primary);padding:8px;border-radius:8px;text-align:center;">
                        <div style="font-weight:700;font-size:0.92rem;color:#f59e0b;">${d.monthlyRequests}</div>
                        <div style="font-size:0.62rem;color:var(--text-secondary);">Scans/mo</div>
                      </div>
                      <div style="background:var(--bg-primary);padding:8px;border-radius:8px;text-align:center;">
                        <div style="font-weight:700;font-size:0.92rem;color:#10b981;">$${d.materialSales.toLocaleString()}</div>
                        <div style="font-size:0.62rem;color:var(--text-secondary);">Sales</div>
                      </div>
                      <div style="background:var(--bg-primary);padding:8px;border-radius:8px;text-align:center;">
                        <div style="font-weight:700;font-size:0.92rem;color:#3b82f6;">${d.conversionRate}%</div>
                        <div style="font-size:0.62rem;color:var(--text-secondary);">Convert</div>
                      </div>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-size:0.7rem;color:#f59e0b;">${d.rating > 0 ? stars + ' ' + d.rating : 'Not rated'}</span>
                      <span style="font-size:0.7rem;font-weight:700;color:${dColor};">View Full Details →</span>
                    </div>
                    <div style="font-size:0.65rem;color:var(--text-secondary);margin-top:6px;">Last active: ${d.lastActive}</div>
                  </div>
                `;
        }).join('')}
            </div>
          </div>
        `;
        lucide.createIcons();

      } else if (menu === 'dealer_detail') {
        const d = db.dealers.find(x => x.id === this.state.selectedDealerId);
        if (!d) { canvas.innerHTML = `<div class="card" style="padding:40px;text-align:center;"><p>Dealer not found.</p></div>`; return; }
        const co = db.companies.find(c => c.name === d.company);
        const dColor = d.status === 'Active' ? '#10b981' : '#f43f5e';
        const stars = d.rating > 0 ? '★'.repeat(Math.round(d.rating)) + '☆'.repeat(5 - Math.round(d.rating)) : '—';
        const aiCostEst = (d.monthlyRequests * 0.19).toFixed(2);
        const revenueEst = (d.materialSales * 0.08).toFixed(0);
        const errorsEst = Math.max(0, Math.round(d.monthlyRequests * 0.02));

        canvas.innerHTML = `
          <!-- Breadcrumb -->
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;font-size:0.82rem;color:var(--text-secondary);">
            <a href="#" onclick="window.BotNBoltApp.navigate('companies')" style="color:var(--primary);text-decoration:none;font-weight:600;">Companies</a>
            <span>›</span>
            <a href="#" onclick="window.BotNBoltApp.navigateToCompany('${co ? co.id : ''}')" style="color:var(--primary);text-decoration:none;font-weight:600;">${d.company}</a>
            <span>›</span>
            <span style="color:var(--text-primary);font-weight:700;">${d.name}</span>
          </div>

          <!-- Dealer Header Banner -->
          <div class="card" style="padding:28px;margin-bottom:24px;background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.06) 100%);border-left:5px solid ${dColor};">
            <div style="display:flex;align-items:flex-start;gap:20px;flex-wrap:wrap;">
              <div style="width:60px;height:60px;border-radius:16px;background:linear-gradient(135deg,${dColor},${dColor}88);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1.2rem;color:#fff;flex-shrink:0;">${d.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
              <div style="flex:1;">
                <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px;">
                  <h2 style="font-size:1.4rem;font-weight:800;color:var(--text-primary);margin:0;">${d.name}</h2>
                  <span class="badge ${d.status === 'Active' ? 'badge-success' : 'badge-danger'}">${d.status}</span>
                  <span style="font-size:0.75rem;color:#f59e0b;font-weight:700;">${d.rating > 0 ? stars + ' ' + d.rating + '/5' : 'Not rated'}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:16px;font-size:0.78rem;color:var(--text-secondary);">
                  <span>🏢 <strong style="color:var(--text-primary);">${d.company}</strong></span>
                  <span>📍 ${d.location}, ${d.city}, ${d.province}</span>
                  <span>👤 ${d.manager}</span>
                  <span>📞 ${d.phone}</span>
                  <span>✉️ <a href="mailto:${d.email}" style="color:var(--primary);">${d.email}</a></span>
                </div>
              </div>
              <div style="text-align:right;font-size:0.78rem;color:var(--text-secondary);">
                <div>Last Active: <strong style="color:var(--text-primary);">${d.lastActive}</strong></div>
                <div style="margin-top:4px;">Plan: <strong>${co ? co.subscriptionPlan : '—'}</strong></div>
              </div>
            </div>
          </div>

          <!-- Dealer KPI Row -->
          <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:16px;margin-bottom:24px;">
            <div class="card" style="padding:16px;border-left:4px solid #f59e0b;text-align:center;">
              <div style="font-size:0.62rem;text-transform:uppercase;color:var(--text-secondary);font-weight:600;margin-bottom:4px;">Monthly Scans</div>
              <strong style="font-size:1.4rem;color:#f59e0b;">${d.monthlyRequests}</strong>
            </div>
            <div class="card" style="padding:16px;border-left:4px solid #10b981;text-align:center;">
              <div style="font-size:0.62rem;text-transform:uppercase;color:var(--text-secondary);font-weight:600;margin-bottom:4px;">Material Sales</div>
              <strong style="font-size:1.4rem;color:#10b981;">$${d.materialSales.toLocaleString()}</strong>
            </div>
            <div class="card" style="padding:16px;border-left:4px solid #3b82f6;text-align:center;">
              <div style="font-size:0.62rem;text-transform:uppercase;color:var(--text-secondary);font-weight:600;margin-bottom:4px;">Conversion Rate</div>
              <strong style="font-size:1.4rem;color:#3b82f6;">${d.conversionRate}%</strong>
            </div>
            <div class="card" style="padding:16px;border-left:4px solid #a855f7;text-align:center;">
              <div style="font-size:0.62rem;text-transform:uppercase;color:var(--text-secondary);font-weight:600;margin-bottom:4px;">Est. AI Cost</div>
              <strong style="font-size:1.4rem;color:#a855f7;">$${aiCostEst}</strong>
            </div>
            <div class="card" style="padding:16px;border-left:4px solid #f43f5e;text-align:center;">
              <div style="font-size:0.62rem;text-transform:uppercase;color:var(--text-secondary);font-weight:600;margin-bottom:4px;">Errors (est.)</div>
              <strong style="font-size:1.4rem;color:#f43f5e;">${errorsEst}</strong>
            </div>
            <div class="card" style="padding:16px;border-left:4px solid #06b6d4;text-align:center;">
              <div style="font-size:0.62rem;text-transform:uppercase;color:var(--text-secondary);font-weight:600;margin-bottom:4px;">Platform Fee</div>
              <strong style="font-size:1.4rem;color:#06b6d4;">$${revenueEst}</strong>
            </div>
          </div>

          <!-- Charts Row: Scan Trend + Category Breakdown -->
          <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;margin-bottom:24px;">
            <div class="card" style="padding:24px;">
              <div class="card-header" style="padding:0 0 16px 0;border-bottom:1px solid var(--border-color);margin-bottom:16px;">
                <span class="card-title">Monthly Scan Volume Trend</span>
              </div>
              <div style="height:200px;"><canvas id="dealerScanChart"></canvas></div>
            </div>
            <div class="card" style="padding:24px;">
              <div class="card-header" style="padding:0 0 16px 0;border-bottom:1px solid var(--border-color);margin-bottom:16px;">
                <span class="card-title">Repair Category Mix</span>
              </div>
              <div style="height:200px;"><canvas id="dealerCategoryChart"></canvas></div>
            </div>
          </div>

          <!-- Performance + Contact + Logs -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
            <!-- Performance Details -->
            <div class="card" style="padding:24px;">
              <div class="card-header" style="padding:0 0 16px 0;border-bottom:1px solid var(--border-color);margin-bottom:16px;">
                <span class="card-title">Performance Details</span>
              </div>
              ${[
            { label: 'Monthly Scan Rank', value: (() => { const sorted = [...db.dealers].sort((a, b) => b.monthlyRequests - a.monthlyRequests); const rank = sorted.findIndex(x => x.id === d.id) + 1; return '#' + rank + ' of ' + sorted.length + ' dealers'; })(), color: '#f59e0b' },
            { label: 'Conversion Rate', value: d.conversionRate + '%', color: '#3b82f6' },
            { label: 'Customer Rating', value: d.rating > 0 ? d.rating + ' / 5.0' : 'Not yet rated', color: '#a855f7' },
            { label: 'Material Sales', value: '$' + d.materialSales.toLocaleString(), color: '#10b981' },
            { label: 'Est. AI Cost / Scan', value: '$0.19', color: '#06b6d4' },
            { label: 'Scan Success Rate', value: d.monthlyRequests > 0 ? (100 - (errorsEst / d.monthlyRequests * 100)).toFixed(1) + '%' : 'N/A', color: '#10b981' },
          ].map(row => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-color);">
                  <span style="font-size:0.8rem;color:var(--text-secondary);">${row.label}</span>
                  <strong style="font-size:0.88rem;color:${row.color};">${row.value}</strong>
                </div>
              `).join('')}
            </div>

            <!-- Recent Activity Log -->
            <div class="card" style="padding:24px;">
              <div class="card-header" style="padding:0 0 16px 0;border-bottom:1px solid var(--border-color);margin-bottom:16px;">
                <span class="card-title">Recent Activity</span>
              </div>
              ${[
            { action: 'AI Scan completed — AI Repair and Analysis', time: 'Today 11:20 AM', type: 'scan', color: '#10b981' },
            { action: 'Customer lead converted to checkout', time: 'Today 10:55 AM', type: 'lead', color: '#3b82f6' },
            { action: 'AI Scan completed — Renovation', time: 'Today 10:30 AM', type: 'scan', color: '#10b981' },
            { action: 'Low-confidence scan flagged (Conf: 57%)', time: 'Today 09:44 AM', type: 'warn', color: '#f59e0b' },
            { action: 'Material quote sent to customer', time: 'Today 09:10 AM', type: 'lead', color: '#3b82f6' },
            { action: 'AI Scan completed — Build', time: 'Yesterday 4:55 PM', type: 'scan', color: '#10b981' },
            { action: 'Error: image resolution too low', time: 'Yesterday 3:22 PM', type: 'error', color: '#f43f5e' },
            { action: 'New customer registered via widget', time: 'Yesterday 2:10 PM', type: 'lead', color: '#3b82f6' }
          ].slice(0, d.monthlyRequests > 0 ? 8 : 2).map(log => `
                <div style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid var(--border-color);">
                  <div style="width:8px;height:8px;border-radius:50%;background:${log.color};margin-top:5px;flex-shrink:0;"></div>
                  <div style="flex:1;">
                    <div style="font-size:0.78rem;color:var(--text-primary);font-weight:500;">${log.action}</div>
                    <div style="font-size:0.68rem;color:var(--text-secondary);margin-top:2px;">${log.time}</div>
                  </div>
                </div>
              `).join('')}
              ${d.monthlyRequests === 0 ? '<div style="padding:20px;text-align:center;color:var(--text-secondary);font-size:0.8rem;">This dealer is disabled — no recent activity.</div>' : ''}
            </div>
          </div>
        `;

        // Draw dealer scan trend chart
        const dsCtx = document.getElementById('dealerScanChart');
        if (dsCtx) {
          const c = this.getChartColors();
          const base = d.monthlyRequests;
          new Chart(dsCtx.getContext('2d'), {
            type: 'line',
            data: {
              labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
              datasets: [{
                label: 'Scans',
                data: [Math.round(base * 0.7), Math.round(base * 0.78), Math.round(base * 0.85), Math.round(base * 0.91), Math.round(base * 0.96), base],
                borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#f59e0b'
              }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: c.grid }, ticks: { color: c.text } }, y: { grid: { color: c.grid }, ticks: { color: c.text } } } }
          });
        }
        // Draw category chart
        const dcCtx = document.getElementById('dealerCategoryChart');
        if (dcCtx) {
          const c = this.getChartColors();
          new Chart(dcCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
              labels: ['AI Repair and Analysis', 'Renovation', 'Build'],
              datasets: [{ data: [48, 32, 20], backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'], borderWidth: 0, hoverOffset: 6 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: c.text, font: { size: 10 }, boxWidth: 10, padding: 8 } } }, cutout: '65%' }
          });
        }
        lucide.createIcons();
      }
    }

    // ----------------------------------------------------
    // COMPANY ADMIN VIEWS
    // ----------------------------------------------------
    renderCompanyAdminView(canvas, menu) {
      const db = this.state.db.companyAdmin;

      if (menu === 'overview') {
        const activeDealers = db.dealers.filter(d => d.status === 'Active').length;
        const totalScans = db.dealers.reduce((s, d) => s + d.monthlyRequests, 0);
        const avgRating = db.dealers.filter(d => d.rating > 0).reduce((s, d, _, a) => s + d.rating / a.length, 0).toFixed(1);
        const topDealer = db.dealers.reduce((best, d) => d.monthlyRequests > (best.monthlyRequests || 0) ? d : best, {});

        canvas.innerHTML = `
          <!-- 5-Column KPI Gradient Cards -->
          <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap: 20px; margin-bottom: 24px;">

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.navigate('dealers')" style="padding:16px; border-left:4px solid var(--primary); display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(37,99,235,0.05) 100%); cursor:pointer; transition:transform 0.15s,box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(37,99,235,0.15)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Total Dealers</div>
                <strong style="font-size:1.4rem; color:var(--text-primary);">${db.kpis.totalDealers.value}</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="users" style="color:var(--primary); width:20px; height:20px; margin-bottom:4px;"></i>
                <span style="color:var(--success); font-size:0.7rem; font-weight:600; background:rgba(16,185,129,0.1); padding:2px 6px; border-radius:4px;">${db.kpis.totalDealers.change}</span>
              </div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.navigate('repair_analytics')" style="padding:16px; border-left:4px solid var(--success); display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.05) 100%); cursor:pointer; transition:transform 0.15s,box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(16,185,129,0.15)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">AI Repair Scans</div>
                <strong style="font-size:1.4rem; color:var(--text-primary);">${db.kpis.totalRepairRequests.value}</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="cpu" style="color:var(--success); width:20px; height:20px; margin-bottom:4px;"></i>
                <span style="color:var(--success); font-size:0.7rem; font-weight:600; background:rgba(16,185,129,0.1); padding:2px 6px; border-radius:4px;">${db.kpis.totalRepairRequests.change}</span>
              </div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.navigate('insights')" style="padding:16px; border-left:4px solid #f59e0b; display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.05) 100%); cursor:pointer; transition:transform 0.15s,box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(245,158,11,0.15)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Revenue Generated</div>
                <strong style="font-size:1.4rem; color:var(--text-primary);">${db.kpis.revenueGenerated.value}</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="banknote" style="color:#f59e0b; width:20px; height:20px; margin-bottom:4px;"></i>
                <span style="color:var(--success); font-size:0.7rem; font-weight:600; background:rgba(16,185,129,0.1); padding:2px 6px; border-radius:4px;">${db.kpis.revenueGenerated.change}</span>
              </div>
            </div>

            <div class="card kpi-card-gradient" style="padding:16px; border-left:4px solid #a855f7; display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(168,85,247,0.05) 100%); cursor:pointer; transition:transform 0.15s,box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(168,85,247,0.15)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Customer Rating</div>
                <strong style="font-size:1.4rem; color:var(--text-primary);">${db.kpis.customerSatisfaction.value}</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="star" style="color:#a855f7; width:20px; height:20px; margin-bottom:4px;"></i>
                <span style="color:var(--success); font-size:0.7rem; font-weight:600; background:rgba(16,185,129,0.1); padding:2px 6px; border-radius:4px;">${db.kpis.customerSatisfaction.change}</span>
              </div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.navigate('dealers')" style="padding:16px; border-left:4px solid #10b981; display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.05) 100%); cursor:pointer; transition:transform 0.15s,box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(16,185,129,0.15)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Active Dealers</div>
                <strong style="font-size:1.4rem; color:var(--text-primary);">${activeDealers} / ${db.kpis.totalDealers.value}</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="store" style="color:#10b981; width:20px; height:20px; margin-bottom:4px;"></i>
                <span style="color:var(--warning); font-size:0.7rem; font-weight:600; background:rgba(245,158,11,0.1); padding:2px 6px; border-radius:4px;">${db.kpis.activeDealers.change}</span>
              </div>
            </div>

          </div>

          <!-- Premium Split Layout -->
          <div class="layout-split" style="grid-template-columns: 2fr 1fr; gap: 24px;">

            <!-- LEFT COLUMN -->
            <div style="display:flex; flex-direction:column; gap:24px;">

              <!-- Dealer Scan Distribution Chart -->
              <div class="card" style="padding:24px;">
                <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:20px;">
                  <span class="card-title" style="font-size:1rem; font-weight:700;">Dealer Monthly Scan Distribution</span>
                  <button class="btn btn-secondary btn-sm" onclick="window.BotNBoltApp.navigate('dealers')">View All Dealers →</button>
                </div>
                <div style="height:260px;"><canvas id="coDealerScanChart"></canvas></div>
              </div>

              <!-- Revenue Trend Chart -->
              <div class="card" style="padding:24px;">
                <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:20px;">
                  <span class="card-title" style="font-size:1rem; font-weight:700;">Revenue Trend (6 Months)</span>
                </div>
                <div style="height:240px;"><canvas id="coRevenueTrendChart"></canvas></div>
              </div>

              <!-- Repair Analytics Chart -->
              <div class="card" style="padding:24px;">
                <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:20px;">
                  <span class="card-title" style="font-size:1rem; font-weight:700;">Repair Category Performance</span>
                  <button class="btn btn-secondary btn-sm" onclick="window.BotNBoltApp.navigate('repair_analytics')">View Details →</button>
                </div>
                <div style="height:220px;"><canvas id="coRepairCatChart"></canvas></div>
              </div>

            </div>

            <!-- RIGHT COLUMN -->
            <div style="display:flex; flex-direction:column; gap:24px;">

              <!-- Circular: Dealer Health -->
              <div class="card" style="text-align:center; padding:20px;">
                <div class="card-header" style="justify-content:center; padding:0 0 12px 0; border-bottom:1px solid var(--border-color); margin-bottom:16px;">
                  <span class="card-title">Fleet Dealer Health</span>
                </div>
                <div style="position:relative; width:130px; height:130px; margin:16px auto;">
                  <svg width="130" height="130" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="45" stroke="var(--bg-app)" stroke-width="8" fill="transparent"/>
                    <circle cx="60" cy="60" r="45" stroke="#10b981" stroke-width="8" fill="transparent"
                            stroke-dasharray="283" stroke-dashoffset="${Math.round(283 * (1 - activeDealers / db.kpis.totalDealers.value))}" stroke-linecap="round"/>
                  </svg>
                  <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center;">
                    <div style="font-size:1.3rem; font-weight:700; color:var(--text-primary);">${Math.round(activeDealers / db.kpis.totalDealers.value * 100)}%</div>
                    <div style="font-size:0.65rem; color:var(--text-secondary);">Active</div>
                  </div>
                </div>
                <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:8px;">${activeDealers} of ${db.kpis.totalDealers.value} dealers running healthy. Top: ${topDealer.name || 'N/A'}</p>
              </div>

              <!-- Circular: Customer Satisfaction -->
              <div class="card" style="text-align:center; padding:20px;">
                <div class="card-header" style="justify-content:center; padding:0 0 12px 0; border-bottom:1px solid var(--border-color); margin-bottom:16px;">
                  <span class="card-title">Customer Satisfaction</span>
                </div>
                <div style="position:relative; width:130px; height:130px; margin:16px auto;">
                  <svg width="130" height="130" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="45" stroke="var(--bg-app)" stroke-width="8" fill="transparent"/>
                    <circle cx="60" cy="60" r="45" stroke="#a855f7" stroke-width="8" fill="transparent"
                            stroke-dasharray="283" stroke-dashoffset="28" stroke-linecap="round"/>
                  </svg>
                  <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center;">
                    <div style="font-size:1.3rem; font-weight:700; color:var(--text-primary);">${avgRating}</div>
                    <div style="font-size:0.65rem; color:var(--text-secondary);">/ 5.0</div>
                  </div>
                </div>
                <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:8px;">${db.kpis.customerSatisfaction.change}</p>
              </div>

              <!-- Province Doughnut -->
              <div class="card" style="padding:20px;">
                <div class="card-header" style="padding:0 0 12px 0; border-bottom:1px solid var(--border-color); margin-bottom:16px;">
                  <span class="card-title">Province Usage</span>
                </div>
                <div style="height:180px;"><canvas id="coProvinceChart"></canvas></div>
              </div>

              <!-- Activity Feed -->
              <div class="card" style="padding:24px;">
                <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:20px;">
                  <span class="card-title" style="font-size:1rem; font-weight:700;">Recent Activity</span>
                </div>
                <div style="position:relative; padding-left:24px; display:flex; flex-direction:column; gap:20px;">
                  <div style="position:absolute; left:7px; top:8px; bottom:8px; width:2px; background:var(--border-color);"></div>
                  <div style="position:relative; display:flex; gap:16px;">
                    <div style="position:absolute; left:-22px; top:4px; width:12px; height:12px; border-radius:50%; background:var(--primary); border:2.5px solid var(--bg-card); box-shadow:0 0 0 3px rgba(37,99,235,0.15);"></div>
                    <div style="flex-grow:1;">
                      <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <strong style="font-size:0.85rem; color:var(--text-primary);">API Key Rotated</strong>
                        <small style="color:var(--text-muted); font-size:0.75rem;">Today, 11:20 AM</small>
                      </div>
                      <p style="font-size:0.8rem; color:var(--text-secondary); margin:0;">Widget API credentials renewed for ${db.companyName} integration.</p>
                    </div>
                  </div>
                  <div style="position:relative; display:flex; gap:16px;">
                    <div style="position:absolute; left:-22px; top:4px; width:12px; height:12px; border-radius:50%; background:var(--success); border:2.5px solid var(--bg-card); box-shadow:0 0 0 3px rgba(16,185,129,0.15);"></div>
                    <div style="flex-grow:1;">
                      <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <strong style="font-size:0.85rem; color:var(--text-primary);">New Dealer Activated</strong>
                        <small style="color:var(--text-muted); font-size:0.75rem;">Today, 9:45 AM</small>
                      </div>
                      <p style="font-size:0.8rem; color:var(--text-secondary); margin:0;">${topDealer.name || 'A new dealer'} registered and activated the BotNBolt scanner widget.</p>
                    </div>
                  </div>
                  <div style="position:relative; display:flex; gap:16px;">
                    <div style="position:absolute; left:-22px; top:4px; width:12px; height:12px; border-radius:50%; background:var(--warning); border:2.5px solid var(--bg-card); box-shadow:0 0 0 3px rgba(245,158,11,0.15);"></div>
                    <div style="flex-grow:1;">
                      <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <strong style="font-size:0.85rem; color:var(--text-primary);">Support Ticket Raised</strong>
                        <small style="color:var(--text-muted); font-size:0.75rem;">Yesterday, 4:30 PM</small>
                      </div>
                      <p style="font-size:0.8rem; color:var(--text-secondary); margin:0;">Dealer billing dispute escalated to support team — priority medium.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        `;

        const colors = this.getChartColors();

        // Dealer Scan Bar Chart
        const ctxDlr = document.getElementById('coDealerScanChart');
        if (ctxDlr) {
          this.state.charts.coDealers = new Chart(ctxDlr.getContext('2d'), {
            type: 'bar',
            data: {
              labels: db.dealers.map(d => d.name.replace(`${db.companyName} `, '')),
              datasets: [{
                label: 'Monthly Scans',
                data: db.dealers.map(d => d.monthlyRequests),
                backgroundColor: colors.primary,
                borderRadius: 4
              }]
            },
            options: {
              responsive: true, maintainAspectRatio: false,
              scales: {
                x: { grid: { color: colors.grid }, ticks: { color: colors.text } },
                y: { grid: { color: colors.grid }, ticks: { color: colors.text } }
              }
            }
          });
        }

        // Revenue Trend Line Chart
        const ctxRev = document.getElementById('coRevenueTrendChart');
        if (ctxRev) {
          this.state.charts.coRevenue = new Chart(ctxRev.getContext('2d'), {
            type: 'line',
            data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [{
                label: 'Revenue ($)',
                data: [98000, 112000, 125000, 131000, 138000, 145200],
                borderColor: colors.success,
                backgroundColor: 'rgba(16,185,129,0.08)',
                fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4
              }]
            },
            options: {
              responsive: true, maintainAspectRatio: false,
              scales: {
                x: { grid: { color: colors.grid }, ticks: { color: colors.text } },
                y: { grid: { color: colors.grid }, ticks: { color: colors.text, callback: v => '$' + (v / 1000) + 'k' } }
              }
            }
          });
        }

        // Repair Category Doughnut
        const ctxRepair = document.getElementById('coRepairCatChart');
        if (ctxRepair) {
          this.state.charts.coRepairCat = new Chart(ctxRepair.getContext('2d'), {
            type: 'doughnut',
            data: {
              labels: db.repairAnalytics.map(r => r.category),
              datasets: [{
                data: db.repairAnalytics.map(r => r.completionRate),
                backgroundColor: [colors.primary, colors.success, colors.warning, colors.danger]
              }]
            },
            options: {
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom', labels: { color: colors.text } } }
            }
          });
        }

        // Province Pie
        const ctxProv = document.getElementById('coProvinceChart');
        if (ctxProv) {
          this.state.charts.prov = new Chart(ctxProv.getContext('2d'), {
            type: 'doughnut',
            data: {
              labels: db.customerInsights.provinceUsage.map(p => p.name),
              datasets: [{
                data: db.customerInsights.provinceUsage.map(p => p.count),
                backgroundColor: [colors.primary, colors.success, colors.warning]
              }]
            },
            options: {
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom', labels: { color: colors.text, font: { size: 10 } } } }
            }
          });
        }

      } else if (menu === 'dealers') {
        const tableKey = 'dealers_co';
        const searchQuery = (this.state.searchQueries[tableKey] || '').toLowerCase();
        const pageSize = this.state.pageSizes[tableKey] || 5;
        const pageIndex = this.state.pageIndices[tableKey] || 0;

        const filters = this.state.dropdownFilters[tableKey] || {};
        const filterCity = filters.city || '';
        const filterProvince = filters.province || '';
        const filterStatus = filters.status || '';

        // Filter rows
        const filtered = this.state.db.companyAdmin.dealers.filter(dl => {
          const matchesSearch = dl.name.toLowerCase().includes(searchQuery) ||
            dl.id.toLowerCase().includes(searchQuery) ||
            dl.location.toLowerCase().includes(searchQuery) ||
            dl.manager.toLowerCase().includes(searchQuery);

          const matchesCity = !filterCity || dl.city === filterCity;
          const matchesProvince = !filterProvince || dl.province === filterProvince;
          const matchesStatus = !filterStatus || dl.status === filterStatus;

          return matchesSearch && matchesCity && matchesProvince && matchesStatus;
        });

        // Paginate rows
        const paginated = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
        const totalPages = Math.ceil(filtered.length / pageSize) || 1;
        const allRowIds = filtered.map(d => d.id);
        const checked = this.state.checkedRows[tableKey] || [];

        const totalDealers = this.state.db.companyAdmin.dealers.length;
        const activeDealers = this.state.db.companyAdmin.dealers.filter(d => d.status === 'Active').length;
        const suspendedDealers = this.state.db.companyAdmin.dealers.filter(d => d.status !== 'Active').length;

        // Helper style for active card selection indication
        const getActiveCardStyle = (currStatus, accentColor) => {
          if (filterStatus === currStatus) {
            return `box-shadow: 0 0 0 2px ${accentColor}; transform: translateY(-2px); font-weight: 700;`;
          }
          return '';
        };

        const dealersStatHeader = `
          <!-- Dealers KPI Cards for Interactive Filtering -->
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px;">
            
            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', '')" 
                 style="padding:16px; border-left:4px solid var(--primary); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(37,99,235,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('', 'var(--primary)')}"
                 onmouseenter="if('${filterStatus}' !== '') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(37,99,235,0.1)'; }" 
                 onmouseleave="if('${filterStatus}' !== '') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Total Outlets</div>
                  <strong style="font-size:1.4rem; color:var(--text-primary);">${totalDealers}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(37,99,235,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="store" style="color:var(--primary); width:16px; height:16px;"></i>
                </div>
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Show all registered dealer outlets</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Active')" 
                 style="padding:16px; border-left:4px solid var(--success); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('Active', 'var(--success)')}"
                 onmouseenter="if('${filterStatus}' !== 'Active') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(16,185,129,0.1)'; }" 
                 onmouseleave="if('${filterStatus}' !== 'Active') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Active Outlets</div>
                  <strong style="font-size:1.4rem; color:var(--success);">${activeDealers}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(16,185,129,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="check-circle" style="color:var(--success); width:16px; height:16px;"></i>
                </div>
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Filter by active dealer locations</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Suspended')" 
                 style="padding:16px; border-left:4px solid var(--danger); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(239,68,68,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('Suspended', 'var(--danger)')}"
                 onmouseenter="if('${filterStatus}' !== 'Suspended') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(239,68,68,0.1)'; }" 
                 onmouseleave="if('${filterStatus}' !== 'Suspended') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Suspended Outlets</div>
                  <strong style="font-size:1.4rem; color:var(--danger);">${suspendedDealers}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(239,68,68,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="alert-triangle" style="color:var(--danger); width:16px; height:16px;"></i>
                </div>
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Filter by suspended locations</div>
            </div>

          </div>
        `;

        canvas.innerHTML = dealersStatHeader + `
          <div class="card">
            <div class="card-header">
              <div style="display:flex; flex-direction:column; gap:4px;">
                <span class="card-title">Manage ${db.companyName} Dealers</span>
                ${filterStatus ? `<span style="font-size: 0.78rem; color: var(--text-secondary);">Active Filter: <strong style="color: var(--primary); text-transform: uppercase;">${filterStatus}</strong></span>` : ''}
              </div>
              <button class="btn btn-primary btn-sm flex-center" onclick="window.BotNBoltApp.openAddDealerModal()">
                <i data-lucide="plus-circle"></i> Add Dealer
              </button>
            </div>
            
            <!-- Table Header Action Controls -->
            <div class="table-header-actions" style="padding: 0 24px; margin-top: 10px;">
              <div class="table-actions-left" style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
                <div class="search-wrapper">
                  <i data-lucide="search"></i>
                  <input type="text" class="form-control search-input" id="search-${tableKey}" placeholder="Search dealers..." value="${this.state.searchQueries[tableKey] || ''}" oninput="window.BotNBoltApp.handleTableSearch('${tableKey}', this.value)">
                </div>

                <!-- City Filter -->
                <select class="form-control dropdown-filter" style="width: 140px; font-size: 0.85rem; padding: 4px 8px; height: 32px;" onchange="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'city', this.value)">
                  <option value="">All Cities</option>
                  <option value="Toronto" ${filterCity === 'Toronto' ? 'selected' : ''}>Toronto</option>
                  <option value="Montreal" ${filterCity === 'Montreal' ? 'selected' : ''}>Montreal</option>
                  <option value="Calgary" ${filterCity === 'Calgary' ? 'selected' : ''}>Calgary</option>
                  <option value="Edmonton" ${filterCity === 'Edmonton' ? 'selected' : ''}>Edmonton</option>
                  <option value="Ottawa" ${filterCity === 'Ottawa' ? 'selected' : ''}>Ottawa</option>
                  <option value="Winnipeg" ${filterCity === 'Winnipeg' ? 'selected' : ''}>Winnipeg</option>
                  <option value="Mississauga" ${filterCity === 'Mississauga' ? 'selected' : ''}>Mississauga</option>
                  <option value="Vancouver" ${filterCity === 'Vancouver' ? 'selected' : ''}>Vancouver</option>
                  <option value="Brampton" ${filterCity === 'Brampton' ? 'selected' : ''}>Brampton</option>
                </select>

                <!-- Province Filter -->
                <select class="form-control dropdown-filter" style="width: 140px; font-size: 0.85rem; padding: 4px 8px; height: 32px;" onchange="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'province', this.value)">
                  <option value="">All Provinces</option>
                  <option value="Ontario" ${filterProvince === 'Ontario' ? 'selected' : ''}>Ontario</option>
                  <option value="Quebec" ${filterProvince === 'Quebec' ? 'selected' : ''}>Quebec</option>
                  <option value="British Columbia" ${filterProvince === 'British Columbia' ? 'selected' : ''}>British Columbia</option>
                  <option value="Alberta" ${filterProvince === 'Alberta' ? 'selected' : ''}>Alberta</option>
                  <option value="Manitoba" ${filterProvince === 'Manitoba' ? 'selected' : ''}>Manitoba</option>
                </select>

                <!-- Status Filter -->
                <select class="form-control dropdown-filter" style="width: 125px; font-size: 0.85rem; padding: 4px 8px; height: 32px;" onchange="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', this.value)">
                  <option value="">All Statuses</option>
                  <option value="Active" ${filterStatus === 'Active' ? 'selected' : ''}>Active</option>
                  <option value="Disabled" ${filterStatus === 'Disabled' ? 'selected' : ''}>Disabled</option>
                </select>
                
                <select class="bulk-actions-select" id="bulk-${tableKey}" style="${checked.length > 0 ? 'display:block;' : 'display:none;'}" onchange="window.BotNBoltApp.triggerBulkAction('${tableKey}', this.value)">
                  <option value="">Bulk Actions (${checked.length} Selected)</option>
                  <option value="disable">Disable Selected</option>
                  <option value="export">Export Selected</option>
                  <option value="delete">Delete Selected</option>
                </select>
              </div>
              
              <div class="table-actions-right">
                <button class="btn btn-secondary btn-sm flex-center" onclick="window.BotNBoltApp.exportDealersCoCsv('${tableKey}')" title="Export Current List to CSV">
                  <i data-lucide="download"></i> Export CSV
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 40px; padding-left: 24px;">
                      <input type="checkbox" id="chk-all-${tableKey}" style="width:16px; height:16px; cursor:pointer;" ${checked.length === allRowIds.length && allRowIds.length > 0 ? 'checked' : ''} onchange="window.BotNBoltApp.handleSelectAllChange('${tableKey}', this.checked, ${JSON.stringify(allRowIds).replace(/"/g, '&quot;')})">
                    </th>
                    <th>Dealer Name</th>
                    <th>City</th>
                    <th>Province</th>
                    <th>Location / Address</th>
                    <th>Manager Name</th>
                    <th>Scans Running</th>
                    <th>Conversion %</th>
                    <th>Material Sales</th>
                    <th>Store Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${paginated.length === 0 ? `
                    <tr>
                      <td colspan="12" style="text-align:center; padding: 32px; color: var(--text-secondary);">No records match your search filter.</td>
                    </tr>
                  ` : paginated.map(dl => `
                    <tr>
                      <td style="padding-left: 24px;">
                        <input type="checkbox" id="chk-${tableKey}-${dl.id}" style="width:16px; height:16px; cursor:pointer;" ${checked.includes(dl.id) ? 'checked' : ''} onchange="window.BotNBoltApp.handleCheckboxChange('${tableKey}', '${dl.id}', this.checked)">
                      </td>
                      <td>
                        <strong>${dl.name}</strong><br>
                        <small style="color:var(--text-secondary);">${dl.email}</small>
                      </td>
                      <td>${dl.city}</td>
                      <td>${dl.province}</td>
                      <td>${dl.location}</td>
                      <td>${dl.manager}</td>
                      <td><strong>${dl.monthlyRequests}</strong> monthly</td>
                      <td>${dl.conversionRate}%</td>
                      <td>$${dl.materialSales}</td>
                      <td><span class="badge ${dl.status === 'Active' ? 'badge-success' : 'badge-danger'}">${dl.status}</span></td>
                      <td>
                        <div class="table-actions">
                          <button class="action-icon-btn" onclick="window.BotNBoltApp.toggleDealerStatus('${dl.id}')" title="${dl.status === 'Active' ? 'Disable' : 'Enable'} Dealer"><i data-lucide="${dl.status === 'Active' ? 'slash' : 'play'}"></i></button>
                          <button class="action-icon-btn" onclick="window.BotNBoltApp.assignStoreManager('${dl.id}')" title="Assign Store Manager"><i data-lucide="user-cog"></i></button>
                          <button class="action-icon-btn" onclick="alert('Generating and downloading performance report PDF for ${dl.name}...')" title="View Reports"><i data-lucide="file-text"></i></button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Table Pagination Footer -->
            <div class="table-footer-pagination">
              <div>
                Showing <strong>${filtered.length === 0 ? 0 : pageIndex * pageSize + 1}</strong> to 
                <strong>${Math.min((pageIndex + 1) * pageSize, filtered.length)}</strong> of 
                <strong>${filtered.length}</strong> dealers
              </div>
              <div class="pagination-controls">
                <span style="margin-right:8px;">Rows per page:</span>
                <select class="rows-selector" style="margin-right:16px;" onchange="window.BotNBoltApp.handleTablePageSizeChange('${tableKey}', this.value)">
                  <option value="5" ${pageSize === 5 ? 'selected' : ''}>5</option>
                  <option value="10" ${pageSize === 10 ? 'selected' : ''}>10</option>
                  <option value="25" ${pageSize === 25 ? 'selected' : ''}>25</option>
                </select>
                <button class="pagination-btn" ${pageIndex === 0 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex - 1})" title="Previous Page"><i data-lucide="chevron-left" style="width:14px; height:14px;"></i></button>
                <span style="font-weight:600; margin:0 8px;">Page ${pageIndex + 1} of ${totalPages}</span>
                <button class="pagination-btn" ${pageIndex >= totalPages - 1 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex + 1})" title="Next Page"><i data-lucide="chevron-right" style="width:14px; height:14px;"></i></button>
              </div>
            </div>

          </div>
        `;
        lucide.createIcons();
      } else if (menu === 'repair_analytics') {
        const tableKey = 'repair_co';
        const searchQuery = (this.state.searchQueries[tableKey] || '').toLowerCase();
        const pageSize = this.state.pageSizes[tableKey] || 5;
        const pageIndex = this.state.pageIndices[tableKey] || 0;

        // Filter rows
        const filtered = db.repairAnalytics.filter(rep =>
          rep.category.toLowerCase().includes(searchQuery) ||
          rep.damageType.toLowerCase().includes(searchQuery) ||
          rep.materialsUsed.toLowerCase().includes(searchQuery)
        );

        // Analytics summary
        const avgCost = filtered.length ? Math.round(filtered.reduce((s, r) => s + r.estimatedCost, 0) / filtered.length) : 0;
        const avgSatisfaction = filtered.length ? (filtered.reduce((s, r) => s + r.satisfaction, 0) / filtered.length).toFixed(1) : 0;
        const avgCompletion = filtered.length ? Math.round(filtered.reduce((s, r) => s + r.completionRate, 0) / filtered.length) : 0;
        const topRepair = filtered.length ? filtered.reduce((a, b) => a.completionRate > b.completionRate ? a : b).category : 'N/A';

        // Prepend summary header HTML before the main table
        const analyticsHeader = `
          <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-bottom:24px;">
            <div class="card" style="padding:20px; border-left:4px solid var(--primary); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(37,99,235,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Top Repair Type</div>
              <strong style="font-size:1rem; color:var(--text-primary);">${topRepair}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Highest completion rate</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #f59e0b; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Avg Repair Cost</div>
              <strong style="font-size:1.8rem; color:var(--text-primary);">$${avgCost}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Per repair estimate</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #a855f7; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(168,85,247,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Avg Satisfaction</div>
              <strong style="font-size:1.8rem; color:var(--text-primary);">${avgSatisfaction} / 5.0</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Customer feedback score</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid var(--success); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Avg Completion Rate</div>
              <strong style="font-size:1.8rem; color:var(--success);">${avgCompletion}%</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Across all repair types</div>
            </div>
          </div>
        `;


        // Paginate rows
        const paginated = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
        const totalPages = Math.ceil(filtered.length / pageSize) || 1;
        const allRowIds = filtered.map((r, i) => 'rep-' + i); // generate unique ID for checkboxes
        const checked = this.state.checkedRows[tableKey] || [];

        canvas.innerHTML = analyticsHeader + `
          <div class="card" style="margin-bottom: 24px;">
            <div class="card-header"><span class="card-title">Damage Repair Metrics</span></div>
            
            <!-- Table Header Action Controls -->
            <div class="table-header-actions" style="padding: 0 24px; margin-top: 10px;">
              <div class="table-actions-left">
                <div class="search-wrapper">
                  <i data-lucide="search"></i>
                  <input type="text" class="form-control search-input" id="search-${tableKey}" placeholder="Search metrics..." value="${this.state.searchQueries[tableKey] || ''}" oninput="window.BotNBoltApp.handleTableSearch('${tableKey}', this.value)">
                </div>
              </div>
              
              <div class="table-actions-right">
                <button class="btn btn-secondary btn-sm flex-center" onclick="window.BotNBoltApp.exportToCsv('Company_Repair_Analytics.csv', ['Category', 'Damage Type', 'Cost', 'Materials', 'Completion %', 'Satisfaction'], ${JSON.stringify(filtered.map(r => [r.category, r.damageType, r.estimatedCost, r.materialsUsed, r.completionRate, r.satisfaction])).replace(/"/g, '&quot;')})" title="Export Current List to CSV">
                  <i data-lucide="download"></i> Export CSV
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Repair Category</th>
                    <th>Damage Type Detected</th>
                    <th>Avg Estimated Cost</th>
                    <th>Suggested Materials</th>
                    <th>Completion Rate</th>
                    <th>User Satisfaction</th>
                    <th>Avg Completion Time</th>
                  </tr>
                </thead>
                <tbody>
                  ${paginated.length === 0 ? `
                    <tr>
                      <td colspan="10" style="text-align:center; padding: 32px; color: var(--text-secondary);">No records match your search filter.</td>
                    </tr>
                  ` : paginated.map(rep => `
                    <tr>
                      <td><strong>${rep.category}</strong></td>
                      <td>${rep.damageType}</td>
                      <td>$${rep.estimatedCost}</td>
                      <td><code>${rep.materialsUsed}</code></td>
                      <td>
                        <div style="display:flex; align-items:center; gap: 8px;">
                          <div style="flex-grow:1; height:6px; background-color:var(--border-color); border-radius:3px;">
                            <div style="width:${rep.completionRate}%; height:100%; background-color:var(--success); border-radius:3px;"></div>
                          </div>
                          <strong>${rep.completionRate}%</strong>
                        </div>
                      </td>
                      <td><strong>${rep.satisfaction}</strong> / 5.0</td>
                      <td>${rep.avgTime}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Table Pagination Footer -->
            <div class="table-footer-pagination">
              <div>
                Showing <strong>${filtered.length === 0 ? 0 : pageIndex * pageSize + 1}</strong> to 
                <strong>${Math.min((pageIndex + 1) * pageSize, filtered.length)}</strong> of 
                <strong>${filtered.length}</strong> metrics
              </div>
              <div class="pagination-controls">
                <span style="margin-right:8px;">Rows per page:</span>
                <select class="rows-selector" style="margin-right:16px;" onchange="window.BotNBoltApp.handleTablePageSizeChange('${tableKey}', this.value)">
                  <option value="5" ${pageSize === 5 ? 'selected' : ''}>5</option>
                  <option value="10" ${pageSize === 10 ? 'selected' : ''}>10</option>
                  <option value="25" ${pageSize === 25 ? 'selected' : ''}>25</option>
                </select>
                <button class="pagination-btn" ${pageIndex === 0 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex - 1})" title="Previous Page"><i data-lucide="chevron-left" style="width:14px; height:14px;"></i></button>
                <span style="font-weight:600; margin:0 8px;">Page ${pageIndex + 1} of ${totalPages}</span>
                <button class="pagination-btn" ${pageIndex >= totalPages - 1 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex + 1})" title="Next Page"><i data-lucide="chevron-right" style="width:14px; height:14px;"></i></button>
              </div>
            </div>

          </div>
        `;
        lucide.createIcons();
      } else if (menu === 'insights') {
        const totalProblems = db.customerInsights.mostCommonProblems.reduce((s, p) => s + p.count, 0);
        const topMaterial = db.customerInsights.mostPurchasedMaterials[0];
        const totalMatRevenue = db.customerInsights.mostPurchasedMaterials.reduce((s, m) => s + m.revenue, 0);

        canvas.innerHTML = `
          <!-- Summary Stats Row -->
          <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-bottom:24px;">
            <div class="card" style="padding:20px; border-left:4px solid var(--primary); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(37,99,235,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Total Reported Problems</div>
              <strong style="font-size:1.8rem; color:var(--text-primary);">${totalProblems}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Across all dealers</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #f59e0b; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Top Material Sold</div>
              <strong style="font-size:0.95rem; color:var(--text-primary);">${topMaterial ? topMaterial.name : 'N/A'}</strong>
              <div style="font-size:0.75rem; color:var(--success); margin-top:4px;">${topMaterial ? topMaterial.count + ' units sold' : ''}</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #10b981; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Total Material Revenue</div>
              <strong style="font-size:1.8rem; color:var(--success);">$${totalMatRevenue.toLocaleString()}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">From product recommendations</div>
            </div>
            <div class="card" style="padding:20px; border-left:4px solid #a855f7; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(168,85,247,0.07) 100%);">
              <div style="font-size:0.72rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:6px;">Repeat Customers</div>
              <strong style="font-size:1rem; color:var(--text-primary);">${db.customerInsights.repeatPercentage.split('%')[0]}%</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Return for secondary estimate</div>
            </div>
          </div>

          <!-- Main Split Layout -->
          <div class="layout-split" style="grid-template-columns:1.4fr 1fr; gap:24px; margin-bottom:24px;">

            <!-- Common Problems with Visual Bars -->
            <div class="card" style="padding:24px;">
              <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:20px;">
                <span class="card-title" style="font-size:1rem; font-weight:700;">Most Common Problems Tracked</span>
              </div>
              ${db.customerInsights.mostCommonProblems.map(prob => {
          const pct = Math.round(prob.count / totalProblems * 100);
          return `
                  <div style="margin-bottom:16px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                      <span style="font-size:0.82rem; font-weight:600; color:var(--text-primary);">${prob.name}</span>
                      <span style="font-size:0.82rem; font-weight:700; color:var(--primary);">${prob.count} reports (${pct}%)</span>
                    </div>
                    <div style="height:9px; background:var(--border-color); border-radius:5px; overflow:hidden;">
                      <div style="height:100%; width:${pct}%; background:linear-gradient(90deg,var(--primary),#60a5fa); border-radius:5px;"></div>
                    </div>
                  </div>
                `;
        }).join('')}
            </div>

            <!-- Most Purchased Materials -->
            <div class="card" style="padding:24px;">
              <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:20px;">
                <span class="card-title" style="font-size:1rem; font-weight:700;">Top Purchased Materials</span>
              </div>
              ${db.customerInsights.mostPurchasedMaterials.map((mat, i) => {
          const colors_arr = ['#2563eb', '#10b981', '#f59e0b'];
          return `
                  <div style="display:flex; gap:14px; padding:14px; background:var(--bg-primary); border-radius:10px; margin-bottom:10px; border-left:3px solid ${colors_arr[i]};">
                    <div style="width:36px; height:36px; border-radius:10px; background:${colors_arr[i]}22; display:flex; align-items:center; justify-content:center; font-weight:800; color:${colors_arr[i]}; font-size:0.9rem; flex-shrink:0;">#${i + 1}</div>
                    <div style="flex:1;">
                      <div style="font-size:0.85rem; font-weight:700; color:var(--text-primary); margin-bottom:3px;">${mat.name}</div>
                      <div style="display:flex; justify-content:space-between; font-size:0.75rem;">
                        <span style="color:var(--text-secondary);">${mat.count} units sold</span>
                        <span style="font-weight:700; color:var(--success);">$${mat.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                `;
        }).join('')}
            </div>
          </div>

          <!-- FAQs Knowledge Base -->
          <div class="card" style="padding:24px;">
            <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:20px;">
              <span class="card-title" style="font-size:1rem; font-weight:700;">Knowledge Base FAQs</span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
              ${db.customerInsights.faqs.map(faq => `
                <div style="padding:16px; background:var(--bg-primary); border-radius:10px; border-left:3px solid var(--primary);">
                  <div style="display:flex; align-items:flex-start; gap:10px; margin-bottom:8px;">
                    <i data-lucide="help-circle" style="width:16px; height:16px; color:var(--primary); flex-shrink:0; margin-top:2px;"></i>
                    <strong style="font-size:0.85rem; color:var(--text-primary); line-height:1.4;">${faq.q}</strong>
                  </div>
                  <p style="font-size:0.8rem; color:var(--text-secondary); margin:0; padding-left:26px;">${faq.a}</p>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        lucide.createIcons();

      } else if (menu === 'materials') {
        const tableKey = 'materials_co';
        const searchQuery = (this.state.searchQueries[tableKey] || '').toLowerCase();
        const pageSize = this.state.pageSizes[tableKey] || 5;
        const pageIndex = this.state.pageIndices[tableKey] || 0;

        const filters = this.state.dropdownFilters[tableKey] || {};
        const statusFilter = filters.status || '';

        // Calculate database-wide counts for KPI cards
        const totalCount = db.materials.length;
        const inStockCount = db.materials.filter(m => m.inventory === 'In Stock').length;
        const lowStockCount = db.materials.filter(m => m.inventory === 'Low Stock').length;
        const outOfStockCount = db.materials.filter(m => m.inventory === 'Out of Stock').length;

        // Filter rows based on search query and status card selection
        const filtered = db.materials.filter(mat => {
          const matchesSearch = mat.name.toLowerCase().includes(searchQuery) ||
            mat.sku.toLowerCase().includes(searchQuery) ||
            mat.inventory.toLowerCase().includes(searchQuery);
          const matchesStatus = !statusFilter || mat.inventory === statusFilter;
          return matchesSearch && matchesStatus;
        });

        // Paginate rows
        const paginated = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
        const totalPages = Math.ceil(filtered.length / pageSize) || 1;
        const allRowIds = filtered.map(m => m.sku);
        const checked = this.state.checkedRows[tableKey] || [];

        // Helper style for active card selection indication
        const getActiveCardStyle = (currStatus, accentColor) => {
          if (statusFilter === currStatus) {
            return `box-shadow: 0 0 0 2px ${accentColor}; transform: translateY(-2px); font-weight: 700;`;
          }
          return '';
        };

        canvas.innerHTML = `
          <!-- Inventory KPI Cards for Interactive Filtering -->
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;">
            
            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', '')" 
                 style="padding:20px; border-left:4px solid var(--primary); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(37,99,235,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('', 'var(--primary)')}"
                 onmouseenter="if('${statusFilter}' !== '') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(37,99,235,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== '') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Total Materials</div>
                  <strong style="font-size:1.8rem; color:var(--text-primary);">${totalCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(37,99,235,0.1); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="package" style="color:var(--primary); width:20px; height:20px;"></i>
                </div>
              </div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:8px;">Show all recommended products</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'In Stock')" 
                 style="padding:20px; border-left:4px solid var(--success); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('In Stock', 'var(--success)')}"
                 onmouseenter="if('${statusFilter}' !== 'In Stock') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(16,185,129,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== 'In Stock') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">In Stock</div>
                  <strong style="font-size:1.8rem; color:var(--success);">${inStockCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(16,185,129,0.1); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="check-circle" style="color:var(--success); width:20px; height:20px;"></i>
                </div>
              </div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:8px;">Filter by In Stock availability</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Low Stock')" 
                 style="padding:20px; border-left:4px solid var(--warning); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('Low Stock', 'var(--warning)')}"
                 onmouseenter="if('${statusFilter}' !== 'Low Stock') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(245,158,11,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== 'Low Stock') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Low Stock</div>
                  <strong style="font-size:1.8rem; color:var(--warning);">${lowStockCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(245,158,11,0.1); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="alert-triangle" style="color:var(--warning); width:20px; height:20px;"></i>
                </div>
              </div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:8px;">Filter by Low Stock warning</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Out of Stock')" 
                 style="padding:20px; border-left:4px solid var(--danger); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(239,68,68,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('Out of Stock', 'var(--danger)')}"
                 onmouseenter="if('${statusFilter}' !== 'Out of Stock') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(239,68,68,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== 'Out of Stock') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Out of Stock</div>
                  <strong style="font-size:1.8rem; color:var(--danger);">${outOfStockCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(239,68,68,0.1); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="x-circle" style="color:var(--danger); width:20px; height:20px;"></i>
                </div>
              </div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:8px;">Filter by Out of Stock critical</div>
            </div>

          </div>

          <div class="card">
            <div class="card-header">
              <div style="display:flex; flex-direction:column; gap:4px;">
                <span class="card-title">Recommended Product & Material Catalog</span>
                ${statusFilter ? `<span style="font-size: 0.78rem; color: var(--text-secondary);">Active Filter: <strong style="color: var(--primary); text-transform: uppercase;">${statusFilter}</strong></span>` : ''}
              </div>
            </div>
            
            <!-- Table Action Controls -->
            <div class="table-header-actions" style="padding: 0 24px; margin-top: 10px;">
              <div class="table-actions-left">
                <div class="search-wrapper">
                  <i data-lucide="search"></i>
                  <input type="text" class="form-control search-input" id="search-${tableKey}" placeholder="Search products..." value="${this.state.searchQueries[tableKey] || ''}" oninput="window.BotNBoltApp.handleTableSearch('${tableKey}', this.value)">
                </div>
                
                <select class="bulk-actions-select" id="bulk-${tableKey}" style="${checked.length > 0 ? 'display:block;' : 'display:none;'}" onchange="window.BotNBoltApp.triggerBulkAction('${tableKey}', this.value)">
                  <option value="">Bulk Actions (${checked.length} Selected)</option>
                  <option value="export">Export Selected</option>
                </select>
              </div>
              
              <div class="table-actions-right">
                <button class="btn btn-secondary btn-sm flex-center" onclick="window.BotNBoltApp.exportToCsv('Company_Materials.csv', ['Name', 'SKU', 'Inventory Status', 'Suggestions', 'Dealers Available', 'Conversion %'], ${JSON.stringify(filtered.map(m => [m.name, m.sku, m.inventory, m.suggestions, m.dealersAvailable, m.conversionRate])).replace(/"/g, '&quot;')})" title="Export Current List to CSV">
                  <i data-lucide="download"></i> Export CSV
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 40px; padding-left: 24px;">
                      <input type="checkbox" id="chk-all-${tableKey}" style="width:16px; height:16px; cursor:pointer;" ${checked.length === allRowIds.length && allRowIds.length > 0 ? 'checked' : ''} onchange="window.BotNBoltApp.handleSelectAllChange('${tableKey}', this.checked, ${JSON.stringify(allRowIds).replace(/"/g, '&quot;')})">
                    </th>
                    <th>Material Name</th>
                    <th>SKU Number</th>
                    <th>Inventory Status</th>
                    <th>Frequently Suggested</th>
                    <th>Dealer Availability</th>
                    <th>Conversion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  ${paginated.length === 0 ? `
                    <tr>
                      <td colspan="10" style="text-align:center; padding: 32px; color: var(--text-secondary);">No records match your search filter.</td>
                    </tr>
                  ` : paginated.map(mat => `
                    <tr>
                      <td style="padding-left: 24px;">
                        <input type="checkbox" id="chk-${tableKey}-${mat.sku}" style="width:16px; height:16px; cursor:pointer;" ${checked.includes(mat.sku) ? 'checked' : ''} onchange="window.BotNBoltApp.handleCheckboxChange('${tableKey}', '${mat.sku}', this.checked)">
                      </td>
                      <td><strong>${mat.name}</strong></td>
                      <td><code>${mat.sku}</code></td>
                      <td><span class="badge ${mat.inventory === 'In Stock' ? 'badge-success' : mat.inventory === 'Low Stock' ? 'badge-warning' : 'badge-danger'}">${mat.inventory}</span></td>
                      <td>${mat.suggestions} times recommended</td>
                      <td>Available at ${mat.dealersAvailable} dealers</td>
                      <td><strong>${mat.conversionRate}%</strong> success</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Table Pagination Footer -->
            <div class="table-footer-pagination">
              <div>
                Showing <strong>${filtered.length === 0 ? 0 : pageIndex * pageSize + 1}</strong> to 
                <strong>${Math.min((pageIndex + 1) * pageSize, filtered.length)}</strong> of 
                <strong>${filtered.length}</strong> items
              </div>
              <div class="pagination-controls">
                <span style="margin-right:8px;">Rows per page:</span>
                <select class="rows-selector" style="margin-right:16px;" onchange="window.BotNBoltApp.handleTablePageSizeChange('${tableKey}', this.value)">
                  <option value="5" ${pageSize === 5 ? 'selected' : ''}>5</option>
                  <option value="10" ${pageSize === 10 ? 'selected' : ''}>10</option>
                  <option value="25" ${pageSize === 25 ? 'selected' : ''}>25</option>
                </select>
                <button class="pagination-btn" ${pageIndex === 0 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex - 1})" title="Previous Page"><i data-lucide="chevron-left" style="width:14px; height:14px;"></i></button>
                <span style="font-weight:600; margin:0 8px;">Page ${pageIndex + 1} of ${totalPages}</span>
                <button class="pagination-btn" ${pageIndex >= totalPages - 1 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex + 1})" title="Next Page"><i data-lucide="chevron-right" style="width:14px; height:14px;"></i></button>
              </div>
            </div>

          </div>
        `;
        lucide.createIcons();
      } else if (menu === 'tickets') {
        const tableKey = 'tickets_co';
        const searchQuery = (this.state.searchQueries[tableKey] || '').toLowerCase();
        const pageSize = this.state.pageSizes[tableKey] || 5;
        const pageIndex = this.state.pageIndices[tableKey] || 0;

        const filters = this.state.dropdownFilters[tableKey] || {};
        const statusFilter = filters.status || '';

        // Calculate counts for KPI cards
        const totalCount = db.supportTickets.length;
        const openCount = db.supportTickets.filter(t => t.status === 'Open').length;
        const inProgressCount = db.supportTickets.filter(t => t.status !== 'Open' && t.status !== 'Resolved').length;
        const resolvedCount = db.supportTickets.filter(t => t.status === 'Resolved').length;

        // Filter rows based on search query and status card selection
        const filtered = db.supportTickets.filter(tkt => {
          const matchesSearch = tkt.id.toLowerCase().includes(searchQuery) ||
            tkt.dealer.toLowerCase().includes(searchQuery) ||
            tkt.problem.toLowerCase().includes(searchQuery) ||
            tkt.assigned.toLowerCase().includes(searchQuery);
          const matchesStatus = !statusFilter || tkt.status === statusFilter;
          return matchesSearch && matchesStatus;
        });

        // Paginate rows
        const paginated = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
        const totalPages = Math.ceil(filtered.length / pageSize) || 1;
        const allRowIds = filtered.map(t => t.id);
        const checked = this.state.checkedRows[tableKey] || [];

        // Helper style for active card selection indication
        const getActiveCardStyle = (currStatus, accentColor) => {
          if (statusFilter === currStatus) {
            return `box-shadow: 0 0 0 2px ${accentColor}; transform: translateY(-2px); font-weight: 700;`;
          }
          return '';
        };

        canvas.innerHTML = `
          <!-- Support Ticket KPI Cards for Interactive Filtering -->
          <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-bottom:24px;">
            
            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', '')" 
                 style="padding:20px; border-left:4px solid var(--primary); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(37,99,235,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('', 'var(--primary)')}"
                 onmouseenter="if('${statusFilter}' !== '') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(37,99,235,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== '') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Total Tickets</div>
                  <strong style="font-size:1.8rem; color:var(--text-primary);">${totalCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(37,99,235,0.1); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="ticket" style="color:var(--primary); width:20px; height:20px;"></i>
                </div>
              </div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:8px;">Show all tickets</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Open')" 
                 style="padding:20px; border-left:4px solid var(--danger); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(239,68,68,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('Open', 'var(--danger)')}"
                 onmouseenter="if('${statusFilter}' !== 'Open') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(239,68,68,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== 'Open') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Open</div>
                  <strong style="font-size:1.8rem; color:var(--danger);">${openCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(239,68,68,0.1); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="inbox" style="color:var(--danger); width:20px; height:20px;"></i>
                </div>
              </div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:8px;">Filter by Open tickets</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'In Progress')" 
                 style="padding:20px; border-left:4px solid var(--warning); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('In Progress', 'var(--warning)')}"
                 onmouseenter="if('${statusFilter}' !== 'In Progress') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(245,158,11,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== 'In Progress') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">In Progress</div>
                  <strong style="font-size:1.8rem; color:var(--warning);">${inProgressCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(245,158,11,0.1); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="loader" style="color:var(--warning); width:20px; height:20px;"></i>
                </div>
              </div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:8px;">Filter by In Progress</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Resolved')" 
                 style="padding:20px; border-left:4px solid var(--success); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('Resolved', 'var(--success)')}"
                 onmouseenter="if('${statusFilter}' !== 'Resolved') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(16,185,129,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== 'Resolved') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Resolved</div>
                  <strong style="font-size:1.8rem; color:var(--success);">${resolvedCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(16,185,129,0.1); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="check-circle" style="color:var(--success); width:20px; height:20px;"></i>
                </div>
              </div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:8px;">Filter by Resolved tickets</div>
            </div>

          </div>

          <div class="card">
            <div class="card-header">
              <div style="display:flex; flex-direction:column; gap:4px;">
                <span class="card-title">Local Support Ticket Center</span>
                ${statusFilter ? `<span style="font-size: 0.78rem; color: var(--text-secondary);">Active Filter: <strong style="color: var(--primary); text-transform: uppercase;">${statusFilter}</strong></span>` : ''}
              </div>
            </div>
            
            <!-- Table Header Action Controls -->
            <div class="table-header-actions" style="padding: 0 24px; margin-top: 10px;">
              <div class="table-actions-left">
                <div class="search-wrapper">
                  <i data-lucide="search"></i>
                  <input type="text" class="form-control search-input" id="search-${tableKey}" placeholder="Search tickets..." value="${this.state.searchQueries[tableKey] || ''}" oninput="window.BotNBoltApp.handleTableSearch('${tableKey}', this.value)">
                </div>
                
                <select class="bulk-actions-select" id="bulk-${tableKey}" style="${checked.length > 0 ? 'display:block;' : 'display:none;'}" onchange="window.BotNBoltApp.triggerBulkAction('${tableKey}', this.value)">
                  <option value="">Bulk Actions (${checked.length} Selected)</option>
                  <option value="export">Export Selected</option>
                </select>
              </div>
              
              <div class="table-actions-right">
                <button class="btn btn-secondary btn-sm flex-center" onclick="window.BotNBoltApp.exportToCsv('Company_Support_Tickets.csv', ['Ticket ID', 'Dealer', 'Problem', 'Priority', 'Assigned Manager', 'Status'], ${JSON.stringify(filtered.map(t => [t.id, t.dealer, t.problem, t.priority, t.assigned, t.status])).replace(/"/g, '&quot;')})" title="Export Current List to CSV">
                  <i data-lucide="download"></i> Export CSV
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 40px; padding-left: 24px;">
                      <input type="checkbox" id="chk-all-${tableKey}" style="width:16px; height:16px; cursor:pointer;" ${checked.length === allRowIds.length && allRowIds.length > 0 ? 'checked' : ''} onchange="window.BotNBoltApp.handleSelectAllChange('${tableKey}', this.checked, ${JSON.stringify(allRowIds).replace(/"/g, '&quot;')})">
                    </th>
                    <th>Ticket ID</th>
                    <th>Dealer Submitter</th>
                    <th>Problem Type</th>
                    <th>Priority</th>
                    <th>Assigned Manager</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${paginated.length === 0 ? `
                    <tr>
                      <td colspan="10" style="text-align:center; padding: 32px; color: var(--text-secondary);">No records match your search filter.</td>
                    </tr>
                  ` : paginated.map(tkt => `
                    <tr style="cursor:pointer;" onclick="window.BotNBoltApp.navigateToTicket('${tkt.id}')" onmouseenter="this.style.backgroundColor='var(--bg-primary)'" onmouseleave="this.style.backgroundColor=''">
                      <td style="padding-left: 24px;" onclick="event.stopPropagation();">
                        <input type="checkbox" id="chk-${tableKey}-${tkt.id}" style="width:16px; height:16px; cursor:pointer;" ${checked.includes(tkt.id) ? 'checked' : ''} onchange="window.BotNBoltApp.handleCheckboxChange('${tableKey}', '${tkt.id}', this.checked)">
                      </td>
                      <td onclick="event.stopPropagation();"><a href="#" style="font-weight:700; color:var(--primary); text-decoration:none;" onclick="event.preventDefault(); window.BotNBoltApp.navigateToTicket('${tkt.id}')"><code>${tkt.id}</code></a></td>
                      <td>${tkt.dealer}</td>
                      <td>${tkt.problem}</td>
                      <td><span class="badge ${tkt.priority === 'High' ? 'badge-danger' : tkt.priority === 'Medium' ? 'badge-warning' : 'badge-info'}">${tkt.priority}</span></td>
                      <td>${tkt.assigned}</td>
                      <td><span class="badge ${tkt.status === 'Open' ? 'badge-danger' : tkt.status === 'Resolved' ? 'badge-success' : 'badge-warning'}">${tkt.status}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Table Pagination Footer -->
            <div class="table-footer-pagination">
              <div>
                Showing <strong>${filtered.length === 0 ? 0 : pageIndex * pageSize + 1}</strong> to 
                <strong>${Math.min((pageIndex + 1) * pageSize, filtered.length)}</strong> of 
                <strong>${filtered.length}</strong> tickets
              </div>
              <div class="pagination-controls">
                <span style="margin-right:8px;">Rows per page:</span>
                <select class="rows-selector" style="margin-right:16px;" onchange="window.BotNBoltApp.handleTablePageSizeChange('${tableKey}', this.value)">
                  <option value="5" ${pageSize === 5 ? 'selected' : ''}>5</option>
                  <option value="10" ${pageSize === 10 ? 'selected' : ''}>10</option>
                  <option value="25" ${pageSize === 25 ? 'selected' : ''}>25</option>
                </select>
                <button class="pagination-btn" ${pageIndex === 0 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex - 1})" title="Previous Page"><i data-lucide="chevron-left" style="width:14px; height:14px;"></i></button>
                <span style="font-weight:600; margin:0 8px;">Page ${pageIndex + 1} of ${totalPages}</span>
                <button class="pagination-btn" ${pageIndex >= totalPages - 1 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex + 1})" title="Next Page"><i data-lucide="chevron-right" style="width:14px; height:14px;"></i></button>
              </div>
            </div>

          </div>
        `;
        lucide.createIcons();
      }
    }



    // ----------------------------------------------------
    // DEALER VIEWS
    // ----------------------------------------------------
    renderDealerView(canvas, menu) {
      const db = this.state.db.dealer;
      if (!db.profile) {
        db.profile = JSON.parse(JSON.stringify((window.BotNBoltMockData && window.BotNBoltMockData.dealer && window.BotNBoltMockData.dealer.profile) || {}));
        this.saveState();
      }
      if (!db.repairRequests) {
        db.repairRequests = JSON.parse(JSON.stringify((window.BotNBoltMockData && window.BotNBoltMockData.dealer && window.BotNBoltMockData.dealer.repairRequests) || []));
        this.saveState();
      }
      if (!db.kpis) {
        db.kpis = JSON.parse(JSON.stringify((window.BotNBoltMockData && window.BotNBoltMockData.dealer && window.BotNBoltMockData.dealer.kpis) || {}));
        this.saveState();
      }

      if (menu === 'overview') {
        const newReqs = db.repairRequests.filter(r => r.status === 'New').length;
        const completedReqs = db.repairRequests.filter(r => r.status === 'Completed').length;
        const inProgressReqs = db.repairRequests.filter(r => r.status !== 'New' && r.status !== 'Completed').length;
        const convRate = Math.round(completedReqs / Math.max(db.repairRequests.length, 1) * 100);

        canvas.innerHTML = `
          <!-- 5-Column KPI Gradient Cards -->
          <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:20px; margin-bottom:24px;">

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.navigate('requests')" style="padding:16px; border-left:4px solid var(--primary); display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(37,99,235,0.05) 100%); cursor:pointer; transition:transform 0.15s,box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(37,99,235,0.15)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Repair Requests</div>
                <strong style="font-size:1.4rem; color:var(--text-primary);">${db.kpis.totalRepairRequests.value}</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="camera" style="color:var(--primary); width:20px; height:20px; margin-bottom:4px;"></i>
                <span style="color:var(--success); font-size:0.7rem; font-weight:600; background:rgba(16,185,129,0.1); padding:2px 6px; border-radius:4px;">${db.kpis.totalRepairRequests.change}</span>
              </div>
            </div>

            <div class="card kpi-card-gradient" style="padding:16px; border-left:4px solid var(--success); display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.05) 100%); cursor:pointer; transition:transform 0.15s,box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(16,185,129,0.15)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Today's Customers</div>
                <strong style="font-size:1.4rem; color:var(--text-primary);">${db.kpis.todayCustomers.value}</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="user-check" style="color:var(--success); width:20px; height:20px; margin-bottom:4px;"></i>
                <span style="color:var(--warning); font-size:0.7rem; font-weight:600; background:rgba(245,158,11,0.1); padding:2px 6px; border-radius:4px;">${db.kpis.todayCustomers.change}</span>
              </div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.navigate('requests')" style="padding:16px; border-left:4px solid #f59e0b; display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.05) 100%); cursor:pointer; transition:transform 0.15s,box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(245,158,11,0.15)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Revenue Estimate</div>
                <strong style="font-size:1.4rem; color:var(--text-primary);">${db.kpis.revenueEstimate.value}</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="banknote" style="color:#f59e0b; width:20px; height:20px; margin-bottom:4px;"></i>
                <span style="color:var(--success); font-size:0.7rem; font-weight:600; background:rgba(16,185,129,0.1); padding:2px 6px; border-radius:4px;">${db.kpis.revenueEstimate.change}</span>
              </div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.navigate('materials')" style="padding:16px; border-left:4px solid #a855f7; display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(168,85,247,0.05) 100%); cursor:pointer; transition:transform 0.15s,box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(168,85,247,0.15)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Materials Suggested</div>
                <strong style="font-size:1.4rem; color:var(--text-primary);">${db.kpis.materialsSuggested.value}</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="wrench" style="color:#a855f7; width:20px; height:20px; margin-bottom:4px;"></i>
                <span style="color:var(--success); font-size:0.7rem; font-weight:600; background:rgba(16,185,129,0.1); padding:2px 6px; border-radius:4px;">${db.kpis.materialsSuggested.change}</span>
              </div>
            </div>

            <div class="card kpi-card-gradient" style="padding:16px; border-left:4px solid #06b6d4; display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(6,182,212,0.05) 100%); cursor:pointer; transition:transform 0.15s,box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(6,182,212,0.15)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Conversion Rate</div>
                <strong style="font-size:1.4rem; color:var(--text-primary);">${convRate}%</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="trending-up" style="color:#06b6d4; width:20px; height:20px; margin-bottom:4px;"></i>
                <span style="color:var(--success); font-size:0.7rem; font-weight:600; background:rgba(16,185,129,0.1); padding:2px 6px; border-radius:4px;">+4.1%</span>
              </div>
            </div>

          </div>

          <!-- Premium Split Layout -->
          <div class="layout-split" style="grid-template-columns: 2fr 1fr; gap: 24px;">

            <!-- LEFT COLUMN -->
            <div style="display:flex; flex-direction:column; gap:24px;">

              <!-- Scan Trend Chart -->
              <div class="card" style="padding:24px;">
                <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:20px;">
                  <span class="card-title" style="font-size:1rem; font-weight:700;">AI Repair Request Trends</span>
                  <button class="btn btn-secondary btn-sm" onclick="window.BotNBoltApp.navigate('requests')">View All →</button>
                </div>
                <div style="height:250px;"><canvas id="dlrScanTrendChart"></canvas></div>
              </div>

              <!-- Materials Stock Bar -->
              <div class="card" style="padding:24px;">
                <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:20px;">
                  <span class="card-title" style="font-size:1rem; font-weight:700;">Material Stock & Unit Costs</span>
                  <button class="btn btn-secondary btn-sm" onclick="window.BotNBoltApp.navigate('materials')">Manage Stock →</button>
                </div>
                <div style="height:220px;"><canvas id="dlrMaterialsChart"></canvas></div>
              </div>

              <!-- Store Profile Card -->
              <div class="card" style="padding:24px;">
                <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:20px;">
                  <span class="card-title" style="font-size:1rem; font-weight:700;">Store Information</span>
                  <button class="btn btn-secondary btn-sm" onclick="window.BotNBoltApp.navigate('profile')">Edit Profile →</button>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                  <div style="display:flex; flex-direction:column; gap:12px;">
                    <div style="padding:12px; background:var(--bg-primary); border-radius:8px;">
                      <div style="font-size:0.7rem; color:var(--text-secondary); font-weight:600; text-transform:uppercase; margin-bottom:3px;">Store Name</div>
                      <div style="font-size:0.85rem; font-weight:700; color:var(--text-primary);">${db.profile.storeName}</div>
                    </div>
                    <div style="padding:12px; background:var(--bg-primary); border-radius:8px;">
                      <div style="font-size:0.7rem; color:var(--text-secondary); font-weight:600; text-transform:uppercase; margin-bottom:3px;">Address</div>
                      <div style="font-size:0.82rem; color:var(--text-primary);">${db.profile.address}</div>
                    </div>
                    <div style="padding:12px; background:var(--bg-primary); border-radius:8px;">
                      <div style="font-size:0.7rem; color:var(--text-secondary); font-weight:600; text-transform:uppercase; margin-bottom:3px;">Hours</div>
                      <div style="font-size:0.8rem; color:var(--text-primary);">${db.profile.hours}</div>
                    </div>
                  </div>
                  <div style="display:flex; flex-direction:column; gap:12px;">
                    <div style="padding:12px; background:var(--bg-primary); border-radius:8px;">
                      <div style="font-size:0.7rem; color:var(--text-secondary); font-weight:600; text-transform:uppercase; margin-bottom:3px;">Contact</div>
                      <div style="font-size:0.8rem; color:var(--text-primary);">${db.profile.contactDetails}</div>
                    </div>
                    <div style="padding:12px; background:var(--bg-primary); border-radius:8px;">
                      <div style="font-size:0.7rem; color:var(--text-secondary); font-weight:600; text-transform:uppercase; margin-bottom:3px;">Assigned Manager</div>
                      <div style="font-size:0.85rem; font-weight:700; color:var(--primary);">${db.profile.assignedManager}</div>
                    </div>
                    <div style="padding:12px; background:var(--bg-primary); border-radius:8px;">
                      <div style="font-size:0.7rem; color:var(--text-secondary); font-weight:600; text-transform:uppercase; margin-bottom:3px;">Province</div>
                      <div style="font-size:0.85rem; color:var(--text-primary);">${db.profile.province}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- RIGHT COLUMN -->
            <div style="display:flex; flex-direction:column; gap:24px;">

              <!-- Circular: Conversion Rate -->
              <div class="card" style="text-align:center; padding:20px;">
                <div class="card-header" style="justify-content:center; padding:0 0 12px 0; border-bottom:1px solid var(--border-color); margin-bottom:16px;">
                  <span class="card-title">Conversion Ratio</span>
                </div>
                <div style="position:relative; width:130px; height:130px; margin:16px auto;">
                  <svg width="130" height="130" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="45" stroke="var(--bg-app)" stroke-width="8" fill="transparent"/>
                    <circle cx="60" cy="60" r="45" stroke="#06b6d4" stroke-width="8" fill="transparent"
                            stroke-dasharray="283" stroke-dashoffset="${Math.round(283 * (1 - convRate / 100))}" stroke-linecap="round"/>
                  </svg>
                  <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center;">
                    <div style="font-size:1.3rem; font-weight:700; color:var(--text-primary);">${convRate}%</div>
                    <div style="font-size:0.65rem; color:var(--text-secondary);">Converted</div>
                  </div>
                </div>
                <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:8px;">${completedReqs} of ${db.repairRequests.length} requests completed this cycle</p>
              </div>

              <!-- Request Status Doughnut -->
              <div class="card" style="padding:20px;">
                <div class="card-header" style="padding:0 0 12px 0; border-bottom:1px solid var(--border-color); margin-bottom:16px;">
                  <span class="card-title">Request Status Breakdown</span>
                </div>
                <div style="height:180px;"><canvas id="dlrStatusChart"></canvas></div>
              </div>

              <!-- Recent Activity Feed -->
              <div class="card" style="padding:24px;">
                <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:20px;">
                  <span class="card-title" style="font-size:1rem; font-weight:700;">Recent Activity</span>
                </div>
                <div style="position:relative; padding-left:24px; display:flex; flex-direction:column; gap:20px;">
                  <div style="position:absolute; left:7px; top:8px; bottom:8px; width:2px; background:var(--border-color);"></div>
                  ${db.repairRequests.slice(0, 3).map((req, i) => {
          const dotColors = ['var(--primary)', 'var(--success)', 'var(--warning)'];
          const glows = ['rgba(37,99,235,0.15)', 'rgba(16,185,129,0.15)', 'rgba(245,158,11,0.15)'];
          return `
                      <div style="position:relative; display:flex; gap:16px;">
                        <div style="position:absolute; left:-22px; top:4px; width:12px; height:12px; border-radius:50%; background:${dotColors[i]}; border:2.5px solid var(--bg-card); box-shadow:0 0 0 3px ${glows[i]};"></div>
                        <div style="flex-grow:1;">
                          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <strong style="font-size:0.83rem; color:var(--text-primary);">${req.repairType}</strong>
                            <small style="color:var(--text-muted); font-size:0.72rem;">${req.date.split(' ').slice(0, 1).join('')}</small>
                          </div>
                          <p style="font-size:0.78rem; color:var(--text-secondary); margin:0;">${req.customerName} — $${req.estimatedCost.toFixed(0)} est. <span class="badge ${req.status === 'New' ? 'badge-danger' : req.status === 'Completed' ? 'badge-success' : 'badge-warning'}" style="font-size:0.65rem;">${req.status}</span></p>
                        </div>
                      </div>
                    `;
        }).join('')}
                </div>
              </div>

            </div>
          </div>
        `;

        const colors = this.getChartColors();

        // Scan Trend Line
        const ctxScan = document.getElementById('dlrScanTrendChart');
        if (ctxScan) {
          this.state.charts.dlrScan = new Chart(ctxScan.getContext('2d'), {
            type: 'line',
            data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [
                { label: 'Repair Requests', data: [88, 102, 95, 118, 128, 142], borderColor: colors.primary, backgroundColor: colors.primaryGlow, fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4 },
                { label: 'Completed', data: [55, 68, 72, 80, 88, 89], borderColor: colors.success, backgroundColor: 'rgba(16,185,129,0.05)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4 }
              ]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { color: colors.grid }, ticks: { color: colors.text } }, y: { grid: { color: colors.grid }, ticks: { color: colors.text } } } }
          });
        }

        // Materials bar
        const ctxMat = document.getElementById('dlrMaterialsChart');
        if (ctxMat) {
          const recs = db.materialRecommendations || [];
          this.state.charts.dlrMaterials = new Chart(ctxMat.getContext('2d'), {
            type: 'bar',
            data: {
              labels: recs.map(m => (m.name || '').split(' ').slice(0, 2).join(' ')),
              datasets: [{ label: 'Unit Cost ($)', data: recs.map(m => m.cost || 0), backgroundColor: colors.warning, borderRadius: 4 }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { color: colors.grid }, ticks: { color: colors.text } }, y: { grid: { color: colors.grid }, ticks: { color: colors.text, callback: v => '$' + v } } } }
          });
        }

        // Status Doughnut
        const ctxStatus = document.getElementById('dlrStatusChart');
        if (ctxStatus) {
          this.state.charts.dlrStatus = new Chart(ctxStatus.getContext('2d'), {
            type: 'doughnut',
            data: {
              labels: ['New', 'In Progress', 'Completed'],
              datasets: [{ data: [newReqs, inProgressReqs, completedReqs], backgroundColor: [colors.danger, colors.warning, colors.success] }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: colors.text, font: { size: 10 } } } } }
          });
        }

      } else if (menu === 'requests') {
        const tableKey = 'requests_dlr';
        const searchQuery = (this.state.searchQueries[tableKey] || '').toLowerCase();
        const pageSize = this.state.pageSizes[tableKey] || 5;
        const pageIndex = this.state.pageIndices[tableKey] || 0;

        const filters = this.state.dropdownFilters[tableKey] || {};
        const statusFilter = filters.status || '';

        // Calculate database counts
        const totalCount = db.repairRequests.length;
        const newCount = db.repairRequests.filter(r => r.status === 'New').length;
        const inspectedCount = db.repairRequests.filter(r => r.status === 'Inspected').length;
        const quoteSentCount = db.repairRequests.filter(r => r.status === 'Quote Sent').length;
        const completedCount = db.repairRequests.filter(r => r.status === 'Completed').length;

        // Filter rows
        const filtered = db.repairRequests.filter(req => {
          const matchesSearch = req.id.toLowerCase().includes(searchQuery) ||
            req.customerName.toLowerCase().includes(searchQuery) ||
            req.repairType.toLowerCase().includes(searchQuery) ||
            req.suggestedMaterials.join(' ').toLowerCase().includes(searchQuery) ||
            req.status.toLowerCase().includes(searchQuery);
          const matchesStatus = !statusFilter || req.status === statusFilter;
          return matchesSearch && matchesStatus;
        });

        // Paginate rows
        const paginated = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
        const totalPages = Math.ceil(filtered.length / pageSize) || 1;
        const allRowIds = filtered.map(r => r.id);
        const checked = this.state.checkedRows[tableKey] || [];

        // Helper style for active card selection indication
        const getActiveCardStyle = (currStatus, accentColor) => {
          if (statusFilter === currStatus) {
            return `box-shadow: 0 0 0 2px ${accentColor}; transform: translateY(-2px); font-weight: 700;`;
          }
          return '';
        };

        const requestsStatHeader = `
          <!-- Requests KPI Cards for Interactive Filtering -->
          <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap: 20px; margin-bottom: 24px;">
            
            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', '')" 
                 style="padding:16px; border-left:4px solid var(--primary); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(37,99,235,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('', 'var(--primary)')}"
                 onmouseenter="if('${statusFilter}' !== '') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(37,99,235,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== '') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Total Requests</div>
                  <strong style="font-size:1.4rem; color:var(--text-primary);">${totalCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(37,99,235,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="camera" style="color:var(--primary); width:16px; height:16px;"></i>
                </div>
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Show all scans</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'New')" 
                 style="padding:16px; border-left:4px solid var(--danger); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(239,68,68,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('New', 'var(--danger)')}"
                 onmouseenter="if('${statusFilter}' !== 'New') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(239,68,68,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== 'New') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">New Scans</div>
                  <strong style="font-size:1.4rem; color:var(--danger);">${newCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(239,68,68,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="alert-circle" style="color:var(--danger); width:16px; height:16px;"></i>
                </div>
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Filter by New scans</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Inspected')" 
                 style="padding:16px; border-left:4px solid var(--primary); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(37,99,235,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('Inspected', 'var(--primary)')}"
                 onmouseenter="if('${statusFilter}' !== 'Inspected') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(37,99,235,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== 'Inspected') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Inspected</div>
                  <strong style="font-size:1.4rem; color:var(--primary);">${inspectedCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(37,99,235,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="sliders" style="color:var(--primary); width:16px; height:16px;"></i>
                </div>
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Filter by Inspected status</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Quote Sent')" 
                 style="padding:16px; border-left:4px solid var(--warning); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('Quote Sent', 'var(--warning)')}"
                 onmouseenter="if('${statusFilter}' !== 'Quote Sent') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(245,158,11,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== 'Quote Sent') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Quote Sent</div>
                  <strong style="font-size:1.4rem; color:var(--warning);">${quoteSentCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(245,158,11,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="mail" style="color:var(--warning); width:16px; height:16px;"></i>
                </div>
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Filter by Quote Sent</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Completed')" 
                 style="padding:16px; border-left:4px solid var(--success); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('Completed', 'var(--success)')}"
                 onmouseenter="if('${statusFilter}' !== 'Completed') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(16,185,129,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== 'Completed') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Completed</div>
                  <strong style="font-size:1.4rem; color:var(--success);">${completedCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(16,185,129,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="check-circle" style="color:var(--success); width:16px; height:16px;"></i>
                </div>
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Filter by Completed scans</div>
            </div>

          </div>
        `;

        canvas.innerHTML = requestsStatHeader + `
          <div class="card">
            <div class="card-header">
              <div style="display:flex; flex-direction:column; gap:4px;">
                <span class="card-title">Recent Damage Repair Scans Queue (AI Inspected)</span>
                ${statusFilter ? `<span style="font-size: 0.78rem; color: var(--text-secondary);">Active Filter: <strong style="color: var(--primary); text-transform: uppercase;">${statusFilter}</strong></span>` : ''}
              </div>
            </div>
            
            <!-- Table Header Action Controls -->
            <div class="table-header-actions" style="padding: 0 24px; margin-top: 10px;">
              <div class="table-actions-left">
                <div class="search-wrapper">
                  <i data-lucide="search"></i>
                  <input type="text" class="form-control search-input" id="search-${tableKey}" placeholder="Search scans..." value="${this.state.searchQueries[tableKey] || ''}" oninput="window.BotNBoltApp.handleTableSearch('${tableKey}', this.value)">
                </div>
                
                <select class="bulk-actions-select" id="bulk-${tableKey}" style="${checked.length > 0 ? 'display:block;' : 'display:none;'}" onchange="window.BotNBoltApp.triggerBulkAction('${tableKey}', this.value)">
                  <option value="">Bulk Actions (${checked.length} Selected)</option>
                  <option value="suspend">Mark Completed</option>
                  <option value="export">Export Selected</option>
                </select>
              </div>
              
              <div class="table-actions-right">
                <button class="btn btn-secondary btn-sm flex-center" onclick="window.BotNBoltApp.exportRequestsDlrCsv('${tableKey}')" title="Export Current List to CSV">
                  <i data-lucide="download"></i> Export CSV
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 40px; padding-left: 24px;">
                      <input type="checkbox" id="chk-all-${tableKey}" style="width:16px; height:16px; cursor:pointer;" ${checked.length === allRowIds.length && allRowIds.length > 0 ? 'checked' : ''} onchange="window.BotNBoltApp.handleSelectAllChange('${tableKey}', this.checked, ${JSON.stringify(allRowIds).replace(/"/g, '&quot;')})">
                    </th>
                    <th>Request ID</th>
                    <th>Customer Name</th>
                    <th>Image Source</th>
                    <th>Repair Target</th>
                    <th>Estimated Cost</th>
                    <th>Suggested Material</th>
                    <th>Received Date</th>
                    <th>Scan Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${paginated.length === 0 ? `
                    <tr>
                      <td colspan="10" style="text-align:center; padding: 32px; color: var(--text-secondary);">No records match your search filter.</td>
                    </tr>
                  ` : paginated.map(req => `
                    <tr>
                      <td style="padding-left: 24px;">
                        <input type="checkbox" id="chk-${tableKey}-${req.id}" style="width:16px; height:16px; cursor:pointer;" ${checked.includes(req.id) ? 'checked' : ''} onchange="window.BotNBoltApp.handleCheckboxChange('${tableKey}', '${req.id}', this.checked)">
                      </td>
                      <td><code>${req.id}</code></td>
                      <td><strong>${req.customerName}</strong></td>
                      <td><span style="font-size:0.8rem; color:var(--primary); font-weight:600;"><i data-lucide="image" style="width:14px; height:14px; vertical-align:middle;"></i> ${req.image}</span></td>
                      <td>${req.repairType}</td>
                      <td><strong>$${req.estimatedCost.toFixed(2)}</strong></td>
                      <td><code>${req.suggestedMaterials[0]}</code></td>
                      <td>${req.date}</td>
                      <td><span class="badge ${req.status === 'New' ? 'badge-danger' : req.status === 'Completed' ? 'badge-success' : 'badge-warning'}">${req.status}</span></td>
                      <td>
                        <div class="table-actions">
                          <button class="btn btn-primary btn-sm flex-center" onclick="window.BotNBoltApp.openAiScanModal('${req.id}')" title="Inspect AI / Generate Quote"><i data-lucide="eye"></i> Inspect AI</button>
                          <button class="action-icon-btn" onclick="alert('Client Phone: +1 (416) 555-7788 | Email: contact@client.com')" title="Contact Customer"><i data-lucide="phone"></i></button>
                          ${req.status !== 'Completed' ? `<button class="action-icon-btn" onclick="window.BotNBoltApp.markRequestCompleted('${req.id}')" title="Mark Completed"><i data-lucide="check-circle-2"></i></button>` : ''}
                          <button class="action-icon-btn" onclick="window.BotNBoltApp.recommendTechnician('${req.id}')" title="Recommend Technician"><i data-lucide="user-cog"></i></button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Table Pagination Footer -->
            <div class="table-footer-pagination">
              <div>
                Showing <strong>${filtered.length === 0 ? 0 : pageIndex * pageSize + 1}</strong> to 
                <strong>${Math.min((pageIndex + 1) * pageSize, filtered.length)}</strong> of 
                <strong>${filtered.length}</strong> scans
              </div>
              <div class="pagination-controls">
                <span style="margin-right:8px;">Rows per page:</span>
                <select class="rows-selector" style="margin-right:16px;" onchange="window.BotNBoltApp.handleTablePageSizeChange('${tableKey}', this.value)">
                  <option value="5" ${pageSize === 5 ? 'selected' : ''}>5</option>
                  <option value="10" ${pageSize === 10 ? 'selected' : ''}>10</option>
                  <option value="25" ${pageSize === 25 ? 'selected' : ''}>25</option>
                </select>
                <button class="pagination-btn" ${pageIndex === 0 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex - 1})" title="Previous Page"><i data-lucide="chevron-left" style="width:14px; height:14px;"></i></button>
                <span style="font-weight:600; margin:0 8px;">Page ${pageIndex + 1} of ${totalPages}</span>
                <button class="pagination-btn" ${pageIndex >= totalPages - 1 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex + 1})" title="Next Page"><i data-lucide="chevron-right" style="width:14px; height:14px;"></i></button>
              </div>
            </div>

          </div>
        `;
        lucide.createIcons();
      } else if (menu === 'materials') {
        const tableKey = 'materials_dlr';
        const searchQuery = (this.state.searchQueries[tableKey] || '').toLowerCase();
        const pageSize = this.state.pageSizes[tableKey] || 5;
        const pageIndex = this.state.pageIndices[tableKey] || 0;

        const filters = this.state.dropdownFilters[tableKey] || {};
        const statusFilter = filters.status || '';

        // Ensure recommendations is defined
        if (!db.materialRecommendations) {
          db.materialRecommendations = JSON.parse(JSON.stringify((window.BotNBoltMockData && window.BotNBoltMockData.dealer && window.BotNBoltMockData.dealer.materialRecommendations) || []));
          this.saveState();
        }
        const recs = db.materialRecommendations;

        // Calculate counts
        const totalCount = recs.length;
        const inStockCount = recs.filter(m => m.stock && !m.stock.includes('Low')).length;
        const lowStockCount = recs.filter(m => m.stock && m.stock.includes('Low')).length;

        // Filter rows
        const filtered = recs.filter(mat => {
          const matchesSearch = (mat.name || '').toLowerCase().includes(searchQuery) ||
            (mat.sku || '').toLowerCase().includes(searchQuery) ||
            (mat.stock || '').toLowerCase().includes(searchQuery);

          let matchesStatus = true;
          if (statusFilter === 'In Stock') {
            matchesStatus = mat.stock && !mat.stock.includes('Low');
          } else if (statusFilter === 'Low Stock') {
            matchesStatus = mat.stock && mat.stock.includes('Low');
          }

          return matchesSearch && matchesStatus;
        });

        // Paginate rows
        const paginated = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
        const totalPages = Math.ceil(filtered.length / pageSize) || 1;
        const allRowIds = filtered.map(m => m.sku);
        const checked = this.state.checkedRows[tableKey] || [];

        // Helper style for active card selection indication
        const getActiveCardStyle = (currStatus, accentColor) => {
          if (statusFilter === currStatus) {
            return `box-shadow: 0 0 0 2px ${accentColor}; transform: translateY(-2px); font-weight: 700;`;
          }
          return '';
        };

        canvas.innerHTML = `
          <!-- Materials KPI Cards for Interactive Filtering -->
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px;">
            
            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', '')" 
                 style="padding:20px; border-left:4px solid var(--primary); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(37,99,235,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('', 'var(--primary)')}"
                 onmouseenter="if('${statusFilter}' !== '') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(37,99,235,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== '') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Total Items</div>
                  <strong style="font-size:1.8rem; color:var(--text-primary);">${totalCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(37,99,235,0.1); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="package" style="color:var(--primary); width:20px; height:20px;"></i>
                </div>
              </div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:8px;">Show all store inventory</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'In Stock')" 
                 style="padding:20px; border-left:4px solid var(--success); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('In Stock', 'var(--success)')}"
                 onmouseenter="if('${statusFilter}' !== 'In Stock') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(16,185,129,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== 'In Stock') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">In Stock</div>
                  <strong style="font-size:1.8rem; color:var(--success);">${inStockCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(16,185,129,0.1); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="check-circle" style="color:var(--success); width:20px; height:20px;"></i>
                </div>
              </div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:8px;">Filter by items in stock</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Low Stock')" 
                 style="padding:20px; border-left:4px solid var(--warning); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('Low Stock', 'var(--warning)')}"
                 onmouseenter="if('${statusFilter}' !== 'Low Stock') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(245,158,11,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== 'Low Stock') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Low Stock</div>
                  <strong style="font-size:1.8rem; color:var(--warning);">${lowStockCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(245,158,11,0.1); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="alert-triangle" style="color:var(--warning); width:20px; height:20px;"></i>
                </div>
              </div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:8px;">Filter by low stock alert</div>
            </div>

          </div>

          <div class="card">
            <div class="card-header">
              <div style="display:flex; flex-direction:column; gap:4px;">
                <span class="card-title">Local Material Stock & Inventory Pricing</span>
                ${statusFilter ? `<span style="font-size: 0.78rem; color: var(--text-secondary);">Active Filter: <strong style="color: var(--primary); text-transform: uppercase;">${statusFilter}</strong></span>` : ''}
              </div>
            </div>
            
            <!-- Table Action Controls -->
            <div class="table-header-actions" style="padding: 0 24px; margin-top: 10px;">
              <div class="table-actions-left">
                <div class="search-wrapper">
                  <i data-lucide="search"></i>
                  <input type="text" class="form-control search-input" id="search-${tableKey}" placeholder="Search inventory..." value="${this.state.searchQueries[tableKey] || ''}" oninput="window.BotNBoltApp.handleTableSearch('${tableKey}', this.value)">
                </div>
                
                <select class="bulk-actions-select" id="bulk-${tableKey}" style="${checked.length > 0 ? 'display:block;' : 'display:none;'}" onchange="window.BotNBoltApp.triggerBulkAction('${tableKey}', this.value)">
                  <option value="">Bulk Actions (${checked.length} Selected)</option>
                  <option value="export">Export Selected</option>
                </select>
              </div>
              
              <div class="table-actions-right">
                <button class="btn btn-secondary btn-sm flex-center" onclick="window.BotNBoltApp.exportMaterialsDlrCsv('${tableKey}')" title="Export Current List to CSV">
                  <i data-lucide="download"></i> Export CSV
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 40px; padding-left: 24px;">
                      <input type="checkbox" id="chk-all-${tableKey}" style="width:16px; height:16px; cursor:pointer;" ${checked.length === allRowIds.length && allRowIds.length > 0 ? 'checked' : ''} onchange="window.BotNBoltApp.handleSelectAllChange('${tableKey}', this.checked, ${JSON.stringify(allRowIds).replace(/"/g, '&quot;')})">
                    </th>
                    <th>Material Name</th>
                    <th>SKU Number</th>
                    <th>Local Stock Availability</th>
                    <th>Unit Cost</th>
                    <th>Frequently Purchased</th>
                  </tr>
                </thead>
                <tbody>
                  ${paginated.length === 0 ? `
                    <tr>
                      <td colspan="10" style="text-align:center; padding: 32px; color: var(--text-secondary);">No records match your search filter.</td>
                    </tr>
                  ` : paginated.map(mat => `
                    <tr>
                      <td style="padding-left: 24px;">
                        <input type="checkbox" id="chk-${tableKey}-${mat.sku}" style="width:16px; height:16px; cursor:pointer;" ${checked.includes(mat.sku) ? 'checked' : ''} onchange="window.BotNBoltApp.handleCheckboxChange('${tableKey}', '${mat.sku}', this.checked)">
                      </td>
                      <td><strong>${mat.name}</strong></td>
                      <td><code>${mat.sku}</code></td>
                      <td><span class="badge ${mat.stock.includes('Low') ? 'badge-warning' : 'badge-success'}">${mat.stock}</span></td>
                      <td><strong>$${mat.cost.toFixed(2)}</strong></td>
                      <td>${mat.frequentlyPurchased ? '<span class="badge badge-info">Popular</span>' : 'Standard'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Table Pagination Footer -->
            <div class="table-footer-pagination">
              <div>
                Showing <strong>${filtered.length === 0 ? 0 : pageIndex * pageSize + 1}</strong> to 
                <strong>${Math.min((pageIndex + 1) * pageSize, filtered.length)}</strong> of 
                <strong>${filtered.length}</strong> items
              </div>
              <div class="pagination-controls">
                <span style="margin-right:8px;">Rows per page:</span>
                <select class="rows-selector" style="margin-right:16px;" onchange="window.BotNBoltApp.handleTablePageSizeChange('${tableKey}', this.value)">
                  <option value="5" ${pageSize === 5 ? 'selected' : ''}>5</option>
                  <option value="10" ${pageSize === 10 ? 'selected' : ''}>10</option>
                  <option value="25" ${pageSize === 25 ? 'selected' : ''}>25</option>
                </select>
                <button class="pagination-btn" ${pageIndex === 0 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex - 1})" title="Previous Page"><i data-lucide="chevron-left" style="width:14px; height:14px;"></i></button>
                <span style="font-weight:600; margin:0 8px;">Page ${pageIndex + 1} of ${totalPages}</span>
                <button class="pagination-btn" ${pageIndex >= totalPages - 1 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex + 1})" title="Next Page"><i data-lucide="chevron-right" style="width:14px; height:14px;"></i></button>
              </div>
            </div>

          </div>
        `;
        lucide.createIcons();
      } else if (menu === 'leads') {
        const tableKey = 'leads_dlr';
        const searchQuery = (this.state.searchQueries[tableKey] || '').toLowerCase();
        const pageSize = this.state.pageSizes[tableKey] || 5;
        const pageIndex = this.state.pageIndices[tableKey] || 0;

        const filters = this.state.dropdownFilters[tableKey] || {};
        const statusFilter = filters.status || '';

        // Calculate counts
        const totalCount = db.customerLeads.length;
        const newCount = db.customerLeads.filter(l => l.leadStatus === 'New').length;
        const contactedCount = db.customerLeads.filter(l => l.leadStatus === 'Contacted').length;
        const convertedCount = db.customerLeads.filter(l => l.leadStatus === 'Converted').length;
        const closedCount = db.customerLeads.filter(l => l.leadStatus === 'Closed').length;

        // Filter rows
        const filtered = db.customerLeads.filter(lead => {
          const matchesSearch = lead.name.toLowerCase().includes(searchQuery) ||
            lead.phone.toLowerCase().includes(searchQuery) ||
            lead.email.toLowerCase().includes(searchQuery) ||
            lead.repairType.toLowerCase().includes(searchQuery) ||
            lead.interestedProducts.toLowerCase().includes(searchQuery) ||
            lead.leadStatus.toLowerCase().includes(searchQuery);
          const matchesStatus = !statusFilter || lead.leadStatus === statusFilter;
          return matchesSearch && matchesStatus;
        });

        // Paginate rows
        const paginated = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
        const totalPages = Math.ceil(filtered.length / pageSize) || 1;
        const allRowIds = filtered.map((l, i) => 'lead-' + i);
        const checked = this.state.checkedRows[tableKey] || [];

        // Helper style for active card selection indication
        const getActiveCardStyle = (currStatus, accentColor) => {
          if (statusFilter === currStatus) {
            return `box-shadow: 0 0 0 2px ${accentColor}; transform: translateY(-2px); font-weight: 700;`;
          }
          return '';
        };

        const leadsStatHeader = `
          <!-- Leads KPI Cards for Interactive Filtering -->
          <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap: 20px; margin-bottom: 24px;">
            
            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', '')" 
                 style="padding:16px; border-left:4px solid var(--primary); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(37,99,235,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('', 'var(--primary)')}"
                 onmouseenter="if('${statusFilter}' !== '') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(37,99,235,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== '') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Total Leads</div>
                  <strong style="font-size:1.4rem; color:var(--text-primary);">${totalCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(37,99,235,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="users" style="color:var(--primary); width:16px; height:16px;"></i>
                </div>
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Show all customer leads</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'New')" 
                 style="padding:16px; border-left:4px solid var(--danger); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(239,68,68,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('New', 'var(--danger)')}"
                 onmouseenter="if('${statusFilter}' !== 'New') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(239,68,68,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== 'New') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">New Leads</div>
                  <strong style="font-size:1.4rem; color:var(--danger);">${newCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(239,68,68,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="user-plus" style="color:var(--danger); width:16px; height:16px;"></i>
                </div>
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Filter by New leads</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Contacted')" 
                 style="padding:16px; border-left:4px solid var(--warning); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('Contacted', 'var(--warning)')}"
                 onmouseenter="if('${statusFilter}' !== 'Contacted') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(245,158,11,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== 'Contacted') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Contacted</div>
                  <strong style="font-size:1.4rem; color:var(--warning);">${contactedCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(245,158,11,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="phone-call" style="color:var(--warning); width:16px; height:16px;"></i>
                </div>
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Filter by Contacted</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Converted')" 
                 style="padding:16px; border-left:4px solid var(--success); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('Converted', 'var(--success)')}"
                 onmouseenter="if('${statusFilter}' !== 'Converted') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(16,185,129,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== 'Converted') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Converted</div>
                  <strong style="font-size:1.4rem; color:var(--success);">${convertedCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(16,185,129,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="user-check" style="color:var(--success); width:16px; height:16px;"></i>
                </div>
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Filter by Converted leads</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Closed')" 
                 style="padding:16px; border-left:4px solid #6b7280; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(107,114,128,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('Closed', '#6b7280')}"
                 onmouseenter="if('${statusFilter}' !== 'Closed') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(107,114,128,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== 'Closed') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Closed</div>
                  <strong style="font-size:1.4rem; color:#6b7280;">${closedCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(107,114,128,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="lock" style="color:#6b7280; width:16px; height:16px;"></i>
                </div>
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Filter by Closed leads</div>
            </div>

          </div>
        `;

        canvas.innerHTML = leadsStatHeader + `
          <div class="card">
            <div class="card-header">
              <div style="display:flex; flex-direction:column; gap:4px;">
                <span class="card-title">Customer Leads Management (CRM)</span>
                ${statusFilter ? `<span style="font-size: 0.78rem; color: var(--text-secondary);">Active Filter: <strong style="color: var(--primary); text-transform: uppercase;">${statusFilter}</strong></span>` : ''}
              </div>
            </div>
            
            <!-- Table Action Controls -->
            <div class="table-header-actions" style="padding: 0 24px; margin-top: 10px;">
              <div class="table-actions-left">
                <div class="search-wrapper">
                  <i data-lucide="search"></i>
                  <input type="text" class="form-control search-input" id="search-${tableKey}" placeholder="Search leads..." value="${this.state.searchQueries[tableKey] || ''}" oninput="window.BotNBoltApp.handleTableSearch('${tableKey}', this.value)">
                </div>
                
                <select class="bulk-actions-select" id="bulk-${tableKey}" style="${checked.length > 0 ? 'display:block;' : 'display:none;'}" onchange="window.BotNBoltApp.triggerBulkAction('${tableKey}', this.value)">
                  <option value="">Bulk Actions (${checked.length} Selected)</option>
                  <option value="export">Export Selected</option>
                </select>
              </div>
              
              <div class="table-actions-right">
                <button class="btn btn-secondary btn-sm flex-center" onclick="window.BotNBoltApp.exportLeadsDlrCsv('${tableKey}')" title="Export Current List to CSV">
                  <i data-lucide="download"></i> Export CSV
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 40px; padding-left: 24px;">
                      <input type="checkbox" id="chk-all-${tableKey}" style="width:16px; height:16px; cursor:pointer;" ${checked.length === allRowIds.length && allRowIds.length > 0 ? 'checked' : ''} onchange="window.BotNBoltApp.handleSelectAllChange('${tableKey}', this.checked, ${JSON.stringify(allRowIds).replace(/"/g, '&quot;')})">
                    </th>
                    <th>Customer Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Repair Category</th>
                    <th>Interested Products</th>
                    <th>Location Area</th>
                    <th>Lead Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${paginated.length === 0 ? `
                    <tr>
                      <td colspan="10" style="text-align:center; padding: 32px; color: var(--text-secondary);">No records match your search filter.</td>
                    </tr>
                  ` : paginated.map((lead, idx) => `
                    <tr>
                      <td style="padding-left: 24px;">
                        <input type="checkbox" id="chk-${tableKey}-lead-${idx}" style="width:16px; height:16px; cursor:pointer;" ${checked.includes('lead-' + idx) ? 'checked' : ''} onchange="window.BotNBoltApp.handleCheckboxChange('${tableKey}', 'lead-${idx}', this.checked)">
                      </td>
                      <td><strong>${lead.name}</strong></td>
                      <td>${lead.phone}</td>
                      <td>${lead.email}</td>
                      <td>${lead.repairType}</td>
                      <td><code>${lead.interestedProducts}</code></td>
                      <td>${lead.location}</td>
                      <td><span class="badge ${lead.leadStatus === 'New' ? 'badge-danger' : lead.leadStatus === 'Closed' ? 'badge-success' : 'badge-warning'}">${lead.leadStatus}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Table Pagination Footer -->
            <div class="table-footer-pagination">
              <div>
                Showing <strong>${filtered.length === 0 ? 0 : pageIndex * pageSize + 1}</strong> to 
                <strong>${Math.min((pageIndex + 1) * pageSize, filtered.length)}</strong> of 
                <strong>${filtered.length}</strong> leads
              </div>
              <div class="pagination-controls">
                <span style="margin-right:8px;">Rows per page:</span>
                <select class="rows-selector" style="margin-right:16px;" onchange="window.BotNBoltApp.handleTablePageSizeChange('${tableKey}', this.value)">
                  <option value="5" ${pageSize === 5 ? 'selected' : ''}>5</option>
                  <option value="10" ${pageSize === 10 ? 'selected' : ''}>10</option>
                  <option value="25" ${pageSize === 25 ? 'selected' : ''}>25</option>
                </select>
                <button class="pagination-btn" ${pageIndex === 0 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex - 1})" title="Previous Page"><i data-lucide="chevron-left" style="width:14px; height:14px;"></i></button>
                <span style="font-weight:600; margin:0 8px;">Page ${pageIndex + 1} of ${totalPages}</span>
                <button class="pagination-btn" ${pageIndex >= totalPages - 1 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex + 1})" title="Next Page"><i data-lucide="chevron-right" style="width:14px; height:14px;"></i></button>
              </div>
            </div>

          </div>
        `;
        lucide.createIcons();
      } else if (menu === 'profile') {
        canvas.innerHTML = `
          <div style="display:grid; grid-template-columns: 1fr 2fr; gap: 24px; animation: fadeIn 0.3s ease;">
            
            <!-- Left Column: Outlet Profile Card -->
            <div style="display:flex; flex-direction:column; gap:20px;">
              <div class="card" style="padding: 24px; text-align: center;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%); margin: 0 auto 16px auto; display:flex; align-items:center; justify-content:center; color:white; font-size:1.8rem; font-weight:800; box-shadow: 0 4px 14px rgba(37,99,235,0.3)">
                  ${db.storeName.substring(0, 2).toUpperCase()}
                </div>
                <h4 style="margin:0 0 4px 0; font-size:1.2rem; font-weight:800; color:var(--text-primary);">${db.storeName}</h4>
                <p style="margin:0 0 16px 0; font-size:0.78rem; color:var(--text-secondary);">Outlet ID: <code style="font-weight:700; color:var(--primary);">DLR-${db.storeName.replace(/\s+/g, '-').toUpperCase()}</code></p>
                
                <div style="display:flex; justify-content:center; gap:8px; margin-bottom:20px;">
                  <span class="badge badge-success" style="padding:4px 10px; font-size:0.75rem;">Online</span>
                  <span class="badge badge-info" style="padding:4px 10px; font-size:0.75rem;">Scanner Active</span>
                </div>

                <div style="border-top:1px solid var(--border-color); padding-top:16px; text-align:left; display:flex; flex-direction:column; gap:12px; font-size:0.8rem;">
                  <div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--text-secondary);">Operating Region</span>
                    <strong style="color:var(--text-primary);">${db.city}</strong>
                  </div>
                  <div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--text-secondary);">Total Sync Scans</span>
                    <strong style="color:var(--text-primary);">${db.kpis.totalRepairRequests.value}</strong>
                  </div>
                  <div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--text-secondary);">Conversion Ratio</span>
                    <strong style="color:var(--success);">${db.kpis.ordersGenerated.value} Orders</strong>
                  </div>
                </div>
              </div>

              <!-- Quick Stats widget -->
              <div class="card" style="padding:20px; border-left:4px solid var(--warning);">
                <h4 style="margin:0 0 8px 0; font-size:0.9rem; font-weight:700; color:var(--text-primary);">Terminal Configuration</h4>
                <div style="font-size:0.75rem; color:var(--text-secondary); line-height:1.4;">
                  Model: <strong>ScannerPro v3.2</strong><br>
                  Firmware: <strong>v4.8.1-release</strong><br>
                  Outbound Ports: <strong>SSL-443 Verified</strong>
                </div>
              </div>
            </div>

            <!-- Right Column: Settings Form -->
            <div class="card" style="padding: 28px;">
              <h3 style="margin:0 0 20px 0; font-size:1.25rem; font-weight:800; color:var(--text-primary);">Outlet Configurations</h3>
              
              <div style="display:flex; flex-direction:column; gap:16px;">
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                  <div class="form-group">
                    <label class="form-label" style="font-weight:600; margin-bottom:6px; font-size:0.8rem;">Store Outlet Name</label>
                    <input type="text" class="form-control" value="${db.storeName}" id="store-name-input">
                  </div>
                  <div class="form-group">
                    <label class="form-label" style="font-weight:600; margin-bottom:6px; font-size:0.8rem;">Location City</label>
                    <input type="text" class="form-control" value="${db.city}" id="store-city-input">
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" style="font-weight:600; margin-bottom:6px; font-size:0.8rem;">Store Physical Address</label>
                  <input type="text" class="form-control" value="${db.profile ? db.profile.address || '401 Bay St., Toronto, ON M5H 2Y4' : '401 Bay St., Toronto, ON M5H 2Y4'}" id="store-addr-input">
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                  <div class="form-group">
                    <label class="form-label" style="font-weight:600; margin-bottom:6px; font-size:0.8rem;">Operational Hours</label>
                    <input type="text" class="form-control" value="${db.profile ? db.profile.hours || 'Mon-Sat: 08:00 AM - 08:00 PM' : 'Mon-Sat: 08:00 AM - 08:00 PM'}" id="store-hours-input">
                  </div>
                  <div class="form-group">
                    <label class="form-label" style="font-weight:600; margin-bottom:6px; font-size:0.8rem;">API Sync Limit (Hourly)</label>
                    <input type="number" class="form-control" value="250" readonly style="background:var(--bg-app); cursor:not-allowed;">
                  </div>
                </div>

                <div style="border-top:1px solid var(--border-color); margin-top:12px; padding-top:16px;">
                  <h4 style="margin:0 0 12px 0; font-size:0.95rem; font-weight:700; color:var(--text-primary);">Preferences & Notifications</h4>
                  
                  <div style="display:flex; flex-direction:column; gap:12px;">
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer; font-size:0.82rem; color:var(--text-secondary);">
                      <input type="checkbox" checked style="width:16px; height:16px; cursor:pointer;">
                      Enable email reports for failed AI scan analysis
                    </label>
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer; font-size:0.82rem; color:var(--text-secondary);">
                      <input type="checkbox" checked style="width:16px; height:16px; cursor:pointer;">
                      Sync local inventory database with material recommendations automatically
                    </label>
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer; font-size:0.82rem; color:var(--text-secondary);">
                      <input type="checkbox" style="width:16px; height:16px; cursor:pointer;">
                      Low Stock Alerts (Push notification when stock is below 10 units)
                    </label>
                  </div>
                </div>

                <div style="margin-top:16px; display:flex; justify-content:flex-end; gap:12px;">
                  <button class="btn btn-secondary" onclick="window.BotNBoltApp.navigate('overview')" style="padding:10px 18px;">Cancel</button>
                  <button class="btn btn-primary" onclick="alert('Store configuration successfully synchronized and saved!')" style="padding:10px 22px;">Save Configurations</button>
                </div>
              </div>

            </div>

          </div>
        `;
      } else if (menu === 'tickets') {
        const tableKey = 'tickets_dlr';
        const searchQuery = (this.state.searchQueries[tableKey] || '').toLowerCase();
        const pageSize = this.state.pageSizes[tableKey] || 5;
        const pageIndex = this.state.pageIndices[tableKey] || 0;

        const filters = this.state.dropdownFilters[tableKey] || {};
        const filterPriority = filters.priority || '';
        const filterStatus = filters.status || '';

        // Safety fallback checks
        if (!this.state.db.supportAdmin) {
          this.state.db.supportAdmin = JSON.parse(JSON.stringify(window.BotNBoltMockData.supportAdmin || {}));
        }
        if (!this.state.db.supportAdmin.tickets) {
          this.state.db.supportAdmin.tickets = JSON.parse(JSON.stringify((window.BotNBoltMockData && window.BotNBoltMockData.supportAdmin && window.BotNBoltMockData.supportAdmin.tickets) || []));
        }

        // Get tickets specifically raised by this dealer outlet
        const myTickets = this.state.db.supportAdmin.tickets.filter(t => t.dealer === db.storeName);

        // Calculate counts
        const totalCount = myTickets.length;
        const openCount = myTickets.filter(t => t.status === 'Open').length;
        const resolvedCount = myTickets.filter(t => t.status === 'Resolved').length;

        // Filter rows
        const filtered = myTickets.filter(tkt => {
          const matchesSearch = tkt.id.toLowerCase().includes(searchQuery) ||
            (tkt.issueType || tkt.problem || '').toLowerCase().includes(searchQuery) ||
            (tkt.assignedTo || tkt.assigned || '').toLowerCase().includes(searchQuery) ||
            tkt.status.toLowerCase().includes(searchQuery);

          const matchesPriority = !filterPriority || tkt.priority === filterPriority;
          const matchesStatus = !filterStatus || tkt.status === filterStatus;

          return matchesSearch && matchesPriority && matchesStatus;
        });

        // Paginate rows
        const paginated = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
        const totalPages = Math.ceil(filtered.length / pageSize) || 1;
        const allRowIds = filtered.map(t => t.id);
        const checked = this.state.checkedRows[tableKey] || [];

        // Helper style for active card selection indication
        const getActiveCardStyle = (currStatus, accentColor) => {
          if (filterStatus === currStatus) {
            return `box-shadow: 0 0 0 2px ${accentColor}; transform: translateY(-2px); font-weight: 700;`;
          }
          return '';
        };

        canvas.innerHTML = `
          <!-- KPI Cards for Dealer Support Tickets -->
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px;">
            
            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', '')" 
                 style="padding:16px; border-left:4px solid var(--primary); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(37,99,235,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('', 'var(--primary)')}"
                 onmouseenter="if('${filterStatus}' !== '') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(37,99,235,0.1)'; }" 
                 onmouseleave="if('${filterStatus}' !== '') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Total Tickets</div>
                  <strong style="font-size:1.4rem; color:var(--text-primary);">${totalCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(37,99,235,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="ticket" style="color:var(--primary); width:16px; height:16px;"></i>
                </div>
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Show all tickets raised by this outlet</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Open')" 
                 style="padding:16px; border-left:4px solid var(--danger); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(239,68,68,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('Open', 'var(--danger)')}"
                 onmouseenter="if('${filterStatus}' !== 'Open') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(239,68,68,0.1)'; }" 
                 onmouseleave="if('${filterStatus}' !== 'Open') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Open Tickets</div>
                  <strong style="font-size:1.4rem; color:var(--danger);">${openCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(239,68,68,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="alert-circle" style="color:var(--danger); width:16px; height:16px;"></i>
                </div>
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Filter by active open support cases</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Resolved')" 
                 style="padding:16px; border-left:4px solid var(--success); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('Resolved', 'var(--success)')}"
                 onmouseenter="if('${filterStatus}' !== 'Resolved') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(16,185,129,0.1)'; }" 
                 onmouseleave="if('${filterStatus}' !== 'Resolved') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Resolved</div>
                  <strong style="font-size:1.4rem; color:var(--success);">${resolvedCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(16,185,129,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="check-circle" style="color:var(--success); width:16px; height:16px;"></i>
                </div>
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Filter by resolved cases</div>
            </div>

          </div>

          <div class="card">
            <div class="card-header">
              <div style="display:flex; flex-direction:column; gap:4px;">
                <span class="card-title">Support Tickets History</span>
                ${filterStatus ? `<span style="font-size: 0.78rem; color: var(--text-secondary);">Active Filter: <strong style="color: var(--primary); text-transform: uppercase;">${filterStatus}</strong></span>` : ''}
              </div>
            </div>

            <!-- Table Actions Row -->
            <div class="table-header-actions" style="padding:0 24px; margin-top:10px;">
              <div class="table-actions-left">
                <div class="search-wrapper">
                  <i data-lucide="search"></i>
                  <input type="text" class="form-control search-input" id="search-${tableKey}" placeholder="Search my tickets..." value="${this.state.searchQueries[tableKey] || ''}" oninput="window.BotNBoltApp.handleTableSearch('${tableKey}', this.value)">
                </div>

                <!-- Priority Filter -->
                <select class="form-control dropdown-filter" style="width:130px; font-size:0.85rem; padding:4px 8px; height:32px;" onchange="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'priority', this.value)">
                  <option value="">All Priorities</option>
                  <option value="High" ${filterPriority === 'High' ? 'selected' : ''}>High</option>
                  <option value="Medium" ${filterPriority === 'Medium' ? 'selected' : ''}>Medium</option>
                  <option value="Low" ${filterPriority === 'Low' ? 'selected' : ''}>Low</option>
                </select>

                <!-- Bulk Actions -->
                <select class="bulk-actions-select" id="bulk-${tableKey}" style="${checked.length > 0 ? 'display:block;' : 'display:none;'}" onchange="window.BotNBoltApp.triggerBulkAction('${tableKey}', this.value)">
                  <option value="">Bulk Actions (${checked.length} Selected)</option>
                  <option value="export">Export Selected</option>
                </select>
              </div>
              <div class="table-actions-right">
                <button class="btn btn-secondary btn-sm flex-center" onclick="window.BotNBoltApp.exportToCsv('Dealer_My_Tickets.csv', ['Ticket ID', 'Issue', 'Priority', 'Assigned Agent', 'SLA', 'Status', 'Date'], ${JSON.stringify(filtered.map(t => [t.id, t.issueType || t.problem, t.priority, t.assignedTo || t.assigned, t.responseTime, t.status, t.date])).replace(/"/g, '&quot;')})" title="Export List to CSV">
                  <i data-lucide="download"></i> Export CSV
                </button>
              </div>
            </div>

            <!-- Table content -->
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width:40px; padding-left:24px;">
                      <input type="checkbox" id="chk-all-${tableKey}" style="width:16px; height:16px; cursor:pointer;" ${checked.length === allRowIds.length && allRowIds.length > 0 ? 'checked' : ''} onchange="window.BotNBoltApp.handleSelectAllChange('${tableKey}', this.checked, ${JSON.stringify(allRowIds).replace(/"/g, '&quot;')})">
                    </th>
                    <th>Ticket ID</th>
                    <th>Issue Category</th>
                    <th>Priority</th>
                    <th>Assigned Support Agent</th>
                    <th>Response SLA</th>
                    <th>Status</th>
                    <th>Date Raised</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${paginated.length === 0 ? `
                    <tr>
                      <td colspan="9" style="text-align:center; padding:32px; color:var(--text-secondary);">No support tickets logged.</td>
                    </tr>
                  ` : paginated.map(tkt => `
                    <tr style="cursor:pointer;" onclick="window.BotNBoltApp.navigateToTicket('${tkt.id}')" onmouseenter="this.style.backgroundColor='var(--bg-primary)'" onmouseleave="this.style.backgroundColor=''">
                      <td style="padding-left: 24px;" onclick="event.stopPropagation();">
                        <input type="checkbox" id="chk-${tableKey}-${tkt.id}" style="width:16px; height:16px; cursor:pointer;" ${checked.includes(tkt.id) ? 'checked' : ''} onchange="window.BotNBoltApp.handleCheckboxChange('${tableKey}', '${tkt.id}', this.checked)">
                      </td>
                      <td onclick="event.stopPropagation();"><a href="#" style="font-weight:700; color:var(--primary); text-decoration:none;" onclick="event.preventDefault(); window.BotNBoltApp.navigateToTicket('${tkt.id}')"><code>${tkt.id}</code></a></td>
                      <td><strong>${tkt.issueType || tkt.problem || 'System Issue'}</strong></td>
                      <td><span class="badge ${tkt.priority === 'High' ? 'badge-danger' : tkt.priority === 'Medium' ? 'badge-warning' : 'badge-info'}">${tkt.priority}</span></td>
                      <td><strong>${tkt.assignedTo || tkt.assigned || 'Unassigned'}</strong></td>
                      <td>${tkt.responseTime}</td>
                      <td><span class="badge ${tkt.status === 'Open' ? 'badge-danger' : tkt.status === 'Resolved' ? 'badge-success' : 'badge-warning'}">${tkt.status}</span></td>
                      <td>${tkt.date}</td>
                      <td onclick="event.stopPropagation();">
                        <button class="btn btn-secondary btn-sm" onclick="window.BotNBoltApp.navigateToTicket('${tkt.id}')">View Details</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Table Pagination Footer -->
            <div class="table-footer-pagination">
              <div>
                Showing <strong>${filtered.length === 0 ? 0 : pageIndex * pageSize + 1}</strong> to 
                <strong>${Math.min((pageIndex + 1) * pageSize, filtered.length)}</strong> of 
                <strong>${filtered.length}</strong> support cases
              </div>
              <div class="pagination-controls">
                <span style="margin-right:8px;">Rows per page:</span>
                <select class="rows-selector" style="margin-right:16px;" onchange="window.BotNBoltApp.handleTablePageSizeChange('${tableKey}', this.value)">
                  <option value="5" ${pageSize === 5 ? 'selected' : ''}>5</option>
                  <option value="10" ${pageSize === 10 ? 'selected' : ''}>10</option>
                  <option value="25" ${pageSize === 25 ? 'selected' : ''}>25</option>
                </select>
                <button class="pagination-btn" ${pageIndex === 0 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex - 1})" title="Previous Page"><i data-lucide="chevron-left" style="width:14px; height:14px;"></i></button>
                <span style="font-weight:600; margin:0 8px;">Page ${pageIndex + 1} of ${totalPages}</span>
                <button class="pagination-btn" ${pageIndex >= totalPages - 1 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex + 1})" title="Next Page"><i data-lucide="chevron-right" style="width:14px; height:14px;"></i></button>
              </div>
            </div>

          </div>
        `;
        lucide.createIcons();
      }
    }

    openAiScanModal(requestId) {
      const req = this.state.db.dealer.repairRequests.find(r => r.id === requestId);
      if (!req) return;

      const title = `AI Scan Report: ${req.id} - ${req.customerName}`;
      const body = `
        <div class="ai-scan-viewer">
          <!-- Left side: Bounding boxes image -->
          <div class="ai-image-viewport">
            <!-- Simulated blueprint/damage image using gradient -->
            <div style="width:100%; height:100%; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); display:flex; align-items:center; justify-content:center; flex-direction:column; position:relative;">
              <div style="border: 2px dashed rgba(255,255,255,0.1); padding: 40px; border-radius: 8px; text-align:center; color:rgba(255,255,255,0.3)">
                <i data-lucide="image" style="width:48px; height:48px; margin-bottom:12px;"></i>
                <div style="font-size:0.8rem;">AI SCAN IMAGE PREVIEW</div>
                <div style="font-size:0.7rem; margin-top:4px;">${req.image}</div>
              </div>
              
              <!-- Absolute overlays representing damage annotation -->
              ${req.aiDetections.map(det => `
                <div class="ai-box" style="left:${det.box[0]}%; top:${det.box[1]}%; width:${det.box[2] - det.box[0]}%; height:${det.box[3] - det.box[1]}%;">
                  <span class="ai-box-label">${det.type} (${det.confidence.toFixed(1)}%)</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right side: Details panel -->
          <div style="display:flex; flex-direction:column; justify-content:space-between; height:100%;">
            <div>
              <h4 style="font-weight:700; margin-bottom:12px; font-size:1.1rem; color:var(--primary);">${req.repairType}</h4>
              <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:16px;">${req.damageDesc}</p>
              
              <div class="card" style="padding:16px; background-color:var(--primary-light); border:none; margin-bottom:16px;">
                <div style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:var(--primary); margin-bottom:6px;">Suggested Materials & Products</div>
                <ul style="padding-left:18px; font-size:0.8rem; line-height:1.6;">
                  ${req.suggestedMaterials.map(mat => `<li>${mat}</li>`).join('')}
                </ul>
              </div>

              <div style="font-size:0.85rem; margin-bottom:8px;"><strong>Calculated Margin Cost:</strong></div>
              <div style="font-size:1.5rem; font-weight:800; color:var(--text-primary);">$${req.estimatedCost.toFixed(2)}</div>
            </div>

            <div style="margin-top:24px; display:flex; flex-direction:column; gap:8px;">
              <button class="btn btn-primary" style="width:100%;" onclick="window.BotNBoltApp.approveEstimate('${req.id}')">Approve Estimate & Generate Quote</button>
              <button class="btn btn-secondary" style="width:100%;" onclick="alert('Contact details: 555-0192 / customer@email.com')">Contact Customer</button>
            </div>
          </div>
        </div>
      `;

      this.showModal(title, body, '');
    }

    approveEstimate(id) {
      const req = this.state.db.dealer.repairRequests.find(r => r.id === id);
      if (req) {
        req.status = 'Quote Sent';
        this.saveState();
        this.closeModalForce();
        this.renderCurrentView();
        alert(`Estimate approved. Quote sent to customer for ${id}.`);
      }
    }

    // ----------------------------------------------------
    // SUPPORT ADMIN VIEWS
    // ----------------------------------------------------
    renderSupportAdminView(canvas, menu) {
      if (!this.state.db.supportAdmin) {
        this.state.db.supportAdmin = JSON.parse(JSON.stringify(window.BotNBoltMockData.supportAdmin || {}));
        this.saveState();
      }
      const db = this.state.db.supportAdmin;
      if (!db.tickets) {
        db.tickets = JSON.parse(JSON.stringify((window.BotNBoltMockData && window.BotNBoltMockData.supportAdmin && window.BotNBoltMockData.supportAdmin.tickets) || []));
        this.saveState();
      }
      if (!db.companySupportOverview) {
        db.companySupportOverview = JSON.parse(JSON.stringify((window.BotNBoltMockData && window.BotNBoltMockData.supportAdmin && window.BotNBoltMockData.supportAdmin.companySupportOverview) || []));
        this.saveState();
      }
      if (!db.aiErrorReports) {
        db.aiErrorReports = JSON.parse(JSON.stringify((window.BotNBoltMockData && window.BotNBoltMockData.supportAdmin && window.BotNBoltMockData.supportAdmin.aiErrorReports) || []));
        this.saveState();
      }
      if (!db.dealerSupport) {
        db.dealerSupport = JSON.parse(JSON.stringify((window.BotNBoltMockData && window.BotNBoltMockData.supportAdmin && window.BotNBoltMockData.supportAdmin.dealerSupport) || []));
        this.saveState();
      }
      if (!db.liveMonitoring) {
        db.liveMonitoring = JSON.parse(JSON.stringify((window.BotNBoltMockData && window.BotNBoltMockData.supportAdmin && window.BotNBoltMockData.supportAdmin.liveMonitoring) || {}));
        this.saveState();
      }

      if (menu === 'overview') {
        const openTickets = db.tickets.filter(t => t.status === 'Open').length;
        const inProgressTickets = db.tickets.filter(t => t.status === 'In Progress').length;
        const resolvedTickets = db.tickets.filter(t => t.status === 'Resolved').length;
        const pendingErrors = db.aiErrorReports.filter(e => e.status === 'Pending').length;
        const totalCompanies = db.companySupportOverview.length;
        const activeIntegrations = db.companySupportOverview.filter(c => c.integrationStatus === 'Active').length;
        const uptimePercent = 99;

        canvas.innerHTML = `
          <!-- 5-Column KPI Gradient Cards -->
          <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:20px; margin-bottom:24px;">

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.navigate('tickets')" style="padding:16px; border-left:4px solid var(--danger); display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(239,68,68,0.05) 100%); cursor:pointer; transition:transform 0.15s,box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(239,68,68,0.15)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Total Tickets</div>
                <strong style="font-size:1.4rem; color:var(--text-primary);">${db.tickets.length}</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="ticket" style="color:var(--danger); width:20px; height:20px; margin-bottom:4px;"></i>
                <span style="color:var(--danger); font-size:0.7rem; font-weight:600; background:rgba(239,68,68,0.1); padding:2px 6px; border-radius:4px;">${openTickets} Open</span>
              </div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.navigate('tickets')" style="padding:16px; border-left:4px solid var(--warning); display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.05) 100%); cursor:pointer; transition:transform 0.15s,box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(245,158,11,0.15)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Open Tickets</div>
                <strong style="font-size:1.4rem; color:var(--text-primary);">${openTickets}</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="inbox" style="color:var(--warning); width:20px; height:20px; margin-bottom:4px;"></i>
                <span style="color:var(--warning); font-size:0.7rem; font-weight:600; background:rgba(245,158,11,0.1); padding:2px 6px; border-radius:4px;">Needs action</span>
              </div>
            </div>

            <div class="card kpi-card-gradient" style="padding:16px; border-left:4px solid var(--success); display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.05) 100%); transition:transform 0.15s,box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(16,185,129,0.15)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Response SLA</div>
                <strong style="font-size:1.4rem; color:var(--text-primary);">12 min</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="clock" style="color:var(--success); width:20px; height:20px; margin-bottom:4px;"></i>
                <span style="color:var(--success); font-size:0.7rem; font-weight:600; background:rgba(16,185,129,0.1); padding:2px 6px; border-radius:4px;">≤15 min target</span>
              </div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.navigate('ai_errors')" style="padding:16px; border-left:4px solid #f59e0b; display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.05) 100%); cursor:pointer; transition:transform 0.15s,box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(245,158,11,0.15)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">AI Error Reports</div>
                <strong style="font-size:1.4rem; color:var(--text-primary);">${db.aiErrorReports.length}</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="alert-triangle" style="color:#f59e0b; width:20px; height:20px; margin-bottom:4px;"></i>
                <span style="color:var(--danger); font-size:0.7rem; font-weight:600; background:rgba(239,68,68,0.1); padding:2px 6px; border-radius:4px;">${pendingErrors} Pending</span>
              </div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.navigate('monitoring')" style="padding:16px; border-left:4px solid #10b981; display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.05) 100%); cursor:pointer; transition:transform 0.15s,box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(16,185,129,0.15)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Server Status</div>
                <strong style="font-size:1.4rem; color:var(--success);">Healthy</strong>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end;">
                <i data-lucide="server" style="color:#10b981; width:20px; height:20px; margin-bottom:4px;"></i>
                <span style="color:var(--success); font-size:0.7rem; font-weight:600; background:rgba(16,185,129,0.1); padding:2px 6px; border-radius:4px;">99.9% uptime</span>
              </div>
            </div>

          </div>

          <!-- Premium Split Layout -->
          <div class="layout-split" style="grid-template-columns: 2fr 1fr; gap: 24px;">

            <!-- LEFT COLUMN -->
            <div style="display:flex; flex-direction:column; gap:24px;">

              <!-- Ticket Trend Chart -->
              <div class="card" style="padding:24px;">
                <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:20px;">
                  <span class="card-title" style="font-size:1rem; font-weight:700;">Ticket Volume Trend (6 Months)</span>
                  <button class="btn btn-secondary btn-sm" onclick="window.BotNBoltApp.navigate('tickets')">Manage Tickets →</button>
                </div>
                <div style="height:250px;"><canvas id="spTicketTrendChart"></canvas></div>
              </div>

              <!-- Tickets by Category Bar -->
              <div class="card" style="padding:24px;">
                <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:20px;">
                  <span class="card-title" style="font-size:1rem; font-weight:700;">Open Tickets By Category</span>
                </div>
                <div style="height:230px;"><canvas id="spTicketCatChart"></canvas></div>
              </div>

              <!-- API Latency Chart -->
              <div class="card" style="padding:24px;">
                <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:20px;">
                  <span class="card-title" style="font-size:1rem; font-weight:700;">Live API Health Latency (ms)</span>
                  <button class="btn btn-secondary btn-sm" onclick="window.BotNBoltApp.navigate('monitoring')">View System →</button>
                </div>
                <div style="height:200px;"><canvas id="spLatencyChart"></canvas></div>
              </div>

            </div>

            <!-- RIGHT COLUMN -->
            <div style="display:flex; flex-direction:column; gap:24px;">

              <!-- Circular: System Uptime -->
              <div class="card" style="text-align:center; padding:20px;">
                <div class="card-header" style="justify-content:center; padding:0 0 12px 0; border-bottom:1px solid var(--border-color); margin-bottom:16px;">
                  <span class="card-title">System Uptime</span>
                </div>
                <div style="position:relative; width:130px; height:130px; margin:16px auto;">
                  <svg width="130" height="130" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="45" stroke="var(--bg-app)" stroke-width="8" fill="transparent"/>
                    <circle cx="60" cy="60" r="45" stroke="#10b981" stroke-width="8" fill="transparent"
                            stroke-dasharray="283" stroke-dashoffset="${Math.round(283 * (1 - uptimePercent / 100))}" stroke-linecap="round"/>
                  </svg>
                  <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center;">
                    <div style="font-size:1.3rem; font-weight:700; color:var(--text-primary);">${uptimePercent}%</div>
                    <div style="font-size:0.65rem; color:var(--text-secondary);">Uptime</div>
                  </div>
                </div>
                <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-top:8px;">
                  <span style="width:8px;height:8px;border-radius:50%;background:#10b981;display:inline-block;box-shadow:0 0 6px #10b981;"></span>
                  <p style="font-size:0.75rem; color:var(--text-secondary); margin:0;">All services operational</p>
                </div>
              </div>

              <!-- Brand Integrations -->
              <div class="card" style="padding:20px;">
                <div class="card-header" style="padding:0 0 12px 0; border-bottom:1px solid var(--border-color); margin-bottom:16px;">
                  <span class="card-title">Brand Integrations</span>
                </div>
                <div style="height:180px;"><canvas id="spIntegrationChart"></canvas></div>
              </div>

              <!-- Alerts Feed -->
              <div class="card" style="padding:24px;">
                <div class="card-header" style="padding:0 0 16px 0; border-bottom:1px solid var(--border-color); margin-bottom:20px;">
                  <span class="card-title" style="font-size:1rem; font-weight:700;">System Alerts</span>
                </div>
                <div style="position:relative; padding-left:24px; display:flex; flex-direction:column; gap:20px;">
                  <div style="position:absolute; left:7px; top:8px; bottom:8px; width:2px; background:var(--border-color);"></div>
                  ${db.aiErrorReports.slice(0, 3).map((err, i) => {
          const dotColors = ['var(--danger)', 'var(--warning)', 'var(--primary)'];
          const glows = ['rgba(239,68,68,0.15)', 'rgba(245,158,11,0.15)', 'rgba(37,99,235,0.15)'];
          return `
                      <div style="position:relative; display:flex; gap:16px;">
                        <div style="position:absolute; left:-22px; top:4px; width:12px; height:12px; border-radius:50%; background:${dotColors[i]}; border:2.5px solid var(--bg-card); box-shadow:0 0 0 3px ${glows[i]};"></div>
                        <div style="flex-grow:1;">
                          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <strong style="font-size:0.83rem; color:var(--text-primary);">${err.wrongDetectionType}</strong>
                            <span class="badge ${err.status === 'Pending' ? 'badge-danger' : err.status === 'Resolved' ? 'badge-success' : 'badge-warning'}" style="font-size:0.65rem;">${err.status}</span>
                          </div>
                          <p style="font-size:0.78rem; color:var(--text-secondary); margin:0;">Report: <code style="font-size:0.72rem;">${err.id}</code> — Confidence: ${err.aiConfidenceScore.toFixed(1)}%</p>
                        </div>
                      </div>
                    `;
        }).join('')}
                </div>
              </div>

            </div>
          </div>
        `;

        const colors = this.getChartColors();

        // Ticket Trend
        const ctxTrend = document.getElementById('spTicketTrendChart');
        if (ctxTrend) {
          this.state.charts.spTrend = new Chart(ctxTrend.getContext('2d'), {
            type: 'line',
            data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [
                { label: 'Total Tickets', data: [42, 58, 51, 67, 72, 78], borderColor: colors.primary, backgroundColor: colors.primaryGlow, fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4 },
                { label: 'Resolved', data: [30, 44, 45, 55, 60, 65], borderColor: colors.success, backgroundColor: 'rgba(16,185,129,0.05)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4 }
              ]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { color: colors.grid }, ticks: { color: colors.text } }, y: { grid: { color: colors.grid }, ticks: { color: colors.text } } } }
          });
        }

        // Ticket Category Bar
        const ctxTkt = document.getElementById('spTicketCatChart');
        if (ctxTkt) {
          this.state.charts.tktCat = new Chart(ctxTkt.getContext('2d'), {
            type: 'bar',
            data: {
              labels: ['AI Scan Mismatch', 'Billing Problems', 'Login Error', 'API Lockouts'],
              datasets: [{ label: 'Ticket count', data: [8, 3, 5, 2], backgroundColor: [colors.danger, colors.warning, colors.primary, '#a855f7'], borderRadius: 4 }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { color: colors.grid }, ticks: { color: colors.text } }, y: { grid: { color: colors.grid }, ticks: { color: colors.text } } } }
          });
        }

        // Latency Chart
        const ctxLat = document.getElementById('spLatencyChart');
        if (ctxLat) {
          this.state.charts.latency = new Chart(ctxLat.getContext('2d'), {
            type: 'line',
            data: {
              labels: ['12:00', '12:05', '12:10', '12:15', '12:20', '12:25'],
              datasets: [{ label: 'Latency (ms)', data: [120, 140, 95, 110, 105, 130], borderColor: colors.primary, backgroundColor: colors.primaryGlow, fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4 }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { color: colors.grid }, ticks: { color: colors.text } }, y: { grid: { color: colors.grid }, ticks: { color: colors.text } } } }
          });
        }

        // Integration Status Doughnut
        const ctxInt = document.getElementById('spIntegrationChart');
        if (ctxInt) {
          this.state.charts.spIntegration = new Chart(ctxInt.getContext('2d'), {
            type: 'doughnut',
            data: {
              labels: ['Active', 'Partial', 'Blocked'],
              datasets: [{ data: [activeIntegrations, 1, totalCompanies - activeIntegrations - 1], backgroundColor: [colors.success, colors.warning, colors.danger] }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: colors.text, font: { size: 10 } } } } }
          });
        }



      } else if (menu === 'tickets') {
        const tableKey = 'tickets_sp';
        const searchQuery = (this.state.searchQueries[tableKey] || '').toLowerCase();
        const pageSize = this.state.pageSizes[tableKey] || 5;
        const pageIndex = this.state.pageIndices[tableKey] || 0;

        const filters = this.state.dropdownFilters[tableKey] || {};
        const filterCompany = filters.company || '';
        const filterCity = filters.city || '';
        const filterPriority = filters.priority || '';
        const filterStatus = filters.status || '';

        // Filter rows
        const filtered = db.tickets.filter(tkt => {
          const matchesSearch = tkt.id.toLowerCase().includes(searchQuery) ||
            tkt.issueType.toLowerCase().includes(searchQuery) ||
            (tkt.customerName || tkt.raisedBy || '').toLowerCase().includes(searchQuery) ||
            (tkt.dealer || '').toLowerCase().includes(searchQuery) ||
            (tkt.assignedTo || '').toLowerCase().includes(searchQuery) ||
            tkt.status.toLowerCase().includes(searchQuery);

          const matchesCompany = !filterCompany || tkt.company === filterCompany;
          const matchesCity = !filterCity || (tkt.city || tkt.dealer || '') === filterCity;
          const matchesPriority = !filterPriority || tkt.priority === filterPriority;
          const matchesStatus = !filterStatus || tkt.status === filterStatus;

          return matchesSearch && matchesCompany && matchesCity && matchesPriority && matchesStatus;
        });

        // Paginate rows
        const paginated = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
        const totalPages = Math.ceil(filtered.length / pageSize) || 1;
        const allRowIds = filtered.map(t => t.id);
        const checked = this.state.checkedRows[tableKey] || [];

        const spTotalCount = db.tickets.length;
        const spOpenCount = db.tickets.filter(t => t.status === 'Open').length;
        const spInProgressCount = db.tickets.filter(t => t.status === 'In Progress').length;
        const spResolvedCount = db.tickets.filter(t => t.status === 'Resolved').length;

        // Helper style for active card selection indication
        const getActiveCardStyle = (currStatus, accentColor) => {
          if (filterStatus === currStatus) {
            return `box-shadow: 0 0 0 2px ${accentColor}; transform: translateY(-2px); font-weight: 700;`;
          }
          return '';
        };

        const ticketStatHeader = `
          <!-- Ticket KPI Cards for Interactive Filtering -->
          <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-bottom:24px;">
            
            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', '')" 
                 style="padding:20px; border-left:4px solid var(--primary); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(37,99,235,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('', 'var(--primary)')}"
                 onmouseenter="if('${filterStatus}' !== '') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(37,99,235,0.1)'; }" 
                 onmouseleave="if('${filterStatus}' !== '') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Total Tickets</div>
                  <strong style="font-size:1.8rem; color:var(--text-primary);">${spTotalCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(37,99,235,0.1); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="ticket" style="color:var(--primary); width:20px; height:20px;"></i>
                </div>
              </div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:8px;">Show all tickets</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Open')" 
                 style="padding:20px; border-left:4px solid var(--danger); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(239,68,68,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('Open', 'var(--danger)')}"
                 onmouseenter="if('${filterStatus}' !== 'Open') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(239,68,68,0.1)'; }" 
                 onmouseleave="if('${filterStatus}' !== 'Open') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Open</div>
                  <strong style="font-size:1.8rem; color:var(--danger);">${spOpenCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(239,68,68,0.1); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="inbox" style="color:var(--danger); width:20px; height:20px;"></i>
                </div>
              </div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:8px;">Filter by Open tickets</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'In Progress')" 
                 style="padding:20px; border-left:4px solid var(--warning); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('In Progress', 'var(--warning)')}"
                 onmouseenter="if('${filterStatus}' !== 'In Progress') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(245,158,11,0.1)'; }" 
                 onmouseleave="if('${filterStatus}' !== 'In Progress') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">In Progress</div>
                  <strong style="font-size:1.8rem; color:var(--warning);">${spInProgressCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(245,158,11,0.1); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="loader" style="color:var(--warning); width:20px; height:20px;"></i>
                </div>
              </div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:8px;">Filter by In Progress</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Resolved')" 
                 style="padding:20px; border-left:4px solid var(--success); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('Resolved', 'var(--success)')}"
                 onmouseenter="if('${filterStatus}' !== 'Resolved') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(16,185,129,0.1)'; }" 
                 onmouseleave="if('${filterStatus}' !== 'Resolved') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Resolved</div>
                  <strong style="font-size:1.8rem; color:var(--success);">${spResolvedCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(16,185,129,0.1); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="check-circle" style="color:var(--success); width:20px; height:20px;"></i>
                </div>
              </div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:8px;">Filter by Resolved tickets</div>
            </div>

          </div>
        `;

        canvas.innerHTML = ticketStatHeader + `
          <div class="card">
            <div class="card-header"><span class="card-title">Support Ticket Queues</span></div>
            
            <!-- Table Header Action Controls -->
            <div class="table-header-actions" style="padding: 0 24px; margin-top: 10px;">
              <div class="table-actions-left" style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
                <div class="search-wrapper">
                  <i data-lucide="search"></i>
                  <input type="text" class="form-control search-input" id="search-${tableKey}" placeholder="Search queue..." value="${this.state.searchQueries[tableKey] || ''}" oninput="window.BotNBoltApp.handleTableSearch('${tableKey}', this.value)">
                </div>

                <!-- Company Filter -->
                <select class="form-control dropdown-filter" style="width: 140px; font-size: 0.85rem; padding: 4px 8px; height: 32px;" onchange="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'company', this.value)">
                  <option value="">All Companies</option>
                  <option value="Home hardware" ${filterCompany === 'Home hardware' ? 'selected' : ''}>Home hardware</option>
                  <option value="My Depot" ${filterCompany === 'My Depot' ? 'selected' : ''}>My Depot</option>
                  <option value="Rona" ${filterCompany === 'Rona' ? 'selected' : ''}>Rona</option>
                  <option value="BMR Group" ${filterCompany === 'BMR Group' ? 'selected' : ''}>BMR Group</option>
                  <option value="Tottens" ${filterCompany === 'Tottens' ? 'selected' : ''}>Tottens</option>
                </select>

                <!-- City Filter -->
                <select class="form-control dropdown-filter" style="width: 130px; font-size: 0.85rem; padding: 4px 8px; height: 32px;" onchange="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'city', this.value)">
                  <option value="">All Cities</option>
                  <option value="Toronto" ${filterCity === 'Toronto' ? 'selected' : ''}>Toronto</option>
                  <option value="Montreal" ${filterCity === 'Montreal' ? 'selected' : ''}>Montreal</option>
                  <option value="Calvary" ${filterCity === 'Calvary' ? 'selected' : ''}>Calgary</option>
                  <option value="Calgary" ${filterCity === 'Calgary' ? 'selected' : ''}>Calgary</option>
                  <option value="Edmonton" ${filterCity === 'Edmonton' ? 'selected' : ''}>Edmonton</option>
                  <option value="Ottawa" ${filterCity === 'Ottawa' ? 'selected' : ''}>Ottawa</option>
                  <option value="HQ Admin" ${filterCity === 'HQ Admin' ? 'selected' : ''}>HQ Admin</option>
                </select>

                <!-- Priority Filter -->
                <select class="form-control dropdown-filter" style="width: 120px; font-size: 0.85rem; padding: 4px 8px; height: 32px;" onchange="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'priority', this.value)">
                  <option value="">All Priorities</option>
                  <option value="High" ${filterPriority === 'High' ? 'selected' : ''}>High</option>
                  <option value="Medium" ${filterPriority === 'Medium' ? 'selected' : ''}>Medium</option>
                  <option value="Low" ${filterPriority === 'Low' ? 'selected' : ''}>Low</option>
                </select>

                <!-- Status Filter -->
                <select class="form-control dropdown-filter" style="width: 120px; font-size: 0.85rem; padding: 4px 8px; height: 32px;" onchange="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', this.value)">
                  <option value="">All Statuses</option>
                  <option value="Open" ${filterStatus === 'Open' ? 'selected' : ''}>Open</option>
                  <option value="In Progress" ${filterStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
                  <option value="Resolved" ${filterStatus === 'Resolved' ? 'selected' : ''}>Resolved</option>
                </select>
                
                <select class="bulk-actions-select" id="bulk-${tableKey}" style="${checked.length > 0 ? 'display:block;' : 'display:none;'}" onchange="window.BotNBoltApp.triggerBulkAction('${tableKey}', this.value)">
                  <option value="">Bulk Actions (${checked.length} Selected)</option>
                  <option value="export">Export Selected</option>
                </select>
              </div>
              
              <div class="table-actions-right">
                <button class="btn btn-secondary btn-sm flex-center" onclick="window.BotNBoltApp.exportTicketsCsv('${tableKey}')" title="Export Current List to CSV">
                  <i data-lucide="download"></i> Export CSV
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 40px; padding-left: 24px;">
                      <input type="checkbox" id="chk-all-${tableKey}" style="width:16px; height:16px; cursor:pointer;" ${checked.length === allRowIds.length && allRowIds.length > 0 ? 'checked' : ''} onchange="window.BotNBoltApp.handleSelectAllChange('${tableKey}', this.checked, ${JSON.stringify(allRowIds).replace(/"/g, '&quot;')})">
                    </th>
                    <th>Ticket ID</th>
                    <th>Issue Category</th>
                    <th>Raised By</th>
                    <th>Dealer Outlet</th>
                    <th>City</th>
                    <th>Priority</th>
                    <th>Assigned Support Agent</th>
                    <th>Response Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${paginated.length === 0 ? `
                    <tr>
                      <td colspan="11" style="text-align:center; padding: 32px; color: var(--text-secondary);">No records match your search filter.</td>
                    </tr>
                  ` : paginated.map(tkt => `
                    <tr style="cursor:pointer;" onclick="window.BotNBoltApp.navigateToTicket('${tkt.id}')" onmouseenter="this.style.backgroundColor='var(--bg-primary)'" onmouseleave="this.style.backgroundColor=''">
                      <td style="padding-left: 24px;" onclick="event.stopPropagation();">
                        <input type="checkbox" id="chk-${tableKey}-${tkt.id}" style="width:16px; height:16px; cursor:pointer;" ${checked.includes(tkt.id) ? 'checked' : ''} onchange="window.BotNBoltApp.handleCheckboxChange('${tableKey}', '${tkt.id}', this.checked)">
                      </td>
                      <td onclick="event.stopPropagation();"><a href="#" style="font-weight:700; color:var(--primary); text-decoration:none;" onclick="event.preventDefault(); window.BotNBoltApp.navigateToTicket('${tkt.id}')"><code>${tkt.id}</code></a></td>
                      <td><strong>${tkt.issueType}</strong></td>
                      <td>${tkt.raisedBy}</td>
                      <td>${tkt.dealer}</td>
                      <td>${tkt.city || 'N/A'}</td>
                      <td><span class="badge ${tkt.priority === 'High' ? 'badge-danger' : 'badge-warning'}">${tkt.priority}</span></td>
                      <td>
                        ${tkt.assignedTo === 'Unassigned' ? `<span style="color:var(--text-secondary); font-style:italic;">Unassigned</span>` : `<strong>${tkt.assignedTo}</strong>`}
                      </td>
                      <td>${tkt.responseTime}</td>
                      <td><span class="badge ${tkt.status === 'Open' ? 'badge-danger' : tkt.status === 'Resolved' ? 'badge-success' : 'badge-warning'}">${tkt.status}</span></td>
                      <td onclick="event.stopPropagation();">
                        <button class="btn btn-secondary btn-sm" onclick="window.BotNBoltApp.navigateToTicket('${tkt.id}')">View Details</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Table Pagination Footer -->
            <div class="table-footer-pagination">
              <div>
                Showing <strong>${filtered.length === 0 ? 0 : pageIndex * pageSize + 1}</strong> to 
                <strong>${Math.min((pageIndex + 1) * pageSize, filtered.length)}</strong> of 
                <strong>${filtered.length}</strong> tickets
              </div>
              <div class="pagination-controls">
                <span style="margin-right:8px;">Rows per page:</span>
                <select class="rows-selector" style="margin-right:16px;" onchange="window.BotNBoltApp.handleTablePageSizeChange('${tableKey}', this.value)">
                  <option value="5" ${pageSize === 5 ? 'selected' : ''}>5</option>
                  <option value="10" ${pageSize === 10 ? 'selected' : ''}>10</option>
                  <option value="25" ${pageSize === 25 ? 'selected' : ''}>25</option>
                </select>
                <button class="pagination-btn" ${pageIndex === 0 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex - 1})" title="Previous Page"><i data-lucide="chevron-left" style="width:14px; height:14px;"></i></button>
                <span style="font-weight:600; margin:0 8px;">Page ${pageIndex + 1} of ${totalPages}</span>
                <button class="pagination-btn" ${pageIndex >= totalPages - 1 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex + 1})" title="Next Page"><i data-lucide="chevron-right" style="width:14px; height:14px;"></i></button>
              </div>
            </div>

          </div>
        `;
        lucide.createIcons();
      } else if (menu === 'ai_errors') {
        const tableKey = 'ai_errors_sp';
        const searchQuery = (this.state.searchQueries[tableKey] || '').toLowerCase();
        const pageSize = this.state.pageSizes[tableKey] || 5;
        const pageIndex = this.state.pageIndices[tableKey] || 0;

        const filters = this.state.dropdownFilters[tableKey] || {};
        const filterStatus = filters.status || '';

        // Filter rows
        const filtered = db.aiErrorReports.filter(err => {
          const matchesSearch = err.id.toLowerCase().includes(searchQuery) ||
            err.wrongDetectionType.toLowerCase().includes(searchQuery) ||
            err.expectedResult.toLowerCase().includes(searchQuery) ||
            err.reportedBy.toLowerCase().includes(searchQuery) ||
            err.status.toLowerCase().includes(searchQuery);

          const matchesStatus = !filterStatus || 
            (filterStatus === 'Pending' && (err.status === 'Pending' || err.status === 'In Review')) ||
            (filterStatus === 'Resolved' && err.status === 'Resolved');

          return matchesSearch && matchesStatus;
        });

        // Paginate rows
        const paginated = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
        const totalPages = Math.ceil(filtered.length / pageSize) || 1;
        const allRowIds = filtered.map(e => e.id);
        const checked = this.state.checkedRows[tableKey] || [];

        // Calculate counts
        const totalErrors = db.aiErrorReports.length;
        const pendingErrors = db.aiErrorReports.filter(e => e.status === 'Pending' || e.status === 'In Review').length;
        const resolvedErrors = db.aiErrorReports.filter(e => e.status === 'Resolved').length;

        // Helper style for active card selection indication
        const getActiveCardStyle = (currStatus, accentColor) => {
          if (filterStatus === currStatus) {
            return `box-shadow: 0 0 0 2px ${accentColor}; transform: translateY(-2px); font-weight: 700;`;
          }
          return '';
        };

        const aiErrorsStatHeader = `
          <!-- AI Errors KPI Cards for Interactive Filtering -->
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px;">
            
            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', '')" 
                 style="padding:16px; border-left:4px solid var(--primary); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(37,99,235,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('', 'var(--primary)')}"
                 onmouseenter="if('${filterStatus}' !== '') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(37,99,235,0.1)'; }" 
                 onmouseleave="if('${filterStatus}' !== '') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Total Reports</div>
                  <strong style="font-size:1.4rem; color:var(--text-primary);">${totalErrors}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(37,99,235,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="cpu" style="color:var(--primary); width:16px; height:16px;"></i>
                </div>
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Show all AI estimation complaints</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Pending')" 
                 style="padding:16px; border-left:4px solid var(--warning); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('Pending', 'var(--warning)')}"
                 onmouseenter="if('${filterStatus}' !== 'Pending') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(245,158,11,0.1)'; }" 
                 onmouseleave="if('${filterStatus}' !== 'Pending') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Pending / In Review</div>
                  <strong style="font-size:1.4rem; color:var(--warning);">${pendingErrors}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(245,158,11,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="alert-triangle" style="color:var(--warning); width:16px; height:16px;"></i>
                </div>
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Filter by active pending review issues</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Resolved')" 
                 style="padding:16px; border-left:4px solid var(--success); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('Resolved', 'var(--success)')}"
                 onmouseenter="if('${filterStatus}' !== 'Resolved') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(16,185,129,0.1)'; }" 
                 onmouseleave="if('${filterStatus}' !== 'Resolved') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Resolved Reports</div>
                  <strong style="font-size:1.4rem; color:var(--success);">${resolvedErrors}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(16,185,129,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="check-circle" style="color:var(--success); width:16px; height:16px;"></i>
                </div>
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Filter by vetted resolved error reports</div>
            </div>

          </div>
        `;

        canvas.innerHTML = aiErrorsStatHeader + `
          <div class="card">
            <div class="card-header">
              <div style="display:flex; flex-direction:column; gap:4px;">
                <span class="card-title">Incorrect AI Estimation Reports (Vetting Panel)</span>
                ${filterStatus ? `<span style="font-size: 0.78rem; color: var(--text-secondary);">Active Filter: <strong style="color: var(--primary); text-transform: uppercase;">${filterStatus}</strong></span>` : ''}
              </div>
            </div>
            
            <!-- Table Header Action Controls -->
            <div class="table-header-actions" style="padding: 0 24px; margin-top: 10px;">
              <div class="table-actions-left">
                <div class="search-wrapper">
                  <i data-lucide="search"></i>
                  <input type="text" class="form-control search-input" id="search-${tableKey}" placeholder="Search errors..." value="${this.state.searchQueries[tableKey] || ''}" oninput="window.BotNBoltApp.handleTableSearch('${tableKey}', this.value)">
                </div>
                
                <select class="bulk-actions-select" id="bulk-${tableKey}" style="${checked.length > 0 ? 'display:block;' : 'display:none;'}" onchange="window.BotNBoltApp.triggerBulkAction('${tableKey}', this.value)">
                  <option value="">Bulk Actions (${checked.length} Selected)</option>
                  <option value="export">Export Selected</option>
                </select>
              </div>
              
              <div class="table-actions-right">
                <button class="btn btn-secondary btn-sm flex-center" onclick="window.BotNBoltApp.exportAiErrorsCsv('${tableKey}')" title="Export Current List to CSV">
                  <i data-lucide="download"></i> Export CSV
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 40px; padding-left: 24px;">
                      <input type="checkbox" id="chk-all-${tableKey}" style="width:16px; height:16px; cursor:pointer;" ${checked.length === allRowIds.length && allRowIds.length > 0 ? 'checked' : ''} onchange="window.BotNBoltApp.handleSelectAllChange('${tableKey}', this.checked, ${JSON.stringify(allRowIds).replace(/"/g, '&quot;')})">
                    </th>
                    <th>Error ID</th>
                    <th>Uploaded Image Ref</th>
                    <th>Wrong Classification</th>
                    <th>Expected Classification</th>
                    <th>Confidence Score</th>
                    <th>Reported By Outlet</th>
                    <th>Resolution Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${paginated.length === 0 ? `
                    <tr>
                      <td colspan="10" style="text-align:center; padding: 32px; color: var(--text-secondary);">No records match your search filter.</td>
                    </tr>
                  ` : paginated.map(err => `
                    <tr>
                      <td style="padding-left: 24px;">
                        <input type="checkbox" id="chk-${tableKey}-${err.id}" style="width:16px; height:16px; cursor:pointer;" ${checked.includes(err.id) ? 'checked' : ''} onchange="window.BotNBoltApp.handleCheckboxChange('${tableKey}', '${err.id}', this.checked)">
                      </td>
                      <td><code>${err.id}</code></td>
                      <td><strong>${err.uploadedImage}</strong></td>
                      <td><span class="badge badge-danger">${err.wrongDetectionType}</span></td>
                      <td><span class="badge badge-success">${err.expectedResult}</span></td>
                      <td><strong>${err.aiConfidenceScore.toFixed(1)}%</strong></td>
                      <td>${err.reportedBy}</td>
                      <td><span class="badge ${err.status === 'Pending' ? 'badge-danger' : err.status === 'Resolved' ? 'badge-success' : 'badge-warning'}">${err.status}</span></td>
                      <td>
                        <button class="btn btn-primary btn-sm flex-center" onclick="window.BotNBoltApp.inspectAiError('${err.id}')">
                          <i data-lucide="sliders"></i> Vet Image
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Table Pagination Footer -->
            <div class="table-footer-pagination">
              <div>
                Showing <strong>${filtered.length === 0 ? 0 : pageIndex * pageSize + 1}</strong> to 
                <strong>${Math.min((pageIndex + 1) * pageSize, filtered.length)}</strong> of 
                <strong>${filtered.length}</strong> reports
              </div>
              <div class="pagination-controls">
                <span style="margin-right:8px;">Rows per page:</span>
                <select class="rows-selector" style="margin-right:16px;" onchange="window.BotNBoltApp.handleTablePageSizeChange('${tableKey}', this.value)">
                  <option value="5" ${pageSize === 5 ? 'selected' : ''}>5</option>
                  <option value="10" ${pageSize === 10 ? 'selected' : ''}>10</option>
                  <option value="25" ${pageSize === 25 ? 'selected' : ''}>25</option>
                </select>
                <button class="pagination-btn" ${pageIndex === 0 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex - 1})" title="Previous Page"><i data-lucide="chevron-left" style="width:14px; height:14px;"></i></button>
                <span style="font-weight:600; margin:0 8px;">Page ${pageIndex + 1} of ${totalPages}</span>
                <button class="pagination-btn" ${pageIndex >= totalPages - 1 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex + 1})" title="Next Page"><i data-lucide="chevron-right" style="width:14px; height:14px;"></i></button>
              </div>
            </div>

          </div>
        `;
        lucide.createIcons();
      } else if (menu === 'companies') {
        const tableKey = 'brands_sp';
        const searchQuery = (this.state.searchQueries[tableKey] || '').toLowerCase();
        const pageSize = this.state.pageSizes[tableKey] || 5;
        const pageIndex = this.state.pageIndices[tableKey] || 0;

        const filters = this.state.dropdownFilters[tableKey] || {};
        const statusFilter = filters.status || '';

        // Calculate counts
        const totalCount = db.companySupportOverview.length;
        const activeCount = db.companySupportOverview.filter(co => co.integrationStatus === 'Active').length;
        const escalatedCount = db.companySupportOverview.filter(co => co.escalatedTickets > 0).length;

        // Filter rows
        const filtered = db.companySupportOverview.filter(co => {
          const matchesSearch = co.name.toLowerCase().includes(searchQuery) ||
            co.lastContacted.toLowerCase().includes(searchQuery);

          let matchesStatus = true;
          if (statusFilter === 'Active') {
            matchesStatus = co.integrationStatus === 'Active';
          } else if (statusFilter === 'Escalated') {
            matchesStatus = co.escalatedTickets > 0;
          }

          return matchesSearch && matchesStatus;
        });

        // Paginate rows
        const paginated = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
        const totalPages = Math.ceil(filtered.length / pageSize) || 1;
        const allRowIds = filtered.map(c => c.name);
        const checked = this.state.checkedRows[tableKey] || [];

        // Helper style for active card selection indication
        const getActiveCardStyle = (currStatus, accentColor) => {
          if (statusFilter === currStatus) {
            return `box-shadow: 0 0 0 2px ${accentColor}; transform: translateY(-2px); font-weight: 700;`;
          }
          return '';
        };

        canvas.innerHTML = `
          <!-- Companies KPI Cards for Interactive Filtering -->
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px;">
            
            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', '')" 
                 style="padding:20px; border-left:4px solid var(--primary); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(37,99,235,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('', 'var(--primary)')}"
                 onmouseenter="if('${statusFilter}' !== '') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(37,99,235,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== '') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Total Brands</div>
                  <strong style="font-size:1.8rem; color:var(--text-primary);">${totalCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(37,99,235,0.1); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="building-2" style="color:var(--primary); width:20px; height:20px;"></i>
                </div>
              </div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:8px;">Show all partner brands</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Active')" 
                 style="padding:20px; border-left:4px solid var(--success); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('Active', 'var(--success)')}"
                 onmouseenter="if('${statusFilter}' !== 'Active') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(16,185,129,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== 'Active') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Active Integrations</div>
                  <strong style="font-size:1.8rem; color:var(--success);">${activeCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(16,185,129,0.1); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="check-circle" style="color:var(--success); width:20px; height:20px;"></i>
                </div>
              </div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:8px;">Operational connections</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'status', 'Escalated')" 
                 style="padding:20px; border-left:4px solid var(--warning); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('Escalated', 'var(--warning)')}"
                 onmouseenter="if('${statusFilter}' !== 'Escalated') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(245,158,11,0.1)'; }" 
                 onmouseleave="if('${statusFilter}' !== 'Escalated') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Urgent Tickets</div>
                  <strong style="font-size:1.8rem; color:var(--warning);">${escalatedCount}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(245,158,11,0.1); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="alert-triangle" style="color:var(--warning); width:20px; height:20px;"></i>
                </div>
              </div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:8px;">Brands with escalated cases</div>
            </div>

          </div>

          <div class="card">
            <div class="card-header">
              <div style="display:flex; flex-direction:column; gap:4px;">
                <span class="card-title">Hardware Brand Integration Health Desk</span>
                ${statusFilter ? `<span style="font-size: 0.78rem; color: var(--text-secondary);">Active Filter: <strong style="color: var(--primary); text-transform: uppercase;">${statusFilter}</strong></span>` : ''}
              </div>
            </div>
            
            <!-- Table Header Action Controls -->
            <div class="table-header-actions" style="padding: 0 24px; margin-top: 10px;">
              <div class="table-actions-left">
                <div class="search-wrapper">
                  <i data-lucide="search"></i>
                  <input type="text" class="form-control search-input" id="search-${tableKey}" placeholder="Search brands..." value="${this.state.searchQueries[tableKey] || ''}" oninput="window.BotNBoltApp.handleTableSearch('${tableKey}', this.value)">
                </div>
                
                <select class="bulk-actions-select" id="bulk-${tableKey}" style="${checked.length > 0 ? 'display:block;' : 'display:none;'}" onchange="window.BotNBoltApp.triggerBulkAction('${tableKey}', this.value)">
                  <option value="">Bulk Actions (${checked.length} Selected)</option>
                  <option value="export">Export Selected</option>
                </select>
              </div>
              
              <div class="table-actions-right">
                <button class="btn btn-secondary btn-sm flex-center" onclick="window.BotNBoltApp.exportBrandSupportCsv('${tableKey}')" title="Export Current List to CSV">
                  <i data-lucide="download"></i> Export CSV
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 40px; padding-left: 24px;">
                      <input type="checkbox" id="chk-all-${tableKey}" style="width:16px; height:16px; cursor:pointer;" ${checked.length === allRowIds.length && allRowIds.length > 0 ? 'checked' : ''} onchange="window.BotNBoltApp.handleSelectAllChange('${tableKey}', this.checked, ${JSON.stringify(allRowIds).replace(/"/g, '&quot;')})">
                    </th>
                    <th>Company Brand</th>
                    <th>Active Tickets</th>
                    <th>Escalated (Urgent)</th>
                    <th>Last Sync Action</th>
                    <th>Operational Health</th>
                  </tr>
                </thead>
                <tbody>
                  ${paginated.length === 0 ? `
                    <tr>
                      <td colspan="10" style="text-align:center; padding: 32px; color: var(--text-secondary);">No records match your search filter.</td>
                    </tr>
                  ` : paginated.map(co => `
                    <tr>
                      <td style="padding-left: 24px;">
                        <input type="checkbox" id="chk-${tableKey}-${co.name}" style="width:16px; height:16px; cursor:pointer;" ${checked.includes(co.name) ? 'checked' : ''} onchange="window.BotNBoltApp.handleCheckboxChange('${tableKey}', '${co.name}', this.checked)">
                      </td>
                      <td><strong>${co.name}</strong></td>
                      <td><strong>${co.activeTickets}</strong> active</td>
                      <td><span class="badge ${co.escalatedTickets > 0 ? 'badge-danger' : 'badge-info'}">${co.escalatedTickets} escalated</span></td>
                      <td>${co.lastContacted}</td>
                      <td><span class="badge badge-success">Online</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Table Pagination Footer -->
            <div class="table-footer-pagination">
              <div>
                Showing <strong>${filtered.length === 0 ? 0 : pageIndex * pageSize + 1}</strong> to 
                <strong>${Math.min((pageIndex + 1) * pageSize, filtered.length)}</strong> of 
                <strong>${filtered.length}</strong> brands
              </div>
              <div class="pagination-controls">
                <span style="margin-right:8px;">Rows per page:</span>
                <select class="rows-selector" style="margin-right:16px;" onchange="window.BotNBoltApp.handleTablePageSizeChange('${tableKey}', this.value)">
                  <option value="5" ${pageSize === 5 ? 'selected' : ''}>5</option>
                  <option value="10" ${pageSize === 10 ? 'selected' : ''}>10</option>
                  <option value="25" ${pageSize === 25 ? 'selected' : ''}>25</option>
                </select>
                <button class="pagination-btn" ${pageIndex === 0 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex - 1})" title="Previous Page"><i data-lucide="chevron-left" style="width:14px; height:14px;"></i></button>
                <span style="font-weight:600; margin:0 8px;">Page ${pageIndex + 1} of ${totalPages}</span>
                <button class="pagination-btn" ${pageIndex >= totalPages - 1 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex + 1})" title="Next Page"><i data-lucide="chevron-right" style="width:14px; height:14px;"></i></button>
              </div>
            </div>

          </div>
        `;
        lucide.createIcons();
      } else if (menu === 'dealers') {
        const tableKey = 'diagnostics_sp';
        const searchQuery = (this.state.searchQueries[tableKey] || '').toLowerCase();
        const pageSize = this.state.pageSizes[tableKey] || 5;
        const pageIndex = this.state.pageIndices[tableKey] || 0;

        const filters = this.state.dropdownFilters[tableKey] || {};
        const filterCompany = filters.company || '';
        const filterCity = filters.city || '';
        const filterAlert = filters.alert || '';

        // Filter rows
        const filtered = db.dealerSupport.filter(dl => {
          const matchesSearch = dl.dealerName.toLowerCase().includes(searchQuery) ||
            dl.storeIssues.toLowerCase().includes(searchQuery);

          const matchesCompany = !filterCompany || dl.dealerName.includes(filterCompany);
          const matchesCity = !filterCity || dl.city === filterCity;
          
          const totalIssues = (dl.loginProblems || 0) + (dl.aiComplaints || 0) + (dl.customerComplaints || 0);
          const matchesAlert = !filterAlert ||
            (filterAlert === 'alert' && totalIssues > 3) ||
            (filterAlert === 'normal' && totalIssues <= 3);

          return matchesSearch && matchesCompany && matchesCity && matchesAlert;
        });

        // Paginate rows
        const paginated = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
        const totalPages = Math.ceil(filtered.length / pageSize) || 1;
        const allRowIds = filtered.map(d => d.dealerName);
        const checked = this.state.checkedRows[tableKey] || [];

        // Calculate counts
        const totalTerminals = db.dealerSupport.length;
        const alertedTerminals = db.dealerSupport.filter(dl => ((dl.loginProblems || 0) + (dl.aiComplaints || 0) + (dl.customerComplaints || 0)) > 3).length;
        const normalTerminals = db.dealerSupport.filter(dl => ((dl.loginProblems || 0) + (dl.aiComplaints || 0) + (dl.customerComplaints || 0)) <= 3).length;

        // Helper style for active card selection indication
        const getActiveCardStyle = (currAlert, accentColor) => {
          if (filterAlert === currAlert) {
            return `box-shadow: 0 0 0 2px ${accentColor}; transform: translateY(-2px); font-weight: 700;`;
          }
          return '';
        };

        const diagStatHeader = `
          <!-- Diagnostics KPI Cards for Interactive Filtering -->
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px;">
            
            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'alert', '')" 
                 style="padding:16px; border-left:4px solid var(--primary); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(37,99,235,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('', 'var(--primary)')}"
                 onmouseenter="if('${filterAlert}' !== '') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(37,99,235,0.1)'; }" 
                 onmouseleave="if('${filterAlert}' !== '') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Total Terminals</div>
                  <strong style="font-size:1.4rem; color:var(--text-primary);">${totalTerminals}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(37,99,235,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="store" style="color:var(--primary); width:16px; height:16px;"></i>
                </div>
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Show all monitored dealer outlets</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'alert', 'alert')" 
                 style="padding:16px; border-left:4px solid var(--danger); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(239,68,68,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('alert', 'var(--danger)')}"
                 onmouseenter="if('${filterAlert}' !== 'alert') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(239,68,68,0.1)'; }" 
                 onmouseleave="if('${filterAlert}' !== 'alert') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Critical Alerts</div>
                  <strong style="font-size:1.4rem; color:var(--danger);">${alertedTerminals}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(239,68,68,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="alert-triangle" style="color:var(--danger); width:16px; height:16px;"></i>
                </div>
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Filter by outlets with >3 errors</div>
            </div>

            <div class="card kpi-card-gradient" onclick="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'alert', 'normal')" 
                 style="padding:16px; border-left:4px solid var(--success); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.05) 100%); cursor:pointer; transition:all 0.2s ease-in-out; border-radius: var(--radius-md); ${getActiveCardStyle('normal', 'var(--success)')}"
                 onmouseenter="if('${filterAlert}' !== 'normal') { this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(16,185,129,0.1)'; }" 
                 onmouseleave="if('${filterAlert}' !== 'normal') { this.style.transform=''; this.style.boxShadow=''; }">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Normal Terminals</div>
                  <strong style="font-size:1.4rem; color:var(--success);">${normalTerminals}</strong>
                </div>
                <div class="kpi-icon-container" style="background: rgba(16,185,129,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                  <i data-lucide="check-circle" style="color:var(--success); width:16px; height:16px;"></i>
                </div>
              </div>
              <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Filter by healthy terminal status</div>
            </div>

          </div>
        `;

        canvas.innerHTML = diagStatHeader + `
          <div class="card">
            <div class="card-header">
              <div style="display:flex; flex-direction:column; gap:4px;">
                <span class="card-title">Outlet Terminal Diagnostics</span>
                ${filterAlert ? `<span style="font-size: 0.78rem; color: var(--text-secondary);">Active Filter: <strong style="color: var(--primary); text-transform: uppercase;">${filterAlert}</strong></span>` : ''}
              </div>
            </div>
            
            <!-- Table Header Action Controls -->
            <div class="table-header-actions" style="padding: 0 24px; margin-top: 10px;">
              <div class="table-actions-left" style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
                <div class="search-wrapper">
                  <i data-lucide="search"></i>
                  <input type="text" class="form-control search-input" id="search-${tableKey}" placeholder="Search outlets..." value="${this.state.searchQueries[tableKey] || ''}" oninput="window.BotNBoltApp.handleTableSearch('${tableKey}', this.value)">
                </div>

                <!-- Company Filter -->
                <select class="form-control dropdown-filter" style="width: 140px; font-size: 0.85rem; padding: 4px 8px; height: 32px;" onchange="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'company', this.value)">
                  <option value="">All Companies</option>
                  <option value="Home hardware" ${filterCompany === 'Home hardware' ? 'selected' : ''}>Home hardware</option>
                  <option value="My Depot" ${filterCompany === 'My Depot' ? 'selected' : ''}>My Depot</option>
                  <option value="Rona" ${filterCompany === 'Rona' ? 'selected' : ''}>Rona</option>
                  <option value="BMR Group" ${filterCompany === 'BMR Group' ? 'selected' : ''}>BMR Group</option>
                  <option value="Tottens" ${filterCompany === 'Tottens' ? 'selected' : ''}>Tottens</option>
                </select>

                <!-- City Filter -->
                <select class="form-control dropdown-filter" style="width: 130px; font-size: 0.85rem; padding: 4px 8px; height: 32px;" onchange="window.BotNBoltApp.handleTableFilterChange('${tableKey}', 'city', this.value)">
                  <option value="">All Cities</option>
                  <option value="Toronto" ${filterCity === 'Toronto' ? 'selected' : ''}>Toronto</option>
                  <option value="Montreal" ${filterCity === 'Montreal' ? 'selected' : ''}>Montreal</option>
                  <option value="Calgary" ${filterCity === 'Calgary' ? 'selected' : ''}>Calgary</option>
                  <option value="Edmonton" ${filterCity === 'Edmonton' ? 'selected' : ''}>Edmonton</option>
                  <option value="Ottawa" ${filterCity === 'Ottawa' ? 'selected' : ''}>Ottawa</option>
                  <option value="Vancouver" ${filterCity === 'Vancouver' ? 'selected' : ''}>Vancouver</option>
                </select>
                
                <select class="bulk-actions-select" id="bulk-${tableKey}" style="${checked.length > 0 ? 'display:block;' : 'display:none;'}" onchange="window.BotNBoltApp.triggerBulkAction('${tableKey}', this.value)">
                  <option value="">Bulk Actions (${checked.length} Selected)</option>
                  <option value="export">Export Selected</option>
                </select>
              </div>
              
              <div class="table-actions-right">
                <button class="btn btn-secondary btn-sm flex-center" onclick="window.BotNBoltApp.exportDiagnosticsCsv('${tableKey}')" title="Export Current List to CSV">
                  <i data-lucide="download"></i> Export CSV
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 40px; padding-left: 24px;">
                      <input type="checkbox" id="chk-all-${tableKey}" style="width:16px; height:16px; cursor:pointer;" ${checked.length === allRowIds.length && allRowIds.length > 0 ? 'checked' : ''} onchange="window.BotNBoltApp.handleSelectAllChange('${tableKey}', this.checked, ${JSON.stringify(allRowIds).replace(/"/g, '&quot;')})">
                    </th>
                    <th>Dealer Location Name</th>
                    <th>City</th>
                    <th>Current System Warnings</th>
                    <th>Recent Auth Fails</th>
                    <th>AI Mismatch Tickets</th>
                    <th>Direct User Complaints</th>
                    <th>Hardware Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${paginated.length === 0 ? `
                    <tr>
                      <td colspan="11" style="text-align:center; padding: 32px; color: var(--text-secondary);">No records match your search filter.</td>
                    </tr>
                  ` : paginated.map(dl => `
                    <tr>
                      <td style="padding-left: 24px;">
                        <input type="checkbox" id="chk-${tableKey}-${dl.dealerName}" style="width:16px; height:16px; cursor:pointer;" ${checked.includes(dl.dealerName) ? 'checked' : ''} onchange="window.BotNBoltApp.handleCheckboxChange('${tableKey}', '${dl.dealerName}', this.checked)">
                      </td>
                      <td><strong>${dl.dealerName}</strong></td>
                      <td>${dl.city || 'N/A'}</td>
                      <td><code style="color:var(--danger);">${dl.storeIssues}</code></td>
                      <td>${dl.loginProblems} fails</td>
                      <td><strong>${dl.aiComplaints}</strong> complaints</td>
                      <td>${dl.customerComplaints} reports</td>
                      <td><span class="badge badge-success">Operational</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Table Pagination Footer -->
            <div class="table-footer-pagination">
              <div>
                Showing <strong>${filtered.length === 0 ? 0 : pageIndex * pageSize + 1}</strong> to 
                <strong>${Math.min((pageIndex + 1) * pageSize, filtered.length)}</strong> of 
                <strong>${filtered.length}</strong> outlets
              </div>
              <div class="pagination-controls">
                <span style="margin-right:8px;">Rows per page:</span>
                <select class="rows-selector" style="margin-right:16px;" onchange="window.BotNBoltApp.handleTablePageSizeChange('${tableKey}', this.value)">
                  <option value="5" ${pageSize === 5 ? 'selected' : ''}>5</option>
                  <option value="10" ${pageSize === 10 ? 'selected' : ''}>10</option>
                  <option value="25" ${pageSize === 25 ? 'selected' : ''}>25</option>
                </select>
                <button class="pagination-btn" ${pageIndex === 0 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex - 1})" title="Previous Page"><i data-lucide="chevron-left" style="width:14px; height:14px;"></i></button>
                <span style="font-weight:600; margin:0 8px;">Page ${pageIndex + 1} of ${totalPages}</span>
                <button class="pagination-btn" ${pageIndex >= totalPages - 1 ? 'disabled' : ''} onclick="window.BotNBoltApp.handleTablePageChange('${tableKey}', ${pageIndex + 1})" title="Next Page"><i data-lucide="chevron-right" style="width:14px; height:14px;"></i></button>
              </div>
            </div>

          </div>
        `;
        lucide.createIcons();
      } else if (menu === 'monitoring') {
        canvas.innerHTML = `
          <div class="card" style="margin-bottom:24px;">
            <div class="card-header">
              <span class="card-title">Live Hardware Services & Health Statuses</span>
            </div>
            
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px;">
              
              <div class="card kpi-card-gradient" style="padding:16px; border-left:4px solid var(--success); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(16,185,129,0.05) 100%); cursor:pointer; transition:transform 0.15s, box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 24px rgba(16,185,129,0.15)'" onmouseleave="this.style.transform=''; this.style.boxShadow=''">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Core API Backend</div>
                    <strong style="font-size:1.4rem; color:var(--success);">99.96% Uptime</strong>
                  </div>
                  <div class="kpi-icon-container" style="background: rgba(16,185,129,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                    <i data-lucide="server" style="color:var(--success); width:16px; height:16px;"></i>
                  </div>
                </div>
                <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px; display:flex; align-items:center; gap:6px;">
                  <span class="pulse-light success" style="width:8px; height:8px; border-radius:50%; background:var(--success); display:inline-block; box-shadow:0 0 8px var(--success);"></span>
                  Online & fully operational
                </div>
              </div>

              <div class="card kpi-card-gradient" style="padding:16px; border-left:4px solid var(--primary); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(37,99,235,0.05) 100%); cursor:pointer; transition:transform 0.15s, box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 24px rgba(37,99,235,0.15)'" onmouseleave="this.style.transform=''; this.style.boxShadow=''">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Server Hardware Load</div>
                    <strong style="font-size:1.4rem; color:var(--primary);">32% CPU / 64% RAM</strong>
                  </div>
                  <div class="kpi-icon-container" style="background: rgba(37,99,235,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                    <i data-lucide="activity" style="color:var(--primary); width:16px; height:16px;"></i>
                  </div>
                </div>
                <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">Load is within normal operating levels</div>
              </div>

              <div class="card kpi-card-gradient" style="padding:16px; border-left:4px solid var(--warning); background:linear-gradient(135deg,var(--bg-card) 0%,rgba(245,158,11,0.05) 100%); cursor:pointer; transition:transform 0.15s, box-shadow 0.15s;" onmouseenter="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 24px rgba(245,158,11,0.15)'" onmouseleave="this.style.transform=''; this.style.boxShadow=''">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); font-weight:600; margin-bottom:4px;">Active Client Terminals</div>
                    <strong style="font-size:1.4rem; color:var(--warning);">342 Active Nodes</strong>
                  </div>
                  <div class="kpi-icon-container" style="background: rgba(245,158,11,0.1); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                    <i data-lucide="users" style="color:var(--warning); width:16px; height:16px;"></i>
                  </div>
                </div>
                <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:8px;">12 image workers online</div>
              </div>

            </div>
          </div>

          <div class="charts-grid">
            <div class="card">
              <div class="card-header"><span class="card-title">Server Resource Consumption (Real-time CPU)</span></div>
              <div style="height: 250px;"><canvas id="resourceChart"></canvas></div>
            </div>
            <div class="card">
              <div class="card-header"><span class="card-title">Web Traffic Rates (API Requests/sec)</span></div>
              <div style="height: 250px;"><canvas id="trafficChart"></canvas></div>
            </div>
          </div>
        `;
        const colors = this.getChartColors();
        const ctxRes = document.getElementById('resourceChart').getContext('2d');
        this.state.charts.resource = new Chart(ctxRes, {
          type: 'line',
          data: {
            labels: ["10s ago", "8s ago", "6s ago", "4s ago", "2s ago", "Just now"],
            datasets: [
              {
                label: 'CPU Load %',
                data: [28, 35, 31, 45, 38, 32],
                borderColor: colors.primary,
                fill: false,
                tension: 0.3
              },
              {
                label: 'RAM Usage %',
                data: [64, 64, 65, 64, 64, 64],
                borderColor: colors.warning,
                fill: false,
                tension: 0.3
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { grid: { color: colors.grid }, ticks: { color: colors.text } },
              y: { min: 0, max: 100, grid: { color: colors.grid }, ticks: { color: colors.text } }
            }
          }
        });

        const ctxTraf = document.getElementById('trafficChart').getContext('2d');
        this.state.charts.traffic = new Chart(ctxTraf, {
          type: 'bar',
          data: {
            labels: ["12:00", "12:05", "12:10", "12:15", "12:20", "12:25"],
            datasets: [{
              label: 'Requests/Min',
              data: [340, 420, 390, 510, 480, 560],
              backgroundColor: colors.success
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { grid: { color: colors.grid }, ticks: { color: colors.text } },
              y: { grid: { color: colors.grid }, ticks: { color: colors.text } }
            }
          }
        });
      } else {
        canvas.innerHTML = `
          <div class="card">
            <div class="card-header"><span class="card-title">${navLabels[menu]} Control System</span></div>
            <p>Module currently running on state model parameters.</p>
          </div>
        `;
      }
    }

    inspectAiError(errId) {
      const err = this.state.db.supportAdmin.aiErrorReports.find(e => e.id === errId);
      if (!err) return;

      const title = `Vetting Correction Panel - ${err.id}`;
      const body = `
        <div style="display:grid; grid-template-columns:1fr 1.5fr; gap:20px;">
          <!-- Left side: image container -->
          <div class="ai-image-viewport" style="height: 300px;">
            <div style="width:100%; height:100%; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); display:flex; align-items:center; justify-content:center; flex-direction:column;">
              <i data-lucide="image" style="width:36px; height:36px; color:rgba(255,255,255,0.2)"></i>
              <span style="font-size:0.75rem; color:rgba(255,255,255,0.3); margin-top:8px;">${err.uploadedImage}</span>
            </div>
          </div>
          <!-- Right side: details and actions -->
          <div>
            <h4 style="font-weight:700; color:var(--danger); margin-bottom:12px;">Wrong AI Detection Vetted</h4>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:16px;"><strong>Report Notes:</strong> ${err.notes}</p>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px;">
              <div>
                <span class="form-label">Wrong AI Class</span>
                <span class="badge badge-danger" style="padding:6px 12px; font-size:0.8rem;">${err.wrongDetectionType}</span>
              </div>
              <div>
                <span class="form-label">Correct Target Class</span>
                <span class="badge badge-success" style="padding:6px 12px; font-size:0.8rem;">${err.expectedResult}</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Adjustment Command Action</label>
              <select class="form-control" id="vetActionSelect">
                <option value="resolve">Confirm Manual Correction & Train Model</option>
                <option value="ignore">Ignore Error (Out of Bounds)</option>
              </select>
            </div>
          </div>
        </div>
      `;

      this.showModal(title, body, `
        <button class="btn btn-secondary" onclick="window.BotNBoltApp.closeModalForce()">Close</button>
        <button class="btn btn-primary" onclick="window.BotNBoltApp.submitVetAction('${err.id}')">Submit Vetting</button>
      `);
      lucide.createIcons();
    }

    submitVetAction(id) {
      const err = this.state.db.supportAdmin.aiErrorReports.find(e => e.id === id);
      const sel = document.getElementById('vetActionSelect').value;
      if (err) {
        err.status = sel === 'resolve' ? 'Resolved' : 'Ignored';
        this.saveState();
        this.closeModalForce();
        this.renderCurrentView();
        alert(`Vetting action submitted. Incorrect classification marked as ${err.status}.`);
      }
    }

    assignTicket(id, agent) {
      const t = this.state.db.supportAdmin.tickets.find(t => t.id === id);
      if (t) {
        t.assignedTo = agent;
        t.status = 'In Progress';
        this.saveState();
        this.renderCurrentView();
        alert(`Ticket ${id} assigned to ${agent}. Status updated to In Progress.`);
      }
    }

    resolveTicket(id) {
      const t = this.state.db.supportAdmin.tickets.find(t => t.id === id);
      if (t) {
        t.status = 'Resolved';
        this.saveState();
        this.renderCurrentView();
        alert(`Ticket ${id} marked as Resolved.`);
      }
    }

    // ----------------------------------------------------
    // GLOBAL MODAL TRIGGERS
    // ----------------------------------------------------
    showModal(title, bodyHtml, footerHtml) {
      document.getElementById('modalTitle').innerText = title;
      document.getElementById('modalBody').innerHTML = bodyHtml;

      const footer = document.getElementById('modalFooter');
      if (footerHtml) {
        footer.style.display = 'flex';
        footer.innerHTML = footerHtml;
      } else {
        footer.style.display = 'none';
      }

      document.getElementById('modalOverlay').classList.add('active');
    }

    closeModal(e) {
      if (e.target.id === 'modalOverlay') {
        this.closeModalForce();
      }
    }

    closeModalForce() {
      document.getElementById('modalOverlay').classList.remove('active');
    }

    // ----------------------------------------------------
    // SUPER ADMIN ADD COMPANY FORM
    // ----------------------------------------------------
    openAddCompanyModal() {
      const body = `
        <form id="addCompanyForm">
          <div class="form-group">
            <label class="form-label">Company Name</label>
            <input type="text" id="coName" class="form-control" placeholder="e.g. Acme Motors" required>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Industry Sector</label>
              <select id="coIndustry" class="form-control">
                <option>Automotive</option>
                <option>Bicycles & Mobility</option>
                <option>Heavy Machinery</option>
                <option>Electronics</option>
                <option>Glass Supplies</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Subscription Tier</label>
              <select id="coPlan" class="form-control">
                <option>Enterprise Gold</option>
                <option>Premium Standard</option>
                <option>Basic Trial</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Contact Email</label>
              <input type="email" id="coEmail" class="form-control" placeholder="admin@acme.com" required>
            </div>
            <div class="form-group">
              <label class="form-label">HQ Location Province</label>
              <select id="coProvince" class="form-control">
                ${this.state.db.provinces.map(p => `<option>${p}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-row" style="margin-top:10px;">
            <div class="form-group" style="display:flex; align-items:center; gap:8px;">
              <input type="checkbox" id="coBranding" style="width:16px; height:16px;">
              <label class="form-label" style="margin-bottom:0; cursor:pointer;" for="coBranding">Enable Custom Branding Colors</label>
            </div>
            <div class="form-group" style="display:flex; align-items:center; gap:8px;">
              <input type="checkbox" id="coWhiteLabel" style="width:16px; height:16px;">
              <label class="form-label" style="margin-bottom:0; cursor:pointer;" for="coWhiteLabel">Enable White Label SDKs</label>
            </div>
          </div>
        </form>
      `;

      const footer = `
        <button class="btn btn-secondary" onclick="window.BotNBoltApp.closeModalForce()">Cancel</button>
        <button class="btn btn-primary" onclick="window.BotNBoltApp.submitAddCompany()">Create Brand Partner</button>
      `;

      this.showModal("Add Hardware Brand Partner", body, footer);
    }

    submitAddCompany() {
      const name = document.getElementById('coName').value;
      const industry = document.getElementById('coIndustry').value;
      const plan = document.getElementById('coPlan').value;
      const email = document.getElementById('coEmail').value;
      const province = document.getElementById('coProvince').value;
      const branding = document.getElementById('coBranding').checked;
      const whitelabel = document.getElementById('coWhiteLabel').checked;

      if (!name || !email) {
        alert("Please complete the required fields.");
        return;
      }

      // Generate random ID
      const randomId = "C-" + Math.floor(100 + Math.random() * 900);
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

      const newCompany = {
        id: randomId,
        name: name,
        logo: initials || 'CO',
        industryType: industry,
        website: "https://" + name.toLowerCase().replace(/\s+/g, '') + ".example.com",
        address: "Main HQ, " + province,
        province: province,
        contactPerson: "HQ Admin Manager",
        email: email,
        phone: "+1 (555) 010-9900",
        subscriptionPlan: plan,
        contractStart: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year
        totalDealers: 0,
        activeDealers: 0,
        apiLimit: plan.includes('Enterprise') ? 8000 : plan.includes('Premium') ? 3000 : 800,
        storageUsage: "0.0 GB / 2 GB",
        status: "Active",
        customBranding: branding,
        whiteLabel: whitelabel,
        supportManager: "David Miller"
      };

      this.state.db.superAdmin.companies.unshift(newCompany);
      this.saveState();
      this.closeModalForce();
      this.renderCurrentView();
      alert(`Successfully registered new brand ${name}. ID: ${randomId}`);
    }

    toggleCompanyStatus(id) {
      const co = this.state.db.superAdmin.companies.find(c => c.id === id);
      if (co) {
        co.status = co.status === 'Active' ? 'Suspended' : 'Active';
        this.saveState();
        this.renderCurrentView();
        alert(`Company ${co.name} status updated to: ${co.status}`);
      }
    }

    manageSubscriptionModal(id) {
      const co = this.state.db.superAdmin.companies.find(c => c.id === id);
      if (!co) return;

      const body = `
        <div class="form-group">
          <label class="form-label">Subscription Tier</label>
          <select id="subTierSelect" class="form-control">
            <option ${co.subscriptionPlan === 'Enterprise Gold' ? 'selected' : ''}>Enterprise Gold</option>
            <option ${co.subscriptionPlan === 'Premium Standard' ? 'selected' : ''}>Premium Standard</option>
            <option ${co.subscriptionPlan === 'Basic Trial' ? 'selected' : ''}>Basic Trial</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Monthly API Request Credits</label>
          <input type="number" id="subApiLimit" class="form-control" value="${co.apiLimit}">
        </div>
        <div class="form-group">
          <label class="form-label">Assigned Support Escalations Manager</label>
          <select id="subManagerSelect" class="form-control">
            ${this.state.db.supportManagers.map(m => `<option ${co.supportManager === m.name ? 'selected' : ''}>${m.name}</option>`).join('')}
          </select>
        </div>
      `;

      const footer = `
        <button class="btn btn-secondary" onclick="window.BotNBoltApp.closeModalForce()">Close</button>
        <button class="btn btn-primary" onclick="window.BotNBoltApp.saveSubscription('${co.id}')">Apply Rules</button>
      `;

      this.showModal(`Access Rules Limit: ${co.name}`, body, footer);
    }

    saveSubscription(id) {
      const co = this.state.db.superAdmin.companies.find(c => c.id === id);
      if (co) {
        co.subscriptionPlan = document.getElementById('subTierSelect').value;
        co.apiLimit = parseInt(document.getElementById('subApiLimit').value);
        co.supportManager = document.getElementById('subManagerSelect').value;
        this.saveState();
        this.closeModalForce();
        this.renderCurrentView();
        alert(`Limits for ${co.name} updated successfully.`);
      }
    }


    handleErrorFilterChange(filterValue) {
      this.state.errorFilter = filterValue;
      this.renderCurrentView();
    }

    inspectErrorModal(id) {
      const err = this.state.db.superAdmin.systemErrors.find(e => e.id === id);
      if (!err) return;

      const body = `
        <div style="font-size: 0.85rem; color: var(--text-primary);">
          <!-- Top Info Card Grid -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; border-bottom:1px solid var(--border-color); padding-bottom:16px;">
            <div>
              <div style="margin-bottom:8px;">
                <span style="font-weight:700; color:var(--text-secondary); text-transform:uppercase; font-size:0.7rem; display:block; margin-bottom:2px;">Error ID</span>
                <code style="font-size:0.95rem; font-weight:700; color:var(--danger);">${err.id}</code>
              </div>
              <div style="margin-bottom:8px;">
                <span style="font-weight:700; color:var(--text-secondary); text-transform:uppercase; font-size:0.7rem; display:block; margin-bottom:2px;">Location / Dealer</span>
                <strong style="color:var(--text-primary); font-size:0.9rem;">${err.dealer}</strong>
              </div>
              <div>
                <span style="font-weight:700; color:var(--text-secondary); text-transform:uppercase; font-size:0.7rem; display:block; margin-bottom:2px;">Trigger Time</span>
                <span style="color:var(--text-secondary); font-weight:500;">${err.time}</span>
              </div>
            </div>
            <div>
              <div style="margin-bottom:8px;">
                <span style="font-weight:700; color:var(--text-secondary); text-transform:uppercase; font-size:0.7rem; display:block; margin-bottom:2px;">Error Type</span>
                <span class="badge badge-danger" style="font-size:0.72rem; padding:3px 8px;">${err.type}</span>
              </div>
              <div style="margin-bottom:8px; display:flex; gap:16px;">
                <div>
                  <span style="font-weight:700; color:var(--text-secondary); text-transform:uppercase; font-size:0.7rem; display:block; margin-bottom:2px;">Severity</span>
                  <span style="font-weight:700; font-size:0.88rem; color:${err.severity === 'High' ? '#f43f5e' : err.severity === 'Medium' ? '#f59e0b' : '#64748b'};">${err.severity}</span>
                </div>
                <div>
                  <span style="font-weight:700; color:var(--text-secondary); text-transform:uppercase; font-size:0.7rem; display:block; margin-bottom:2px;">Occurrences</span>
                  <strong style="font-size:0.95rem;">${err.count}</strong>
                </div>
              </div>
              <div>
                <span style="font-weight:700; color:var(--text-secondary); text-transform:uppercase; font-size:0.7rem; display:block; margin-bottom:2px;">Current Status</span>
                <span class="badge ${err.status === 'Open' ? 'badge-danger' : err.status === 'Auto-Resolved' ? 'badge-warning' : 'badge-success'}" style="font-size:0.72rem; padding:3px 8px;">${err.status}</span>
              </div>
            </div>
          </div>

          <!-- Description Section -->
          <div style="margin-bottom:16px;">
            <span style="font-weight:700; color:var(--text-secondary); text-transform:uppercase; font-size:0.7rem; display:block; margin-bottom:4px;">Diagnostic Message</span>
            <div style="background:var(--bg-primary); padding:10px; border-radius:8px; border:1px solid var(--border-color); color:var(--text-primary); font-family:monospace; font-size:0.8rem; line-height:1.4;">
              ${err.message}
            </div>
          </div>

          <!-- Raw Stack Trace Section -->
          <div style="margin-bottom:20px;">
            <span style="font-weight:700; color:var(--text-secondary); text-transform:uppercase; font-size:0.7rem; display:block; margin-bottom:4px;">System Stack Trace</span>
            <pre style="background:#1e1e1e; color:#d4d4d4; padding:12px; border-radius:8px; font-family:'Courier New', Courier, monospace; font-size:0.75rem; overflow-x:auto; max-height:160px; line-height:1.4; border:1px solid #333; margin:0;">${err.trace || 'No trace captured'}</pre>
          </div>

          <!-- Recommended Diagnostic Actions -->
          <div style="background:rgba(37,99,235,0.05); border:1px solid rgba(37,99,235,0.15); border-radius:10px; padding:16px;">
            <span style="font-weight:700; color:var(--primary); text-transform:uppercase; font-size:0.7rem; display:block; margin-bottom:8px; letter-spacing:0.5px;">Recommended Recovery Actions</span>
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
              ${this.getErrorActionButtons(err)}
            </div>
          </div>
        </div>
      `;

      const footer = `
        <button class="btn btn-secondary" onclick="window.BotNBoltApp.closeModalForce()">Close</button>
        ${err.status === 'Open' ? `
          <button class="btn btn-primary" onclick="window.BotNBoltApp.resolveSystemError('${err.id}')">Mark Resolved & Dismiss</button>
        ` : ''}
      `;

      this.showModal(`Diagnostic Console — ${err.id}`, body, footer);
    }

    getErrorActionButtons(err) {
      switch (err.id) {
        case 'ERR-701':
          return `
            <button class="btn btn-secondary btn-sm" onclick="window.BotNBoltApp.runDiagnosticStep('${err.id}', 'Testing AI pipeline connection...', 'Connection successful. API responded in 184ms.')">Test AI Connection</button>
            <button class="btn btn-secondary btn-sm" onclick="window.BotNBoltApp.runDiagnosticStep('${err.id}', 'Extending request timeout limit to 45s...', 'Timeout updated in gateway configurations.')">Increase Timeout Limit</button>
          `;
        case 'ERR-702':
          return `
            <button class="btn btn-secondary btn-sm" onclick="window.BotNBoltApp.runDiagnosticStep('${err.id}', 'Refreshing dealer authorization credentials...', 'Token refreshed successfully. Session restarted.')">Force Token Refresh</button>
          `;
        case 'ERR-703':
          return `
            <button class="btn btn-secondary btn-sm" onclick="window.BotNBoltApp.runDiagnosticStep('${err.id}', 'Validating S3 CORS and file limit policy...', 'Policy checked. Current restriction: max 15MB.')">Validate Upload Policy</button>
          `;
        case 'ERR-704':
          return `
            <button class="btn btn-secondary btn-sm" onclick="window.BotNBoltApp.runDiagnosticStep('${err.id}', 'Temporarily lifting rate limits for IP...', 'Rate limit temporarily increased to 1000req/hour.')">Lift Rate Limit</button>
          `;
        case 'ERR-705':
          return `
            <button class="btn btn-secondary btn-sm" onclick="window.BotNBoltApp.runDiagnosticStep('${err.id}', 'Whitelisting CORS domains...', 'Domain registered in allowed origins.')">Whitelist Domain</button>
          `;
        case 'ERR-706':
          return `
            <button class="btn btn-secondary btn-sm" onclick="window.BotNBoltApp.runDiagnosticStep('${err.id}', 'Pinging database primary replica...', 'Replica responding. Status: healthy.')">Ping Replica</button>
          `;
        case 'ERR-707':
          return `
            <button class="btn btn-secondary btn-sm" onclick="window.BotNBoltApp.runDiagnosticStep('${err.id}', 'Dispatching re-scan request to model endpoint...', 'Model returned 82% confidence on repeat analysis.')">Force Re-scan</button>
          `;
        case 'ERR-708':
          return `
            <button class="btn btn-secondary btn-sm" onclick="window.BotNBoltApp.runDiagnosticStep('${err.id}', 'Testing SMTP relay handshake...', 'Handshake success. Spam reputation score: neutral.')">Test SMTP Relay</button>
          `;
        case 'ERR-709':
          return `
            <button class="btn btn-secondary btn-sm" onclick="window.BotNBoltApp.runDiagnosticStep('${err.id}', 'Requesting Stripe to resend webhook...', 'Stripe signature validated. Payment synchronized.')">Redeliver Webhook</button>
          `;
        case 'ERR-710':
          return `
            <button class="btn btn-secondary btn-sm" onclick="window.BotNBoltApp.runDiagnosticStep('${err.id}', 'Dumping frontend telemetry state...', 'Session dump extracted and logged to console.')">Dump Telemetry</button>
          `;
        default:
          return '<span style="font-size:0.75rem; color:var(--text-secondary);">No automatic action recommended.</span>';
      }
    }

    runDiagnosticStep(id, actionMsg, resultMsg) {
      alert(`[DIAGNOSTICS - ${id}] ${actionMsg}\n\nSuccess: ${resultMsg}`);
    }

    resolveSystemError(id) {
      const err = this.state.db.superAdmin.systemErrors.find(e => e.id === id);
      if (err) {
        err.status = 'Resolved';
        this.saveState();
        this.closeModalForce();
        this.renderCurrentView();
        alert(`Error ${id} status updated to Resolved.`);
      }
    }

    // ----------------------------------------------------
    // COMPANY ADMIN ADD DEALER FORM
    // ----------------------------------------------------
    openAddDealerModal() {
      const body = `
        <form id="addDealerForm">
          <div class="form-group">
            <label class="form-label">Dealer Branch Name</label>
            <input type="text" id="dlrName" class="form-control" placeholder="e.g. Apex Toronto East" required>
          </div>
          <div class="form-group">
            <label class="form-label">Physical Store Location Address</label>
            <input type="text" id="dlrLocation" class="form-control" placeholder="1050 Danforth Ave, Toronto" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Dealer Manager Name</label>
              <input type="text" id="dlrManager" class="form-control" placeholder="e.g. Robert Chen" required>
            </div>
            <div class="form-group">
              <label class="form-label">Province</label>
              <select id="dlrProvince" class="form-control">
                ${this.state.db.provinces.map(p => `<option>${p}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Contact Email</label>
              <input type="email" id="dlrEmail" class="form-control" placeholder="torontoeast@apexdealers.com" required>
            </div>
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input type="text" id="dlrPhone" class="form-control" placeholder="555-9011" required>
            </div>
          </div>
        </form>
      `;

      const footer = `
        <button class="btn btn-secondary" onclick="window.BotNBoltApp.closeModalForce()">Cancel</button>
        <button class="btn btn-primary" onclick="window.BotNBoltApp.submitAddDealer()">Add Dealer Outlet</button>
      `;

      this.showModal("Add Brand Outlet / Dealer", body, footer);
    }

    submitAddDealer() {
      const name = document.getElementById('dlrName').value;
      const location = document.getElementById('dlrLocation').value;
      const manager = document.getElementById('dlrManager').value;
      const province = document.getElementById('dlrProvince').value;
      const email = document.getElementById('dlrEmail').value;
      const phone = document.getElementById('dlrPhone').value;

      if (!name || !location || !manager || !email) {
        alert("Please complete the required fields.");
        return;
      }

      const randomId = "DLR-" + Math.floor(100 + Math.random() * 900);
      const newDlr = {
        id: randomId,
        name: name,
        location: location,
        province: province,
        manager: manager,
        phone: phone,
        email: email,
        monthlyRequests: 0,
        materialSales: 0,
        conversionRate: 0,
        rating: 0.0,
        lastActive: "Never",
        status: "Active"
      };

      this.state.db.companyAdmin.dealers.unshift(newDlr);
      this.saveState();
      this.closeModalForce();
      this.renderCurrentView();
      alert(`Dealer outlet registered. Store Code: ${randomId}`);
    }

    toggleDealerStatus(id) {
      const dl = this.state.db.companyAdmin.dealers.find(d => d.id === id);
      if (dl) {
        dl.status = dl.status === 'Active' ? 'Disabled' : 'Active';
        this.saveState();
        this.renderCurrentView();
        alert(`Dealer ${dl.name} status updated to: ${dl.status}`);
      }
    }

    handleTableSearch(tableKey, query) {
      this.state.searchQueries[tableKey] = query;
      this.state.pageIndices[tableKey] = 0;
      this.renderCurrentView();
      // Keep search focused
      const input = document.getElementById(`search-${tableKey}`);
      if (input) {
        input.focus();
        input.selectionStart = input.selectionEnd = input.value.length;
      }
    }

    handleTableFilterChange(tableKey, filterName, value) {
      if (!this.state.dropdownFilters[tableKey]) {
        this.state.dropdownFilters[tableKey] = {};
      }
      this.state.dropdownFilters[tableKey][filterName] = value;
      this.state.pageIndices[tableKey] = 0;
      this.renderCurrentView();
    }

    handleTablePageChange(tableKey, index) {
      this.state.pageIndices[tableKey] = index;
      this.renderCurrentView();
    }

    handleTablePageSizeChange(tableKey, size) {
      this.state.pageSizes[tableKey] = parseInt(size);
      this.state.pageIndices[tableKey] = 0;
      this.renderCurrentView();
    }

    handleCheckboxChange(tableKey, rowId, checked) {
      if (!this.state.checkedRows[tableKey]) {
        this.state.checkedRows[tableKey] = [];
      }
      if (checked) {
        if (!this.state.checkedRows[tableKey].includes(rowId)) {
          this.state.checkedRows[tableKey].push(rowId);
        }
      } else {
        this.state.checkedRows[tableKey] = this.state.checkedRows[tableKey].filter(id => id !== rowId);
      }
      this.updateBulkBar(tableKey);
    }

    handleSelectAllChange(tableKey, checked, allRowIds) {
      this.state.checkedRows[tableKey] = checked ? [...allRowIds] : [];

      // Update DOM checkboxes directly
      document.querySelectorAll(`input[id^="chk-${tableKey}-"]`).forEach(chk => {
        chk.checked = checked;
      });

      this.updateBulkBar(tableKey);
    }

    updateBulkBar(tableKey) {
      const checked = this.state.checkedRows[tableKey] || [];
      const bulkSelect = document.getElementById(`bulk-${tableKey}`);
      if (bulkSelect) {
        if (checked.length > 0) {
          bulkSelect.style.display = 'block';
          bulkSelect.options[0].text = `Bulk Actions (${checked.length} Selected)`;
        } else {
          bulkSelect.style.display = 'none';
        }
      }
    }

    triggerBulkAction(tableKey, action) {
      if (!action) return;
      const checkedIds = this.state.checkedRows[tableKey] || [];
      if (checkedIds.length === 0) return;

      if (action === 'delete') {
        if (confirm(`Are you sure you want to delete ${checkedIds.length} items?`)) {
          if (tableKey === 'companies') {
            this.state.db.superAdmin.companies = this.state.db.superAdmin.companies.filter(c => !checkedIds.includes(c.id));
          } else if (tableKey === 'dealers') {
            this.state.db.companyAdmin.dealers = this.state.db.companyAdmin.dealers.filter(d => !checkedIds.includes(d.id));
          } else if (tableKey === 'tickets') {
            this.state.db.supportAdmin.tickets = this.state.db.supportAdmin.tickets.filter(t => !checkedIds.includes(t.id));
          }
          this.state.checkedRows[tableKey] = [];
          this.saveState();
          this.renderCurrentView();
          alert(`Successfully deleted ${checkedIds.length} items.`);
        }
      } else if (action === 'suspend' || action === 'disable') {
        if (tableKey === 'companies') {
          this.state.db.superAdmin.companies.forEach(c => {
            if (checkedIds.includes(c.id)) c.status = 'Suspended';
          });
        } else if (tableKey === 'dealers') {
          this.state.db.companyAdmin.dealers.forEach(d => {
            if (checkedIds.includes(d.id)) d.status = 'Disabled';
          });
        } else if (tableKey === 'tickets') {
          this.state.db.supportAdmin.tickets.forEach(t => {
            if (checkedIds.includes(t.id)) t.status = 'Resolved';
          });
        }
        this.state.checkedRows[tableKey] = [];
        this.saveState();
        this.renderCurrentView();
        alert(`Bulk action updated status of ${checkedIds.length} items.`);
      } else if (action === 'export') {
        alert(`Exporting ${checkedIds.length} checked rows to CSV...`);
        this.state.checkedRows[tableKey] = [];
        this.renderCurrentView();
      }

      const bulkSelect = document.getElementById(`bulk-${tableKey}`);
      if (bulkSelect) bulkSelect.selectedIndex = 0;
    }

    exportToCsv(filename, headers, rows) {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += headers.join(",") + "\r\n";

      rows.forEach(row => {
        const rowString = row.map(val => {
          let str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        }).join(",");
        csvContent += rowString + "\r\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    exportCompaniesCsv(tableKey) {
      const headers = ["Company ID", "Company Name", "Email", "Industry", "Plan Tier", "Dealers Registered", "Status", "Contract Expiry"];
      const rows = this.state.db.superAdmin.companies.map(co => [
        co.id, co.name, co.email, co.industryType, co.subscriptionPlan, co.totalDealers, co.status, co.expiryDate
      ]);
      this.exportToCsv("BotNBolt_Companies.csv", headers, rows);
    }

    exportDealersCsv(tableKey) {
      const headers = ["Dealer ID", "Dealer Name", "Company", "City", "Province", "Manager Name", "Scans Count", "Status"];
      const rows = this.state.db.superAdmin.dealers.map(dl => [
        dl.id, dl.name, dl.company, dl.city, dl.province, dl.manager, dl.monthlyRequests, dl.status
      ]);
      this.exportToCsv("BotNBolt_Dealers.csv", headers, rows);
    }

    exportTicketsCsv(tableKey) {
      const headers = ["Ticket ID", "Issue Category", "Raised By", "Dealer Outlet", "Priority", "Assigned Support Agent", "Response Time", "Status"];
      const rows = this.state.db.supportAdmin.tickets.map(tkt => [
        tkt.id, tkt.issueType, tkt.raisedBy, tkt.dealer, tkt.priority, tkt.assignedTo, tkt.responseTime, tkt.status
      ]);
      this.exportToCsv("BotNBolt_Tickets.csv", headers, rows);
    }

    exportAuditLogsCsv(tableKey) {
      const headers = ["Timestamp", "User IP/Email", "Action Performed", "Target Module", "Status Outcome"];
      const rows = this.state.db.superAdmin.logs.map(log => [
        log.timestamp, log.user, log.action, log.module, log.status
      ]);
      this.exportToCsv("BotNBolt_AuditLogs.csv", headers, rows);
    }

    exportDealersCoCsv(tableKey) {
      const headers = ["Dealer ID", "Dealer Name", "Location/Address", "Manager", "Scans Count", "Conversion %", "Material Sales", "Status"];
      const rows = this.state.db.companyAdmin.dealers.map(dl => [
        dl.id, dl.name, dl.location, dl.manager, dl.monthlyRequests, dl.conversionRate, dl.materialSales, dl.status
      ]);
      this.exportToCsv("Company_Dealers.csv", headers, rows);
    }

    exportAnalyticsCoCsv(tableKey) {
      const headers = ["Scan ID", "Dealer Branch", "Damage Class", "Suggested Material", "Estimated Cost", "Received Date", "Status"];
      const rows = this.state.db.dealer.repairRequests.map(req => [
        req.id, req.dealerName, req.repairType, req.suggestedMaterials.join('; '), req.estimatedCost, req.date, req.status
      ]);
      this.exportToCsv("Company_Repair_Analytics.csv", headers, rows);
    }

    exportRequestsDlrCsv(tableKey) {
      const headers = ["Request ID", "Customer Name", "Damage Image Ref", "Repair Category", "Cost Estimate", "Material SKU", "Received Date", "Status"];
      const rows = this.state.db.dealer.repairRequests.map(req => [
        req.id, req.customerName, req.image, req.repairType, req.estimatedCost, req.suggestedMaterials.join('; '), req.date, req.status
      ]);
      this.exportToCsv("Dealer_Repair_Requests.csv", headers, rows);
    }

    exportLeadsDlrCsv(tableKey) {
      const headers = ["Customer Name", "Phone", "Email", "Category", "Interested Products", "Location", "Status"];
      const rows = this.state.db.dealer.customerLeads.map(ld => [
        ld.name, ld.phone, ld.email, ld.repairType, ld.interestedProducts, ld.location, ld.leadStatus
      ]);
      this.exportToCsv("Dealer_Customer_Leads.csv", headers, rows);
    }

    exportMaterialsDlrCsv(tableKey) {
      const headers = ["Material Name", "SKU Number", "Stock Availability", "Unit Cost", "Frequently Purchased"];
      const rows = this.state.db.dealer.materialRecommendations.map(mat => [
        mat.name, mat.sku, mat.stock, `$${mat.cost.toFixed(2)}`, mat.frequentlyPurchased ? 'Popular' : 'Standard'
      ]);
      this.exportToCsv("Dealer_Materials.csv", headers, rows);
    }

    exportAiErrorsCsv(tableKey) {
      const headers = ["Error ID", "Wrong Class Detection", "Expected Detection", "Confidence Score", "Reporting Outlet", "Status"];
      const rows = this.state.db.supportAdmin.aiErrorReports.map(err => [
        err.id, err.wrongDetectionType, err.expectedResult, err.aiConfidenceScore, err.reportedBy, err.status
      ]);
      this.exportToCsv("Support_AI_Errors.csv", headers, rows);
    }

    exportBrandSupportCsv(tableKey) {
      const headers = ["Brand Partner Name", "Active Tickets Count", "Escalated Count", "Integration Health Status", "Last Sync DateTime"];
      const rows = this.state.db.supportAdmin.companySupportOverview.map(co => [
        co.name, co.activeTickets, co.escalatedTickets, co.integrationStatus, co.lastContacted
      ]);
      this.exportToCsv("Support_Brand_Health.csv", headers, rows);
    }

    exportDiagnosticsCsv(tableKey) {
      const headers = ["Dealer Location Name", "System Warnings Count", "Failed Login Counts", "AI Classification Complaints", "Complaints Logs", "Status"];
      const rows = this.state.db.supportAdmin.dealerSupport.map(dl => [
        dl.dealerName, dl.storeIssues, dl.loginProblems, dl.aiComplaints, dl.customerComplaints, dl.status || 'Active'
      ]);
      this.exportToCsv("Support_Terminal_Diagnostics.csv", headers, rows);
    }


    editCompany(id) {
      const co = this.state.db.superAdmin.companies.find(c => c.id === id);
      if (!co) return;
      const body = `
        <div class="form-group">
          <label class="form-label">Company Name</label>
          <input type="text" id="editCoName" class="form-control" value="${co.name}">
        </div>
        <div class="form-group">
          <label class="form-label">Contact Person</label>
          <input type="text" id="editCoContact" class="form-control" value="${co.contactPerson}">
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" id="editCoEmail" class="form-control" value="${co.email}">
        </div>
        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input type="text" id="editCoPhone" class="form-control" value="${co.phone}">
        </div>
      `;
      const footer = `
        <button class="btn btn-secondary" onclick="window.BotNBoltApp.closeModalForce()">Cancel</button>
        <button class="btn btn-primary" onclick="window.BotNBoltApp.saveCompanyDetails('${co.id}')">Save Changes</button>
      `;
      this.showModal(`Edit Company Details: ${co.name}`, body, footer);
    }

    saveCompanyDetails(id) {
      const co = this.state.db.superAdmin.companies.find(c => c.id === id);
      if (co) {
        co.name = document.getElementById('editCoName').value;
        co.contactPerson = document.getElementById('editCoContact').value;
        co.email = document.getElementById('editCoEmail').value;
        co.phone = document.getElementById('editCoPhone').value;
        this.saveState();
        this.closeModalForce();
        this.renderCurrentView();
        alert("Company details updated.");
      }
    }

    resetCompanyPassword(id) {
      alert(`Password reset link generated for ${id}.\nTemporary login credential: BotNBoltTemp$${Math.floor(1000 + Math.random() * 9000)}`);
    }

    assignDealerAdmin(id) {
      const body = `
        <div class="form-group">
          <label class="form-label">Admin Representative Email</label>
          <input type="email" id="dealerAdminEmail" class="form-control" placeholder="admin@outlet.com" required>
        </div>
      `;
      const footer = `
        <button class="btn btn-secondary" onclick="window.BotNBoltApp.closeModalForce()">Cancel</button>
        <button class="btn btn-primary" onclick="window.BotNBoltApp.submitAssignDealerAdmin('${id}')">Assign Administrator</button>
      `;
      this.showModal("Assign Dealer Administrator", body, footer);
    }

    submitAssignDealerAdmin(id) {
      const email = document.getElementById('dealerAdminEmail').value;
      if (!email) {
        alert("Please enter a valid email.");
        return;
      }
      this.closeModalForce();
      alert(`Administrator representative assigned to dealer outlet ${id}. Registration link dispatched.`);
    }

    editDealerPermissions(id) {
      const body = `
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:16px;">Configure terminal level security rules for outlet: <strong>${id}</strong></p>
        <div style="display:flex; flex-direction:column; gap:10px; font-size:0.85rem;">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;"><input type="checkbox" checked style="width:16px; height:16px;"> Allow AI camera capture uploads</label>
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;"><input type="checkbox" checked style="width:16px; height:16px;"> Allow manual override of cost estimation margins</label>
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;"><input type="checkbox" checked style="width:16px; height:16px;"> Allow direct local ticket submission to Support desk</label>
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;"><input type="checkbox" style="width:16px; height:16px;"> Allow inventory stock level editing permission</label>
        </div>
      `;
      const footer = `
        <button class="btn btn-secondary" onclick="window.BotNBoltApp.closeModalForce()">Cancel</button>
        <button class="btn btn-primary" onclick="window.BotNBoltApp.closeModalForce(); alert('Dealer permissions rules updated.');">Apply Rules</button>
      `;
      this.showModal("Edit Dealer Operational Permissions", body, footer);
    }

    assignStoreManager(id) {
      const body = `
        <div class="form-group">
          <label class="form-label">Store Manager Name</label>
          <input type="text" id="smName" class="form-control" placeholder="e.g. Robert Chen" required>
        </div>
        <div class="form-group">
          <label class="form-label">Manager Contact Email</label>
          <input type="email" id="smEmail" class="form-control" placeholder="manager@dealer.com" required>
        </div>
      `;
      const footer = `
        <button class="btn btn-secondary" onclick="window.BotNBoltApp.closeModalForce()">Cancel</button>
        <button class="btn btn-primary" onclick="window.BotNBoltApp.submitAssignStoreManager('${id}')">Assign Manager</button>
      `;
      this.showModal("Assign Store Manager", body, footer);
    }

    submitAssignStoreManager(id) {
      const name = document.getElementById('smName').value;
      const email = document.getElementById('smEmail').value;
      if (!name || !email) {
        alert("Please fill in all fields.");
        return;
      }
      const dl = this.state.db.companyAdmin.dealers.find(d => d.id === id);
      if (dl) {
        dl.manager = name;
        dl.email = email;
        this.saveState();
      }
      this.closeModalForce();
      this.renderCurrentView();
      alert(`Successfully assigned ${name} as manager of dealer branch ${id}.`);
    }

    markRequestCompleted(id) {
      const req = this.state.db.dealer.repairRequests.find(r => r.id === id);
      if (req) {
        req.status = 'Completed';
        this.saveState();
        this.renderCurrentView();
        alert(`Repair Request ${id} marked as Completed.`);
      }
    }

    recommendTechnician(id) {
      const body = `
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:16px;">Suggest a local technician to resolve request: <strong>${id}</strong></p>
        <div class="form-group">
          <label class="form-label">Available Technicians</label>
          <select id="techSelect" class="form-control">
            <option>John Mechanic (Body Shop Lead)</option>
            <option>Elena PanelBeater (Refinish Specialist)</option>
            <option>Marcus Vance (ABS Welder)</option>
          </select>
        </div>
      `;
      const footer = `
        <button class="btn btn-secondary" onclick="window.BotNBoltApp.closeModalForce()">Cancel</button>
        <button class="btn btn-primary" onclick="window.BotNBoltApp.closeModalForce(); alert('Technician assigned.');">Assign Technician</button>
      `;
      this.showModal("Recommend local technician", body, footer);
    }

    // ----------------------------------------------------
    // CARD UTILITIES
    // ----------------------------------------------------
    createKpiCard(title, value, change, icon, trend) {
      const trendClass = `kpi-trend-${trend}`;
      let trendIcon = 'minus';
      if (trend === 'up') trendIcon = 'trending-up';
      if (trend === 'down') trendIcon = 'trending-down';
      if (trend === 'warning') trendIcon = 'alert-triangle';

      return `
        <div class="card kpi-card">
          <div class="kpi-meta">
            <span class="kpi-title">${title}</span>
            <div class="kpi-icon-container">
              <i data-lucide="${icon}"></i>
            </div>
          </div>
          <div class="kpi-value">${value}</div>
          <div class="kpi-change-row ${trendClass}">
            <i data-lucide="${trendIcon}" style="width:12px; height:12px;"></i>
            <span>${change}</span>
          </div>
        </div>
      `;
    }

    showNotifications() {
      alert("System Notifications:\n\n- [Home hardware] 3 custom pricing rules changed (Yesterday)\n- [Rona] Subscription renewal in 20 days\n- [Support Desk] AI Scan Vetting error list has 2 pending items");
      const dot = document.getElementById('notifDot');
      if (dot) dot.style.display = 'none';
    }
  }

  // Auto boot dashboard
  window.addEventListener('DOMContentLoaded', () => {
    new BotNBoltDashboard();
  });

})();
