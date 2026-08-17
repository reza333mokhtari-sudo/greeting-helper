# Plan - Admin Data Visualization and Stability

Improving the Admin Control Center with data visualization and fixing system-wide stability issues.

## User Review Required

- **Data Visualization**: Integrated \`recharts\` to provide visual audit logs and system stats.
- **Improved Overview**: The Admin Overview now shows real-time stats from the database.
- **Stability Fixes**: Resolved TypeScript errors in the chart component and audit log types.

## Technical Details

### Frontend
- **src/routes/admin/index.tsx**: Refactored the overview to use \`recharts\` for audit log distribution.
- **src/lib/admin-stats.functions.ts**: New server function for efficient aggregate statistics.
- **src/components/ui/chart.tsx**: Removed broken shadcn chart boilerplate in favor of native recharts implementation.

### Infrastructure
- **Bun**: Added \`recharts\` package.
- **Supabase**: Verified RLS on \`admin_audit_logs\`.
