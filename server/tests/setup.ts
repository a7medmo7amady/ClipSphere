import dotenv from 'dotenv';
import path from 'path';

// Silence console during tests to keep output clean
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'debug').mockImplementation(() => {});
jest.spyOn(console, 'info').mockImplementation(() => {});

// Load environment variables for testing
dotenv.config({ 
  path: path.join(__dirname, '..', '.env'),
  // @ts-ignore - some versions of dotenv support quiet, but we also silenced console above
  quiet: true 
});

// Overwrite sensitive variables for testing to prevent accidental production impact
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.MONGODB_URI = 'mongodb://localhost:27017/clipsphere_test';
process.env.JWT_SECRET = 'test-secret-key-12345';
process.env.CLIENT_URL = 'http://localhost:3000';
