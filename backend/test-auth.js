const axios = require('axios');

async function testAuth() {
  try {
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@test.com',
      password: 'test123'
    });
  } catch (error) {
    // Ignore login test errors
  }

  try {
    const signupResponse = await axios.post('http://localhost:5000/api/auth/signup', {
      name: 'Test User',
      email: 'newuser@test.com',
      password: 'test123'
    });
  } catch (error) {
    // Ignore signup test errors
  }
}

testAuth();