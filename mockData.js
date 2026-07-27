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

      // 2. BMR Group (6 dealers)
      { id: "DLR-BG-01", name: "BMR Group 01", company: "BMR Group", city: "Toronto", location: "2500 Dufferin St", province: "Ontario", manager: "Jack Ryan", phone: "+1 (416) 555-9311", email: "bmr01@bmr.com", monthlyRequests: 95, materialSales: 7800, conversionRate: 68.4, rating: 4.3, lastActive: "Today, 10:00 AM", status: "Active" },
      { id: "DLR-BG-02", name: "BMR Group 02", company: "BMR Group", city: "Montreal", location: "444 Rue Jean-Talon", province: "Quebec", manager: "Marie Curie", phone: "+1 (514) 555-9312", email: "bmr02@bmr.com", monthlyRequests: 70, materialSales: 5800, conversionRate: 64.2, rating: 4.2, lastActive: "Yesterday", status: "Active" },
      { id: "DLR-BG-03", name: "BMR Group 03", company: "BMR Group", city: "Calgary", location: "333 36 St NE", province: "Alberta", manager: "Bruce Wayne", phone: "+1 (403) 555-9313", email: "bmr03@bmr.com", monthlyRequests: 45, materialSales: 2900, conversionRate: 59.8, rating: 4.1, lastActive: "Yesterday", status: "Active" },
      { id: "DLR-BG-04", name: "BMR Group 04", company: "BMR Group", city: "Edmonton", location: "8888 137 Ave NW", province: "Alberta", manager: "Clark Kent", phone: "+1 (780) 555-9314", email: "bmr04@bmr.com", monthlyRequests: 28, materialSales: 1600, conversionRate: 52.5, rating: 3.9, lastActive: "Yesterday", status: "Active" },
      { id: "DLR-BG-05", name: "BMR Group 05", company: "BMR Group", city: "Ottawa", location: "1901 St. Laurent Blvd", province: "Ontario", manager: "Lois Lane", phone: "+1 (613) 555-9315", email: "bmr05@bmr.com", monthlyRequests: 62, materialSales: 4900, conversionRate: 65.0, rating: 4.4, lastActive: "Today, 09:00 AM", status: "Active" },
      { id: "DLR-BG-06", name: "BMR Group 06", company: "BMR Group", city: "Winnipeg", location: "800 Nairn Ave", province: "Manitoba", manager: "Peter Parker", phone: "+1 (204) 555-9316", email: "bmr06@bmr.com", monthlyRequests: 40, materialSales: 2700, conversionRate: 58.2, rating: 4.0, lastActive: "3 days ago", status: "Active" }
    ],
    logs: [
      { id: "LOG-001", timestamp: "2026-07-07 11:20 AM", user: "Marcus Vance", ip: "192.168.1.14", action: "Exported regional dealer analytics spreadsheet", module: "Dealer Management", status: "Success" },
      { id: "LOG-002", timestamp: "2026-07-07 10:45 AM", user: "Sarah Connor", ip: "192.168.1.28", action: "Assigned manager David Miller to Ticket TKT-9042", module: "Support Ticket Desk", status: "Success" },
      { id: "LOG-003", timestamp: "2026-07-07 09:15 AM", user: "Alex Mercer", ip: "10.0.0.145", action: "Attempted login with expired password", module: "Authentication Gate", status: "Failed Login" },
      { id: "LOG-004", timestamp: "2026-07-07 08:30 AM", user: "System Scheduler", ip: "127.0.0.1", action: "Triggered nightly model performance sweep", module: "AI Engine Core", status: "Success" },
      { id: "LOG-005", timestamp: "2026-07-07 07:12 AM", user: "Nihit Sharma", ip: "192.168.1.5", action: "Created new tenant BMR Group", module: "Partner Desk", status: "Success" },
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
        labels: ["Home hardware 01 - Toronto", "BMR Group 01 - Toronto", "Home hardware 05 - Ottawa", "BMR Group 02 - Montreal", "Home hardware 08 - Vancouver"],
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
      { id: "TKT-9038", issueType: "Login Issues", customerName: "Pierre Seguin", company: "Home hardware", dealer: "Home hardware 02", priority: "Medium", status: "In Progress", assignedTo: "Sarah Connor", responseTime: "45 min", resolutionTime: "Pending", date: "2026-07-07 09:12 AM" },
      { id: "TKT-9015", issueType: "Billing Issues", customerName: "Marcus Vance", company: "Home hardware", dealer: "HQ Admin", priority: "High", status: "Open", assignedTo: "Unassigned", responseTime: "Not Responded", resolutionTime: "Pending", date: "2026-07-07 07:05 AM" },
      { id: "TKT-8951", issueType: "API Failure", customerName: "Alex Mercer", company: "BMR Group", dealer: "BMR Group 01", priority: "High", status: "Resolved", assignedTo: "Alex Mercer", responseTime: "8 min", resolutionTime: "34 min", date: "2026-07-06 03:22 PM" },
      { id: "TKT-8840", issueType: "Dealer Access Problem", customerName: "Clark Kent", company: "BMR Group", dealer: "BMR Group 04", priority: "Low", status: "Resolved", assignedTo: "David Miller", responseTime: "2 hours", resolutionTime: "4 hours", date: "2026-07-05 01:10 PM" },
      { id: "TKT-8799", issueType: "Website Integration Issue", customerName: "Clint Barton", company: "BMR Group", dealer: "BMR Group 02", priority: "Medium", status: "Resolved", assignedTo: "Sarah Connor", responseTime: "1 hour", resolutionTime: "3 hours", date: "2026-07-04 10:05 AM" }
    ],
    companySupportOverview: [
      { name: "Home hardware", activeTickets: 2, escalatedTickets: 1, integrationStatus: "Active", lastContacted: "Today, 11:20 AM" },
      { name: "BMR Group", activeTickets: 0, escalatedTickets: 0, integrationStatus: "Active", lastContacted: "3 days ago" }
    ],
    dealerSupport: [
      { dealerName: "Home hardware 01", city: "Toronto", storeIssues: "API mismatch on login", loginProblems: 2, aiComplaints: 4, customerComplaints: 0 },
      { dealerName: "Home hardware 05", city: "Ottawa", storeIssues: "Slow image uploading", loginProblems: 1, aiComplaints: 1, customerComplaints: 1 },
      { dealerName: "BMR Group 04", city: "Edmonton", storeIssues: "None", loginProblems: 0, aiComplaints: 0, customerComplaints: 0 }
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
        reportedBy: "BMR Group 02",
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
    },
    tenantAwsBilling: {
      kpis: {
        totalAwsCost: 7570.20,
        awsCostChange: "+4.2%",
        totalRevenue: 42200.00,
        revenueChange: "+12.8%",
        grossProfit: 34629.80,
        profitMargin: 82.06,
        activeTenants: 2,
        newTenants: "+0 New",
        totalRequests: "1.67M",
        requestsChange: "+14.2%",
        totalStorage: "21.2 TB",
        storageGrowth: "+2.1 TB"
      },
      topInsights: {
        highestCostTenant: { name: "Home Hardware", logo: "HH", cost: "$6,150.20", trend: "+4.2%" },
        highestStorageConsumer: { name: "Home Hardware", logo: "HH", storage: "18.4 TB", trend: "+4.1%" },
        highestAiUsage: { name: "Home Hardware", logo: "HH", usage: "112.5M Tokens ($1,950.20 Bedrock)", trend: "+8.4%" },
        mostProfitableCustomer: { name: "BMR Group", logo: "BG", profit: "$8,380.00 (85.5% Margin)", trend: "+6.2%" }
      },
      awsCostDistribution: [
        { service: "Amazon S3", percentage: 41, cost: 3070.00, color: "#10b981" },
        { service: "Amazon Bedrock", percentage: 34, cost: 2590.20, color: "#2563eb" },
        { service: "Amazon ECS / Fargate", percentage: 13, cost: 1000.00, color: "#f59e0b" },
        { service: "API Gateway", percentage: 7, cost: 560.00, color: "#8b5cf6" },
        { service: "Amazon Textract", percentage: 5, cost: 350.00, color: "#ec4899" }
      ],
      monthlyCostTrend: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        costs: [5200, 5600, 6100, 6400, 6800, 7150, 7570.20]
      },
      tenants: [
        {
          id: "TNT-001",
          name: "Home Hardware",
          logo: "HH",
          plan: "Enterprise Platinum",
          activeUsers: 320,
          monthlyRequests: "1,250,000",
          storageUsed: "18.4 TB",
          aiTokens: "112.5M",
          awsCost: 6150.20,
          customerInvoice: 32400.00,
          profit: 26249.80,
          profitMargin: "81.0%",
          invoiceStatus: "Paid",
          country: "Canada",
          joinedDate: "2024-03-20",
          region: "ca-central-1",
          breakdown: {
            requests: { total: "1,250,000", images: "620,000", pdfs: "280,000", voice: "90,000", aiConvos: "260,000" },
            infra: { storage: "18.4 TB", tokens: "112.5M", ocrPages: "310,000", apiCalls: "1.25M", cpuHours: "2,400", bandwidth: "9.8 TB", vectorSearches: "380,000" },
            financials: { estAwsCost: 6150.20, invoice: 32400.00, grossProfit: 26249.80, outstanding: 0.00 },
            services: [
              { name: "Amazon S3", usage: "18.4 TB", unit: "TB-Month", cost: 2650.00, pct: 43.1 },
              { name: "Amazon Bedrock", usage: "112.5M Tokens", unit: "Tokens", cost: 1950.20, pct: 31.7 },
              { name: "Amazon ECS/Fargate", usage: "2,400 Hrs", unit: "vCPU-Hrs", cost: 780.00, pct: 12.7 },
              { name: "API Gateway", usage: "1.25M Calls", unit: "Requests", cost: 420.00, pct: 6.8 },
              { name: "Amazon Textract", usage: "310K Pages", unit: "Pages", cost: 350.00, pct: 5.7 }
            ]
          }
        },
        {
          id: "TNT-002",
          name: "BMR Group",
          logo: "BG",
          plan: "Premium Standard",
          activeUsers: 150,
          monthlyRequests: "420,000",
          storageUsed: "2.8 TB",
          aiTokens: "38.6M",
          awsCost: 1420.00,
          customerInvoice: 9800.00,
          profit: 8380.00,
          profitMargin: "85.5%",
          invoiceStatus: "Paid",
          country: "Canada",
          joinedDate: "2025-02-01",
          region: "ca-central-1",
          breakdown: {
            requests: { total: "420,000", images: "180,000", pdfs: "90,000", voice: "30,000", aiConvos: "120,000" },
            infra: { storage: "2.8 TB", tokens: "38.6M", ocrPages: "85,000", apiCalls: "420K", cpuHours: "620", bandwidth: "2.6 TB", vectorSearches: "110,000" },
            financials: { estAwsCost: 1420.00, invoice: 9800.00, grossProfit: 8380.00, outstanding: 0.00 },
            services: [
              { name: "Amazon Bedrock", usage: "38.6M Tokens", unit: "Tokens", cost: 640.00, pct: 45.1 },
              { name: "Amazon S3", usage: "2.8 TB", unit: "TB-Month", cost: 420.00, pct: 29.6 },
              { name: "Amazon ECS/Fargate", usage: "620 Hrs", unit: "vCPU-Hrs", cost: 220.00, pct: 15.5 },
              { name: "API Gateway", usage: "420K Calls", unit: "Requests", cost: 140.00, pct: 9.8 }
            ]
          }
        }
      ],
      storageAnalytics: {
        metrics: {
          images: "24.2 TB",
          pdfs: "14.6 TB",
          reports: "4.8 TB",
          voice: "2.4 TB",
          videos: "1.8 TB",
          deleted: "0.6 TB",
          archivedGlacier: "12.4 TB",
          retentionPolicy: "90 Days Auto-Archive to Glacier Deep Archive",
          monthlyGrowth: "+3.2 TB / mo"
        },
        trend: {
          labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
          dataTB: [32.4, 35.8, 39.1, 42.6, 45.4, 48.6]
        }
      },
      aiUsageAnalytics: {
        metrics: {
          inputTokens: "842.5M",
          outputTokens: "421.2M",
          avgTokensPerReq: "1,248",
          aiRequests: "1.01M",
          avgAiCost: "$0.012",
          avgResponseTime: "185 ms",
          mostUsedModel: "OpenAI GPT-4 Vision"
        },
        tokenTrend: {
          labels: ["Jul 18", "Jul 19", "Jul 20", "Jul 21", "Jul 22", "Jul 23", "Jul 24"],
          input: [110, 125, 118, 142, 135, 150, 162],
          output: [55, 62, 59, 71, 68, 75, 81]
        },
        dailyCost: {
          labels: ["Jul 18", "Jul 19", "Jul 20", "Jul 21", "Jul 22", "Jul 23", "Jul 24"],
          costs: [340, 380, 360, 440, 410, 480, 520]
        },
        modelDistribution: [
          { model: "OpenAI GPT-4 Vision", percentage: 58, color: "#2563eb" },
          { model: "OpenAI GPT-4o", percentage: 24, color: "#10b981" },
          { model: "Qdrant Vector Engine", percentage: 12, color: "#f59e0b" },
          { model: "Amazon Textract OCR", percentage: 6, color: "#8b5cf6" }
        ]
      },
      requestAnalytics: [
        { id: "REQ-9901", user: "Marcus Vance", tenant: "Home Hardware", module: "AI Surface Scan", model: "OpenAI GPT-4 Vision", storage: "14.2 MB", services: "S3, OpenAI, Qdrant VectorDB", time: "182 ms", cost: "$0.018", date: "2026-07-24 12:44:12" },
        { id: "REQ-9902", user: "Sarah Jenkins", tenant: "Home Hardware", module: "Material Estimator", model: "OpenAI GPT-4o", storage: "8.4 MB", services: "S3, OpenAI, Qdrant VectorDB", time: "145 ms", cost: "$0.014", date: "2026-07-24 12:41:05" },
        { id: "REQ-9903", user: "David Miller", tenant: "Home Hardware", module: "SKU Catalog Match", model: "Qdrant Vector Engine", storage: "2.1 MB", services: "S3, Qdrant VectorDB", time: "92 ms", cost: "$0.006", date: "2026-07-24 12:38:50" },
        { id: "REQ-9904", user: "Elena Rostova", tenant: "BMR Group", module: "Structural Analysis", model: "AWS Bedrock (Claude 3.5)", storage: "22.6 MB", services: "S3, Textract, Bedrock", time: "240 ms", cost: "$0.024", date: "2026-07-24 12:35:19" },
        { id: "REQ-9905", user: "Alex Mercer", tenant: "BMR Group", module: "Product Recommendation", model: "OpenAI GPT-4o", storage: "4.8 MB", services: "S3, OpenAI, Qdrant VectorDB", time: "110 ms", cost: "$0.008", date: "2026-07-24 12:25:01" },
        { id: "REQ-9906", user: "Clark Kent", tenant: "BMR Group", module: "PDF Repair Guide OCR", model: "Amazon Textract OCR", storage: "18.9 MB", services: "S3, Textract", time: "420 ms", cost: "$0.032", date: "2026-07-24 12:18:30" }
      ],
      billingSummary: {
        awsInfraCost: 7570.20,
        platformCharges: 25000.00,
        aiServiceCharges: 9630.00,
        supportCharges: 2000.00,
        discounts: -2000.00,
        taxes: 5486.00,
        finalInvoiceAmount: 47686.20
      },
      billingEvents: [
        { id: "EVT-101", timestamp: "10 mins ago", company: "Home Hardware", eventType: "Invoice Generated", detail: "Monthly invoice #INV-2026-0701 generated for $32,400.00", status: "Success", icon: "file-check" },
        { id: "EVT-102", timestamp: "1 hour ago", company: "Home Hardware", eventType: "Invoice Sent", detail: "Automated billing summary PDF emailed to finance@homehardware.ca", status: "Success", icon: "mail" },
        { id: "EVT-103", timestamp: "3 hours ago", company: "BMR Group", eventType: "Payment Received", detail: "ACH Direct Deposit of $9,800.00 confirmed by Stripe Ledger", status: "Success", icon: "credit-card" },
        { id: "EVT-104", timestamp: "5 hours ago", company: "Home Hardware", eventType: "Storage Increased", detail: "Auto-scaling S3 bucket threshold adjusted (+4.5 TB scaling allocation)", status: "Info", icon: "database" },
        { id: "EVT-105", timestamp: "8 hours ago", company: "BMR Group", eventType: "AI Usage Spike", detail: "Token throughput exceeded 30M threshold (+24% surge in AI requests)", status: "Warning", icon: "zap" },
        { id: "EVT-106", timestamp: "12 hours ago", company: "BMR Group", eventType: "Budget Alert", detail: "AWS monthly consumption reached 85% of assigned quota ($1,420 / $1,600)", status: "Warning", icon: "alert-triangle" }
      ],
      recommendations: [
        { id: "REC-01", title: "Reduce Unused S3 Temp Storage", savings: "$1,240 / mo", priority: "High", desc: "Automate 7-day lifecycle purge policy on temporary upload buckets across all enterprise tenants.", action: "Apply Auto-Purge" },
        { id: "REC-02", title: "Archive Inactive PDF Manuals", savings: "$850 / mo", priority: "Medium", desc: "Move PDF technical manuals older than 60 days to Amazon S3 Glacier Flexible Retrieval.", action: "Migrate to Glacier" },
        { id: "REC-03", title: "Enable Image WebP Compression", savings: "$620 / mo", priority: "Medium", desc: "Compress uploaded terminal diagnostic photos to WebP before writing to S3 storage.", action: "Enable Compression" },
        { id: "REC-04", title: "Optimize AI Prompt Tokens", savings: "$2,150 / mo", priority: "High", desc: "Trim redundant context tokens in system prompt templates for Bedrock inference calls.", action: "Trim Prompt Tokens" },
        { id: "REC-05", title: "Enable Bedrock Response Caching", savings: "$3,400 / mo", priority: "High", desc: "Cache common hardware SKU lookup embeddings using ElastiCache Redis cluster.", action: "Enable Caching" },
        { id: "REC-06", title: "Move Old Files to Glacier Deep", savings: "$1,100 / mo", priority: "Low", desc: "Transition repair logs older than 180 days to S3 Glacier Deep Archive tier.", action: "Configure Rule" },
        { id: "REC-07", title: "Delete Expired Temporary Files", savings: "$480 / mo", priority: "Low", desc: "Purge unreferenced temporary scan uploads and transient thumbnail images.", action: "Clean Temp Uploads" }
      ]
    }
  }
};

// Backwards-compatibility hook: copy Home hardware dealers into companyAdmin.dealers
window.BotNBoltMockData.companyAdmin.dealers = window.BotNBoltMockData.superAdmin.dealers.filter(
  d => d.company === "Home hardware"
);
window.BotNBoltMockData.superAdmin.tenantAwsBilling = window.BotNBoltMockData.supportAdmin.tenantAwsBilling;
