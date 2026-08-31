# LM Verify — Project Checklists

## Part 11: Time-Verified Traceability
- [x] Remove legacy GeoTimeVerifier.jsx and legacy GPS states
- [x] Create common/TimeVerifiedEvidence.jsx component
- [x] Mount TimeVerifiedEvidence inside pages/lmo/InspectionDetail.jsx
- [x] Mount TimeVerifiedEvidence inside pages/gatc/GATCInspectionDetail.jsx
- [x] Integrate backend/mock timezone-aware server-authoritative timestamps with persistence across refreshes
- [x] Ensure zero browser location API requests
- [x] Verify production builds compile cleanly

## Part 12: GATC Calibration Workflow
- [x] Build complete GATC dashboard cards and recent tasks grid
- [x] Prevent LMO/Admin privilege escalation (role-based view permissions)
- [x] Implement dynamic associatedTestId routing lookup (no hardcoded test IDs)
- [x] Develop startTest API hook to transition status SCHEDULED -> IN_PROGRESS
- [x] Render GATC accreditation license expiration banners on dashboard and details page
- [x] Block test initiation if the NABL license is expired
- [x] Integrate calibration draft saving & resumption across page refreshes
- [x] Display comprehensive Test Submission Summary tables inside final modal
- [x] Lock test records editing capabilities upon finalized submission
- [x] Compile production build successfully
