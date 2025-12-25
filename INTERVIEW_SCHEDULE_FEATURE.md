# Interview Schedule Feature - Implementation Summary

## Overview

Created a complete "Interview Schedule" viewing and management system for recruiters to view already-created interviews with detailed information about participants, status, and meeting details.

## Files Created

### 1. `app/Employer/InterviewSchedule.tsx` (595 lines)

**List view page** - Shows all interviews for recruiter's company

**Features:**

- **Tabs/Filters:** Upcoming, Past, Canceled
- **Search:** By job title
- **Date Range Filter:** From date and To date
- **List Item Display:**
  - Job title with status badge
  - Formatted date/time with timezone
  - Type badge (online/offline)
  - Meeting link and location indicators
  - Participant count
- **Data Fetching:**
  - Retrieves interviews from `interviews` table
  - Filters by company_id (derived from logged-in employer)
  - Includes participant counts from `interview_participants`
  - Ordered by start_time DESC

**Key Functions:**

- `loadData()` - Fetches interviews with participant counts
- `useFocusEffect()` - Refreshes data when screen comes into focus
- `formatDateTime()` - Formats date/time with timezone support
- `getStatusColor()` - Returns color for each status

---

### 2. `app/Employer/InterviewScheduleDetail.tsx` (1013 lines)

**Detail view page** - Shows complete interview information with participants

**Features:**

- **Interview Section:**

  - Job title, company name/logo
  - Date/time and duration calculation
  - Timezone information
  - Type (online/offline) with conditional display:
    - Online: Meeting link with copy/open buttons
    - Offline: Location address
  - Interview notes
  - Status badge

- **Participant Section:**

  - List of all candidates
  - Participant status badge (invited/confirmed/declined/no_show)
  - Search by candidate name/email
  - Sort by status or name
  - Avatar, name, email display

- **Action Buttons:**
  - Reschedule interview (TODO)
  - Mark as done (TODO)
  - Cancel interview (TODO)

**Data Fetching:**

- Fetches interview details with `jobs` and `companies` joins
- Fetches all participants via `interview_participants` with candidate profile data
- Uses `!inner()` join syntax for inner joins
- Proper null-safety with fallback values

---

### 3. Updated `app/Component/EmployerSidebarLayout.tsx`

**Added new menu item:**

```tsx
{
  icon: "calendar",
  label: "Lịch phỏng vấn",
  route: "/Employer/InterviewSchedule",
}
```

- Positioned between "Xếp lịch phỏng vấn" (scheduling creation) and "Công ty"
- Uses `calendar` icon to differentiate from `calendar-check` (scheduling creation)

---

## Database Queries

### Interview List Query

```tsx
const { data: interviewsData } = await supabase
  .from("interviews")
  .select(
    `
    id, job_id, company_id, start_time, end_time, timezone, 
    type, meeting_link, location, status, created_at, note,
    jobs(title),
    interview_participants(id)
  `
  )
  .eq("company_id", employers.company_id)
  .order("start_time", { ascending: false });
```

### Interview Detail Query

```tsx
const { data: interviewData } = await supabase
  .from("interviews")
  .select(
    `
    id, job_id, company_id, start_time, end_time, timezone, 
    type, meeting_link, location, status, note,
    jobs!inner(title),
    companies!inner(name, logo_url)
  `
  )
  .eq("id", interviewId)
  .single();
```

### Participants Query

```tsx
const { data: participantsData } = await supabase
  .from("interview_participants")
  .select(
    `
    id, interview_id, application_id, candidate_id, participant_status,
    candidate_profiles(
      user:profiles(full_name, email, phone, avatar_url)
    )
  `
  )
  .eq("interview_id", interviewId);
```

---

## UI/UX Design

### Colors & Styling

- **Status Badge Colors:**

  - Scheduled/Rescheduled: Light blue (#E3F2FD) / Blue (#1976D2)
  - Done: Light green (#E8F5E9) / Green (#388E3C)
  - Canceled: Light red (#FFEBEE) / Red (#D32F2F)

- **Participant Status Colors:**
  - Invited: Light orange (#FFF3E0) / Orange (#F57C00)
  - Confirmed: Light green (#E8F5E9) / Green (#388E3C)
  - Declined: Light red (#FFEBEE) / Red (#D32F2F)
  - No show: Light gray (#F5F5F5) / Gray (#616161)

### Components Used

- `EmployerSidebarLayout` - Consistent sidebar navigation
- `AlertModal` - Error/info messages
- Material Community Icons - Consistent iconography
- Custom theme system - Color palette consistency

---

## Navigation

- **List → Detail:** Tap interview item → Route to `/Employer/InterviewScheduleDetail` with `id` param
- **Detail → List:** Back button navigates to previous screen
- **From Sidebar:** "Lịch phỏng vấn" menu item opens interview list

---

## Data Flow

```
1. Load interviews with company_id filter
   ↓
2. Display in list with status, date, participant count
   ↓
3. User taps interview
   ↓
4. Navigate with interview id param
   ↓
5. Fetch full interview details and participants
   ↓
6. Display complete information with participant list
   ↓
7. User can perform actions (reschedule, done, cancel)
```

---

## Error Handling

- Try-catch blocks for all async operations
- AlertModal for user-facing errors
- Console logging for debugging
- Loading states during data fetching
- Empty state UI when no interviews found

---

## Future Enhancement - TODO Items

1. **Mark as Done** - Update interview status to 'done'
2. **Cancel Interview** - Update status to 'canceled', notify participants
3. **Reschedule** - Navigate to schedule form with pre-filled data
4. **Participant Actions** - Accept/decline/update participant status
5. **Real-time Updates** - Subscribe to interview and participant changes
6. **Notification Integration** - Show in-app notification count

---

## Testing Checklist

- [ ] Navigate from sidebar to interview list
- [ ] Filter by upcoming/past/canceled tabs
- [ ] Search by job title
- [ ] Filter by date range
- [ ] Tap interview to view details
- [ ] View participant list with status badges
- [ ] Search and sort participants
- [ ] View meeting link/location based on type
- [ ] Copy/open meeting link (online interviews)
- [ ] Navigate back to list
- [ ] Verify proper company_id filtering
- [ ] Test timezone formatting
