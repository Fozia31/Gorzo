# Her_Hackton Backend API Test Flow (Start to End)

This guide is ordered so each response gives IDs needed for the next API.

## 0) Start server

```bash
cd backend
node server.js
```

Base URL:

```text
http://localhost:5000
```

Health check:

- GET `/`

---

## 1) Create Admin (required before Doctor)

### Create Admin
- POST `/api/admins`

```json
{
  "displayName": "System Admin",
  "email": "admin1@herhealth.com",
  "password": "AdminPass123",
  "department": "Operations"
}
```

Save from response:
- `admin._id` as `ADMIN_ID`
- `user._id` as `ADMIN_USER_ID`
<!--       "_id": "69ab40c5d06f7b56d708d9df",
       "userId": "69ab40c5d06f7b56d708d9df",
-->

### Get all Admins
- GET `/api/admins`

### Get Admin by ID
- GET `/api/admins/ADMIN_ID`

### Update Admin
- PUT `/api/admins/ADMIN_ID`

```json
{
  "department": "Platform Trust"
}
```

---

## 2) Create Normal User

### Create User
- POST `/api/users`

```json
{
  "displayName": "Amina",
  "email": "amina@herhealth.com",
  "password": "UserPass123",
  "isPremium": true
}
```

Save:
- `_id` as `USER_ID`

### Get all Users
- GET `/api/users`

### Get User by ID
- GET `/api/users/USER_ID`

### Update User
- PUT `/api/users/USER_ID`

```json
{
  "displayName": "Amina Noor",
  "isPremium": true
}
```

---

## 3) Admin Onboards Doctor (important rule)

### Create Doctor (Admin-controlled)
- POST `/api/doctors/admin/ADMIN_ID`

```json
{
  "displayName": "Dr. Sara",
  "email": "dr.sara@herhealth.com",
  "password": "DoctorPass123",
  "specialization": "Gynecology",
  "verificationStatus": "Verified",
  "bio": "Women health specialist"
}
```

Save:
- `doctor._id` as `DOCTOR_ID`
- `user._id` as `DOCTOR_USER_ID`

### Get all Doctors
- GET `/api/doctors`

### Get Doctor by ID
- GET `/api/doctors/DOCTOR_ID`

### Update Doctor
- PUT `/api/doctors/DOCTOR_ID`

```json
{
  "verificationStatus": "Verified",
  "bio": "Certified OB-GYN with 10 years experience"
}
```

---

## 4) Anonymous Community Post + Comment + Engagement

### Create Post
- POST `/api/posts`

```json
{
  "userId": "USER_ID",
  "title": "Need advice about irregular cycle",
  "content": "My cycle has been irregular for 3 months. Any safe first steps?",
  "category": "menstrual-health",
  "isAnonymous": true,
  "tags": ["cycle", "period", "health"]
}
```

Save:
- `_id` as `POST_ID`

### Get Posts
- GET `/api/posts`

Optional filters examples:
- GET `/api/posts?category=menstrual-health`
- GET `/api/posts?userId=USER_ID`
- GET `/api/posts?tag=cycle`

### Get Post by ID
- GET `/api/posts/POST_ID`

### Update Post
- PUT `/api/posts/POST_ID`

```json
{
  "title": "Need advice about irregular cycle (updated)",
  "tags": ["cycle", "period", "support"]
}
```

### Create Comment
- POST `/api/comments`

```json
{
  "postId": "POST_ID",
  "userId": "USER_ID",
  "displayName": "Anonymous Sister",
  "content": "You should consult a doctor and track symptoms.",
  "isReported": false
}
```

Save:
- `_id` as `COMMENT_ID`

### Get Comments
- GET `/api/comments`

Optional filters examples:
- GET `/api/comments?postId=POST_ID`
- GET `/api/comments?userId=USER_ID`

### Get Comment by ID
- GET `/api/comments/COMMENT_ID`

### Update Comment
- PUT `/api/comments/COMMENT_ID`

```json
{
  "content": "Please consult a verified doctor and monitor symptoms."
}
```

### Like Post (Engagement)
- POST `/api/post-engagements`

```json
{
  "postId": "POST_ID",
  "userId": "USER_ID",
  "type": "Like"
}
```

Save:
- `_id` as `LIKE_ENGAGEMENT_ID`

### Report Post (Engagement)
- POST `/api/post-engagements`

```json
{
  "postId": "POST_ID",
  "userId": "DOCTOR_USER_ID",
  "type": "Report",
  "reportReason": "Potential misinformation"
}
```

Save:
- `_id` as `REPORT_ENGAGEMENT_ID`

### Get Engagements
- GET `/api/post-engagements`

Optional filters examples:
- GET `/api/post-engagements?postId=POST_ID`
- GET `/api/post-engagements?type=Like`

### Update Engagement
- PUT `/api/post-engagements/REPORT_ENGAGEMENT_ID`

```json
{
  "reportReason": "Updated reason after moderator review"
}
```

---

## 5) Doctor Educational Content (Article / Voice Lesson)

### Create Text Article
- POST `/api/doctor-advice`

```json
{
  "doctorId": "DOCTOR_ID",
  "title": "Understanding Menstrual Pain",
  "category": "menstrual-health",
  "contentType": "Text",
  "textContent": "Most menstrual pain is manageable with hydration, rest, and proper medical advice.",
  "summary": "Beginner-friendly overview",
  "isPublished": true
}
```

Save:
- `_id` as `ADVICE_TEXT_ID`

### Create Voice Lesson
- POST `/api/doctor-advice`

```json
{
  "doctorId": "DOCTOR_ID",
  "title": "PCOS Basics Audio",
  "category": "pcos",
  "contentType": "VoiceURL",
  "voiceUrl": "https://example.com//pcos-basics.mp3",
  "audioDuration": 420,
  "transcript": "Welcome to this quick lesson on PCOS...",
  "isPublished": true
}
```

Save:
- `_id` as `ADVICE_VOICE_ID`

### Get Advice
- GET `/api/doctor-advice`

Optional filters examples:
- GET `/api/doctor-advice?doctorId=DOCTOR_ID`
- GET `/api/doctor-advice?contentType=Text`

### Get Advice by ID
- GET `/api/doctor-advice/ADVICE_TEXT_ID`

### Update Advice
- PUT `/api/doctor-advice/ADVICE_TEXT_ID`

```json
{
  "summary": "Updated summary",
  "isPublished": true
}
```

---

## 6) Premium Chat Session + Messages

### Create Chat Session
- POST `/api/chats`

```json
{
  "userId": "USER_ID",
  "doctorId": "DOCTOR_ID",
  "sessionStatus": "Active"
}
```

Save:
- `_id` as `CHAT_ID`

### Get Chats
- GET `/api/chats`

Optional filters examples:
- GET `/api/chats?userId=USER_ID`
- GET `/api/chats?doctorId=DOCTOR_ID`

### Get Chat by ID
- GET `/api/chats/CHAT_ID`

### Update Chat
- PUT `/api/chats/CHAT_ID`

```json
{
  "sessionStatus": "Closed",
  "endedAt": "2026-03-07T12:30:00.000Z"
}
```

### Create Message (User)
- POST `/api/messages`

```json
{
  "chatId": "CHAT_ID",
  "senderId": "USER_ID",
  "messageText": "Hi doctor, I need a personalized plan.",
  "isRead": false
}
```

Save:
- `_id` as `MESSAGE_USER_ID`

### Create Message (Doctor)
- POST `/api/messages`

```json
{
  "chatId": "CHAT_ID",
  "senderId": "DOCTOR_USER_ID",
  "messageText": "Sure, please share symptoms and cycle details.",
  "isRead": false
}
```

Save:
- `_id` as `MESSAGE_DOCTOR_ID`

### Get Messages
- GET `/api/messages`

Optional filter:
- GET `/api/messages?chatId=CHAT_ID`

### Update Message
- PUT `/api/messages/MESSAGE_DOCTOR_ID`

```json
{
  "isRead": true
}
```

---

## 7) AI Conversation (non-premium chatbot history)

### Create AI Conversation
- POST `/api/ai-conversations`

```json
{
  "userId": "USER_ID",
  "sessionTitle": "Cycle symptom quick help",
  "history": [
    {
      "prompt": "Summarize common causes of delayed period",
      "summaryResponse": "Stress, hormonal shifts, thyroid issues, and lifestyle changes are common causes."
    }
  ],
  "isArchived": false
}
```

Save:
- `_id` as `AI_CONVERSATION_ID`

### Get AI Conversations
- GET `/api/ai-conversations`

Optional filters:
- GET `/api/ai-conversations?userId=USER_ID`
- GET `/api/ai-conversations?isArchived=false`

### Get AI Conversation by ID
- GET `/api/ai-conversations/AI_CONVERSATION_ID`

### Update AI Conversation
- PUT `/api/ai-conversations/AI_CONVERSATION_ID`

```json
{
  "history": [
    {
      "prompt": "Summarize safe first steps for pain management",
      "summaryResponse": "Hydration, rest, heat pad, and consulting a doctor if pain worsens."
    }
  ],
  "isArchived": false
}
```

### Gemini Chat (AI assistant)

Before using these endpoints, set in `backend/.env`:

```text
GEMINI_API_KEY=your_google_ai_api_key
GEMINI_MODEL=gemini-1.5-flash
```

### Chat with Gemini
- POST `/api/ai-conversations/chat`

```json
{
  "userId": "USER_ID",
  "conversationId": "AI_CONVERSATION_ID",
  "message": "I have irregular cycle and fatigue, what should I track before seeing a doctor?"
}
```

### Summarize Community Post
- POST `/api/ai-conversations/summarize/post`

```json
{
  "userId": "USER_ID",
  "postId": "POST_ID",
  "conversationId": "AI_CONVERSATION_ID"
}
```

### Summarize Doctor Article
- POST `/api/ai-conversations/summarize/article`

```json
{
  "userId": "USER_ID",
  "articleId": "ADVICE_TEXT_ID",
  "conversationId": "AI_CONVERSATION_ID"
}
```

### Suggest Doctors
- POST `/api/ai-conversations/suggest-doctors`

```json
{
  "userId": "USER_ID",
  "conversationId": "AI_CONVERSATION_ID",
  "query": "I have frequent period pain and need a verified gynecology specialist."
}
```

---

## 8) Personal Assistance (AI summary storage)

### Create Personal Assistance Entry
- POST `/api/personal-assistance`

```json
{
  "userId": "USER_ID",
  "prompt": "I have mild cramps and fatigue. Give basic guidance.",
  "summaryResponse": "Try rest, hydration, and monitor for red-flag symptoms.",
  "category": "general"
}
```

Save:
- `_id` as `ASSISTANCE_ID`

### Get Personal Assistance Entries
- GET `/api/personal-assistance`

Optional filters:
- GET `/api/personal-assistance?userId=USER_ID`
- GET `/api/personal-assistance?category=general`

### Get Entry by ID
- GET `/api/personal-assistance/ASSISTANCE_ID`

### Update Entry
- PUT `/api/personal-assistance/ASSISTANCE_ID`

```json
{
  "summaryResponse": "Updated guidance: rest, hydration, and seek care if severe pain continues."
}
```

---

## 9) Delete flow (cleanup tests)

Use this order to avoid dangling test references:

1. DELETE `/api/messages/MESSAGE_USER_ID`
2. DELETE `/api/messages/MESSAGE_DOCTOR_ID`
3. DELETE `/api/chats/CHAT_ID`
4. DELETE `/api/comments/COMMENT_ID`
5. DELETE `/api/post-engagements/LIKE_ENGAGEMENT_ID`
6. DELETE `/api/post-engagements/REPORT_ENGAGEMENT_ID`
7. DELETE `/api/doctor-advice/ADVICE_TEXT_ID`
8. DELETE `/api/doctor-advice/ADVICE_VOICE_ID`
9. DELETE `/api/ai-conversations/AI_CONVERSATION_ID`
10. DELETE `/api/personal-assistance/ASSISTANCE_ID`
11. DELETE `/api/posts/POST_ID`
12. DELETE `/api/doctors/DOCTOR_ID`
13. DELETE `/api/users/USER_ID`
14. DELETE `/api/admins/ADMIN_ID`

---

## 10) Gemini Chatbot API (AI Conversation with Gemini)

### Send Gemini Chatbot Prompt
- POST `/api/ai-conversations/gemini`

**Request:**
```json
{
  "userId": "USER_ID",
  "prompt": "What are safe remedies for menstrual cramps?"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Safe remedies include hydration, rest, heat pads, and consulting a doctor if pain worsens. Always follow legal and honest medical advice.",
  "conversation": {
    "_id": "AI_CONVERSATION_ID",
    "userId": "USER_ID",
    "history": [
      {
        "prompt": "What are safe remedies for menstrual cramps?",
        "summaryResponse": "Safe remedies include hydration, rest, heat pads, and consulting a doctor if pain worsens. Always follow legal and honest medical advice."
      }
    ],
    ...other fields...
  }
}
```

**Error Example:**
```json
{
  "success": false,
  "message": "Gemini API error: ..."
}
```

---

## Common quick checks

- Invalid ID test:
  - Try `GET /api/users/123`
  - Expected: `400` with invalid ID message.

- Not found test:
  - Try valid ObjectId not in DB.
  - Expected: `404` with not found message.

- Missing required fields:
  - POST any endpoint without required payload.
  - Expected: `400` with missing fields message.
