# Security Configuration

This API includes multiple layers of security to protect against unauthorized access and reduce costs.

## Authentication

- **API Key**: Required for all endpoints except `/api/health`
- Set `API_KEY` environment variable with a strong, unique key

## IP Whitelisting (Recommended for Production)

To restrict access to specific IP addresses:

```bash
# Enable IP whitelisting
ENABLE_IP_WHITELIST=true

# Specify allowed IPs (comma-separated)
ALLOWED_IPS=192.168.1.100,203.0.113.0/24,198.51.100.42
```

## Rate Limiting

- **Development**: 100 requests per 15 minutes
- **Production**: 50 requests per 15 minutes (recommended)
- Automatic banning after 10 violations in production

```bash
# Production rate limiting
RATE_LIMIT_MAX=50
RATE_LIMIT_WINDOW=900000  # 15 minutes
```

## Security Headers

Automatically applied:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` 
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Bot Protection

Automatically blocks requests with suspicious user agents:
- Bots, crawlers, spiders
- Automated tools (curl, wget)
- Exception: Health check endpoint remains accessible

## Request Validation

- Maximum request size: 1MB
- Suspicious URL pattern detection
- Path traversal protection
- Script injection detection

## Monitoring

All requests are logged in production with:
- IP address
- User agent
- Request method and URL
- Response status code
- Response time

## Cost Protection

1. **Rate Limiting**: Prevents API abuse
2. **IP Whitelisting**: Restricts access to known IPs
3. **Bot Blocking**: Reduces automated traffic
4. **Request Size Limits**: Prevents large payload attacks
5. **Authentication**: Ensures only authorized users

## Production Deployment Checklist

- [ ] Set strong `API_KEY`
- [ ] Enable `ENABLE_IP_WHITELIST=true`
- [ ] Configure `ALLOWED_IPS` with your IP addresses
- [ ] Set `RATE_LIMIT_MAX=50` or lower
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper logging
- [ ] Set up monitoring alerts
- [ ] Test all security measures

## Emergency Response

If you detect unauthorized access:

1. Immediately rotate the `API_KEY`
2. Review and update `ALLOWED_IPS`
3. Temporarily reduce `RATE_LIMIT_MAX`
4. Check application logs for suspicious activity
5. Consider temporarily disabling the service if needed
