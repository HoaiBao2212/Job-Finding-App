# Interview Candidate Detail Feature - Implementation Summary

## Overview

Added candidate interview management functionality allowing recruiters to view detailed candidate profiles and update their interview participation status within the interview schedule workflow.

## Files Created/Modified

### 1. Created: `app/Employer/InterviewCandidateDetail.tsx` (1070+ lines)

**Candidate Interview Management Page** - Detailed candidate view with management actions

**Sections:**

#### Section A: Candidate Profile Information

- **Avatar & Header**
  - Profile picture, full name, headline/title
  - Current participation status badge (invited/confirmed/declined/pending)
- **Contact Information**
  - Email, phone number
  - Both in styled info cards with icons
- **Professional Details**
  - Years of experience
  - Desired position
  - Salary range (formatted as millions VND)
  - Preferred work locations
- **Top Skills** (first 5)
  - Pill-shaped badges with primary color theme
  - Fetched from `candidate_skills` with skill name
- **Work Experience** (collapsible)
  - Card per experience with left border highlight
  - Expandable for job description
  - Shows: job title, company, date range
  - Icon: briefcase
- **Education** (collapsible)
  - Card per education with left border highlight
  - Shows: degree, field of study, school, graduation date
  - Icon: school

#### Section B: Interview Information (Compact)

- Schedule: formatted date/time with timezone
- Type: Online (video icon) or In-person (map icon)
- Meeting link: For online interviews (underlined, clickable)
- Location: For in-person interviews
- Notes: Interview-related notes from recruiter

#### Section C: Management Actions

Three action buttons to update `interview_participants.participant_status`:

1. **Chấp nhận** (Accept)
   - Sets status to `'confirmed'`
   - Green button background
   - Shows: ✓ icon + "Đã chấp nhận ứng viên" toast
2. **Từ chối** (Decline)
   - Sets status to `'declined'`
   - Red button background
   - Shows: ✗ icon + "Đã từ chối ứng viên" toast
3. **Đang nghĩ lại sau** (Pending/Reconsidering)
   - Sets status to `'invited'`
   - Orange button background
   - Shows: ⏱ icon + "Đã chuyển về trạng thái chờ" toast

**Status Update Guards:**

- Disabled if interview status is `'canceled'` or `'done'`
- Shows warning message when interview is not open for updates
- Loading indicator during update operation
- Error handling with AlertModal

**Data Fetching:**

```tsx
// Interview data
FROM interviews WHERE id = :interviewId
SELECT: id, start_time, timezone, type, meeting_link, location, note, status

// Participant record
FROM interview_participants WHERE interview_id = :interviewId AND candidate_id = :candidateId
SELECT: all fields (to get current participant_status and application_id)

// Candidate profile
FROM candidate_profiles WHERE id = :candidateId
SELECT: all fields + user:profiles(full_name, email, phone, avatar_url)

// Skills (top 5)
FROM candidate_skills WHERE candidate_id = :candidateId
LIMIT 5
SELECT: skills(id, name)

// Experiences
FROM candidate_experiences WHERE candidate_id = :candidateId
ORDER BY start_date DESC
SELECT: all fields

// Educations
FROM candidate_educations WHERE candidate_id = :candidateId
ORDER BY graduation_date DESC
SELECT: all fields
```

**Update Query:**

```tsx
UPDATE interview_participants
SET participant_status = :newStatus
WHERE id = :participantId
```

---

### 2. Modified: `app/Employer/InterviewScheduleDetail.tsx`

**Made candidate rows clickable**

**Change:**

- Wrapped participant list item from `<View>` to `<TouchableOpacity>`
- Added `onPress` handler to navigate to candidate detail
- Passes params: `interviewId` (from route params) and `candidateId` (from participant data)

```tsx
<TouchableOpacity
  onPress={() =>
    router.push({
      pathname: "/Employer/InterviewCandidateDetail",
      params: {
        interviewId: params.id,
        candidateId: participant.candidate_id,
      },
    })
  }
  // ... existing styles ...
>
  {/* existing participant row UI */}
</TouchableOpacity>
```

---

### 3. Modified: `app/_layout.tsx`

**Added route definitions** for new screens

```tsx
<Stack.Screen
  name="Employer/InterviewSchedule"
  options={{ title: "Lịch phỏng vấn" }}
/>
<Stack.Screen
  name="Employer/InterviewScheduleDetail"
  options={{ title: "Chi tiết phỏng vấn" }}
/>
<Stack.Screen
  name="Employer/InterviewCandidateDetail"
  options={{ title: "Chi tiết ứng viên phỏng vấn" }}
/>
```

---

## UI/UX Design

### Color Scheme

**Status Badges:**

- Invited/Pending: Light orange (#FFF3E0) / Orange (#F57C00)
- Confirmed: Light green (#E8F5E9) / Green (#388E3C)
- Declined: Light red (#FFEBEE) / Red (#D32F2F)

**Action Buttons:**

- Accept: Green (#388E3C) with light green background
- Decline: Red (#D32F2F) with light red background
- Pending: Orange (#F57C00) with light orange background

**Info Cards:**

- Background: colors.bgNeutral (#F8F9FA)
- Collapsible sections: white with left border (primary blue)

### Typography

- Header: 18px, fontWeight 600, white on primary background
- Section titles: 14px, fontWeight 600, text-dark
- Card titles: 13px, fontWeight 600, text-dark
- Labels: 12px, text-gray
- Body text: 13px, text-dark

### Icons

- Material Community Icons throughout
- Consistent sizing (12-18px based on context)
- Color matched to text/theme

---

## Navigation Flow

```
InterviewScheduleDetail
  ↓ (click candidate row)
  ↓ router.push({ pathname: "/Employer/InterviewCandidateDetail", params: { interviewId, candidateId } })
  ↓
InterviewCandidateDetail
  ↓ (click action button)
  ↓ Update interview_participants.participant_status
  ↓ Show toast/alert
  ↓ Back button → returns to InterviewScheduleDetail (auto-refreshes via useFocusEffect)
```

---

## Data Flow

### On Page Load:

1. Parse route params (`interviewId`, `candidateId`)
2. Fetch interview by id (for Section B data)
3. Fetch interview_participants record (for current status + application_id)
4. Fetch candidate_profiles (joined with profiles table)
5. Fetch candidate_skills (top 5)
6. Fetch candidate_experiences (ordered by date)
7. Fetch candidate_educations (ordered by date)
8. Display all sections

### On Status Update:

1. User taps action button
2. Disable buttons & show loading indicator
3. Send UPDATE to interview_participants
4. Update local state optimistically
5. Show success toast with status-specific message
6. Keep buttons disabled briefly
7. If error, show error alert (buttons remain enabled)

---

## Error Handling

**Loading State:**

- Full-screen ActivityIndicator while fetching data
- Shown at mount + on data refresh

**Empty/Error States:**

- If data not found: Display "Data not found" message
- If load error: Show AlertModal with error message
- If update error: Show AlertModal (buttons re-enable)

**Guards:**

- Check interview status before showing action buttons
- Disable buttons if interview is canceled/done
- Display warning message for non-updateable interviews
- Validate params before fetching

---

## Helper Functions

- `formatDateTime(dateString, timezone)` - Formats date/time with timezone support
- `formatDate(dateString)` - Formats date as DD/MM/YYYY
- `formatSalary(min, max)` - Formats salary range in millions VND
- `getParticipantStatusLabel(status)` - Maps status to Vietnamese label
- `getParticipantStatusColor(status)` - Maps status to color scheme

---

## Testing Checklist

- [ ] Click candidate row in InterviewScheduleDetail
- [ ] Navigate to InterviewCandidateDetail with correct params
- [ ] All candidate info sections load and display correctly
- [ ] Skills show in pill format (max 5)
- [ ] Experiences are collapsible (expand/collapse description)
- [ ] Educations are collapsible
- [ ] Interview info section displays correctly
- [ ] Action buttons are enabled (when interview is open)
- [ ] Click "Chấp nhận" - updates to confirmed, shows green toast
- [ ] Click "Từ chối" - updates to declined, shows red toast
- [ ] Click "Đang nghĩ lại sau" - updates to invited, shows orange toast
- [ ] Status badge updates in UI after action
- [ ] Loading indicator shows during update
- [ ] Error handling works if update fails
- [ ] Buttons disabled if interview is canceled/done
- [ ] Back button returns to InterviewScheduleDetail
- [ ] Parent list refreshes participant status on return (useFocusEffect)

---

## Future Enhancements

1. **Attachment Viewer** - Show candidate resume/documents
2. **Communication** - Add notes/feedback on candidate
3. **Comparison View** - Side-by-side candidate comparison
4. **Bulk Actions** - Update multiple candidates at once
5. **Interview Recording** - Link/embed interview recording if available
6. **Rating System** - Recruiter rating/scoring of candidate
7. **Automated Notifications** - Send candidate notifications on status change
8. **Activity Timeline** - Show all interactions with this candidate

---

## Performance Notes

- Queries are efficient (single fetch per table with proper joins)
- Lazy loading of expandable sections (descriptions only rendered when expanded)
- Image optimization for avatars (fixed size: 80x80px)
- No unnecessary re-renders (proper state management)
- Loading states prevent action spam

---

## Accessibility

- All buttons have icons + text labels
- Color-coded status with text labels (not just color)
- Sufficient touch target sizes (minimum 44px)
- Clear visual hierarchy with typography
- Icons from Material Community Icons (widely recognized)
- VN language labels for all text
