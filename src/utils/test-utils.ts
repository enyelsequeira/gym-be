// src/utils/test-utils/db-check.ts

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Utility to check and initialize the test database
 * @returns Object with information about database state and initialization
 */
export async function initializeTestDb() {
  const result = {
    dbExists: false,
    dbInitialized: false,
    actions: [] as string[],
    errors: [] as string[],
  };

  try {
    // Check if test.db file exists
    const dbPath = path.resolve(process.cwd(), 'test.db');
    result.dbExists = fs.existsSync(dbPath);

    if (!result.dbExists) {
      result.actions.push('Creating new test.db file');
      try {
        // Create an empty database file
        fs.writeFileSync(dbPath, '');
        result.dbExists = true;
      } catch (err) {
        // @ts-ignore
        result.errors.push(`Failed to create database file: ${err.message}`);
      }
    }

    // Initialize database schema
    if (result.dbExists) {
      result.actions.push('Running database migrations');
      try {
        execSync('yarn drizzle-kit push', { stdio: 'pipe' });
        result.actions.push('Database migrations completed successfully');
        result.dbInitialized = true;
      } catch (err) {
        // @ts-ignore
        result.errors.push(`Failed to run migrations: ${err.message}`);
      }
    }
  } catch (err) {
    // @ts-ignore
    result.errors.push(`Unexpected error: ${err.message}`);
  }

  return result;
}

/**
 * Log database initialization results in a formatted way
 */
export function logDbInitResults(result: Awaited<ReturnType<typeof initializeTestDb>>) {
  console.log('\n----- Test Database Initialization -----');
  console.log(`Database file exists: ${result.dbExists ? 'Yes' : 'No'}`);
  console.log(`Database initialized: ${result.dbInitialized ? 'Yes' : 'No'}`);

  if (result.actions.length > 0) {
    console.log('\nActions taken:');
    result.actions.forEach((action) => console.log(`- ${action}`));
  }

  if (result.errors.length > 0) {
    console.log('\nErrors encountered:');
    result.errors.forEach((error) => console.log(`- ${error}`));
  }

  console.log('---------------------------------------\n');
}
