# Test Plan

## User scenarios

| Test Case | Steps | Expected Result |
|---|---|---|
| **User Registration** | 1. Navigate to `/auth/signup`.<br>2. Enter valid email and password.<br>3. Submit. | Redirect to `/upload`. Confirmation email sent. |
| **User Login** | 1. Navigate to `/auth/login`.<br>2. Enter credentials.<br>3. Submit. | Redirect to `/upload`. |
| **Invalid Login** | 1. Navigate to `/auth/login`.<br>2. Enter wrong password. | Error message displayed. |
| **File Upload (PDF)** | 1. Go to `/upload`.<br>2. Drag/drop a valid PDF.<br>3. Wait. | Upload success. Redirect to matches page. Skills extracted. |
| **File Upload (DOCX)** | 1. Go to `/upload`.<br>2. Drag/drop a valid DOCX. | Upload success. Skills extracted. |
| **File Upload (Unsupported)** | 1. Go to `/upload`.<br>2. Drag/drop a PNG file. | Error message: "Unsupported file type." |
| **File Too Large** | 1. Go to `/upload`.<br>2. Drag/drop file > 10MB. | Error message: "File is too large." |
| **Skill Editing** | 1. Go to matches page.<br>2. Click edit on a skill.<br>3. Change name.<br>4. Save. | Skill name updates in UI. |
| **Skill Deletion** | 1. Go to matches page.<br>2. Click delete on a skill.<br>3. Confirm. | Skill removed from UI. |
| **View Job Matches** | 1. On matches page, click "Jobs" tab. | List of job recommendations appears. |
| **View Learning Paths** | 1. On matches page, click "Learning Paths" tab. | List of course recommendations appears. |
| **View Certificates** | 1. On matches page, click "Certificates" tab. | List of certification recommendations appears. |
| **View Match Explanation** | 1. Click on a match card. | Explanation panel opens with details. |
| **Unauthenticated Access** | 1. Clear session.<br>2. Navigate to `/matches`. | Redirect to `/auth/login`. |
| **AI Provider Failure** | 1. Disable local AI.<br>2. Disconnect from internet (for OpenAI).<br>3. Upload document. | Graceful error message shown in UI. No crash. |

## Manual testing workflow

1. Create a test account.
2. Prepare sample resumes (PDF, DOCX, TXT).
3. Execute each test case from the table above.
4. Verify UI state and database records.
5. Check for console errors.

## Automated testing (Future)

- **Unit tests**: Jest for utility functions and hooks.
- **Integration tests**: React Testing Library for component interactions.
- **E2E tests**: Playwright or Cypress for full user flows.
