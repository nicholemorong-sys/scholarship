# ISKOLAR MARSU

A responsive, multi-page scholarship application and monitoring frontend for Marinduque State University. It uses semantic HTML, CSS, and vanilla JavaScript; no frontend framework or package dependencies are required.

## Pages

- `index.html` / `login.html`: role selection
- `student-login.html`: student sign-in
- `admin-login.html`: separate Admin / Staff sign-in
- `register.html`: explains that student accounts are provisioned by an administrator; public self-registration is intentionally disabled
- `student-dashboard.html`: student overview and recent notices
- `admin-dashboard.html`: staff overview, complete applicant register, review actions, student records, scholarship and announcement publishing, and payout schedule management
- `scholarships.html`: searchable scholarship directory and requirements
- `application.html`: scholarship application form and document/image attachments
- `profile.html`: student profile
- `announcements.html`: student announcements
- `tracking.html`: student-only application status and decision view
- `payouts.html`: published payout dates and release instructions

Shared assets: `styles.css`, `app.js`, and the local `marsu_logo.png` official logo image.

## Features

- Distinct Student and Admin / Staff entry points. Selecting Admin / Staff leads directly to the separate staff login.
- Student and Admin / Staff sign-in use separate role-specific pages. On localhost, non-empty email/password fields create a mock role session for navigation demos; public student self-registration remains disabled.
- Student-side scholarship search/filter, application submission, profile editing, announcements, status tracking, and payout viewing.
- Staff-side all-applicant table with search and status/program filters; application detail/document review; approve, reject, and pending actions; CSV export; student account record management; scholarship and announcement publishing; and payout schedule management.
- Uploaded files are kept in the current browser's IndexedDB in this frontend prototype. The listings and editable records use browser local storage.
- Responsive sidebar navigation, notification panel, keyboard skip link, visible focus states, semantic tables/forms, accessible names, and reduced-motion support.

## Authentication and production integration

This repository is a frontend prototype, not a production scholarship service. On `localhost`, `127.0.0.1`, and `::1`, entering a non-empty email and password creates a mock session for the selected role; credentials are not verified and passwords are not stored. There is no demo-mode banner in the interface. Do not expose this prototype flow or its local data as a real scholarship service.

On other hosts, sign-in uses `POST /api/auth/login` with JSON `{ "identifier", "password", "role" }` and expects a response shaped like `{ "user": { "role", "id", "studentId", "name", "email", "course", "year", "campus" } }`. The production service must set an `HttpOnly`, `Secure`, `SameSite` session cookie and verify accounts and role assignments against the university identity system. The authentication endpoint and secure shared data store are not included. Browser-only records are local prototype data and are not shared across users or devices. Before deployment, connect every application, document, student-account, scholarship, announcement, and payout read/write to authenticated server endpoints. The server must authorize Admin / Staff for review/status changes and account management, scope students to their own profile and applications, validate uploads, and store documents securely. A client-side role check or browser storage alone is not an authorization boundary.

## Run and test

1. Open the folder in VS Code and serve it on localhost with a static-file server (for example, the Live Server extension). Use a local server rather than relying on `file://` behavior for browser storage.
2. Verify role routing: Student goes to `student-login.html`; Admin / Staff goes to `admin-login.html`. On localhost, use any non-empty email and password to preview the respective dashboards.
3. Before deployment, connect a test authentication service with separate student/staff test accounts. Confirm a student response cannot enter the staff workspace and an Admin / Staff response cannot enter the student workspace.
4. As a student, test scholarship search/category filtering, required-field validation, multiple PDF/JPG/PNG uploads, profile save, announcement viewing, status tracking, and payout schedules. Confirm status controls are not present in the student UI.
5. As Admin / Staff, test the full applicant list, filtering, application/document view, all three decision actions, CSV export, student record activation, scholarship/announcement publishing, and payout add/edit/remove. Confirm changes are persisted by the authorized service in an integrated deployment.
6. Test keyboard-only use (skip link, navigation, forms, dialog, Escape to close), screen-reader labels/status messages, and layouts at approximately 360px, 768px, and 1280px widths. Check browser console/network errors and verify focus remains visible.

