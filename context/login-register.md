 Request/Response Structures
2.1 Register Request
Endpoint: POST /api/v1/auth/register

Field	Type	Validation	UI Control
email	String	Required, Valid email format	Email input
password	String	Required, Min 8 characters	Password input
fullName	String	Required	Text input
phone	String	Optional, E.164 format (+919876543210)	Phone input
Example Request:
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe",
  "phone": "+919876543210"
}

2.2 Login Request
Endpoint: POST /api/v1/auth/login

Field	Type	Validation	UI Control
email	String	Required, Valid email format	Email input
password	String	Required	Password input
Example Request:

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

 Auth Response (Both Endpoints)
Field	Type	Description
status	String	"success"
accessToken	String	JWT token for Authorization header
userId	UUID	User's unique identifier
email	String	User's email
fullName	String	User's display name
userType	String	"new_investor" or "existing_investor"
createdAt	DateTime	Account creation timestamp
Example Response:
{
  "status": "success",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "fullName": "John Doe",
  "userType": "new_investor",
  "createdAt": "2025-12-29T10:30:00"
}

Error Handling
3.1 Error Responses
Scenario	HTTP Status	Error Message
Email already registered	400	"Email already registered"
Invalid credentials	401	"Bad credentials"
Invalid email format	400	"Invalid email format"
Password too short	400	"Password must be at least 8 characters"
Missing required field	400	"Email is required" / "Password is required"
Token expired	401	"Expired JWT token"
Invalid token	401	"Invalid JWT token"
3.2 Error Response Format
{
  "status": 400,
  "message": "Email already registered",
  "timestamp": "2025-12-29T10:30:00Z",
  "errors": []
}


src/app/
├── core/
│   ├── auth/
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   ├── interceptors/
│   │   │   └── jwt.interceptor.ts
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── guest.guard.ts
│   │   ├── models/
│   │   │   ├── login-request.model.ts
│   │   │   ├── register-request.model.ts
│   │   │   └── auth-response.model.ts
│   │   └── store/
│   │       └── auth.store.ts          # Signals-based state
│   │
│   └── storage/
│       └── token-storage.service.ts
│
├── features/
│   └── auth/
│       ├── login/
│       │   └── login.component.ts
│       ├── register/
│       │   └── register.component.ts
│       └── auth.routes.ts
│
└── shared/
    └── components/
        ├── password-input.component.ts
        └── social-auth-buttons.component.ts


        ┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────┐ │
│  │                              │  │                                  │ │
│  │     ┌────────────────┐       │  │    Create Account 🚀             │ │
│  │     │   BRAND LOGO   │       │  │                                  │ │
│  │     └────────────────┘       │  │    Start your investment journey │ │
│  │                              │  │                                  │ │
│  │     ✓ Smart portfolio        │  │    ┌────────────────────────────┐│ │
│  │       recommendations        │  │    │  👤 Full Name              ││ │
│  │                              │  │    │  John Doe                  ││ │
│  │     ✓ Risk-based asset       │  │    └────────────────────────────┘│ │
│  │       allocation             │  │                                  │ │
│  │                              │  │    ┌────────────────────────────┐│ │
│  │     ✓ Real-time portfolio    │  │    │  📧 Email                  ││ │
│  │       health analysis        │  │    │  user@example.com          ││ │
│  │                              │  │    └────────────────────────────┘│ │
│  │     ✓ Wealth projection      │  │                                  │ │
│  │       & tracking             │  │    ┌────────────────────────────┐│ │
│  │                              │  │    │  📱 Phone (optional)       ││ │
│  │                              │  │    │  +91 98765 43210           ││ │
│  │                              │  │    └────────────────────────────┘│ │
│  │                              │  │                                  │ │
│  │                              │  │    ┌────────────────────────────┐│ │
│  │                              │  │    │  🔒 Password          👁   ││ │
│  │                              │  │    │  ••••••••••                ││ │
│  │                              │  │    └────────────────────────────┘│ │
│  │                              │  │    ✓ Min 8 chars  ○ Uppercase   │ │
│  │                              │  │                                  │ │
│  │                              │  │    ┌────────────────────────────┐│ │
│  │                              │  │    │      Create Account →      ││ │
│  │                              │  │    └────────────────────────────┘│ │
│  │                              │  │                                  │ │
│  │                              │  │    Already have an account?      │ │
│  │                              │  │    Sign in →                     │ │
│  └──────────────────────────────┘  └──────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

