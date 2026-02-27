const crypto = require('crypto');

const BASE_URL   = process.env.PHONEPE_BASE_URL;
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY   = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';

// Build Base64 payload + X-VERIFY checksum for a given API endpoint path
function buildRequest(payload, endpoint) {
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
  const [receivedHash] = xVerify.split('###');
  const expectedHash = crypto
    .createHash('sha256')
    .update(base64Response + SALT_KEY)
    .digest('hex');
  return receivedHash === expectedHash;
}

module.exports = { BASE_URL, MERCHANT_ID, SALT_INDEX, buildRequest, verifyResponseChecksum };
