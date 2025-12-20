# Session Persistence Strategy

## Executive Summary

This document outlines the authentication session persistence strategy for The MentalPitch application. The strategy balances security, user experience, and operational complexity to provide seamless authentication while maintaining robust security posture.

## Current Implementation

### Supabase Auth Configuration

The application uses Supabase Auth with the following configuration:

```typescript
{
  auth: {
    persistSession: true,
    storage: AsyncStorage, // React Native persistent storage
    autoRefreshToken: true, // Default Supabase behavior
  }
}
```

**Key Characteristics**:
- Sessions are persisted to AsyncStorage (device-local storage)
- Automatic token refresh enabled
- Session state managed via React Context
- Auth state changes trigger UI updates automatically

## Session Duration Strategy

### Recommended Approach: Adaptive Session Duration with Refresh Tokens

**Primary Strategy**: Long-lived refresh tokens (30 days) with short-lived access tokens (1 hour)

### Token Lifecycle

1. **Access Token**: 1 hour expiration
   - Used for API requests
   - Automatically refreshed by Supabase SDK
   - Stored in memory (not persisted)

2. **Refresh Token**: 30 days expiration
   - Used to obtain new access tokens
   - Persisted in AsyncStorage (encrypted)
   - Rotated on each refresh (security best practice)

3. **Session Persistence**: Indefinite (until explicit logout or token expiration)
   - User remains logged in across app restarts
   - Session survives device reboots
   - Requires re-authentication after 30 days of inactivity

### Implementation Details

**Supabase Default Behavior**:
- Access tokens expire after 1 hour (JWT expiration)
- Refresh tokens expire after 30 days (configurable in Supabase dashboard)
- Auto-refresh occurs 5 minutes before access token expiration
- Failed refresh attempts trigger logout

**User Experience Flow**:

1. **Initial Login**: User signs in → tokens stored → session active
2. **App Restart**: Session restored from AsyncStorage → user remains logged in
3. **Active Use**: Access token refreshed automatically in background
4. **Inactivity**: After 30 days, refresh token expires → user must sign in again
5. **Explicit Logout**: Tokens cleared → user must sign in again

## Architecture Analysis

### Why This Strategy?

**Security Considerations**:

1. **Short Access Token Lifetime (1 hour)**:
   - Limits exposure window if token is compromised
   - Reduces risk of token theft via XSS or man-in-the-middle attacks
   - Aligns with OAuth 2.0 best practices

2. **Refresh Token Rotation**:
   - Each refresh generates new refresh token
   - Old refresh token invalidated immediately
   - Prevents token replay attacks

3. **Secure Storage**:
   - AsyncStorage provides device-level encryption (iOS Keychain, Android Keystore)
   - Tokens never exposed in application code
   - Protected by device security (biometrics, passcode)

**User Experience Considerations**:

1. **Seamless Persistence**:
   - Users don't need to sign in frequently
   - Session survives app updates and restarts
   - Reduces friction in daily usage

2. **Automatic Refresh**:
   - No user intervention required
   - Background token refresh invisible to user
   - Maintains session continuity

3. **Graceful Expiration**:
   - 30-day window accommodates occasional users
   - Clear re-authentication prompt after expiration
   - No unexpected logouts during active use

**Operational Considerations**:

1. **Reduced Support Burden**:
   - Fewer "I got logged out" support tickets
   - Predictable session behavior
   - Clear expiration messaging

2. **Scalability**:
   - Stateless access tokens reduce server load
   - Refresh token validation minimal overhead
   - No session storage required on backend

## Alternative Strategies

### Strategy 1: Short Session Duration (24 hours)

**Configuration**: Refresh token expires after 24 hours

**Pros**:
- Enhanced security (shorter exposure window)
- Forces regular re-authentication
- Reduces risk of unauthorized access on lost devices

**Cons**:
- Poor UX (frequent re-authentication)
- Higher support burden
- Reduced user engagement
- May violate user expectations for mobile apps

**Use Case**: High-security applications (banking, healthcare)

**Verdict**: Not recommended for consumer fitness/wellness app

### Strategy 2: Very Long Session Duration (90 days)

**Configuration**: Refresh token expires after 90 days

**Pros**:
- Excellent UX (rare re-authentication)
- High user retention
- Minimal friction

**Cons**:
- Increased security risk (longer exposure window)
- Lost device remains accessible longer
- May violate security compliance requirements
- Reduced ability to enforce password updates

**Use Case**: Low-security consumer apps

**Verdict**: Acceptable but not optimal for mental performance tracking app

### Strategy 3: Remember Me Toggle

**Configuration**: User chooses session duration (7 days vs 30 days)

**Pros**:
- User control over security vs convenience
- Accommodates different use cases
- Transparent security trade-offs

**Cons**:
- Added UI complexity
- Users may not understand implications
- Requires additional state management
- May confuse users

**Use Case**: Applications with diverse user security needs

**Verdict**: Consider for future enhancement, not initial implementation

### Strategy 4: Device-Based Session Limits

**Configuration**: Limit concurrent sessions per user

**Pros**:
- Prevents account sharing
- Enhanced security monitoring
- Reduces unauthorized access risk

**Cons**:
- Complex implementation
- User confusion (why logged out?)
- Support burden
- May frustrate legitimate multi-device users

**Use Case**: Enterprise applications with strict access controls

**Verdict**: Not recommended for consumer app

## Recommended Implementation: 30-Day Refresh Token

### Rationale

**Balanced Approach**: 30 days provides optimal balance between security and UX for a mental performance tracking application.

**Security Posture**:
- Access tokens expire hourly (short exposure window)
- Refresh tokens rotate on each use (prevents replay)
- Device-level encryption protects stored tokens
- Automatic logout after 30 days of inactivity

**User Experience**:
- Seamless daily usage (no frequent re-authentication)
- Session persists across app restarts
- Clear expiration messaging after 30 days
- Predictable behavior builds trust

**Industry Alignment**:
- Matches common mobile app patterns (Instagram, Twitter, etc.)
- Aligns with OAuth 2.0 best practices
- Meets consumer app security expectations

### Configuration

**Supabase Dashboard Settings**:
```
Refresh Token Expiration: 30 days
Access Token Expiration: 1 hour (JWT expiration)
Auto-refresh: Enabled (5 minutes before expiration)
```

**Application Code**:
- No additional configuration required
- Supabase SDK handles token refresh automatically
- AuthContext manages session state
- LoadingScreen shown during auth checks

### Security Enhancements

**Additional Security Measures** (Future Considerations):

1. **Biometric Re-authentication**:
   - Require biometric verification for sensitive operations
   - Optional: Require biometric after 7 days of inactivity
   - Enhances security without impacting daily UX

2. **Device Fingerprinting**:
   - Track device characteristics
   - Alert on suspicious device changes
   - Optional: Require re-authentication on new device

3. **Activity-Based Expiration**:
   - Extend session on active use
   - Reset expiration timer on user actions
   - Reduces friction for active users

4. **Remote Session Revocation**:
   - Allow users to revoke sessions from other devices
   - Security feature for account management
   - Reduces impact of lost/stolen devices

## Implementation Details

### Current Flow

1. **Initial Authentication**:
   ```
   User enters credentials → Supabase validates → 
   Access token (1h) + Refresh token (30d) issued → 
   Tokens stored in AsyncStorage → Session active
   ```

2. **Token Refresh** (Automatic):
   ```
   Access token expires in 5 minutes → 
   Supabase SDK calls refresh endpoint → 
   New access token (1h) + New refresh token (30d) issued → 
   Old refresh token invalidated → Session continues
   ```

3. **Session Restoration**:
   ```
   App restarts → AuthContext checks AsyncStorage → 
   Refresh token found → Validate with Supabase → 
   New access token issued → Session restored
   ```

4. **Session Expiration**:
   ```
   30 days of inactivity → Refresh token expires → 
   Refresh attempt fails → Supabase SDK clears session → 
   User redirected to AuthScreen
   ```

### Error Handling

**Network Errors During Refresh**:
- Retry with exponential backoff
- Show loading state during retry
- If all retries fail, prompt for re-authentication

**Invalid Refresh Token**:
- Clear stored tokens
- Redirect to AuthScreen
- Show clear error message

**Concurrent Refresh Attempts**:
- Supabase SDK handles deduplication
- No additional application logic required

## Monitoring and Analytics

### Key Metrics to Track

1. **Session Duration Distribution**:
   - Average session length
   - Percentage of users with 30-day sessions
   - Early logout patterns

2. **Refresh Token Success Rate**:
   - Percentage of successful auto-refreshes
   - Refresh failure reasons
   - Network-related failures

3. **Re-authentication Frequency**:
   - Users requiring re-auth after expiration
   - Users logging out explicitly
   - Session abandonment patterns

4. **Security Events**:
   - Failed refresh attempts
   - Suspicious token usage
   - Multiple device logins

### Alerting Thresholds

- Refresh failure rate > 5%: Investigate network/backend issues
- Unusual logout patterns: Potential security incident
- High re-authentication rate: Consider UX improvements

## Pros and Cons Analysis

### Pros of 30-Day Refresh Token Strategy

**Security**:
- Short access token lifetime limits exposure
- Refresh token rotation prevents replay attacks
- Device-level encryption protects stored tokens
- Automatic logout after inactivity reduces risk

**User Experience**:
- Seamless daily usage (no frequent re-authentication)
- Session persists across app restarts
- Predictable behavior builds user trust
- Reduces friction in daily journaling workflow

**Operational**:
- Low support burden (fewer logout complaints)
- Stateless design scales efficiently
- Standard implementation (Supabase handles complexity)
- Easy to monitor and debug

**Business**:
- Higher user retention (reduced friction)
- Better engagement metrics
- Lower churn from authentication frustration
- Aligns with industry standards

### Cons of 30-Day Refresh Token Strategy

**Security**:
- Longer exposure window if device is compromised
- Lost device remains accessible for up to 30 days
- May not meet strict compliance requirements
- Requires additional security measures for sensitive data

**User Experience**:
- Users may forget credentials after 30 days
- No explicit "remember me" choice (assumed behavior)
- May surprise users expecting shorter sessions

**Operational**:
- Requires monitoring for security events
- Need clear expiration messaging
- Potential support questions about session duration

**Technical**:
- Refresh token storage requires secure implementation
- Token rotation adds complexity to error handling
- Network failures during refresh need graceful handling

## Mitigation Strategies

### Security Mitigations

1. **Device Encryption**: Leverage iOS Keychain and Android Keystore
2. **Token Rotation**: Supabase handles automatically
3. **Activity Monitoring**: Track suspicious patterns
4. **Remote Revocation**: Allow users to revoke sessions

### UX Mitigations

1. **Clear Messaging**: Inform users about 30-day sessions
2. **Graceful Expiration**: Show friendly re-authentication prompt
3. **Biometric Option**: Add optional biometric verification
4. **Session Management**: Allow users to view active sessions

### Operational Mitigations

1. **Monitoring**: Track key metrics and alert on anomalies
2. **Documentation**: Clear docs for support team
3. **User Education**: In-app messaging about session behavior
4. **Feedback Loop**: Collect user feedback on session duration

## Recommendations

### Immediate Implementation

1. **Use 30-day refresh token expiration** (default Supabase behavior)
2. **Enable automatic token refresh** (default Supabase behavior)
3. **Implement graceful error handling** for refresh failures
4. **Add clear loading states** during auth checks

### Short-Term Enhancements (1-3 months)

1. **Biometric re-authentication** for sensitive operations
2. **Session management UI** (view active sessions, revoke devices)
3. **Activity-based expiration** (extend on active use)
4. **Enhanced error messaging** for expired sessions

### Long-Term Considerations (3-6 months)

1. **Remember Me toggle** (user choice of session duration)
2. **Device fingerprinting** for security monitoring
3. **Advanced session analytics** and reporting
4. **Compliance features** (GDPR, HIPAA if needed)

## Conclusion

The recommended 30-day refresh token strategy provides optimal balance between security and user experience for The MentalPitch application. This approach:

- Maintains strong security posture with short access tokens and token rotation
- Delivers seamless user experience with persistent sessions
- Aligns with industry best practices and user expectations
- Scales efficiently with stateless token design
- Provides foundation for future security enhancements

The implementation leverages Supabase's built-in token management, requiring minimal custom code while providing robust authentication functionality. Regular monitoring and user feedback will inform future refinements to the session persistence strategy.
