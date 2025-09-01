# Project Status Management System

This document outlines the comprehensive project status management system implemented in the Projevo platform.

## Project Status Flow

### Draft Mode

#### 1. **In Progress** Status
- **Condition**: `status === 'Draft'` OR `moderationStatus === 'draft'`
- **Display**: "In Progress" badge (Gray)
- **Button**: "Edit Project" - Allows project owner to continue editing
- **Description**: Owner is still creating the project draft

#### 2. **Review** Status
- **Condition**: `moderationStatus === 'pending'` OR `status === 'Under Review'` OR `status === 'Review'`
- **Display**: "Review" badge (Orange)
- **Button**: "Wait Admin To Approve" - Disabled button
- **Description**: Owner has submitted the draft for admin review

#### 3. **Revise** Status
- **Condition**: `moderationStatus === 'rejected'` OR `status === 'Revise'` OR `moderationStatus === 'revision_required'`
- **Display**: "Revise" badge (Red)
- **Button**: "Edit Project" - With tooltip showing admin notes
- **Description**: Admin requires project owner to revise project details
- **Features**: 
  - Shows admin revision notes in a red alert box
  - Tooltip on button shows admin feedback

#### 4. **Approve** Status
- **Condition**: `moderationStatus === 'approved'` AND `procurementMethod !== 'Tender'`
- **Display**: "Approve" badge (Purple)
- **Button**: "View Details" - Read-only view
- **Description**: Admin approved the project and it's live in marketplace

### Tender Mode

#### 5. **Open** Status
- **Condition**: `moderationStatus === 'approved'` AND `procurementMethod === 'Tender'` AND > 24 hours to deadline
- **Display**: "Open" badge (Green)
- **Button**: "View Details" with tender status info
- **Description**: Tender is open for vendor proposals
- **Features**: Shows remaining time to deadline

#### 6. **Locked** Status
- **Condition**: Tender with ≤ 24 hours to deadline
- **Display**: "Locked" badge (Orange)
- **Button**: "View Details" with locked indicator
- **Description**: Tender is locked, no new proposals accepted
- **Features**: Shows "Tender Locked (< 24h)" message

#### 7. **Negotiate** Status
- **Condition**: `hasNegotiationOffer === true` OR `status === 'Negotiate'`
- **Display**: "Negotiate" badge (Purple)
- **Button**: "View Offer" - Goes directly to proposals tab
- **Description**: There is an active negotiation with a vendor

#### 8. **Awarded** Status
- **Condition**: `selectedVendorId` exists OR `status === 'Awarded'`
- **Display**: "Awarded" badge (Red)
- **Button**: "Need Payment" - Triggers 50% payment flow
- **Description**: Vendor has been selected, payment required to start project

#### 9. **Failed** Status
- **Condition**: Deadline passed with no winner selected
- **Display**: "Failed" badge (Gray)
- **Button**: "Resubmit" - Allows reopening tender
- **Description**: No vendor was selected before deadline

## Admin Functions

### Project Review Actions
1. **Approve**: Sets `moderationStatus: 'approved'`, `status: 'Active'`, makes project live
2. **Request Revision**: Sets `moderationStatus: 'revision_required'`, `status: 'Revise'`, adds admin notes
3. **Reject**: Sets `moderationStatus: 'rejected'`, `status: 'Rejected'`, adds rejection reason

### Revision Request Fields
- `adminNotes`: Specific revision instructions from admin
- `revisionRequestedAt`: Timestamp when revision was requested
- `moderationStatus`: Set to `'revision_required'`

## Project Owner Experience

### Status Colors
- **Gray**: Draft/In Progress/Failed states
- **Orange**: Review/Locked states
- **Red**: Revise/Awarded (payment needed) states
- **Purple**: Approved/Negotiate states
- **Green**: Open tender state

### Interactive Elements
- **Edit Project**: Available for In Progress and Revise statuses
- **View Details**: Standard viewing mode
- **View Offer**: Direct navigation to proposals for negotiation
- **Need Payment**: Integration with Midtrans payment system
- **Resubmit**: Restart failed tender process

## Technical Implementation

### Key Functions
- `getProjectStatus(project)`: Determines current project status
- `getActionButton(project)`: Returns appropriate action button
- `getStatusColor(project)`: Returns status-specific color
- `getTimeToDeadlineInHours(deadline)`: Calculates time remaining

### Database Fields
- `status`: Main project status
- `moderationStatus`: Admin review status
- `adminNotes`: Revision instructions
- `procurementMethod`: Project type (Tender, Contract, etc.)
- `selectedVendorId`: Chosen vendor ID
- `hasNegotiationOffer`: Active negotiation flag

## Usage Examples

```javascript
// Check if project needs revision
const projectStatus = getProjectStatus(project);
if (projectStatus === 'Revise') {
  // Show revision notes and edit button
}

// Check if tender is locked
if (projectStatus === 'Locked') {
  // Show locked state, disable new proposals
}

// Check if payment is needed
if (projectStatus === 'Awarded') {
  // Show payment button, trigger Midtrans flow
}
```

This system provides a comprehensive workflow for project management from initial draft creation through vendor selection and payment processing.
