// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Export environment variables
export const IUH_BASE_URL = process.env.IUH_BASE_URL;

// Example of how to use it in other files:
// import { IUH_BASE_URL } from './config.js';
// console.log(IUH_BASE_URL);
