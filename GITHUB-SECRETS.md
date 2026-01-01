# 🔐 GitHub Secrets Configuration

This document lists all the GitHub secrets that need to be configured for the CI/CD pipeline to work properly.

## 🚀 **Required Secrets for Production Deployment**

### **Database & Infrastructure**
```bash
HETZNER_HOST=5.78.147.82
HETZNER_USER=root
HETZNER_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
[Your private SSH key content]
-----END OPENSSH PRIVATE KEY-----

DB_ROOT_PASSWORD=your_secure_mysql_root_password
DB_PASSWORD=your_secure_mysql_password
```

### **Application Configuration**
```bash
JWT_SECRET=your_jwt_secret_minimum_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_minimum_32_characters
SETTINGS_ENCRYPTION_KEY=your_encryption_key_32_characters

REDIS_PASSWORD=your_redis_password
```

### **Payment & External Services**
```bash
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### **Email Service**
```bash
EMAIL_HOST=smtp.your-email-provider.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

### **Monitoring & Notifications**
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

## 🧪 **Required Secrets for Staging Deployment**

```bash
STAGING_HOST=your-staging-server.com
STAGING_USER=root
STAGING_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
[Your staging private SSH key content]
-----END OPENSSH PRIVATE KEY-----
```

## 📋 **Setup Instructions**

### **1. Navigate to GitHub Secrets**
1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### **2. Add Each Secret**
For each secret listed above:
1. Click **New repository secret**
2. Enter the **Name** (exactly as shown above)
3. Enter the **Value** (your actual secret)
4. Click **Add secret**

### **3. Environment-Specific Secrets**
Some secrets should be added to specific environments:
- **Production secrets** → Add to **Production** environment
- **Staging secrets** → Add to **Staging** environment
- **Development secrets** → Add to **Development** environment

## 🔧 **Testing the Setup**

After adding secrets:

1. **Test the workflow**:
   ```bash
   git push origin main  # Triggers production deployment
   git push origin develop  # Triggers staging deployment
   ```

2. **Check the Actions tab** in GitHub for any secret-related errors

3. **Verify deployment** on your servers

## ⚠️ **Security Notes**

- **Never commit secrets to your repository**
- **Use strong, unique passwords** for each secret
- **Rotate secrets regularly** (especially JWT secrets)
- **Limit access** to secrets to only necessary team members
- **Use different secrets** for production vs staging

## 🚨 **Common Issues**

### **Secret Not Found Error**
```
Error: Context access might be invalid: SECRET_NAME
```
**Solution**: Add the missing secret in GitHub repository settings

### **Invalid SSH Key Error**
```
Error: Unable to authenticate with provided SSH key
```
**Solution**: Ensure SSH key is properly formatted and has correct permissions

### **Database Connection Failed**
```
Error: Access denied for user 'root'@'localhost'
```
**Solution**: Verify DB_ROOT_PASSWORD and database user permissions

---

**📝 After configuring these secrets, the CI/CD pipeline should work correctly for both staging and production deployments.**
