"use strict";

const LOGO_SRC = "marsu_logo.png";
const SESSION_KEY = "iskolar.session";
const APPLICATIONS_KEY = "iskolar.applications";
const SCHOLARSHIPS_KEY = "iskolar.scholarships";
const ANNOUNCEMENTS_KEY = "iskolar.announcements";
const PROFILE_KEY = "iskolar.profile";
const PAYOUTS_KEY = "iskolar.payouts";
const STUDENTS_KEY = "iskolar.students";
const page = document.body.dataset.page;
const expectedRole = document.body.dataset.role;

const defaultScholarships = [
  { id: "tdp", name: "Tulong Dunong Program (TDP)", sponsor: "CHED", category: "Government", deadline: "2026-12-15", amount: "Based on current CHED guidelines", description: "Financial assistance for qualified students enrolled in a recognized higher education institution.", requirements: ["Certificate of registration", "Certificate of indigency or latest ITR", "Latest grades", "Student ID"] },
  { id: "tes", name: "Tertiary Education Subsidy (TES)", sponsor: "UniFAST", category: "Government", deadline: "2026-12-20", amount: "Subject to program guidelines", description: "A government grant for eligible students, subject to current UniFAST qualifications and available funding.", requirements: ["Certificate of registration", "Proof of household income", "Latest grades", "Student ID"] },
  { id: "provincial", name: "Provincial Government Scholarship", sponsor: "Province of Marinduque", category: "Provincial", deadline: "2027-01-10", amount: "See provincial announcement", description: "Scholarship support for qualified Marinduque residents pursuing higher education.", requirements: ["Proof of residency", "Certificate of registration", "Latest grades", "Barangay certificate"] },
  { id: "lgu", name: "LGU Scholarship Assistance", sponsor: "Local Government Unit", category: "LGU", deadline: "2027-01-18", amount: "Varies by LGU", description: "Local scholarship opportunities for eligible students. Confirm specific terms with your LGU.", requirements: ["Proof of residency", "Certificate of registration", "Latest grades", "Valid ID"] },
  { id: "marsu", name: "MarSU Student Assistance", sponsor: "MarSU", category: "University", deadline: "2027-02-05", amount: "Based on eligibility and availability", description: "University-recognized student assistance. The scholarship office will announce applicable eligibility criteria.", requirements: ["Certificate of registration", "Latest grades", "Student ID", "Application form"] }
];

const defaultApplications = [
  { id: "APP-2026-1042", studentId: "2023-00124", student: "Mikaela S. Reyes", course: "BS Information Technology", scholarship: "Tulong Dunong Program (TDP)", status: "Pending", submitted: "2026-11-06", documents: ["Certificate of Registration.pdf", "Grades.pdf"] },
  { id: "APP-2026-1039", studentId: "2022-00418", student: "Joshua L. Mendoza", course: "BS Education", scholarship: "Provincial Government Scholarship", status: "Approved", submitted: "2026-11-04", documents: ["Certificate of Registration.pdf", "Barangay Certificate.jpg"] },
  { id: "APP-2026-1035", studentId: "2024-00275", student: "Andrea P. Santos", course: "BS Agriculture", scholarship: "Tertiary Education Subsidy (TES)", status: "Pending", submitted: "2026-11-02", documents: ["Certificate of Registration.pdf", "Income Affidavit.pdf"] },
  { id: "APP-2026-1028", studentId: "2023-00087", student: "Paolo R. Dela Cruz", course: "BS Fisheries", scholarship: "LGU Scholarship Assistance", status: "Rejected", submitted: "2026-10-28", documents: ["Certificate of Registration.pdf"] },
  { id: "APP-2026-1016", studentId: "2021-00316", student: "Camille T. Garcia", course: "BS Hospitality Management", scholarship: "MarSU Student Assistance", status: "Approved", submitted: "2026-10-21", documents: ["Certificate of Registration.pdf", "Grades.pdf"] }
];

const defaultAnnouncements = [
  { title: "Scholarship application period is open", date: "November 10, 2026", body: "Applications for selected government, provincial, LGU, and MarSU-recognized scholarships are now being accepted. Review each program's requirements and deadline before applying." },
  { title: "Keep your student profile up to date", date: "November 7, 2026", body: "Please verify your contact information and academic details before submitting an application. Incomplete information may delay review." },
  { title: "Document submission reminders", date: "November 3, 2026", body: "Upload clear, readable scans or photos of all required documents. Use PDF, JPG, or PNG files and check each program's requirements." }
];

const defaultPayouts = [
  { program: "Tulong Dunong Program (TDP)", date: "2026-12-12", venue: "MarSU Main Campus, Boac", details: "Bring your student ID and original supporting documents for verification." },
  { program: "Provincial Government Scholarship", date: "2026-12-19", venue: "Provincial Capitol, Boac", details: "Release details are subject to confirmation by the Provincial Scholarship Office." },
  { program: "MarSU Student Assistance", date: "2027-01-08", venue: "MarSU Cashier's Office", details: "Approved applicants will receive an individual notice with collection instructions." }
];
const defaultStudents = [
  { studentId: "2023-00124", name: "Mikaela S. Reyes", email: "mikaela.reyes@student.marsu.edu.ph", course: "BS Information Technology", status: "Active" },
  { studentId: "2022-00418", name: "Joshua L. Mendoza", email: "joshua.mendoza@student.marsu.edu.ph", course: "BS Education", status: "Active" },
  { studentId: "2024-00275", name: "Andrea P. Santos", email: "andrea.santos@student.marsu.edu.ph", course: "BS Agriculture", status: "Active" },
  { studentId: "2023-00087", name: "Paolo R. Dela Cruz", email: "paolo.delacruz@student.marsu.edu.ph", course: "BS Fisheries", status: "Active" },
  { studentId: "2021-00316", name: "Camille T. Garcia", email: "camille.garcia@student.marsu.edu.ph", course: "BS Hospitality Management", status: "Active" }
];

function readStore(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.error(`Unable to read ${key}`, error);
    return fallback;
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Unable to save ${key}`, error);
    showToast("Your browser could not save this change. Check available storage and try again.");
    return false;
  }
}

function session() {
  return readStore(SESSION_KEY, null);
}

function isLocalPrototype() {
  return ["localhost", "127.0.0.1", "::1", "[::1]"].includes(window.location.hostname);
}

if (!session()) {
  localStorage.removeItem("userRole");
}

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function displayDate(value) {
  if (!value) return "To be announced";
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

function currentProfile() {
  const user = session() || {};
  return Object.assign({
    name: user.name || "MarSU Student",
    studentId: user.studentId || user.id || "Student account",
    course: user.course || "",
    year: user.year || "",
    email: user.email || "",
    phone: user.phone || "",
    campus: user.campus || ""
  }, readStore(PROFILE_KEY, {}));
}

function applications() {
  return readStore(APPLICATIONS_KEY, defaultApplications);
}

function scholarships() {
  return readStore(SCHOLARSHIPS_KEY, defaultScholarships);
}

function announcements() {
  return readStore(ANNOUNCEMENTS_KEY, defaultAnnouncements);
}

function payoutSchedules() {
  return readStore(PAYOUTS_KEY, defaultPayouts);
}

function studentAccounts() {
  return readStore(STUDENTS_KEY, defaultStudents);
}

function statusBadge(status) {
  const normalized = String(status || "").toLowerCase();
  const className = normalized === "approved" ? "badge-approved" : normalized === "rejected" ? "badge-rejected" : normalized === "under review" ? "badge-review" : "badge-pending";
  return `<span class="badge ${className}">${escapeHtml(status || "Pending")}</span>`;
}

function logo() {
  return `<img src="${LOGO_SRC}" alt="Marinduque State University official logo" data-marsu-logo>`;
}

function pageTitle(name, description, eyebrow = "ISKOLAR MARSU") {
  return `<header class="page-heading"><div><p class="eyebrow">${escapeHtml(eyebrow)}</p><h1>${escapeHtml(name)}</h1><p class="page-description">${escapeHtml(description)}</p></div></header>`;
}

const studentNav = [
  ["student-dashboard.html", "Overview", "⌂"],
  ["scholarships.html", "Scholarships", "◇"],
  ["tracking.html", "My applications", "◷"],
  ["announcements.html", "Announcements", "▤"],
  ["payouts.html", "Payout schedule", "◷"],
  ["profile.html", "My profile", "○"]
];
const adminNav = [
  ["admin-dashboard.html", "Overview & applications", "⌂"]
];

function shell(content, role) {
  const user = session() || {};
  const links = role === "admin" ? adminNav : studentNav;
  const activeHref = role === "admin" ? "admin-dashboard.html" : `${page}.html`;
  const name = role === "admin" ? (user.name || "Scholarship Staff") : (currentProfile().name || "Student");
  const initials = name.split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase();
  const nav = links.map(([href, label, icon]) => `<a class="nav-link" href="${href}"${href === activeHref ? ' aria-current="page"' : ""}><span class="nav-icon" aria-hidden="true">${icon}</span>${label}</a>`).join("");
  const heading = role === "admin" ? "Staff workspace" : "Student portal";
  return `<a class="skip-link" href="#main-content">Skip to main content</a>
    <div class="app-shell">
      <aside class="sidebar" id="site-sidebar" aria-label="Main navigation">
        <div class="sidebar-head"><a class="brand" href="${role === "admin" ? "admin-dashboard.html" : "student-dashboard.html"}">${logo()}<span class="brand-copy"><strong>ISKOLAR MARSU</strong><small>Scholarship Services</small></span></a><button class="icon-button sidebar-close" type="button" aria-label="Close navigation menu" aria-controls="site-sidebar" aria-expanded="false" data-action="menu">×</button></div>
        <p class="role-label">${role === "admin" ? "Admin / Staff" : "Student"}</p>
        <nav class="nav-list" aria-label="${role === "admin" ? "Staff" : "Student"} pages">${nav}</nav>
        <div class="sidebar-bottom"><a class="nav-link" href="#" data-action="logout"><span class="nav-icon" aria-hidden="true">↪</span>Sign out</a></div>
      </aside>
      <div class="workspace">
        <header class="topbar">
          <div class="topbar-left"><button class="icon-button menu-toggle" type="button" aria-label="Open navigation menu" aria-controls="site-sidebar" aria-expanded="false" data-action="menu">☰</button><div><p class="topbar-title">${heading}</p><p class="topbar-subtitle">Marinduque State University</p></div></div>
          <div class="topbar-actions"><button class="icon-button" type="button" aria-label="Notifications" aria-expanded="false" aria-controls="notification-panel" data-action="notifications">♧</button><div class="user-chip"><span class="avatar" aria-hidden="true">${escapeHtml(initials || "M")}</span><span class="user-info"><strong>${escapeHtml(name)}</strong><span>${role === "admin" ? "Admin / Staff" : "Student account"}</span></span></div></div>
          <section class="notification-panel" id="notification-panel" aria-label="Notifications" hidden><div class="section-head"><h2>Notifications</h2><a href="announcements.html">View all</a></div><div class="list-item"><div><p class="item-title">Scholarship application period is open</p><p class="item-meta">Review deadlines and prepare your documents.</p></div></div><div class="list-item"><div><p class="item-title">Keep your profile current</p><p class="item-meta">Confirm your contact and academic information.</p></div></div></section>
        </header>
        <main class="main-content" id="main-content">${content}</main>
      </div>
    </div><div class="toast" role="status" aria-live="polite" hidden></div>`;
}

function renderLogin(admin) {
  const title = admin ? "Staff / Admin sign in" : "Student sign in";
  const summary = admin ? "Sign in to the separate Admin / Staff workspace." : "Sign in to browse scholarships, submit applications, and track updates.";
  return `<main class="auth-page">
    <section class="auth-brand-panel" aria-label="About ISKOLAR MARSU">
      <a class="brand" href="login.html">${logo()}<span class="brand-copy"><strong>ISKOLAR MARSU</strong><small>Marinduque State University</small></span></a>
      <div class="auth-message"><p class="eyebrow">Scholarship Application &amp; Monitoring</p><h1>Support for your next chapter.</h1><p>A clear, convenient way for MarSU students to discover scholarship opportunities, submit requirements, and follow application updates.</p></div>
      <p class="auth-footer">Marinduque State University · Scholarship Services</p>
    </section>
    <section class="auth-form-panel"><div class="auth-form-wrap">
      <p class="eyebrow">${admin ? "Authorized personnel" : "Student portal"}</p><h2>${title}</h2><p>${summary}</p>
      <form data-form="login" data-login-role="${admin ? "admin" : "student"}" novalidate>
        <p class="form-error" id="login-error" role="alert"></p>
        <div class="field"><label for="login-identifier">Email address</label><input id="login-identifier" name="identifier" type="email" autocomplete="username" placeholder="University or personal email" required></div>
        <div class="field"><label for="login-password">Password</label><input id="login-password" name="password" type="password" autocomplete="current-password" required></div>
        <button class="button" type="submit">${admin ? "Sign in to staff portal" : "Sign in to student portal"}</button>
      </form>
      ${admin ? `<p class="auth-switch"><a href="login.html">← Back to role selection</a></p>` : `<p class="auth-switch">Student account access is provided by your administrator. <a href="register.html">Need account access?</a></p><p class="auth-switch"><a href="login.html">Change role</a></p>`}
      <p class="field-help">Enter your email and password to continue. Passwords are not stored in this page.</p>
    </div></section>
  </main>`;
}

function renderRoleSelect() {
  return `<main class="auth-page">
    <section class="auth-brand-panel" aria-label="About ISKOLAR MARSU">
      <a class="brand" href="login.html">${logo()}<span class="brand-copy"><strong>ISKOLAR MARSU</strong><small>Marinduque State University</small></span></a>
      <div class="auth-message"><p class="eyebrow">Scholarship Application &amp; Monitoring</p><h1>Your scholarship journey starts here.</h1><p>Explore opportunities, submit your requirements, and keep track of important application updates—all in one place.</p></div>
      <p class="auth-footer">Marinduque State University · Scholarship Services</p>
    </section>
    <section class="auth-form-panel"><div class="auth-form-wrap">
      <p class="eyebrow">Welcome to ISKOLAR MARSU</p><h2>Choose your portal</h2><p>Select the account role you were assigned. Staff selection takes you to the separate staff sign-in page.</p>
      <form data-form="role-select"><div class="field"><label for="role-select">I am signing in as</label><select id="role-select" name="role" required><option value="student">Student</option><option value="admin">Admin / Staff</option></select></div><button class="button" type="submit">Continue to sign in</button></form>
      <p class="auth-switch">Student accounts are assigned by the administrator. <a href="register.html">Request account access</a></p>
    </div></section>
  </main>`;
}

function renderRegistration() {
  return `<main class="auth-page">
    <section class="auth-brand-panel" aria-label="About ISKOLAR MARSU">
      <a class="brand" href="login.html">${logo()}<span class="brand-copy"><strong>ISKOLAR MARSU</strong><small>Marinduque State University</small></span></a>
      <div class="auth-message"><p class="eyebrow">Account access</p><h1>University accounts, securely managed.</h1><p>Student access is provisioned by the administrator to protect applicant records and ensure accurate enrollment information.</p></div>
      <p class="auth-footer">Marinduque State University · Scholarship Services</p>
    </section>
    <section class="auth-form-panel"><div class="auth-form-wrap">
      <p class="eyebrow">No public self-registration</p><h2>Request account access</h2><p>Students sign in with their assigned MarSU account. To activate or recover an account, contact the Scholarship Office or your campus administrator.</p>
      <form data-form="role-select"><div class="field"><label for="role-select">Select your role</label><select id="role-select" name="role" required><option value="student">Student — I need account access</option><option value="admin">Admin / Staff</option></select></div><button class="button" type="submit">Continue</button></form>
      <div class="callout" style="margin-top:16px">Do not share your password. Staff credentials are never provided through public demo access.</div>
      <p class="auth-switch"><a href="login.html">← Return to sign in</a></p>
    </div></section>
  </main>`;
}

function renderStudentDashboard() {
  const user = currentProfile();
  const mine = applications().filter(item => item.studentId === user.studentId);
  const approved = mine.filter(item => item.status === "Approved").length;
  const notices = announcements().slice(0, 2);
  return `${pageTitle("Good day, " + (user.name.split(" ")[0] || "Student"), "Your scholarship applications and important updates at a glance.", "STUDENT DASHBOARD")}
    <section class="welcome-panel"><h2>Make the most of your scholarship opportunities.</h2><p>Browse current programs, check each program's requirements, and submit your application before the deadline. Application decisions are made by authorized scholarship staff.</p><a class="button button-gold" href="scholarships.html">Explore scholarships <span aria-hidden="true">→</span></a></section>
    <div class="grid stats-grid">
      <article class="card stat-card"><div><span class="stat-label">My applications</span><strong class="stat-value">${mine.length}</strong><span class="stat-caption">Submitted applications</span></div><span class="stat-icon" aria-hidden="true">▤</span></article>
      <article class="card stat-card"><div><span class="stat-label">Pending</span><strong class="stat-value">${mine.filter(item => item.status === "Pending").length}</strong><span class="stat-caption">Awaiting a decision</span></div><span class="stat-icon" aria-hidden="true">◷</span></article>
      <article class="card stat-card"><div><span class="stat-label">Approved</span><strong class="stat-value">${approved}</strong><span class="stat-caption">Staff-reviewed decisions</span></div><span class="stat-icon" aria-hidden="true">✓</span></article>
      <article class="card stat-card"><div><span class="stat-label">Open programs</span><strong class="stat-value">${scholarships().length}</strong><span class="stat-caption">Scholarships to explore</span></div><span class="stat-icon" aria-hidden="true">◇</span></article>
    </div>
    <div class="grid two-column">
      <section class="card card-pad"><div class="section-head"><h2>Recent applications</h2><a href="tracking.html">View all</a></div>${mine.length ? `<div class="list">${mine.slice(0, 3).map(item => `<div class="list-item"><div><p class="item-title">${escapeHtml(item.scholarship)}</p><p class="item-meta">Submitted ${displayDate(item.submitted)} · ${escapeHtml(item.id)}</p></div>${statusBadge(item.status)}</div>`).join("")}</div>` : `<div class="empty-state">You have not submitted an application yet. Browse scholarships to get started.</div>`}</section>
      <section class="card card-pad"><div class="section-head"><h2>Latest announcements</h2><a href="announcements.html">View all</a></div>${notices.map(item => `<article class="announcement"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p><span class="item-meta">${escapeHtml(item.date)}</span></article>`).join("")}</section>
    </div>`;
}

function renderAdminDashboard() {
  const items = applications();
  return `${pageTitle("Scholarship administration", "Review every submitted application, verify requirements, and record decisions.", "ADMIN / STAFF DASHBOARD")}
    <div class="callout callout-maroon" style="margin-bottom:18px">This staff workspace includes the complete applicant register. Only Admin / Staff can change application decisions. All actions require server-side authorization in a live deployment.</div>
    <div class="grid stats-grid">
      <article class="card stat-card"><div><span class="stat-label">All applications</span><strong class="stat-value">${items.length}</strong><span class="stat-caption">Every applicant in the register</span></div><span class="stat-icon" aria-hidden="true">▤</span></article>
      <article class="card stat-card"><div><span class="stat-label">Pending</span><strong class="stat-value">${items.filter(item => item.status === "Pending").length}</strong><span class="stat-caption">Awaiting staff decision</span></div><span class="stat-icon" aria-hidden="true">◷</span></article>
      <article class="card stat-card"><div><span class="stat-label">Approved</span><strong class="stat-value">${items.filter(item => item.status === "Approved").length}</strong><span class="stat-caption">Approved applications</span></div><span class="stat-icon" aria-hidden="true">✓</span></article>
      <article class="card stat-card"><div><span class="stat-label">Rejected</span><strong class="stat-value">${items.filter(item => item.status === "Rejected").length}</strong><span class="stat-caption">Rejected applications</span></div><span class="stat-icon" aria-hidden="true">×</span></article>
    </div>
    <section class="card card-pad" style="margin-bottom:18px"><div class="section-head"><h2>All scholarship applications</h2><button class="button button-secondary button-small" type="button" data-action="export">Export applicant records</button></div>
      <div class="filters"><label class="sr-only" for="admin-search">Search applicants</label><input id="admin-search" type="search" placeholder="Search name, student ID, program…" data-filter="admin-search"><label class="sr-only" for="admin-status">Filter by status</label><select id="admin-status" data-filter="admin-status"><option value="">All statuses</option><option>Pending</option><option>Approved</option><option>Rejected</option></select><label class="sr-only" for="admin-program">Filter by scholarship</label><select id="admin-program" data-filter="admin-program"><option value="">All scholarships</option>${[...new Set(items.map(item => item.scholarship))].map(name => `<option>${escapeHtml(name)}</option>`).join("")}</select></div>
      <div class="table-wrap"><table><caption class="sr-only">All student scholarship applications and their decision statuses</caption><thead><tr><th scope="col">Applicant</th><th scope="col">Student ID / Course</th><th scope="col">Scholarship</th><th scope="col">Submitted</th><th scope="col">Status</th><th scope="col">Review actions</th></tr></thead><tbody id="admin-applications">${items.map(applicationRow).join("")}</tbody></table></div>
      <p class="field-help">Showing all ${items.length} submitted application records. Use the search and filters to locate an applicant.</p>
    </section>
    <div class="grid two-column">
      <section class="card card-pad"><div class="section-head"><h2>Post a scholarship opportunity</h2></div><form data-form="scholarship"><div class="form-grid"><div class="field field-full"><label for="program-name">Program name</label><input id="program-name" name="name" required></div><div class="field"><label for="program-sponsor">Sponsor</label><input id="program-sponsor" name="sponsor" required></div><div class="field"><label for="program-category">Category</label><select id="program-category" name="category"><option>Government</option><option>Provincial</option><option>LGU</option><option>University</option><option>Other</option></select></div><div class="field"><label for="program-deadline">Deadline</label><input id="program-deadline" name="deadline" type="date" required></div><div class="field"><label for="program-amount">Award / amount</label><input id="program-amount" name="amount"></div><div class="field field-full"><label for="program-description">Description and requirements</label><textarea id="program-description" name="description" required></textarea></div></div><div class="form-actions"><button class="button" type="submit">Publish opportunity</button></div></form></section>
      <section class="card card-pad"><div class="section-head"><h2>Publish an announcement</h2></div><form data-form="announcement"><div class="field"><label for="announcement-title">Announcement title</label><input id="announcement-title" name="title" required></div><div class="field" style="margin-top:14px"><label for="announcement-body">Message</label><textarea id="announcement-body" name="body" required></textarea></div><div class="form-actions"><button class="button" type="submit">Publish announcement</button></div></form></section>
    </div>
    <div class="grid two-column" style="margin-top:18px">
      <section class="card card-pad"><div class="section-head"><h2>Manage student accounts</h2></div><form data-form="student-account"><div class="form-grid"><div class="field"><label for="account-student-id">Assigned student ID</label><input id="account-student-id" name="studentId" required></div><div class="field"><label for="account-name">Student name</label><input id="account-name" name="name" required></div><div class="field"><label for="account-email">University email</label><input id="account-email" name="email" type="email" required></div><div class="field"><label for="account-course">Program / course</label><input id="account-course" name="course" required></div></div><div class="form-actions"><button class="button" type="submit">Add student record</button></div></form><div class="table-wrap" style="margin-top:17px"><table><caption class="sr-only">Student account access records</caption><thead><tr><th scope="col">Student</th><th scope="col">University account</th><th scope="col">Access</th></tr></thead><tbody>${studentAccounts().map(student => `<tr><td><strong>${escapeHtml(student.name)}</strong><br><span class="item-meta">${escapeHtml(student.studentId)} · ${escapeHtml(student.course)}</span></td><td>${escapeHtml(student.email)}</td><td><button class="button ${student.status === "Active" ? "button-secondary" : "button-small"} button-small" type="button" data-action="toggle-student" data-id="${escapeHtml(student.studentId)}">${escapeHtml(student.status)}</button></td></tr>`).join("")}</tbody></table></div><p class="field-help">Account credentials and provisioning are managed by the university authentication service. This register does not create passwords.</p></section>
      <section class="card card-pad"><div class="section-head"><h2>Manage payout schedules</h2></div><form data-form="payout"><input type="hidden" name="id"><div class="form-grid"><div class="field field-full"><label for="payout-program">Scholarship program</label><input id="payout-program" name="program" required></div><div class="field"><label for="payout-date">Release date</label><input id="payout-date" name="date" type="date" required></div><div class="field"><label for="payout-venue">Location</label><input id="payout-venue" name="venue" required></div><div class="field field-full"><label for="payout-details">Instructions</label><textarea id="payout-details" name="details" required></textarea></div></div><div class="form-actions"><button class="button" type="submit">Save payout schedule</button></div></form><div class="list" style="margin-top:17px">${payoutSchedules().map((item, index) => `<div class="list-item"><div><p class="item-title">${escapeHtml(item.program)}</p><p class="item-meta">${displayDate(item.date)} · ${escapeHtml(item.venue)}</p></div><div class="table-actions"><button class="button button-secondary button-small" type="button" data-action="edit-payout" data-index="${index}">Edit</button><button class="button button-danger button-small" type="button" data-action="remove-payout" data-index="${index}">Remove</button></div></div>`).join("")}</div></section>
    </div>`;
}

function applicationRow(item) {
  return `<tr data-application-row data-name="${escapeHtml(item.student)}" data-student-id="${escapeHtml(item.studentId)}" data-scholarship="${escapeHtml(item.scholarship)}" data-status="${escapeHtml(item.status)}">
    <td><strong>${escapeHtml(item.student)}</strong><br><span class="item-meta">${escapeHtml(item.id)}</span></td><td>${escapeHtml(item.studentId)}<br><span class="item-meta">${escapeHtml(item.course || "Course not provided")}</span></td><td>${escapeHtml(item.scholarship)}</td><td>${displayDate(item.submitted)}</td><td>${statusBadge(item.status)}</td>
    <td><div class="table-actions"><button class="button button-secondary button-small" type="button" data-action="view-application" data-id="${escapeHtml(item.id)}">View</button><button class="button button-small" type="button" data-action="set-status" data-id="${escapeHtml(item.id)}" data-status="Approved">Approve</button><button class="button button-danger button-small" type="button" data-action="set-status" data-id="${escapeHtml(item.id)}" data-status="Rejected">Reject</button><button class="button button-secondary button-small" type="button" data-action="set-status" data-id="${escapeHtml(item.id)}" data-status="Pending">Pending</button></div></td>
  </tr>`;
}

function renderScholarships() {
  const list = scholarships();
  return `${pageTitle("Scholarship opportunities", "Explore MarSU-recognized programs and review eligibility, requirements, and deadlines.", "FIND SUPPORT")}
    <div class="callout" style="margin-bottom:18px">Program criteria and award amounts may change. Confirm the latest details with the scholarship sponsor before applying.</div>
    <div class="filters"><label class="sr-only" for="scholarship-search">Search scholarships</label><input id="scholarship-search" type="search" placeholder="Search programs or sponsors…" data-filter="scholarship-search"><label class="sr-only" for="scholarship-category">Filter by category</label><select id="scholarship-category" data-filter="scholarship-category"><option value="">All categories</option>${[...new Set(list.map(item => item.category))].map(category => `<option>${escapeHtml(category)}</option>`).join("")}</select></div>
    <div class="grid three-column" id="scholarship-list">${list.map(scholarshipCard).join("")}</div>`;
}

function scholarshipCard(item) {
  const past = item.deadline && new Date(`${item.deadline}T23:59:59`) < new Date();
  return `<article class="card scholarship-card" data-scholarship-card data-name="${escapeHtml(item.name)}" data-sponsor="${escapeHtml(item.sponsor)}" data-category="${escapeHtml(item.category)}">
    <div><span class="badge">${escapeHtml(item.category)}</span><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description)}</p><p><strong>Sponsor:</strong> ${escapeHtml(item.sponsor)}<br><strong>Deadline:</strong> ${displayDate(item.deadline)}<br><strong>Award:</strong> ${escapeHtml(item.amount || "See sponsor guidelines")}</p></div>
    <div class="card-foot"><span class="item-meta">${past ? "Deadline passed" : "Requirements available"}</span>${past ? '<span class="badge badge-rejected">Closed</span>' : `<button class="button button-small" type="button" data-action="apply" data-id="${escapeHtml(item.id)}">View &amp; apply</button>`}</div>
    <details class="requirements"><summary class="text-link">View requirements</summary><ul>${(item.requirements || ["Confirm requirements with sponsor"]).map(req => `<li>${escapeHtml(req)}</li>`).join("")}</ul></details>
  </article>`;
}

function renderApplication() {
  const programId = new URLSearchParams(location.search).get("program") || "";
  const selectedProgram = scholarships().find(item => item.id === programId);
  const options = scholarships().map(item => `<option value="${escapeHtml(item.id)}"${item.id === programId ? " selected" : ""}>${escapeHtml(item.name)}</option>`).join("");
  return `${pageTitle("Apply for a scholarship", "Complete your details and attach clear copies of the required documents.", "APPLICATION FORM")}
    ${selectedProgram ? `<div class="callout" style="margin-bottom:17px"><strong>${escapeHtml(selectedProgram.name)}</strong> — ${escapeHtml(selectedProgram.description)}<br>Required: ${escapeHtml((selectedProgram.requirements || []).join(", "))}</div>` : ""}
    <section class="card card-pad"><form data-form="application"><div class="form-grid">
      <div class="field"><label for="application-program">Scholarship program <span aria-hidden="true">*</span></label><select id="application-program" name="program" required><option value="">Choose a program</option>${options}</select></div>
      <div class="field"><label for="applicant-student-id">Student ID</label><input id="applicant-student-id" name="studentId" value="${escapeHtml(currentProfile().studentId)}" readonly aria-describedby="student-id-help"><span class="field-help" id="student-id-help">Your assigned account ID; it cannot be changed here.</span></div>
      <div class="field"><label for="applicant-name">Full name</label><input id="applicant-name" name="student" value="${escapeHtml(currentProfile().name)}" required></div>
      <div class="field"><label for="applicant-course">Program / course</label><input id="applicant-course" name="course" value="${escapeHtml(currentProfile().course)}" required></div>
      <div class="field"><label for="applicant-email">University email</label><input id="applicant-email" name="email" type="email" value="${escapeHtml(currentProfile().email)}" required></div>
      <div class="field"><label for="applicant-phone">Contact number</label><input id="applicant-phone" name="phone" type="tel" value="${escapeHtml(currentProfile().phone)}" required></div>
      <div class="field field-full"><label for="application-notes">Additional information</label><textarea id="application-notes" name="notes" placeholder="Add any relevant information for the scholarship office."></textarea></div>
      <div class="field field-full"><label for="application-documents">Upload required documents and image files <span aria-hidden="true">*</span></label><input id="application-documents" name="documents" type="file" accept=".pdf,.jpg,.jpeg,.png" multiple required aria-describedby="document-help"><span id="document-help" class="field-help">Accepted formats: PDF, JPG, PNG. Upload all items listed in this program's requirements. Files stay in this browser in this prototype; a live service must send them to secure university storage.</span><div id="file-list" class="file-list" aria-live="polite"></div></div>
    </div><p class="form-error" id="application-error" role="alert"></p><div class="callout callout-maroon" style="margin-top:17px">Submitting sends your application for staff review. Only Admin / Staff can approve, reject, or update your application status.</div><div class="form-actions"><a class="button button-secondary" href="scholarships.html">Cancel</a><button class="button" type="submit">Submit application</button></div></form></section>`;
}

function renderProfile() {
  const user = currentProfile();
  return `${pageTitle("My profile", "Review and update your contact and academic details.", "STUDENT ACCOUNT")}
    <div class="grid two-column"><section class="card card-pad"><div class="section-head"><h2>Personal information</h2></div><form data-form="profile"><div class="form-grid">
      <div class="field field-full"><label for="profile-name">Full name</label><input id="profile-name" name="name" value="${escapeHtml(user.name)}" required></div>
      <div class="field"><label for="profile-id">Student ID</label><input id="profile-id" value="${escapeHtml(user.studentId)}" readonly></div>
      <div class="field"><label for="profile-email">University email</label><input id="profile-email" name="email" type="email" value="${escapeHtml(user.email)}" required></div>
      <div class="field"><label for="profile-phone">Contact number</label><input id="profile-phone" name="phone" type="tel" value="${escapeHtml(user.phone)}"></div>
      <div class="field"><label for="profile-course">Program / course</label><input id="profile-course" name="course" value="${escapeHtml(user.course)}"></div>
      <div class="field"><label for="profile-year">Year level</label><select id="profile-year" name="year"><option value="">Select year</option>${["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"].map(year => `<option${year === user.year ? " selected" : ""}>${year}</option>`).join("")}</select></div>
      <div class="field"><label for="profile-campus">Campus</label><input id="profile-campus" name="campus" value="${escapeHtml(user.campus)}"></div>
    </div><p class="form-error" id="profile-error" role="alert"></p><div class="form-actions"><button class="button" type="submit">Save profile</button></div></form></section>
    <aside class="card card-pad"><div class="section-head"><h2>Account access</h2></div><p class="page-description">Your student ID is assigned by the university and cannot be changed here. For password changes, account recovery, or corrections to official identity details, contact your campus administrator.</p><div class="callout" style="margin-top:17px">Profile updates do not change scholarship decisions. Decisions are made by authorized scholarship staff.</div></aside></div>`;
}

function renderTracking() {
  const user = currentProfile();
  const mine = applications().filter(item => item.studentId === user.studentId);
  return `${pageTitle("Application tracking", "Check progress and view the decision recorded by scholarship staff.", "MY APPLICATIONS")}
    <div class="callout callout-maroon" style="margin-bottom:18px">You can view your application information and results here. Students cannot approve, reject, or change decisions.</div>
    <section class="card card-pad"><div class="section-head"><h2>My submitted applications</h2><a class="button button-small" href="scholarships.html">Find a scholarship</a></div>${mine.length ? `<div class="table-wrap"><table><caption class="sr-only">Your scholarship applications and their current decisions</caption><thead><tr><th scope="col">Scholarship</th><th scope="col">Application ID</th><th scope="col">Date submitted</th><th scope="col">Decision</th></tr></thead><tbody>${mine.map(item => `<tr><td><strong>${escapeHtml(item.scholarship)}</strong></td><td>${escapeHtml(item.id)}</td><td>${displayDate(item.submitted)}</td><td>${statusBadge(item.status)}</td></tr>`).join("")}</tbody></table></div><div class="grid two-column" style="margin-top:22px">${mine.map(item => `<article class="card card-pad"><div class="section-head"><h3>${escapeHtml(item.scholarship)}</h3>${statusBadge(item.status)}</div><div class="timeline">${timelineFor(item.status)}</div></article>`).join("")}</div>` : `<div class="empty-state">No applications are linked to your account yet. <a class="text-link" href="scholarships.html">Browse scholarships</a>.</div>`}</section>`;
}

function timelineFor(status) {
  const steps = ["Submitted", "Under review", "Decision recorded"];
  const active = status === "Approved" || status === "Rejected" ? 2 : status === "Under review" ? 1 : 0;
  return steps.map((step, index) => `<div class="timeline-step ${index < active ? "complete" : index === active ? "current" : ""}"><span class="timeline-dot" aria-hidden="true">${index < active ? "✓" : index + 1}</span><div><h3>${step}${index === 2 && (status === "Approved" || status === "Rejected") ? ` — ${escapeHtml(status)}` : ""}</h3><p>${index === 0 ? "Your application has been received." : index === 1 ? "Scholarship staff are checking your submitted information and documents." : status === "Approved" || status === "Rejected" ? "The decision is recorded by authorized Admin / Staff." : "A decision will appear here after staff review."}</p></div></div>`).join("");
}

function renderAnnouncements() {
  return `${pageTitle("Announcements", "Important scholarship notices, deadlines, and student reminders.", "STAY INFORMED")}
    <div class="grid two-column"><section class="card card-pad"><div class="section-head"><h2>Latest updates</h2></div>${announcements().map(item => `<article class="announcement"><span class="eyebrow">${escapeHtml(item.date)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`).join("")}</section>
    <aside class="card card-pad"><div class="section-head"><h2>Stay prepared</h2></div><p class="page-description">Check your student email and this page regularly for scholarship announcements. Always confirm deadlines and eligibility details with the program sponsor.</p><div class="callout" style="margin-top:17px">Never pay a fee to apply for a scholarship unless the official sponsor explicitly requires it. Confirm questionable requests with the Scholarship Office.</div><p style="margin:18px 0 0"><a class="text-link" href="scholarships.html">Browse available scholarships →</a></p></aside></div>`;
}

function renderPayouts() {
  const user = currentProfile();
  const approvedMine = applications().filter(item => item.studentId === user.studentId && item.status === "Approved");
  return `${pageTitle("Payout schedule", "View published payout dates, locations, and collection reminders.", "PAYMENT INFORMATION")}
    <div class="callout" style="margin-bottom:18px">Schedules may change. Confirm your eligibility and the latest release instructions with the Scholarship Office before traveling.</div>
    ${approvedMine.length ? `<section class="card card-pad" style="margin-bottom:18px"><div class="section-head"><h2>Approved applications</h2></div>${approvedMine.map(item => `<div class="list-item"><div><p class="item-title">${escapeHtml(item.scholarship)}</p><p class="item-meta">Application ${escapeHtml(item.id)}</p></div>${statusBadge(item.status)}</div>`).join("")}</section>` : ""}
    <section class="card card-pad"><div class="section-head"><h2>Upcoming releases</h2></div><div class="list">${payoutSchedules().map(item => `<article class="list-item"><div class="payout-date" aria-label="${displayDate(item.date)}"><strong>${new Date(`${item.date}T00:00:00`).getDate()}</strong>${new Date(`${item.date}T00:00:00`).toLocaleDateString("en", { month: "short" })}</div><div style="flex:1"><p class="item-title">${escapeHtml(item.program)}</p><p class="item-meta">${displayDate(item.date)} · ${escapeHtml(item.venue)}</p><p class="item-meta" style="margin-top:5px">${escapeHtml(item.details)}</p></div></article>`).join("") || '<div class="empty-state">No payout dates have been published.</div>'}</div></section>`;
}

function render() {
  const user = session();
  const publicPages = ["login", "student-login", "admin-login", "register"];
  if (!publicPages.includes(page) && (!user || user.role !== expectedRole)) {
    location.replace(user && user.role === "admin" ? "admin-dashboard.html" : user && user.role === "student" ? "student-dashboard.html" : "login.html");
    return;
  }
  if (publicPages.includes(page) && user && (page === "login" || page === "student-login" || page === "admin-login")) {
    location.replace(user.role === "admin" ? "admin-dashboard.html" : "student-dashboard.html");
    return;
  }

  let html = "";
  switch (page) {
    case "login": html = renderRoleSelect(); break;
    case "student-login": html = renderLogin(false); break;
    case "admin-login": html = renderLogin(true); break;
    case "register": html = renderRegistration(); break;
    case "student-dashboard": html = renderStudentDashboard(); break;
    case "admin-dashboard": html = renderAdminDashboard(); break;
    case "scholarships": html = renderScholarships(); break;
    case "application": html = renderApplication(); break;
    case "profile": html = renderProfile(); break;
    case "tracking": html = renderTracking(); break;
    case "announcements": html = renderAnnouncements(); break;
    case "payouts": html = renderPayouts(); break;
    default: html = renderRoleSelect();
  }
  document.getElementById("app").innerHTML = publicPages.includes(page) ? html : shell(html, expectedRole);
  document.querySelectorAll("[data-marsu-logo]").forEach(image => {
    image.addEventListener("error", () => {
      image.alt = "Marinduque State University";
      image.hidden = true;
      const fallback = document.createElement("span");
      fallback.className = "avatar";
      fallback.setAttribute("aria-label", "Marinduque State University");
      fallback.textContent = "M";
      image.replaceWith(fallback);
    }, { once: true });
  });
  bindForms();
  bindActions();
}

function showToast(message) {
  const toast = document.querySelector(".toast");
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => { toast.hidden = true; }, 4200);
}

async function signOut() {
  console.log("[ISKOLAR MARSU] Signing out.");
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("userRole");

  try {
    const response = await fetch("login.html", { method: "HEAD", cache: "no-store" });
    if (!response.ok) {
      console.error(`[ISKOLAR MARSU] Sign-out redirect canceled: login.html returned ${response.status}.`);
      showToast("Sign-out complete, but login.html could not be found at the project root.");
      return;
    }

    console.log("[ISKOLAR MARSU] login.html exists; redirecting.");
    window.location.href = "login.html";
  } catch (error) {
    console.error("[ISKOLAR MARSU] Could not verify login.html. Is Live Server running?", error);
    showToast("Sign-out complete, but the login page could not be reached. Check that Live Server is running.");
  }
}

function bindForms() {
  document.querySelectorAll("form[data-form]").forEach(form => form.addEventListener("submit", async event => {
    event.preventDefault();
    const formType = form.dataset.form;
    const formData = new FormData(form);
    if (formType === "role-select") {
      location.href = formData.get("role") === "admin" ? "admin-login.html" : "student-login.html";
      return;
    }
    if (formType === "login") {
      const identifier = String(formData.get("identifier") || "").trim();
      const password = String(formData.get("password") || "");
      const role = form.dataset.loginRole;
      const errorNode = document.getElementById("login-error");
      if (!identifier || !password) {
        errorNode.textContent = "Enter your email address and password.";
        return;
      }
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      submit.textContent = "Signing in…";
      errorNode.textContent = "";
      try {
        if (isLocalPrototype()) {
          const previewName = identifier.split("@")[0].replace(/[._-]+/g, " ").trim() || "Student";
          const previewUser = {
            role,
            name: role === "admin" ? "Staff / Admin" : previewName,
            id: identifier,
            studentId: role === "student" ? identifier : "",
            email: identifier
          };
          if (!writeStore(SESSION_KEY, previewUser)) return;
          localStorage.setItem("userRole", role);
          console.info("[ISKOLAR MARSU] Local prototype sign-in; credentials are not verified.");
          location.href = role === "admin" ? "admin-dashboard.html" : "student-dashboard.html";
          return;
        }

        const response = await fetch("/api/auth/login", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ identifier, password, role: form.dataset.loginRole })
        });
        if (response.status === 404) {
          throw new Error("The university sign-in service is not connected. Configure POST /api/auth/login to sign in.");
        }
        const responseText = await response.text();
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error("The university sign-in service returned an invalid response.");
        }
        if (!response.ok || !result.user || result.user.role !== form.dataset.loginRole) {
          throw new Error(result.message || "Sign-in failed. Check your assigned credentials or contact your administrator.");
        }
        writeStore(SESSION_KEY, {
          role: result.user.role,
          name: result.user.name || "",
          id: result.user.id || "",
          studentId: result.user.studentId || result.user.id || "",
          email: result.user.email || "",
          course: result.user.course || "",
          year: result.user.year || "",
          campus: result.user.campus || ""
        });
        location.href = result.user.role === "admin" ? "admin-dashboard.html" : "student-dashboard.html";
      } catch (error) {
        errorNode.textContent = error instanceof TypeError
          ? "The university sign-in service is not connected. Connect the approved authentication API to use assigned accounts."
          : error.message;
      } finally {
        submit.disabled = false;
        submit.textContent = form.dataset.loginRole === "admin" ? "Sign in to staff portal" : "Sign in to student portal";
      }
      return;
    }
    if (formType === "profile") {
      const updated = Object.fromEntries(formData.entries());
      const profile = Object.assign({}, currentProfile(), updated);
      if (!writeStore(PROFILE_KEY, profile)) return;
      const storedSession = session();
      if (storedSession) writeStore(SESSION_KEY, Object.assign({}, storedSession, { name: profile.name, email: profile.email, course: profile.course, year: profile.year, campus: profile.campus }));
      showToast("Profile details saved on this device.");
      window.setTimeout(() => location.reload(), 700);
      return;
    }
    if (formType === "application") {
      const files = Array.from(form.querySelector('[name="documents"]').files || []);
      const errors = document.getElementById("application-error");
      if (files.length === 0) {
        errors.textContent = "Attach at least one required document before submitting.";
        return;
      }
      const profile = currentProfile();
      const chosenProgram = scholarships().find(item => item.id === formData.get("program"));
      if (!chosenProgram) {
        errors.textContent = "Choose a valid scholarship program.";
        return;
      }
      const newApplication = {
        id: `APP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        studentId: profile.studentId,
        student: String(formData.get("student") || profile.name),
        course: String(formData.get("course") || profile.course),
        email: String(formData.get("email") || profile.email),
        phone: String(formData.get("phone") || profile.phone),
        scholarship: chosenProgram.name,
        status: "Pending",
        submitted: new Date().toISOString().slice(0, 10),
        documents: files.map(file => file.name),
        notes: String(formData.get("notes") || ""),
        fileIds: []
      };
      try {
        for (const file of files) {
          const fileId = `${newApplication.id}-${newApplication.fileIds.length}`;
          await saveFile(fileId, file);
          newApplication.fileIds.push(fileId);
        }
      } catch (error) {
        errors.textContent = "The selected files could not be saved in this browser. Check available storage and try again.";
        console.error("Unable to store uploaded documents", error);
        return;
      }
      const records = applications();
      records.unshift(newApplication);
      if (!writeStore(APPLICATIONS_KEY, records)) return;
      location.href = "tracking.html";
    }
    if (formType === "scholarship") {
      const values = Object.fromEntries(formData.entries());
      const updated = scholarships();
      updated.unshift({
        id: `staff-${Date.now()}`, name: values.name, sponsor: values.sponsor, category: values.category,
        deadline: values.deadline, amount: values.amount, description: values.description,
        requirements: values.description.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
      });
      if (writeStore(SCHOLARSHIPS_KEY, updated)) {
        showToast("Scholarship opportunity published.");
        form.reset();
      }
    }
    if (formType === "announcement") {
      const values = Object.fromEntries(formData.entries());
      const updated = announcements();
      updated.unshift({ title: values.title, body: values.body, date: new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) });
      if (writeStore(ANNOUNCEMENTS_KEY, updated)) {
        showToast("Announcement published.");
        form.reset();
      }
    }
    if (formType === "student-account") {
      const values = Object.fromEntries(formData.entries());
      const records = studentAccounts();
      if (records.some(student => student.studentId.toLowerCase() === String(values.studentId).trim().toLowerCase())) {
        showToast("A student record with that ID already exists.");
        return;
      }
      records.unshift({
        studentId: String(values.studentId).trim(),
        name: String(values.name).trim(),
        email: String(values.email).trim(),
        course: String(values.course).trim(),
        status: "Active"
      });
      if (writeStore(STUDENTS_KEY, records)) {
        showToast("Student record added. Create or assign sign-in credentials through the university authentication service.");
        render();
      }
    }
    if (formType === "payout") {
      const values = Object.fromEntries(formData.entries());
      const schedules = payoutSchedules();
      const existing = values.id ? schedules.find(item => item.id === values.id) : null;
      const schedule = {
        id: existing ? existing.id : `payout-${Date.now()}`,
        program: String(values.program).trim(),
        date: values.date,
        venue: String(values.venue).trim(),
        details: String(values.details).trim()
      };
      if (existing) Object.assign(existing, schedule);
      else schedules.unshift(schedule);
      if (writeStore(PAYOUTS_KEY, schedules)) {
        showToast(existing ? "Payout schedule updated." : "Payout schedule published.");
        render();
      }
    }
  }));
}

let actionsBound = false;
function bindActions() {
  if (actionsBound) return;
  actionsBound = true;
  document.addEventListener("click", async event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "menu") {
      const sidebar = document.getElementById("site-sidebar");
      const shouldOpen = !sidebar.classList.contains("is-open");
      sidebar.classList.toggle("is-open", shouldOpen);
      document.querySelectorAll('[data-action="menu"]').forEach(toggle => {
        toggle.setAttribute("aria-expanded", String(shouldOpen));
        toggle.setAttribute("aria-label", shouldOpen ? "Close navigation menu" : "Open navigation menu");
      });
    }
    if (action === "notifications") {
      const panel = document.getElementById("notification-panel");
      panel.hidden = !panel.hidden;
      button.setAttribute("aria-expanded", String(!panel.hidden));
      if (!panel.hidden) panel.querySelector("a")?.focus();
    }
    if (action === "logout") {
      event.preventDefault();
      await signOut();
    }
    if (action === "apply") location.href = `application.html?program=${encodeURIComponent(button.dataset.id)}`;
    if (action === "set-status") {
      const user = session();
      if (!user || user.role !== "admin") {
        showToast("Only authorized Admin / Staff can change application decisions.");
        return;
      }
      const records = applications();
      const record = records.find(item => item.id === button.dataset.id);
      if (!record) {
        showToast("That application could not be found.");
        return;
      }
      record.status = button.dataset.status;
      if (writeStore(APPLICATIONS_KEY, records)) render();
    }
    if (action === "view-application") {
      const record = applications().find(item => item.id === button.dataset.id);
      if (record) await showApplicationDetails(record);
    }
    if (action === "export") exportApplications();
    if (action === "toggle-student") {
      const user = session();
      if (!user || user.role !== "admin") return;
      const records = studentAccounts();
      const student = records.find(item => item.studentId === button.dataset.id);
      if (!student) return;
      student.status = student.status === "Active" ? "Inactive" : "Active";
      if (writeStore(STUDENTS_KEY, records)) render();
    }
    if (action === "edit-payout") {
      const schedule = payoutSchedules()[Number(button.dataset.index)];
      const form = document.querySelector('[data-form="payout"]');
      if (!schedule || !form) return;
      form.elements.id.value = schedule.id || "";
      form.elements.program.value = schedule.program;
      form.elements.date.value = schedule.date;
      form.elements.venue.value = schedule.venue;
      form.elements.details.value = schedule.details;
      form.scrollIntoView({ behavior: "smooth", block: "center" });
      form.elements.program.focus();
    }
    if (action === "remove-payout") {
      const schedules = payoutSchedules();
      const index = Number(button.dataset.index);
      if (!Number.isInteger(index) || !schedules[index]) return;
      if (window.confirm(`Remove the payout schedule for ${schedules[index].program}?`)) {
        schedules.splice(index, 1);
        if (writeStore(PAYOUTS_KEY, schedules)) render();
      }
    }
  });

  document.addEventListener("input", event => {
    if (event.target.dataset.filter === "admin-search" || event.target.dataset.filter === "admin-status" || event.target.dataset.filter === "admin-program") filterAdminRows();
    if (event.target.dataset.filter === "scholarship-search" || event.target.dataset.filter === "scholarship-category") filterScholarships();
    if (event.target.id === "application-documents") showSelectedFiles(event.target.files);
  });
  document.addEventListener("change", event => {
    if (event.target.dataset.filter === "admin-status" || event.target.dataset.filter === "admin-program") filterAdminRows();
    if (event.target.dataset.filter === "scholarship-category") filterScholarships();
    if (event.target.id === "application-documents") showSelectedFiles(event.target.files);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      const panel = document.getElementById("notification-panel");
      if (panel && !panel.hidden) {
        panel.hidden = true;
        const toggle = document.querySelector('[data-action="notifications"]');
        toggle?.setAttribute("aria-expanded", "false");
        toggle?.focus();
      }
      const sidebar = document.getElementById("site-sidebar");
      if (sidebar) {
        sidebar.classList.remove("is-open");
        document.querySelectorAll('[data-action="menu"]').forEach(toggle => {
          toggle.setAttribute("aria-expanded", "false");
          toggle.setAttribute("aria-label", "Open navigation menu");
        });
      }
    }
  });
}

function filterAdminRows() {
  const search = (document.getElementById("admin-search")?.value || "").trim().toLowerCase();
  const status = document.getElementById("admin-status")?.value || "";
  const program = document.getElementById("admin-program")?.value || "";
  document.querySelectorAll("[data-application-row]").forEach(row => {
    const matchesText = `${row.dataset.name} ${row.dataset.studentId} ${row.dataset.scholarship}`.toLowerCase().includes(search);
    row.hidden = !(matchesText && (!status || row.dataset.status === status) && (!program || row.dataset.scholarship === program));
  });
}

function filterScholarships() {
  const search = (document.getElementById("scholarship-search")?.value || "").trim().toLowerCase();
  const category = document.getElementById("scholarship-category")?.value || "";
  document.querySelectorAll("[data-scholarship-card]").forEach(card => {
    const matchesText = `${card.dataset.name} ${card.dataset.sponsor}`.toLowerCase().includes(search);
    card.hidden = !(matchesText && (!category || card.dataset.category === category));
  });
}

function showSelectedFiles(files) {
  const container = document.getElementById("file-list");
  if (!container) return;
  const chosen = Array.from(files || []);
  container.innerHTML = chosen.map(file => `<div class="file-entry"><span>${escapeHtml(file.name)} <span class="item-meta">(${Math.max(1, Math.round(file.size / 1024))} KB)</span></span><span class="badge">Ready</span></div>`).join("");
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("Browser file storage is unavailable"));
      return;
    }
    const request = indexedDB.open("iskolar-marsu-files", 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("documents")) database.createObjectStore("documents", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Unable to open browser file storage"));
  });
}

async function saveFile(id, file) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("documents", "readwrite");
    transaction.objectStore("documents").put({ id, name: file.name, type: file.type, blob: file });
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transaction.error || new Error("Unable to save uploaded document")); };
    transaction.onabort = () => { database.close(); reject(transaction.error || new Error("Document storage was interrupted")); };
  });
}

async function getFile(id) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("documents", "readonly");
    const request = transaction.objectStore("documents").get(id);
    request.onsuccess = () => { database.close(); resolve(request.result || null); };
    request.onerror = () => { database.close(); reject(request.error || new Error("Unable to retrieve uploaded document")); };
  });
}

async function showApplicationDetails(record) {
  const documents = [];
  for (const fileId of record.fileIds || []) {
    try {
      const file = await getFile(fileId);
      if (file) documents.push(file);
    } catch (error) {
      console.error("Unable to retrieve application document", error);
    }
  }
  const dialog = document.createElement("dialog");
  dialog.className = "card card-pad";
  dialog.setAttribute("aria-labelledby", "application-detail-title");
  dialog.style.cssText = "width:min(640px,calc(100% - 28px));max-height:85vh;overflow:auto;border:1px solid var(--line);border-radius:12px";
  dialog.innerHTML = `<div class="section-head"><h2 id="application-detail-title">Application ${escapeHtml(record.id)}</h2><button class="button button-secondary button-small" type="button" data-action="close-dialog">Close</button></div>
    <div class="grid two-column"><p><span class="item-meta">Applicant</span><br><strong>${escapeHtml(record.student)}</strong></p><p><span class="item-meta">Student ID</span><br><strong>${escapeHtml(record.studentId)}</strong></p><p><span class="item-meta">Course</span><br><strong>${escapeHtml(record.course || "Not provided")}</strong></p><p><span class="item-meta">Scholarship</span><br><strong>${escapeHtml(record.scholarship)}</strong></p><p><span class="item-meta">Email</span><br><strong>${escapeHtml(record.email || "Not provided")}</strong></p><p><span class="item-meta">Phone</span><br><strong>${escapeHtml(record.phone || "Not provided")}</strong></p><p><span class="item-meta">Submitted</span><br><strong>${displayDate(record.submitted)}</strong></p><p><span class="item-meta">Current decision</span><br>${statusBadge(record.status)}</p></div>
    <div style="margin-top:12px"><strong class="item-title">Applicant notes</strong><p class="item-meta">${escapeHtml(record.notes || "No additional notes.")}</p></div>
    <div style="margin-top:14px"><strong class="item-title">Submitted documents</strong><div class="file-list">${(record.documents || []).map((name, index) => `<div class="file-entry"><span>${escapeHtml(name)}</span>${documents[index] ? `<button class="button button-secondary button-small" type="button" data-action="download-file" data-file-id="${escapeHtml(documents[index].id)}">Open / download</button>` : '<span class="item-meta">File record only</span>'}</div>`).join("")}</div></div>`;
  document.body.append(dialog);
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => dialog.remove(), { once: true });
  dialog.showModal();
  dialog.querySelector("button")?.focus();
}

function exportApplications() {
  const rows = applications();
  const columns = ["id", "student", "studentId", "course", "scholarship", "submitted", "status"];
  const csv = [columns.join(","), ...rows.map(row => columns.map(key => `"${String(row[key] || "").replace(/"/g, '""')}"`).join(","))].join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "iskolar-marsu-applicant-records.csv";
  link.click();
  URL.revokeObjectURL(url);
}

document.addEventListener("click", async event => {
  const button = event.target.closest('[data-action="close-dialog"], [data-action="download-file"]');
  if (!button) return;
  if (button.dataset.action === "close-dialog") button.closest("dialog")?.close();
  if (button.dataset.action === "download-file") {
    try {
      const file = await getFile(button.dataset.fileId);
      if (!file) {
        showToast("This file is not available in this browser's local storage.");
        return;
      }
      const url = URL.createObjectURL(file.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Unable to download application document", error);
      showToast("Unable to open this document.");
    }
  }
});

render();
