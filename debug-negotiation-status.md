# Negotiation Status Debug Guide

## Status Flow
1. **negotiating** - Initial state, both parties can negotiate
2. **pending_owner_response** - Vendor sent offer, waiting for project owner action
3. **pending_vendor_response** - Project owner responded, vendor can take action

## Vendor UI Logic
- When status = `pending_vendor_response` → Show action buttons (vendor can act)
- When status = `pending_owner_response` → Show waiting message (vendor waiting)
- When status = `negotiating` → Show action buttons (vendor can act)

## Testing Steps
1. Reset negotiation data in project collection
2. Set status to `negotiating` to start fresh
3. Vendor submits counter offer → status becomes `pending_owner_response`
4. Project owner responds → status becomes `pending_vendor_response`
5. Vendor can act again → cycle continues

## Debug Console Logs
Look for these emojis in console:
- 🔄 Loading negotiation data
- 📋 Found vendor proposal  
- 💬 Found negotiation data
- 📊 Setting counter offer
- ⏳ Vendor waiting for owner
- 🚀 Vendor can respond now
- ✅ No active negotiation

## Firestore Structure
```
projects/{projectId}/proposals[index]/negotiation: {
  status: "pending_vendor_response" | "pending_owner_response" | "negotiating",
  history: [...],
  counterOffer: {...}
}
```
