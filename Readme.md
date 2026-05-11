## Real time Polling app

User submits answer
│
▼
INSERT into question_responses ← source of truth
│
▼
Compute points (correctness + speed bonus)
│
▼
UPDATE session_participants ← totalPoints += earned
SET totalPoints = totalPoints + X
│
▼
Recalculate ranks for session ← optional, can do client-side
│
▼
Publish leaderboard event ← WebSocket broadcast
to all session subscribers

![alt text](image.png)
ERD

```TS
users [icon: user, color: blue] {
  id uuid pk
  clerk_user_id varchar
  name varchar
  email varchar
  created_at timestamp
  updated_at timestamp
}

polls [icon: list, color: purple] {
  id uuid pk
  created_by uuid fk
  title varchar
  description text
  status poll_status
  is_anonymous boolean
  expires_at timestamp
  published_at timestamp
  created_at timestamp
  updated_at timestamp
}

questions [icon: help-circle, color: teal] {
  id uuid pk
  poll_id uuid fk
  question text
  question_type enum
  options text
  is_mandatory boolean
  display_order int
  created_at timestamp
}

responses [icon: message-square, color: green] {
  id uuid pk
  poll_id uuid fk
  user_id uuid fk nullable
  submission_token varchar nullable
  submitted_at timestamp
  created_at timestamp
}

question_responses [icon: check-square, color: orange] {
  id uuid pk
  response_id uuid fk
  question_id uuid fk
  selected_option_id varchar nullable
  answered_at timestamp
}

// one user creates many polls (user must exist)
users.id < polls.created_by

// one user submits many responses (nullable — anonymous allowed)
users.id <? responses.user_id

// one poll has many questions (poll must exist)
polls.id < questions.poll_id

// one poll receives many responses (poll must exist)
polls.id < responses.poll_id

// one response contains one or more question_responses (must have at least one)
responses.id < question_responses.response_id

// one question answered across many question_responses (zero or many)
questions.id < question_responses.question_id
```

User creates poll
│
▼
status = "draft"
│
│ Add questions + options freely
│ Edit / delete / reorder
│
▼
status = "active" ←── creator hits "Go Live"
│ shareable link is now valid
│
│ Respondents submit answers
│
├──── expiresAt passes ──────────► status = "expired"
│ │
│ │ no more submissions
│ ▼
│ creator reviews analytics
│ │
└───────────────────────────────────────▼
status = "published"
public can see results
via same poll link

---

```JS
Who Joins the Poll Room and When
Creator opens analytics dashboard
        │
        ▼
socket.emit("poll:join", { pollId })   ← watches live stats

Respondent opens public poll link
        │
        ▼
socket.emit("poll:join", { pollId })   ← same room, different reason
Both join the same poll:${pollId} room. But only the creator cares about the poll:stats:updated event — the respondent is there just to submit answers via REST.

So Do You Even Need Respondent in the Room?
No. Think about it:

Respondent opens poll link → fills the form → hits submit → POST /api/polls/:id/respond
That's pure REST. No socket needed from the respondent's side at all.
The socket emit after insert goes to the creator's dashboard, not back to the respondent.

Respondent                Creator Dashboard
    │                           │
    │  POST /respond (REST)     │  socket.emit("poll:join")
    │ ─────────────────────►    │  ← already listening
    │                           │
    │                    DB insert happens
    │                           │
    │                    io.to(`poll:${pollId}`)
    │                    .emit("poll:stats:updated")
    │                           │
    │                           ▼
    │                    stats update on screen

Verdict
WhoNeeds to join socket room?WhyCreator on dashboard✅ YesReceives live stats updatesRespondent on poll form❌ NoOnly does REST submit, needs no live data
So only emit poll:join on the creator's analytics dashboard page, not on the public poll form page. Keep the respondent flow pure REST — simpler and cleaner.
```

---

```JS
Two Different Pages
/poll/:id              ← public page, respondent fills and submits
/dashboard/poll/:id    ← creator's page, sees live stats

Respondent Flow (pure REST, no socket)
Respondent opens /poll/:id
        │
        ▼
Sees the form, fills answers
        │
        ▼
Clicks Submit
        │
        ▼
POST /api/polls/:id/respond    ← just a normal API call
        │
        ▼
Done. Redirected to "Thanks for submitting!"
The respondent never touches a socket. They just fill a form and hit an API endpoint. That's it.

Creator Flow (socket involved)
Creator opens /dashboard/poll/:id
        │
        ▼
Page loads → socket.emit("poll:join", { pollId })
        │         ← tells server "I want live updates for this poll"
        ▼
Creator sits and watches the dashboard
        │
        ▼
Meanwhile... a respondent submits via REST
        │
        ▼
Server inserts into DB
        │
        ▼
Server emits to poll room:
io.to("poll:pollId").emit("poll:stats:updated", { totalResponses: 5 })
        │
        ▼
Creator's dashboard receives it → numbers update live

The Connection Between Both
Respondent                 Your Server              Creator Dashboard
    │                           │                           │
    │  POST /api/polls/:id/respond                          │
    │ ─────────────────────────►│                           │
    │                           │ insert into DB            │
    │                           │ calculate new counts      │
    │                           │ io.to(pollId).emit() ────►│
    │                           │                           │ updates live
    │  201 OK                   │                           │
    │ ◄─────────────────────────│                           │
The respondent's REST call triggers the socket emit, but the respondent themselves never receives or sends any socket event. The socket message goes only to the creator's open dashboard tab.

One Line Summary

Respondent submits via REST → server emits to socket room → creator's dashboard updates live.

The respondent is the cause, the creator's dashboard is the receiver. They never directly talk to each other.
```

---

```JS
Creator dashboard loads
        │
        ▼
Every 3 seconds:
GET /api/polls/:id/stats  ← keeps hitting server repeatedly
GET /api/polls/:id/stats
GET /api/polls/:id/stats
        │
        ▼
Wasteful — most requests return same data
Adds unnecessary DB load
Feels delayed (up to 3s lag)
```

---

```JS
With Socket (what you're building — good)
Creator dashboard loads
        │
        ▼
socket.emit("poll:join", { pollId })  ← one time, on page load
        │
        ▼
Creator just sits and waits
        │
        │   ... respondent submits somewhere in the world ...
        │
        ▼
Server: new row inserted into DB
        │
        ▼
Server: io.to(`poll:${pollId}`).emit("poll:stats:updated", {
          totalResponses: 6,
          optionCounts: [...]
        })
        │
        ▼
Creator's dashboard receives it instantly
Numbers update on screen — no request made
```
