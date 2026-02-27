const crypto = require('crypto');

// Read env vars as getters so they are resolved at request time, not module load time
const getConfig = () => ({
  BASE_URL:   process.env.PHONEPE_BASE_URL,
  MERCHANT_ID: process.env.PHONEPE_MERCHANT_ID,
  SALT_KEY:   process.env.PHONEPE_SALT_KEY,
  SALT_INDEX: process.env.PHONEPE_SALT_INDEX || '1',
});

// Build Base64 payload + X-VERIFY checksum for a given API endpoint path
function buildRequest(payload, endpoint) {
  const { SALT_KEY, SALT_INDEX } = getConfig();
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const hash = crypto
    .createHash('sha256')
    .update(base64Payload + endpoint + SALT_KEY)
    .digest('hex');
  const checksum = `${hash}###${SALT_INDEX}`;
  return { base64Payload, checksum };
}

// Verify X-VERIFY header from PhonePe Status API response
function verifyResponseChecksum(base64Response, xVerify) {
  const { SALT_KEY } = getConfig();
  const [receivedHash] = xVerify.split('###');
  const expectedHash = crypto
    .createHash('sha256')
    .update(base64Response + SALT_KEY)
    .digest('hex');
  return receivedHash === expectedHash;
}

module.exports = { getConfig, buildRequest, verifyResponseChecksum };
