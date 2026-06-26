const http = require('http');
const payload = JSON.stringify({
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'password123',
  organization: 'Acme',
  role: 'Student',
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  },
};

const req = http.request(options, (res) => {
  console.log('STATUS', res.statusCode);
  res.setEncoding('utf8');
  res.on('data', (chunk) => process.stdout.write(chunk));
  res.on('end', () => process.stdout.write('\n'));
});

req.on('error', (err) => {
  console.error('REQUEST ERROR', err.message);
});
req.write(payload);
req.end();
