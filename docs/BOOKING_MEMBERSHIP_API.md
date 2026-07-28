# HiLex Membership API for Forest & Co Booking

## Verify membership

Endpoint:

```txt
POST https://membersaccess.hilex.co.uk/api/membership/verify
```

Request:

```json
{
  "email": "client@email.com"
}
```

Response for active member:

```json
{
  "member": true,
  "plan": "essential",
  "status": "active",
  "includedMinutes": 45,
  "usedMinutes": 15,
  "remainingMinutes": 30
}
```

Response for inactive/non-member:

```json
{
  "member": false,
  "plan": null,
  "status": "inactive",
  "includedMinutes": 0,
  "usedMinutes": 0,
  "remainingMinutes": 0
}
```

This endpoint only reads membership data. It does not create users and does not send any email.

## Consume consultation credit

Endpoint:

```txt
POST https://membersaccess.hilex.co.uk/api/membership/use-consultation-credit
```

Required header:

```txt
X-HILEX-Booking-Key: your-secret-value
```

Request:

```json
{
  "email": "client@email.com",
  "minutes": 15,
  "bookingId": "booking-id",
  "source": "forest-booking"
}
```

Response:

```json
{
  "member": true,
  "plan": "essential",
  "status": "active",
  "includedMinutes": 45,
  "usedMinutes": 30,
  "remainingMinutes": 15,
  "consumed": true,
  "duplicate": false
}
```

The `bookingId` is unique per user, so the same confirmed booking cannot consume minutes twice.

## Vercel environment variables

```txt
BOOKING_ALLOWED_ORIGIN=https://booking.fcos.co.uk
BOOKING_VERIFY_SECRET=choose-a-long-random-secret
```

Use the same `BOOKING_VERIFY_SECRET` in the booking system when calling the consume endpoint.
