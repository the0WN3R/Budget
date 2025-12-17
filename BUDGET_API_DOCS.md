# Budget API Documentation

Complete API documentation for budget management endpoints.

## Authentication

All budget endpoints require authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

## Endpoints

### 1. Create Budget

**POST** `/api/budgets`

Creates a new budget for the authenticated user.

**Request Body:**
```json
{
  "name": "Monthly Budget 2024",
  "description": "My monthly household budget",
  "currency_code": "USD"
}
```

**Parameters:**
- `name` (required) - Budget name
- `description` (optional) - Budget description
- `currency_code` (optional) - ISO 4217 currency code (default: "USD")

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Budget created successfully",
  "budget": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Monthly Budget 2024",
    "description": "My monthly household budget",
    "currency_code": "USD",
    "created_at": "2024-12-16T...",
    "updated_at": "2024-12-16T..."
  }
}
```

**Features:**
- Automatically links budget to authenticated user
- If user has no active budget, sets this as their active budget (updates `user_profiles.budget_id`)
- Validates currency code format (must be 3 uppercase letters)

---

### 2. Get All Budgets

**GET** `/api/budgets`

Retrieves all budgets belonging to the authenticated user.

**Response (200 OK):**
```json
{
  "success": true,
  "budgets": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Monthly Budget 2024",
      "description": "My monthly household budget",
      "currency_code": "USD",
      "created_at": "2024-12-16T...",
      "updated_at": "2024-12-16T..."
    }
  ],
  "count": 1
}
```

---

### 3. Get Single Budget

**GET** `/api/budgets/[id]`

Retrieves a specific budget by ID. Only accessible if you own the budget.

**Response (200 OK):**
```json
{
  "success": true,
  "budget": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Monthly Budget 2024",
    "description": "My monthly household budget",
    "currency_code": "USD",
    "created_at": "2024-12-16T...",
    "updated_at": "2024-12-16T..."
  }
}
```

**Errors:**
- `404` - Budget not found or you don't have permission

---

### 4. Update Budget

**PUT** `/api/budgets/[id]`

Updates a budget. Only accessible if you own the budget.

**Request Body:**
```json
{
  "name": "Updated Budget Name",
  "description": "Updated description",
  "currency_code": "EUR"
}
```

**Parameters (all optional):**
- `name` - New budget name
- `description` - New budget description
- `currency_code` - New currency code

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Budget updated successfully",
  "budget": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Updated Budget Name",
    "description": "Updated description",
    "currency_code": "EUR",
    "created_at": "2024-12-16T...",
    "updated_at": "2024-12-16T..."
  }
}
```

---

### 5. Delete Budget

**DELETE** `/api/budgets/[id]`

Deletes a budget. Only accessible if you own the budget.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Budget deleted successfully"
}
```

**Features:**
- Automatically deletes associated budget tabs (cascade delete)
- If this was the user's active budget, clears `user_profiles.budget_id`

---

## Error Responses

All endpoints may return these error responses:

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "You must be logged in to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Budget not found or you do not have permission to access it"
}
```

### 400 Bad Request
```json
{
  "error": "Validation error",
  "message": "Budget name is required"
}
```

### 500 Internal Server Error
```json
{
  "error": "Database error",
  "message": "Failed to create budget. Please try again."
}
```

---

## Usage Examples

### Using the API Client (Frontend)

```javascript
import { budgetAPI, getSession } from '../lib/api'

// Create a budget
try {
  const response = await budgetAPI.create(
    'Monthly Budget 2024',
    'My monthly household budget',
    'USD'
  )
  console.log('Budget created:', response.budget)
} catch (error) {
  console.error('Error:', error.message)
}

// Get all budgets
const { budgets } = await budgetAPI.getAll()

// Get a specific budget
const { budget } = await budgetAPI.getById(budgetId)

// Update a budget
await budgetAPI.update(budgetId, {
  name: 'New Name',
  currency_code: 'EUR'
})

// Delete a budget
await budgetAPI.delete(budgetId)
```

### Using cURL

**Create Budget:**
```bash
curl -X POST http://localhost:3000/api/budgets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Monthly Budget 2024",
    "description": "My monthly household budget",
    "currency_code": "USD"
  }'
```

**Get All Budgets:**
```bash
curl -X GET http://localhost:3000/api/budgets \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Update Budget:**
```bash
curl -X PUT http://localhost:3000/api/budgets/BUDGET_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Updated Name"
  }'
```

**Delete Budget:**
```bash
curl -X DELETE http://localhost:3000/api/budgets/BUDGET_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Security Features

1. **Authentication Required**: All endpoints require a valid access token
2. **Ownership Verification**: Users can only access/modify their own budgets
3. **Row Level Security**: Database RLS policies enforce access control
4. **Input Validation**: All inputs are validated before processing
5. **Cascade Deletion**: Deleting a budget automatically deletes associated tabs

---

## Database Behavior

- Creating a budget automatically sets it as the user's active budget if they don't have one
- Deleting a budget automatically clears `user_profiles.budget_id` if it was the active budget
- Budget deletion cascades to `budget_tabs` table (all tabs are deleted)

---

## Next Steps

After creating budgets, you can:
1. Add budget tabs/categories using the budget tabs API
2. Link expenses to budgets
3. Track spending against budget limits

