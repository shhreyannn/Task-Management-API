import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // Ramp-up to 50 users
    { duration: '1m', target: 50 },  // Maintain 50 concurrent users
    { duration: '30s', target: 0 },  // Scale down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be under 1%
  },
};

export default function () {
  const res = http.get('http://localhost:5000/api-docs/');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1); // Simulate real-user interaction pace
}
