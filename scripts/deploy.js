const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const ENV_FILE = '.env';
const BACKUP_DIR = 'backups';

function createBackup() {
  console.log('Creating backup...');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(BACKUP_DIR, timestamp);
  
  // Create backup directory
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
  }
  fs.mkdirSync(backupDir);

  // Backup environment variables
  if (fs.existsSync(ENV_FILE)) {
    fs.copyFileSync(ENV_FILE, path.join(backupDir, ENV_FILE));
  }

  // Backup package files
  fs.copyFileSync('package.json', path.join(backupDir, 'package.json'));
  fs.copyFileSync('package-lock.json', path.join(backupDir, 'package-lock.json'));

  console.log(`Backup created in ${backupDir}`);
  return backupDir;
}

function restoreBackup(backupDir) {
  console.log('Restoring backup...');
  
  // Restore environment variables
  if (fs.existsSync(path.join(backupDir, ENV_FILE))) {
    fs.copyFileSync(path.join(backupDir, ENV_FILE), ENV_FILE);
  }

  // Restore package files
  fs.copyFileSync(path.join(backupDir, 'package.json'), 'package.json');
  fs.copyFileSync(path.join(backupDir, 'package-lock.json'), 'package-lock.json');

  console.log('Backup restored successfully');
}

function deploy() {
  const backupDir = createBackup();
  
  try {
    // Install dependencies
    console.log('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // Build the application
    console.log('Building application...');
    execSync('npm run build', { stdio: 'inherit' });

    console.log('Deployment completed successfully');
  } catch (error) {
    console.error('Deployment failed:', error);
    console.log('Rolling back changes...');
    
    try {
      restoreBackup(backupDir);
      console.log('Rollback completed successfully');
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
      console.log('Manual intervention required');
    }
    
    process.exit(1);
  }
}

// Check if this script is being run directly
if (require.main === module) {
  deploy();
}

module.exports = { deploy, createBackup, restoreBackup }; 