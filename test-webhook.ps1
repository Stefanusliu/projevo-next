# Test Xendit Webhook with Verification Token
# Replace PROJECT_ID with actual project ID

$PROJECT_ID = "your_project_id_here"
$WEBHOOK_URL = "http://localhost:3000/api/xendit/webhook"
$VERIFICATION_TOKEN = "sfDQ78ovuNRUh4dxDsyk4uXDJ99rwsawOUuWXu3By38NjwAb"

Write-Host "🧪 Testing Xendit Webhook with Verification Token" -ForegroundColor Green
Write-Host "================================================"

$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$isoDate = [DateTime]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.000Z")

# Test 1: Valid webhook with correct token
Write-Host "Test 1: Valid webhook with correct token" -ForegroundColor Yellow

$headers1 = @{
    "Content-Type" = "application/json"
    "x-callback-token" = $VERIFICATION_TOKEN
}

$body1 = @{
    id = "test-invoice-$timestamp"
    external_id = "proj-$PROJECT_ID-$timestamp"
    status = "PAID"
    amount = 25000000
    paid_amount = 25000000
    paid_at = $isoDate
    payment_id = "test-payment-$timestamp"
    payment_method = "BANK_TRANSFER"
    payment_channel = "BCA"
    payer_email = "test@example.com"
    description = "Test payment"
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri $WEBHOOK_URL -Method POST -Headers $headers1 -Body $body1
    Write-Host "✅ Response: $($response1 | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"

# Test 2: Invalid webhook with wrong token
Write-Host "Test 2: Invalid webhook with wrong token" -ForegroundColor Yellow

$headers2 = @{
    "Content-Type" = "application/json"
    "x-callback-token" = "wrong_token"
}

$body2 = @{
    id = "test-invoice-invalid"
    external_id = "proj-$PROJECT_ID-invalid"
    status = "PAID"
    amount = 25000000
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri $WEBHOOK_URL -Method POST -Headers $headers2 -Body $body2
    Write-Host "❌ Unexpected success: $($response2 | ConvertTo-Json)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Correctly rejected with 401 Unauthorized" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n"

# Test 3: Webhook without token
Write-Host "Test 3: Webhook without token" -ForegroundColor Yellow

$headers3 = @{
    "Content-Type" = "application/json"
}

$body3 = @{
    id = "test-invoice-no-token"
    external_id = "proj-$PROJECT_ID-no-token"
    status = "PAID"
    amount = 25000000
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri $WEBHOOK_URL -Method POST -Headers $headers3 -Body $body3
    Write-Host "❌ Unexpected success: $($response3 | ConvertTo-Json)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Correctly rejected with 401 Unauthorized" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n"
Write-Host "✅ Webhook tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Expected results:"
Write-Host "- Test 1: Should return 200 with 'verified: true'"
Write-Host "- Test 2: Should return 401 'Unauthorized'"  
Write-Host "- Test 3: Should return 401 'Unauthorized'"
