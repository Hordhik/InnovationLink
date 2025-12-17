# Notification System - Complete Implementation Guide

## Overview

The notification system now properly displays connection requests with Accept/Reject buttons, allows navigation to sender's profile, and enables read/unread toggling.

## Architecture

### Backend Query Flow

```
User receives notification
    ↓
GET /api/notifications (user_id from token)
    ↓
Database Query (LEFT JOIN with connections, users, investors, startup_profile_details)
    ↓
Returns: id, type, message, connection_status, sender_username, sender_userType, sender_display_name
    ↓
Frontend receives JSON response
```

### Frontend Processing Flow

```
Raw API Response
    ↓
Map to Notifications object:
  - id, read, text, time, type
  - senderId, senderUsername, senderUserType, senderDisplayName
  - connectionStatus
  - link (generated based on type and sender info)
    ↓
Render in UI based on conditions
```

## Detailed UI Rendering Logic

### For Connection Request Notifications

#### When Status is Pending/Null:
```
┌────────────────────────────────────────────────┐
│ [👤] You have a new connection request   [○]  │
│      from gopalrao                             │
│      17/12/2025                                │
│      [Accept] [Reject]                         │
│                                                │
│ When clicked: Navigate to gopalrao's profile  │
└────────────────────────────────────────────────┘
```

**Condition:**
```javascript
notif.type === 'connection_request' && 
(notif.connectionStatus === null || 
 notif.connectionStatus === undefined || 
 notif.connectionStatus === 'pending')
```

**Actions:**
- Click "Accept" → Calls `acceptConnectionRequest()` → Refreshes → Shows status
- Click "Reject" → Calls `rejectConnectionRequest()` → Refreshes → Shows status
- Click notification area → Navigate to `/[I|S]/startups/gopalrao`
- Click toggle (○) → Mark as read → Shows (✓)

#### When Status is Accepted:
```
┌────────────────────────────────────────────────┐
│ [👤] You have a new connection request   [✓]  │
│      from gopalrao                             │
│      17/12/2025                                │
│      ✓ Connection with gopalrao accepted      │
│                                                │
│ When clicked: Navigate to gopalrao's profile  │
└────────────────────────────────────────────────┘
```

**Condition:**
```javascript
notif.type === 'connection_request' && 
notif.connectionStatus === 'accepted'
```

**Actions:**
- Shows green checkmark with "Connection with gopalrao accepted"
- Click notification area → Navigate to `/[I|S]/startups/gopalrao`
- Click toggle (✓) → Mark as unread → Shows (○)

#### When Status is Rejected:
```
┌────────────────────────────────────────────────┐
│ [👤] You have a new connection request   [✓]  │
│      from gopalrao                             │
│      17/12/2025                                │
│      ✗ Connection with gopalrao rejected       │
│                                                │
│ When clicked: Navigate to gopalrao's profile  │
└────────────────────────────────────────────────┘
```

**Condition:**
```javascript
notif.type === 'connection_request' && 
notif.connectionStatus === 'rejected'
```

**Actions:**
- Shows red X with "Connection with gopalrao rejected"
- Click notification area → Navigate to `/[I|S]/startups/gopalrao`

### For Connection Accepted Notifications

```
┌────────────────────────────────────────────────┐
│ [👤] gopalrao accepted your connection   [○]  │
│      17/12/2025                                │
│      ✓ Connection with gopalrao accepted      │
│                                                │
│ When clicked: Navigate to connections page   │
└────────────────────────────────────────────────┘
```

**Condition:**
```javascript
notif.type === 'connection_accepted'
```

**Actions:**
- Always shows "✓ Connection with [name] accepted"
- Click notification area → Navigate to `/[I|S]/profile#connections`
- Click toggle → Toggle read/unread status

## Critical Implementation Details

### Button Visibility Logic

The buttons appear ONLY when ALL conditions are met:

```javascript
notif.type === 'connection_request' && 
(
  notif.connectionStatus === null ||
  notif.connectionStatus === undefined ||
  notif.connectionStatus === 'pending'
)
```

**Why these specific checks:**
- `=== null` - Handles explicit null values from database
- `=== undefined` - Handles missing values
- `=== 'pending'` - Handles explicit pending status from connections table

### Event Propagation

All interactive elements must stop event propagation:

```javascript
// Accept Button
onClick={(e) => {
  e.stopPropagation();  // ← CRITICAL
  handleAccept(e, notif);
}}

// Reject Button
onClick={(e) => {
  e.stopPropagation();  // ← CRITICAL
  handleReject(e, notif);
}}

// Read/Unread Toggle
onClick={(e) => {
  e.stopPropagation();  // ← CRITICAL
  toggleNotificationRead(notif.id);
}}

// Notification Item (clickable)
onClick={() => {
  handleNotificationClick(notif.id, notif.link);
}}
```

### Profile Navigation

Dynamically determined based on sender's user type:

```javascript
getLinkForType = (type, senderUsername, senderUserType) => {
  const portalPrefix = `/${(window.location.pathname.split("/")[1] || "S")}`;
  
  switch (type) {
    case 'connection_request':
      if (senderUsername && senderUserType) {
        // Route to sender's public profile
        return `${portalPrefix}/${
          senderUserType === 'investor' ? 'investors' : 'startups'
        }/${senderUsername}`;
      }
      return `${portalPrefix}/profile#connections`;
      
    case 'connection_accepted':
      // Route to connections page
      return `${portalPrefix}/profile#connections`;
      
    default:
      return `${portalPrefix}/home`;
  }
};
```

## CSS Layout Structure

### Wrapper Container
```css
.notification-item-wrapper {
  display: flex;
  align-items: stretch;  /* Vertically align items */
  border-bottom: 1px solid var(--border-color);
  position: relative;
  gap: 0;
}
```

### Main Content (Clickable)
```css
.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  flex: 1;  /* Takes remaining space */
  transition: background-color 0.2s ease;
}

.notification-item:hover {
  background-color: var(--bg-hover);
}
```

### Controls (Not Clickable)
```css
.notification-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;  /* Doesn't shrink */
  padding: 8px 12px;
}
```

### Action Buttons
```css
.notification-actions-inline {
  display: flex;
  gap: 8px;
}

.notification-action-btn {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.notification-action-btn.accept {
  background-color: #4CAF50;
  color: white;
}

.notification-action-btn.reject {
  background-color: #EF4444;
  color: white;
}
```

## Complete User Flow Example

### Scenario: John (Investor) sends connection request to Sarah (Startup)

**Step 1: John sends request**
```
Frontend: POST /api/connections/request { targetUserId: sarah_id }
Backend: Creates connection (status: pending) + notification
```

**Step 2: Sarah sees notification**
```
GET /api/notifications → Returns:
{
  id: 1,
  type: 'connection_request',
  message: 'You have a new connection request from john_investor',
  connection_status: null,  ← IMPORTANT: null because just created
  sender_username: 'john_investor',
  sender_userType: 'investor',
  sender_display_name: 'John Investment Co'
}

Frontend renders:
- Message displayed
- ✓ Buttons visible: Accept, Reject
- Link points to: /S/investors/john_investor
```

**Step 3: Sarah clicks Accept**
```
Frontend: POST /api/connections/accept { senderId: john_id }
Backend: Updates connection status to 'accepted'
Frontend: Calls fetchData() to refresh

Updated notification:
{
  id: 1,
  type: 'connection_request',
  message: 'You have a new connection request from john_investor',
  connection_status: 'accepted',  ← CHANGED
  sender_username: 'john_investor',
  sender_userType: 'investor',
  sender_display_name: 'John Investment Co'
}

Frontend renders:
- Buttons HIDDEN (condition fails)
- Status shown: "✓ Connection with John Investment Co accepted"
- Link points to: /S/investors/john_investor
```

**Step 4: John receives notification**
```
Backend creates new notification:
{
  type: 'connection_accepted',
  message: 'john_investor accepted your connection request',
  connection_status: 'accepted',
  sender_username: 'sarah_startup',
  ...
}

Frontend renders:
- Status shown: "✓ Connection with Sarah Startup Company accepted"
- Link points to: /I/profile#connections
```

## Testing Checklist

- [ ] Pending request notification shows Accept/Reject buttons
- [ ] Accept button removes buttons and shows status
- [ ] Reject button removes buttons and shows status
- [ ] Clicking notification navigates to correct profile
- [ ] Read/Unread toggle works independently
- [ ] Status messages include sender's name/company
- [ ] Works for both investor and startup senders
- [ ] Connection accepted notification shows correct status
- [ ] All buttons have proper styling and hover effects
- [ ] No console errors

## Troubleshooting

### Buttons not appearing
- Check if `connectionStatus` is being populated (should be null or 'pending')
- Verify API response includes all sender fields
- Check browser console for errors

### Wrong profile opening
- Verify `senderUsername` and `senderUserType` are correct
- Check portal prefix is detected correctly
- Ensure user type is either 'investor' or 'startup'

### Read/Unread toggle not working
- Check `markNotificationAsRead` and `markNotificationAsUnread` API calls
- Verify `e.stopPropagation()` is being called
- Check API response for errors

### Status message not showing
- Verify `senderDisplayName` or `senderUsername` is available
- Check backend query is joining with investors/startup_profile_details
- Ensure notification type matches condition
