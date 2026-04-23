# Step 1: User Profile CRUD & Cloudinary Integration

**Objective**: Replace the hardcoded dummy data in the Profile tab of `Settings.vue` with dynamic CRUD operations connected to the backend. You will also implement profile picture uploads using Cloudinary, ensuring old photos are deleted when updated.

## 1. Backend Updates

### Database Schema
The database schema at `services/core/src/db/schema/user.ts` has already been updated to include the necessary columns:
- `username` (varchar)
- `shortBio` (text)
- `avatarUrl` (text)

**Action**: Generate and run your Drizzle migrations to reflect these new columns in your local database.

### API Endpoints
Create or update the user profile endpoints (e.g., `GET /api/profile` and `PUT /api/profile`).
- The `GET` endpoint should return the current user's details (fullName, username, email, shortBio, avatarUrl).
- The `PUT` endpoint should handle updating these details.

### Cloudinary Upload & Cleanup Logic
When a user updates their profile picture, the frontend will send the new image (typically as a base64 string, similar to how it works in `ProjectCms.vue`).

**Action**:
1. When receiving a new image payload, upload it to Cloudinary.
2. **Crucial Cleanup Step**: Before saving the new Cloudinary URL to the database, check if the user already has an existing `avatarUrl`.
3. If an old `avatarUrl` exists, extract its Cloudinary `public_id` and call the Cloudinary SDK to **delete the old file**. This prevents orphaned files from taking up storage space over time.
4. Save the new Cloudinary URL to the database.

## 2. Frontend Updates (`Settings.vue`)

### Fetching Data
- Remove the static mock data inside the `profile` reactive object.
- Create a `fetchProfile` function that calls your `GET /api/profile` endpoint on component mount and populates the `profile` state.

### Handling Avatar Uploads
- Look at `frontend/src/views/private/ProjectCms.vue` as a reference for handling file inputs. 
- You will see it uses `FileReader` to read the file as a DataURL (base64) when the user selects a new image. Apply this exact pattern in `Settings.vue`.

### Submitting the Form
- Update the "Save Profile" button to trigger a function that sends a `PUT /api/profile` request with the updated profile data (including the base64 avatar if it was changed).
- Utilize the existing `showToast` method to notify the user upon success or failure.
- Ensure loading states are handled properly (disabling the button while saving).
