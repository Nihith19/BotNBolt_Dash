// Mock database for BotNBolt Dashboard application
window.BotNBoltMockData = {
  // ----------------------------------------------------
  // GLOBAL CONFIG & GENERAL LISTS
  // ----------------------------------------------------
  provinces: ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba"],
  supportManagers: [
    { id: "MGR-001", name: "David Miller" },
    { id: "MGR-002", name: "Sarah Connor" },
    { id: "MGR-003", name: "Alex Mercer" }
  ],
  supportAgents: ["David Miller", "Sarah Connor", "Alex Mercer", "Emma Watson", "James Bond"],

  // ----------------------------------------------------
  // ROLE 1: SUPER ADMIN DATA
  // ----------------------------------------------------
  superAdmin: {
    kpis: {
      totalCompanies: { value: 5, change: "+0 this month", trend: "neutral" },
      totalDealers: { value: 36, change: "+4 this month", trend: "up" },
      totalEndUsers: { value: 1240, change: "+15% YoY", trend: "up" },
      totalRepairScans: { value: 8420, change: "+324 this week", trend: "up" },
      activeUsersToday: { value: 145, change: "12% higher than average", trend: "up" },
      monthlyRevenue: { value: "$32,400", change: "+8.4%", trend: "up" },
      aiRequestsUsed: { value: 12450, change: "Limit: 20k", trend: "neutral" },
      totalTicketsOpen: { value: 6, change: "2 urgent", trend: "down" },
      subscriptionExpiryAlerts: { value: 1, change: "Within 30 days", trend: "warning" },
      avgRepairAccuracy: { value: "94.2%", change: "+0.8% accuracy", trend: "up" },
      awsCost: { value: "$1,450", change: "+4.2%", trend: "up" },
      aiCost: { value: "$2,180", change: "+1.8%", trend: "up" },
      investment: { value: "$8,500" },
      netProfit: { value: "$23,900", change: "73.7% Margin", trend: "up" },
      todayErrors: { value: "14", change: "-12% drop", trend: "down" },
      avgResponseTime: { value: "124 ms", change: "99.9% Uptime", trend: "success" }
    },
    companies: [
      {
        id: "C-001",
        name: "Home hardware",
        logo: "HH",
        industryType: "Hardware Retail",
        website: "https://www.homehardware.ca",
        address: "34 Industrial Rd, St. Jacobs",
        province: "Ontario",
        contactPerson: "Marcus Vance",
        email: "m.vance@homehardware.ca",
        phone: "+1 (519) 555-0192",
        subscriptionPlan: "Enterprise Gold",
        contractStart: "2025-01-15",
        expiryDate: "2027-01-14",
        totalDealers: 9,
        activeDealers: 8,
        apiLimit: 5000,
        storageUsage: "4.2 GB / 10 GB",
        status: "Active",
        customBranding: true,
        whiteLabel: true,
        supportManager: "David Miller"
      },
      {
        id: "C-002",
        name: "My Depot",
        logo: "MD",
        industryType: "Home Improvement",
        website: "https://www.mydepot.ca",
        address: "742 Rue Saint-Catherine, Montreal",
        province: "Quebec",
        contactPerson: "Chantal Lebeau",
        email: "c.lebeau@mydepot.ca",
        phone: "+1 (514) 555-0284",
        subscriptionPlan: "Premium Standard",
        contractStart: "2025-06-01",
        expiryDate: "2026-05-31",
        totalDealers: 6,
        activeDealers: 5,
        apiLimit: 2000,
        storageUsage: "1.8 GB / 5 GB",
        status: "Active",
        customBranding: true,
        whiteLabel: false,
        supportManager: "Sarah Connor"
      },
      {
        id: "C-003",
        name: "Rona",
        logo: "RN",
        industryType: "Home Improvement Retail",
        website: "https://www.rona.ca",
        address: "220 Chemin du Tremblay, Boucherville",
        province: "Quebec",
        contactPerson: "Arthur Pendelton",
        email: "apendelton@rona.ca",
        phone: "+1 (450) 555-0322",
        subscriptionPlan: "Enterprise Platinum",
        contractStart: "2024-03-10",
        expiryDate: "2026-07-28",
        totalDealers: 6,
        activeDealers: 6,
        apiLimit: 10000,
        storageUsage: "8.9 GB / 20 GB",
        status: "Active",
        customBranding: true,
        whiteLabel: true,
        supportManager: "Alex Mercer"
      },
      {
        id: "C-004",
        name: "BMR Group",
        logo: "BG",
        industryType: "Hardware & Lumber",
        website: "https://www.bmr.ca",
        address: "1501 Rue de Montarville, Boucherville",
        province: "Quebec",
        contactPerson: "Elena Rostova",
        email: "e.rostova@bmr.ca",
        phone: "+1 (450) 555-0455",
        subscriptionPlan: "Premium Standard",
        contractStart: "2026-06-01",
        expiryDate: "2027-06-30",
        totalDealers: 6,
        activeDealers: 6,
        apiLimit: 2000,
        storageUsage: "0.9 GB / 5 GB",
        status: "Active",
        customBranding: true,
        whiteLabel: false,
        supportManager: "David Miller"
      },
      {
        id: "C-005",
        name: "Tottens",
        logo: "TT",
        industryType: "Building Supplies",
        website: "https://www.tottens.ca",
        address: "44 Portage Ave, Winnipeg",
        province: "Manitoba",
        contactPerson: "Derrick Bell",
        email: "d.bell@tottens.ca",
        phone: "+1 (204) 555-0912",
        subscriptionPlan: "Premium Standard",
        contractStart: "2025-11-01",
        expiryDate: "2026-10-31",
        totalDealers: 9,
        activeDealers: 8,
        apiLimit: 2000,
        storageUsage: "1.2 GB / 5 GB",
        status: "Active",
        customBranding: false,
        whiteLabel: false,
        supportManager: "Sarah Connor"
      }
    ],
    dealers: [
      // 1. Home hardware (9 dealers)
      { id: "DLR-HH-01", name: "Home hardware 01", company: "Home hardware", city: "Toronto", location: "1050 Danforth Ave", province: "Ontario", manager: "Robert Chen", phone: "+1 (416) 555-9011", email: "hh01@hhdealers.com", monthlyRequests: 142, materialSales: 12400, conversionRate: 78.5, rating: 4.8, lastActive: "Today, 11:20 AM", status: "Active" },
      { id: "DLR-HH-02", name: "Home hardware 02", company: "Home hardware", city: "Montreal", location: "742 Rue Saint-Catherine", province: "Quebec", manager: "Chantal Lebeau", phone: "+1 (514) 555-0284", email: "hh02@hhdealers.com", monthlyRequests: 98, materialSales: 8900, conversionRate: 72.1, rating: 4.6, lastActive: "Today, 10:45 AM", status: "Active" },
      { id: "DLR-HH-03", name: "Home hardware 03", company: "Home hardware", city: "Calgary", location: "515 9 Ave SW", province: "Alberta", manager: "Gary Vance", phone: "+1 (403) 555-7722", email: "hh03@hhdealers.com", monthlyRequests: 64, materialSales: 4100, conversionRate: 64.8, rating: 4.5, lastActive: "Yesterday", status: "Active" },
      { id: "DLR-HH-04", name: "Home hardware 04", company: "Home hardware", city: "Edmonton", location: "10255 104 St NW", province: "Alberta", manager: "Diana Prince", phone: "+1 (780) 555-1234", email: "hh04@hhdealers.com", monthlyRequests: 42, materialSales: 2800, conversionRate: 61.2, rating: 4.3, lastActive: "3 days ago", status: "Active" },
      { id: "DLR-HH-05", name: "Home hardware 05", company: "Home hardware", city: "Ottawa", location: "450 Carling Ave", province: "Ontario", manager: "Lana Peterson", phone: "+1 (613) 555-8833", email: "hh05@hhdealers.com", monthlyRequests: 80, materialSales: 6400, conversionRate: 70.0, rating: 4.7, lastActive: "Today, 9:15 AM", status: "Active" },
      { id: "DLR-HH-06", name: "Home hardware 06", company: "Home hardware", city: "Winnipeg", location: "44 Portage Ave", province: "Manitoba", manager: "Derrick Bell", phone: "+1 (204) 555-0912", email: "hh06@hhdealers.com", monthlyRequests: 55, materialSales: 3900, conversionRate: 66.4, rating: 4.4, lastActive: "Yesterday", status: "Active" },
      { id: "DLR-HH-07", name: "Home hardware 07", company: "Home hardware", city: "Mississauga", location: "3050 Dundas St W", province: "Ontario", manager: "Ben Parker", phone: "+1 (905) 555-0987", email: "hh07@hhdealers.com", monthlyRequests: 38, materialSales: 2500, conversionRate: 60.5, rating: 4.2, lastActive: "4 days ago", status: "Active" },
      { id: "DLR-HH-08", name: "Home hardware 08", company: "Home hardware", city: "Vancouver", location: "1045 Georgia St W", province: "British Columbia", manager: "Arthur Pendelton", phone: "+1 (604) 555-0322", email: "hh08@hhdealers.com", monthlyRequests: 110, materialSales: 9800, conversionRate: 75.2, rating: 4.7, lastActive: "Today, 11:00 AM", status: "Active" },
      { id: "DLR-HH-09", name: "Home hardware 09", company: "Home hardware", city: "Brampton", location: "99 Brampton Rd", province: "Ontario", manager: "Elena Rostova", phone: "+1 (905) 555-0455", email: "hh09@hhdealers.com", monthlyRequests: 20, materialSales: 1200, conversionRate: 50.0, rating: 4.0, lastActive: "2 weeks ago", status: "Disabled" },

      // 2. My Depot (6 dealers)
      { id: "DLR-MD-01", name: "My Depot 01", company: "My Depot", city: "Toronto", location: "120 Yonge St", province: "Ontario", manager: "Alice Wong", phone: "+1 (416) 555-9111", email: "md01@mydepot.com", monthlyRequests: 115, materialSales: 9400, conversionRate: 71.2, rating: 4.5, lastActive: "Today, 10:30 AM", status: "Active" },
      { id: "DLR-MD-02", name: "My Depot 02", company: "My Depot", city: "Montreal", location: "555 Rue St-Denis", province: "Quebec", manager: "Pierre Seguin", phone: "+1 (514) 555-9112", email: "md02@mydepot.com", monthlyRequests: 85, materialSales: 7200, conversionRate: 68.0, rating: 4.4, lastActive: "Yesterday", status: "Active" },
      { id: "DLR-MD-03", name: "My Depot 03", company: "My Depot", city: "Calgary", location: "888 17 Ave SW", province: "Alberta", manager: "Keith Richards", phone: "+1 (403) 555-9113", email: "md03@mydepot.com", monthlyRequests: 50, materialSales: 3100, conversionRate: 60.1, rating: 4.2, lastActive: "Yesterday", status: "Active" },
      { id: "DLR-MD-04", name: "My Depot 04", company: "My Depot", city: "Edmonton", location: "9910 108 St NW", province: "Alberta", manager: "Sarah Connor", phone: "+1 (780) 555-9114", email: "md04@mydepot.com", monthlyRequests: 35, materialSales: 2100, conversionRate: 58.4, rating: 4.1, lastActive: "3 days ago", status: "Active" },
      { id: "DLR-MD-05", name: "My Depot 05", company: "My Depot", city: "Vancouver", location: "220 Georgia St W", province: "British Columbia", manager: "Winston Smith", phone: "+1 (604) 555-9115", email: "md05@mydepot.com", monthlyRequests: 95, materialSales: 8100, conversionRate: 73.0, rating: 4.6, lastActive: "Today, 09:40 AM", status: "Active" },
      { id: "DLR-MD-06", name: "My Depot 06", company: "My Depot", city: "Brampton", location: "10 Main St S", province: "Ontario", manager: "David Miller", phone: "+1 (905) 555-9116", email: "md06@mydepot.com", monthlyRequests: 0, materialSales: 0, conversionRate: 0, rating: 0, lastActive: "Never", status: "Disabled" },

      // 3. Rona (6 dealers)
      { id: "DLR-RN-01", name: "Rona 01", company: "Rona", city: "Toronto", location: "400 Keele St", province: "Ontario", manager: "John Doe", phone: "+1 (416) 555-9211", email: "rn01@rona.com", monthlyRequests: 110, materialSales: 9100, conversionRate: 70.5, rating: 4.4, lastActive: "Today, 11:15 AM", status: "Active" },
      { id: "DLR-RN-02", name: "Rona 02", company: "Rona", city: "Montreal", location: "900 Rue Sherbrooke", province: "Quebec", manager: "Jacques Cartier", phone: "+1 (514) 555-9212", email: "rn02@rona.com", monthlyRequests: 80, materialSales: 6800, conversionRate: 67.2, rating: 4.3, lastActive: "Yesterday", status: "Active" },
      { id: "DLR-RN-03", name: "Rona 03", company: "Rona", city: "Calgary", location: "1200 37 St SW", province: "Alberta", manager: "Alex Mercer", phone: "+1 (403) 555-9213", email: "rn03@rona.com", monthlyRequests: 60, materialSales: 3900, conversionRate: 63.5, rating: 4.2, lastActive: "Yesterday", status: "Active" },
      { id: "DLR-RN-04", name: "Rona 04", company: "Rona", city: "Edmonton", location: "11100 100 St NW", province: "Alberta", manager: "Lara Croft", phone: "+1 (780) 555-9214", email: "rn04@rona.com", monthlyRequests: 30, materialSales: 1800, conversionRate: 56.1, rating: 4.0, lastActive: "4 days ago", status: "Active" },
      { id: "DLR-RN-05", name: "Rona 05", company: "Rona", city: "Ottawa", location: "300 Hunt Club Rd", province: "Ontario", manager: "Emma Watson", phone: "+1 (613) 555-9215", email: "rn05@rona.com", monthlyRequests: 75, materialSales: 5900, conversionRate: 68.4, rating: 4.5, lastActive: "Today, 08:30 AM", status: "Active" },
      { id: "DLR-RN-06", name: "Rona 06", company: "Rona", city: "Winnipeg", location: "1500 Regent Ave W", province: "Manitoba", manager: "Derrick Bell", phone: "+1 (204) 555-9216", email: "rn06@rona.com", monthlyRequests: 48, materialSales: 3200, conversionRate: 61.2, rating: 4.1, lastActive: "5 days ago", status: "Active" },

      // 4. BMR Group (6 dealers)
      { id: "DLR-BG-01", name: "BMR Group 01", company: "BMR Group", city: "Toronto", location: "2500 Dufferin St", province: "Ontario", manager: "Jack Ryan", phone: "+1 (416) 555-9311", email: "bmr01@bmr.com", monthlyRequests: 95, materialSales: 7800, conversionRate: 68.4, rating: 4.3, lastActive: "Today, 10:00 AM", status: "Active" },
      { id: "DLR-BG-02", name: "BMR Group 02", company: "BMR Group", city: "Montreal", location: "444 Rue Jean-Talon", province: "Quebec", manager: "Marie Curie", phone: "+1 (514) 555-9312", email: "bmr02@bmr.com", monthlyRequests: 70, materialSales: 5800, conversionRate: 64.2, rating: 4.2, lastActive: "Yesterday", status: "Active" },
      { id: "DLR-BG-03", name: "BMR Group 03", company: "BMR Group", city: "Calgary", location: "333 36 St NE", province: "Alberta", manager: "Bruce Wayne", phone: "+1 (403) 555-9313", email: "bmr03@bmr.com", monthlyRequests: 45, materialSales: 2900, conversionRate: 59.8, rating: 4.1, lastActive: "Yesterday", status: "Active" },
      { id: "DLR-BG-04", name: "BMR Group 04", company: "BMR Group", city: "Edmonton", location: "8888 137 Ave NW", province: "Alberta", manager: "Clark Kent", phone: "+1 (780) 555-9314", email: "bmr04@bmr.com", monthlyRequests: 28, materialSales: 1600, conversionRate: 52.5, rating: 3.9, lastActive: "Yesterday", status: "Active" },
      { id: "DLR-BG-05", name: "BMR Group 05", company: "BMR Group", city: "Ottawa", location: "1901 St. Laurent Blvd", province: "Ontario", manager: "Lois Lane", phone: "+1 (613) 555-9315", email: "bmr05@bmr.com", monthlyRequests: 62, materialSales: 4900, conversionRate: 65.0, rating: 4.4, lastActive: "Today, 09:00 AM", status: "Active" },
      { id: "DLR-BG-06", name: "BMR Group 06", company: "BMR Group", city: "Winnipeg", location: "800 Nairn Ave", province: "Manitoba", manager: "Peter Parker", phone: "+1 (204) 555-9316", email: "bmr06@bmr.com", monthlyRequests: 40, materialSales: 2700, conversionRate: 58.2, rating: 4.0, lastActive: "3 days ago", status: "Active" },

      // 5. Tottens (9 dealers)
      { id: "DLR-TT-01", name: "Tottens 01", company: "Tottens", city: "Toronto", location: "600 Warden Ave", province: "Ontario", manager: "Tony Stark", phone: "+1 (416) 555-9411", email: "tt01@tottens.com", monthlyRequests: 130, materialSales: 11200, conversionRate: 76.4, rating: 4.7, lastActive: "Today, 11:45 AM", status: "Active" },
      { id: "DLR-TT-02", name: "Tottens 02", company: "Tottens", city: "Montreal", location: "1200 Rue Saint-Jacques", province: "Quebec", manager: "Steve Rogers", phone: "+1 (514) 555-9412", email: "tt02@tottens.com", monthlyRequests: 92, materialSales: 8400, conversionRate: 71.0, rating: 4.5, lastActive: "Today, 10:15 AM", status: "Active" },
      { id: "DLR-TT-03", name: "Tottens 03", company: "Tottens", city: "Calgary", location: "1400 52 St NE", province: "Alberta", manager: "Thor Odinson", phone: "+1 (403) 555-9413", email: "tt03@tottens.com", monthlyRequests: 62, materialSales: 4000, conversionRate: 64.0, rating: 4.4, lastActive: "Yesterday", status: "Active" },
      { id: "DLR-TT-04", name: "Tottens 04", company: "Tottens", city: "Edmonton", location: "12025 149 St NW", province: "Alberta", manager: "Natasha Romanoff", phone: "+1 (780) 555-9414", email: "tt04@tottens.com", monthlyRequests: 40, materialSales: 2600, conversionRate: 60.5, rating: 4.2, lastActive: "Yesterday", status: "Active" },
      { id: "DLR-TT-05", name: "Tottens 05", company: "Tottens", city: "Ottawa", location: "2020 Merivale Rd", province: "Ontario", manager: "Clint Barton", phone: "+1 (613) 555-9415", email: "tt05@tottens.com", monthlyRequests: 78, materialSales: 6100, conversionRate: 69.2, rating: 4.6, lastActive: "Yesterday", status: "Active" },
      { id: "DLR-TT-06", name: "Tottens 06", company: "Tottens", city: "Winnipeg", location: "1122 McPhillips St", province: "Manitoba", manager: "Bruce Banner", phone: "+1 (204) 555-9416", email: "tt06@tottens.com", monthlyRequests: 50, materialSales: 3500, conversionRate: 64.5, rating: 4.3, lastActive: "4 days ago", status: "Active" },
      { id: "DLR-TT-07", name: "Tottens 07", company: "Tottens", city: "Mississauga", location: "2555 Stanfield Rd", province: "Ontario", manager: "Selina Kyle", phone: "+1 (905) 555-9417", email: "tt07@tottens.com", monthlyRequests: 35, materialSales: 2200, conversionRate: 59.8, rating: 4.1, lastActive: "3 days ago", status: "Active" },
      { id: "DLR-TT-08", name: "Tottens 08", company: "Tottens", city: "Vancouver", location: "1550 Kingsway", province: "British Columbia", manager: "Arthur Pendelton", phone: "+1 (604) 555-9418", email: "tt08@tottens.com", monthlyRequests: 105, materialSales: 9200, conversionRate: 74.0, rating: 4.6, lastActive: "Today, 10:50 AM", status: "Active" },
      { id: "DLR-TT-09", name: "Tottens 09", company: "Tottens", city: "Brampton", location: "80 Queen St E", province: "Ontario", manager: "Elena Rostova", phone: "+1 (905) 555-9419", email: "tt09@tottens.com", monthlyRequests: 0, materialSales: 0, conversionRate: 0, rating: 0, lastActive: "Never", status: "Disabled" }
    ],
    logs: [
      { id: "LOG-001", timestamp: "2026-07-07 11:20 AM", user: "Marcus Vance", ip: "192.168.1.14", action: "Exported regional dealer analytics spreadsheet", module: "Dealer Management", status: "Success" },
      { id: "LOG-002", timestamp: "2026-07-07 10:45 AM", user: "Sarah Connor", ip: "192.168.1.28", action: "Assigned manager David Miller to Ticket TKT-9042", module: "Support Ticket Desk", status: "Success" },
      { id: "LOG-003", timestamp: "2026-07-07 09:15 AM", user: "Alex Mercer", ip: "10.0.0.145", action: "Attempted login with expired password", module: "Authentication Gate", status: "Failed Login" },
      { id: "LOG-004", timestamp: "2026-07-07 08:30 AM", user: "System Scheduler", ip: "127.0.0.1", action: "Triggered nightly model performance sweep", module: "AI Engine Core", status: "Success" },
      { id: "LOG-005", timestamp: "2026-07-07 07:12 AM", user: "Nihit Sharma", ip: "192.168.1.5", action: "Created new company BMR Group", module: "Partner Desk", status: "Success" },
      { id: "LOG-006", timestamp: "2026-07-06 04:30 PM", user: "David Miller", ip: "192.168.2.19", action: "Updated API Limit to 5000 requests", module: "Subscription Manager", status: "Success" },
      { id: "LOG-007", timestamp: "2026-07-06 02:15 PM", user: "Emma Watson", ip: "192.168.2.40", action: "Resolved support ticket TKT-8951", module: "Support Ticket Desk", status: "Success" },
      { id: "LOG-008", timestamp: "2026-07-06 11:00 AM", user: "System Monitor", ip: "127.0.0.1", action: "Detected high CPU load on Image Workers", module: "Infrastructure", status: "Warning" },
      { id: "LOG-009", timestamp: "2026-07-06 09:40 AM", user: "Marcus Vance", ip: "192.168.1.14", action: "Added new outlet dealer branch Home hardware 09", module: "Dealer Management", status: "Success" }
    ],
    charts: {
      repairCategories: {
        labels: ["AI Repair and Analysis", "Renovation", "Build"],
        data: [5800, 3100, 2400]
      },
      mostUploadedDamage: {
        labels: ["Scratches", "Dents", "Cracks", "Corrosion", "Alignment Wear"],
        data: [35, 28, 18, 12, 7]
      },
      userGrowth: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        data: [820, 900, 990, 1050, 1140, 1240]
      },
      aiUsageTrends: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        requests: [6200, 7500, 9200, 10500, 11800, 12450],
        successRate: [91.5, 92.0, 93.1, 93.5, 94.0, 94.2]
      },
      incomeVsExpenses: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        income: [18000, 22000, 25000, 28000, 30000, 32400],
        expenses: [6000, 7000, 8000, 8200, 8500, 8500]
      },
      investmentVsProfit: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        investment: [6000, 7000, 8000, 8200, 8500, 8500],
        profit: [12000, 15000, 17000, 19800, 21500, 23900]
      },
      revenueGrowth: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        growthRate: [8, 22, 13, 12, 7, 8]
      },
      appUsage: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        sessions: [15000, 18000, 22000, 27000, 29000, 31000]
      },
      dealerPerformance: {
        labels: ["Home hardware 01 - Toronto", "Rona 03 - Calgary", "My Depot 02 - Montreal", "Home hardware 05 - Ottawa", "Tottens 08 - Vancouver"],
        data: [94, 91, 89, 87, 82]
      },
      mapData: [
        { name: "Ontario", count: 18, scans: 3420 },
        { name: "Quebec", count: 8, scans: 2110 },
        { name: "British Columbia", count: 4, scans: 1840 },
        { name: "Alberta", count: 4, scans: 850 },
        { name: "Manitoba", count: 2, scans: 200 }
      ]
    }
  },

  // ----------------------------------------------------
  // ROLE 2: ADMIN (HEADQUARTERS / COMPANY ADMIN)
  // Assumes logged in as: Home hardware
  // ----------------------------------------------------
  companyAdmin: {
    companyName: "Home hardware",
    kpis: {
      totalDealers: { value: 9, change: "+1 this quarter", trend: "up" },
      activeDealers: { value: 8, change: "1 offline / disabled", trend: "warning" },
      totalRepairRequests: { value: 1840, change: "+148 this month", trend: "up" },
      customerSatisfaction: { value: "4.7 / 5.0", change: "96% positive rating", trend: "up" },
      topRepairTypes: { value: "Bumper Crack / Scratched Panel", change: "60% of all requests", trend: "neutral" },
      materialsRecommended: { value: "542 units", change: "Valued at $42,500", trend: "up" },
      revenueGenerated: { value: "$145,200", change: "+12.5% vs last month", trend: "up" },
      dealerPerformance: { value: "Home hardware 01", change: "Top performer this week", trend: "up" }
    },
    dealers: [], // Will be dynamically computed or fallback populated in app.js from the main list
    repairAnalytics: [
      { category: "Bumper Crack", damageType: "Structural Split", estimatedCost: 350, materialsUsed: "FlexResin Glue, Staples", completionRate: 92, satisfaction: 4.8, avgTime: "1.5 hours" },
      { category: "Panel Scratch", damageType: "Clearcoat Abrasion", estimatedCost: 120, materialsUsed: "Compound Grit-3000, ClearSpray-A", completionRate: 98, satisfaction: 4.9, avgTime: "0.8 hours" },
      { category: "Fender Dent", damageType: "Medium Concavity", estimatedCost: 280, materialsUsed: "Puller-Tabs, MetalSoft Hammer", completionRate: 88, satisfaction: 4.5, avgTime: "2.2 hours" },
      { category: "Grille Chip", damageType: "Plastic Piercing", estimatedCost: 180, materialsUsed: "ABS Melt-Kit, MattePaint-B", completionRate: 90, satisfaction: 4.6, avgTime: "1.2 hours" }
    ],
    customerInsights: {
      mostCommonProblems: [
        { name: "Parking Lot Scrapes", count: 420 },
        { name: "Highway Gravel Pits", count: 310 },
        { name: "Hail/Storm Impact Dents", count: 220 },
        { name: "Winter Salt Corrosion", count: 95 }
      ],
      faqs: [
        { q: "Is flex resin paintable immediately?", a: "Yes, after a 15-minute UV curing cycle." },
        { q: "Does the clear coat protect against rust?", a: "Only if the metal substrate is fully sealed first." }
      ],
      mostPurchasedMaterials: [
        { name: "FlexResin Epoxy (Glue)", count: 280, revenue: 14000 },
        { name: "ClearSpray Acrylic", count: 195, revenue: 5850 },
        { name: "ABS Melt Rods", count: 150, revenue: 3000 }
      ],
      repeatPercentage: "18.5% of customers return for secondary repair estimates",
      provinceUsage: [
        { name: "Ontario", count: 1240 },
        { name: "Quebec", count: 480 },
        { name: "Alberta", count: 120 }
      ]
    },
    materials: [
      { name: "FlexResin Epoxy (Industrial)", sku: "FR-EPOXY-400ML", inventory: "In Stock", suggestions: 412, dealersAvailable: 12, conversionRate: 74.2 },
      { name: "ClearSpray Acrylic (High Gloss)", sku: "CS-GLOSS-500ML", inventory: "Low Stock", suggestions: 320, dealersAvailable: 9, conversionRate: 68.5 },
      { name: "ABS Melt Filler Rods", sku: "ABS-MELT-10PK", inventory: "In Stock", suggestions: 180, dealersAvailable: 11, conversionRate: 59.8 },
      { name: "High-Build Primer Spray", sku: "HB-PRIMER-GREY", inventory: "Out of Stock", suggestions: 92, dealersAvailable: 4, conversionRate: 48.1 }
    ],
    supportTickets: [
      { id: "TKT-9042", dealer: "Home hardware 01", city: "Toronto", problem: "API Authentication Key Failure", priority: "High", status: "Open", assigned: "David Miller" },
      { id: "TKT-8840", dealer: "Home hardware 05", city: "Ottawa", problem: "Billing dispute - Standard vs Gold", priority: "Medium", status: "In Progress", assigned: "Emma Watson" },
      { id: "TKT-8711", dealer: "Home hardware 08", city: "Vancouver", problem: "Incorrect AI scratch estimation margin", priority: "Low", status: "Resolved", assigned: "Sarah Connor" }
    ],
    widgetConfig: {
      apiKey: "bb_live_hh_7c361e2f9d8a5b4c3d2e1f0",
      domain: "homehardware.ca",
      status: "Active",
      theme: "light",
      primaryColor: "#d32f2f",
      buttonStyle: "rounded",
      language: "English"
    }
  },

  // ----------------------------------------------------
  // ROLE 3: DEALER MANAGER / STAFF
  // Assumes logged in as: Home hardware 01
  // ----------------------------------------------------
  dealer: {
    storeName: "Home hardware 01",
    city: "Toronto",
    kpis: {
      totalRepairRequests: { value: 142, change: "+18 this week", trend: "up" },
      todayCustomers: { value: 8, change: "3 scans pending analysis", trend: "neutral" },
      materialsSuggested: { value: 312, change: "Avg 2.2 items/request", trend: "neutral" },
      ordersGenerated: { value: 89, change: "62% completion rate", trend: "up" },
      revenueEstimate: { value: "$24,500", change: "Avg $172 per repair", trend: "up" },
      mostCommonRepairs: { value: "Panel Scratch / Dent", change: "78% of local cases", trend: "neutral" }
    },
    repairRequests: [
      {
        id: "REQ-4001",
        customerName: "Alex Mercer",
        image: "drywall_crack",
        damageDesc: "Deep structural crack in home hallway drywall.",
        aiDetections: [
          { type: "Crack", confidence: 96.5, box: [15, 30, 75, 45], severity: "Medium" }
        ],
        repairType: "AI Repair and Analysis",
        estimatedCost: 150.00,
        suggestedMaterials: ["Drywall Joint Compound", "Mesh Joint Tape"],
        status: "New",
        date: "2026-07-07 09:15 AM"
      },
      {
        id: "REQ-4002",
        customerName: "Claire Redfield",
        image: "blueprint_layout",
        damageDesc: "Double-story garage building blueprint blueprint.pdf.",
        aiDetections: [
          { type: "Blueprint", confidence: 91.2, box: [40, 20, 70, 60], severity: "Light" }
        ],
        repairType: "Build",
        estimatedCost: 110.00,
        suggestedMaterials: ["Standard Stud Framing timber", "Concrete Anchor Bolts"],
        status: "Quote Sent",
        date: "2026-07-06 04:30 PM"
      },
      {
        id: "REQ-4003",
        customerName: "Bruce Wayne",
        image: "plaster_damage",
        damageDesc: "Large plaster cavity in wall due to impact.",
        aiDetections: [
          { type: "Cavity", confidence: 98.1, box: [10, 50, 90, 85], severity: "Heavy" }
        ],
        repairType: "Renovation",
        estimatedCost: 320.00,
        suggestedMaterials: ["Plaster Wall Filler Patch", "Putty Knife Set"],
        status: "Completed",
        date: "2026-07-05 11:00 AM"
      },
      {
        id: "REQ-4004",
        customerName: "Selina Kyle",
        image: "deck_wear",
        damageDesc: "Worn out outdoor wooden deck showing mold & crack.",
        aiDetections: [
          { type: "Wear", confidence: 85.4, box: [25, 10, 30, 15], severity: "Light" },
          { type: "Crack", confidence: 88.0, box: [65, 30, 70, 35], severity: "Light" }
        ],
        repairType: "AI Repair and Analysis",
        estimatedCost: 85.00,
        suggestedMaterials: ["Premium Deck Sealer", "Sanding Grids Kit"],
        status: "Inspected",
        date: "2026-07-05 02:15 PM"
      }
    ],
    materialRecommendations: [
      { name: "Drywall Joint Compound", sku: "DRY-COMP-400ML", stock: "In Stock (14 items)", cost: 50.00, frequentlyPurchased: true },
      { name: "Mesh Joint Tape", sku: "MSH-TAPE-50M", stock: "Low Stock (2 items)", cost: 30.00, frequentlyPurchased: true },
      { name: "Standard Stud Framing timber", sku: "TIM-STUD-8FT", stock: "In Stock (22 items)", cost: 20.00, frequentlyPurchased: false },
      { name: "Concrete Anchor Bolts", sku: "CON-ANCH-10PK", stock: "In Stock (10 items)", cost: 15.00, frequentlyPurchased: true }
    ],
    customerLeads: [
      { name: "John Doe", phone: "+1 (416) 555-7788", email: "j.doe@example.com", repairType: "Drywall Crack", interestedProducts: "Drywall Joint Compound", location: "East York, Toronto", leadStatus: "New" },
      { name: "Mary Jane", phone: "+1 (647) 555-2233", email: "mj@example.com", repairType: "Blueprint Scan", interestedProducts: "Standard Stud Framing timber", location: "Scarborough", leadStatus: "Contacted" },
      { name: "Peter Parker", phone: "+1 (416) 555-1122", email: "spidey@example.com", repairType: "Plaster Cavity", interestedProducts: "Plaster Wall Filler Patch", location: "Downtown Toronto", leadStatus: "Converted" },
      { name: "Tony Stark", phone: "+1 (647) 555-3000", email: "tony@stark.com", repairType: "Deck Wood Crack", interestedProducts: "Premium Deck Sealer", location: "Etobicoke", leadStatus: "Closed" }
    ],
    profile: {
      storeName: "Home hardware 01 (Dealer #01)",
      address: "1050 Danforth Ave, Toronto, ON M4J 1M2",
      hours: "Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM",
      contactDetails: "Phone: +1 (416) 555-9011 | Email: hh01@hhdealers.com",
      assignedManager: "David Miller",
      province: "Ontario"
    }
  },

  // ----------------------------------------------------
  // ROLE 4: SUPPORT ADMIN DATA
  // ----------------------------------------------------
  supportAdmin: {
    tickets: [
      { id: "TKT-9042", issueType: "AI Wrong Detection", customerName: "Robert Chen", company: "Home hardware", dealer: "Home hardware 01", priority: "High", status: "Open", assignedTo: "David Miller", responseTime: "15 min", resolutionTime: "Pending", date: "2026-07-07 10:30 AM" },
      { id: "TKT-9038", issueType: "Login Issues", customerName: "Pierre Seguin", company: "My Depot", dealer: "My Depot 02", priority: "Medium", status: "In Progress", assignedTo: "Sarah Connor", responseTime: "45 min", resolutionTime: "Pending", date: "2026-07-07 09:12 AM" },
      { id: "TKT-9015", issueType: "Billing Issues", customerName: "Marcus Vance", company: "Home hardware", dealer: "HQ Admin", priority: "High", status: "Open", assignedTo: "Unassigned", responseTime: "Not Responded", resolutionTime: "Pending", date: "2026-07-07 07:05 AM" },
      { id: "TKT-8951", issueType: "API Failure", customerName: "Alex Mercer", company: "Rona", dealer: "Rona 03", priority: "High", status: "Resolved", assignedTo: "Alex Mercer", responseTime: "8 min", resolutionTime: "34 min", date: "2026-07-06 03:22 PM" },
      { id: "TKT-8840", issueType: "Dealer Access Problem", customerName: "Clark Kent", company: "BMR Group", dealer: "BMR Group 04", priority: "Low", status: "Resolved", assignedTo: "David Miller", responseTime: "2 hours", resolutionTime: "4 hours", date: "2026-07-05 01:10 PM" },
      { id: "TKT-8799", issueType: "Website Integration Issue", customerName: "Clint Barton", company: "Tottens", dealer: "Tottens 05", priority: "Medium", status: "Resolved", assignedTo: "Sarah Connor", responseTime: "1 hour", resolutionTime: "3 hours", date: "2026-07-04 10:05 AM" }
    ],
    companySupportOverview: [
      { name: "Home hardware", activeTickets: 2, escalatedTickets: 1, integrationStatus: "Active", lastContacted: "Today, 11:20 AM" },
      { name: "My Depot", activeTickets: 1, escalatedTickets: 0, integrationStatus: "Active", lastContacted: "Today, 09:15 AM" },
      { name: "Rona", activeTickets: 0, escalatedTickets: 0, integrationStatus: "Active", lastContacted: "Yesterday, 04:30 PM" },
      { name: "BMR Group", activeTickets: 0, escalatedTickets: 0, integrationStatus: "Active", lastContacted: "3 days ago" },
      { name: "Tottens", activeTickets: 0, escalatedTickets: 0, integrationStatus: "Integration Blocked", lastContacted: "Never" }
    ],
    dealerSupport: [
      { dealerName: "Home hardware 01", city: "Toronto", storeIssues: "API mismatch on login", loginProblems: 2, aiComplaints: 4, customerComplaints: 0 },
      { dealerName: "Home hardware 05", city: "Ottawa", storeIssues: "Slow image uploading", loginProblems: 1, aiComplaints: 1, customerComplaints: 1 },
      { dealerName: "My Depot 02", city: "Montreal", storeIssues: "None", loginProblems: 0, aiComplaints: 2, customerComplaints: 0 },
      { dealerName: "Rona 03", city: "Calgary", storeIssues: "None", loginProblems: 0, aiComplaints: 0, customerComplaints: 0 },
      { dealerName: "BMR Group 04", city: "Edmonton", storeIssues: "None", loginProblems: 0, aiComplaints: 0, customerComplaints: 0 },
      { dealerName: "Tottens 08", city: "Vancouver", storeIssues: "Authentication keys expired", loginProblems: 5, aiComplaints: 1, customerComplaints: 2 }
    ],
    aiErrorReports: [
      {
        id: "ERR-201",
        uploadedImage: "bumper_corner.jpg",
        imageDesc: "Bumper corner scraping showing dark plastic substrate",
        wrongDetectionType: "Crack (Heavy)",
        expectedResult: "Scratch (Deep) + Paint Peeling",
        aiConfidenceScore: 92.4,
        reportedBy: "Home hardware 01",
        status: "Pending",
        notes: "Algorithm misidentified the long scraping boundary line as a structural crack. Needs model retraining trigger."
      },
      {
        id: "ERR-202",
        uploadedImage: "hood_gash.jpg",
        imageDesc: "Small gash in hood",
        wrongDetectionType: "Corrosion (Medium)",
        expectedResult: "Chips (Multiple Light) + Dent",
        aiConfidenceScore: 84.1,
        reportedBy: "My Depot 02",
        status: "In Review",
        notes: "Gravel chip rust outline led to corrosion classification. Over-confidence issue."
      },
      {
        id: "ERR-203",
        uploadedImage: "fender_crease.jpg",
        imageDesc: "Sharp body line crease on rear quarter panel",
        wrongDetectionType: "Scratch (Light)",
        expectedResult: "Creased Dent (Medium)",
        aiConfidenceScore: 78.5,
        reportedBy: "Home hardware 05",
        status: "Resolved",
        notes: "Resolved by adjusting pre-processing shadow threshold. Accuracy validated."
      }
    ],
    liveMonitoring: {
      apiStatus: "Healthy (99.96% uptime)",
      serverHealth: { cpu: 32, ram: 64, storage: 45 },
      activeSessions: 342,
      failedRequests: 14,
      integrationStats: { active: 38, error: 2, inactive: 8 }
    }
  }
};

// Backwards-compatibility hook: copy Home hardware dealers into companyAdmin.dealers
window.BotNBoltMockData.companyAdmin.dealers = window.BotNBoltMockData.superAdmin.dealers.filter(
  d => d.company === "Home hardware"
);
