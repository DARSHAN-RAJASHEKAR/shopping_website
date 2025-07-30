const axios = require('axios');

async function testAuth() {
  try {
    console.log('Testing login endpoint...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@test.com',
      password: 'test123'
    });
    console.log('Login response:', loginResponse.data);
  } catch (error) {
    console.log('Login error:', error.response?.data || error.message);
  }

  try {
    console.log('\nTesting signup endpoint...');
    const signupResponse = await axios.post('http://localhost:5000/api/auth/signup', {
      name: 'Test User',
      email: 'newuser@test.com',
      password: 'test123'
    });
    console.log('Signup response:', signupResponse.data);
  } catch (error) {
    console.log('Signup error:', error.response?.data || error.message);
  }
}

testAuth();