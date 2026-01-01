/**
 * Backup Service
 * Database backup and recovery for Haven Institute
 */

import { sequelize } from '../config/database';
import { logger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

interface BackupConfig {
  enabled: boolean;
  schedule: string; // cron format
  retentionDays: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  backupPath: string;
}

interface BackupResult {
  success: boolean;
  backupId: string;
  filename: string;
  size: number;
  timestamp: Date;
  duration: number;
  error?: string;
}

interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  createdAt: Date;
  compressed: boolean;
  encrypted: boolean;
  checksum: string;
}

export class BackupService {
  private static config: BackupConfig = {
    enabled: process.env.BACKUP_ENABLED === 'true',
    schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
    retentionDays: Number(process.env.BACKUP_RETENTION_DAYS) || 30,
    compressionEnabled: true,
    encryptionEnabled: true,
    backupPath: process.env.BACKUP_PATH || './backups'
  };

  private static encryptionKey = process.env.SETTINGS_ENCRYPTION_KEY || '';

  /**
   * Perform database backup
   */
  static async performBackup(): Promise<BackupResult> {
    const startTime = Date.now();
    const backupId = crypto.randomUUID();
    const timestamp = new Date();
    
    try {
      logger.info(`Starting backup ${backupId}`);
      
      // Ensure backup directory exists
      await this.ensureBackupDirectory();
      
      // Create backup filename
      const filename = `haven_backup_${timestamp.toISOString().replace(/[:.]/g, '-')}.sql`;
      
      // Generate SQL dump
      const sqlDump = await this.generateSQLDump();
      
      // Compress if enabled
      let finalData: Buffer | string = sqlDump;
      let finalFilename = filename;
      
      if (this.config.compressionEnabled) {
        const compressed = await this.compressData(sqlDump);
        finalData = compressed;
        finalFilename = filename + '.gz';
      }
      
      // Encrypt if enabled
      if (this.config.encryptionEnabled) {
        finalData = await this.encryptData(finalData as Buffer);
        finalFilename += '.enc';
      }
      
      // Write backup file
      const finalFilepath = path.join(this.config.backupPath, finalFilename);
      await fs.writeFile(finalFilepath, finalData);
      
      // Calculate checksum
      const checksum = crypto.createHash('sha256').update(finalData).digest('hex');
      
      // Get file size
      const stats = await fs.stat(finalFilepath);
      
      // Save backup metadata
      await this.saveBackupMetadata({
        id: backupId,
        filename: finalFilename,
        size: stats.size,
        createdAt: timestamp,
        compressed: this.config.compressionEnabled,
        encrypted: this.config.encryptionEnabled,
        checksum
      });
      
      const duration = Date.now() - startTime;
      
      logger.info(`Backup ${backupId} completed successfully`, {
        filename: finalFilename,
        size: stats.size,
        duration
      });
      
      return {
        success: true,
        backupId,
        filename: finalFilename,
        size: stats.size,
        timestamp,
        duration
      };
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error(`Backup ${backupId} failed:`, error);
      
      return {
        success: false,
        backupId,
        filename: '',
        size: 0,
        timestamp,
        duration,
        error: error.message
      };
    }
  }

  /**
   * Generate SQL dump from database
   */
  private static async generateSQLDump(): Promise<string> {
    try {
      // Get all table names
      const [tables] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
      `);
      
      let sqlDump = '-- Haven Institute Database Backup\n';
      sqlDump += `-- Generated: ${new Date().toISOString()}\n\n`;
      
      // For each table, get structure and data
      for (const tableObj of tables as any[]) {
        const tableName = tableObj.table_name;
        
        // Skip system tables
        if (tableName.startsWith('information_schema') || 
            tableName.startsWith('mysql') || 
            tableName.startsWith('performance_schema')) {
          continue;
        }
        
        sqlDump += `-- Table: ${tableName}\n`;
        sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n\n`;
        
        // Get table structure
        const [createTable] = await sequelize.query(`SHOW CREATE TABLE \`${tableName}\``);
        sqlDump += (createTable as any[])[0]['Create Table'] + ';\n\n';
        
        // Get table data
        const [rows] = await sequelize.query(`SELECT * FROM \`${tableName}\``);
        
        if (Array.isArray(rows) && rows.length > 0) {
          sqlDump += `-- Data for table ${tableName}\n`;
          
          for (const row of rows as any[]) {
            const columns = Object.keys(row);
            const values = columns.map(col => {
              const value = row[col];
              if (value === null) return 'NULL';
              if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
              if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
              return String(value);
            });
            
            sqlDump += `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${values.join(', ')});\n`;
          }
          
          sqlDump += '\n';
        }
      }
      
      return sqlDump;
    } catch (error) {
      logger.error('Error generating SQL dump:', error);
      throw error;
    }
  }

  /**
   * Compress data using gzip
   */
  private static async compressData(data: string): Promise<Buffer> {
    const zlib = require('zlib');
    return new Promise((resolve, reject) => {
      zlib.gzip(data, (error: any, result: Buffer) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  private static async encryptData(data: Buffer): Promise<Buffer> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not configured');
    }
    
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('haven-backup', 'utf8'));
    
    const encrypted = Buffer.concat([
      cipher.update(data),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    // Combine IV + authTag + encrypted data
    return Buffer.concat([iv, authTag, encrypted]);
  }

  /**
   * Ensure backup directory exists
   */
  private static async ensureBackupDirectory(): Promise<void> {
    try {
      await fs.access(this.config.backupPath);
    } catch {
      await fs.mkdir(this.config.backupPath, { recursive: true });
    }
  }

  /**
   * Save backup metadata
   */
  private static async saveBackupMetadata(metadata: BackupInfo): Promise<void> {
    const metadataFile = path.join(this.config.backupPath, 'metadata.json');
    
    let metadataList: BackupInfo[] = [];
    
    try {
      const existing = await fs.readFile(metadataFile, 'utf8');
      metadataList = JSON.parse(existing);
    } catch {
      // File doesn't exist, start with empty array
    }
    
    metadataList.push(metadata);
    
    // Save updated metadata
    await fs.writeFile(metadataFile, JSON.stringify(metadataList, null, 2));
  }

  /**
   * Clean up old backups based on retention policy
   */
  static async cleanupOldBackups(): Promise<number> {
    if (!this.config.enabled) return 0;
    
    try {
      const metadataFile = path.join(this.config.backupPath, 'metadata.json');
      const cutoffDate = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
      
      let metadataList: BackupInfo[] = [];
      
      try {
        const existing = await fs.readFile(metadataFile, 'utf8');
        metadataList = JSON.parse(existing);
      } catch {
        return 0;
      }
      
      const toDelete = metadataList.filter(backup => 
        new Date(backup.createdAt) < cutoffDate
      );
      
      let deletedCount = 0;
      
      for (const backup of toDelete) {
        try {
          const filepath = path.join(this.config.backupPath, backup.filename);
          await fs.unlink(filepath);
          deletedCount++;
        } catch (error) {
          logger.error(`Failed to delete backup file ${backup.filename}:`, error);
        }
      }
      
      // Update metadata file
      const remainingBackups = metadataList.filter(backup => 
        new Date(backup.createdAt) >= cutoffDate
      );
      
      await fs.writeFile(metadataFile, JSON.stringify(remainingBackups, null, 2));
      
      logger.info(`Cleaned up ${deletedCount} old backup files`);
      return deletedCount;
      
    } catch (error) {
      logger.error('Error cleaning up old backups:', error);
      return 0;
    }
  }

  /**
   * List available backups
   */
  static async listBackups(): Promise<BackupInfo[]> {
    try {
      const metadataFile = path.join(this.config.backupPath, 'metadata.json');
      const existing = await fs.readFile(metadataFile, 'utf8');
      return JSON.parse(existing);
    } catch {
      return [];
    }
  }

  /**
   * Get backup configuration
   */
  static getConfig(): BackupConfig {
    return { ...this.config };
  }

  /**
   * Update backup configuration
   */
  static updateConfig(newConfig: Partial<BackupConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Backup configuration updated:', this.config);
  }

  /**
   * Test backup functionality
   */
  static async testBackup(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.performBackup();
      
      if (result.success) {
        // Clean up test backup
        const filepath = path.join(this.config.backupPath, result.filename);
        await fs.unlink(filepath);
        
        return {
          success: true,
          message: `Test backup successful. Generated ${result.filename} (${result.size} bytes) in ${result.duration}ms`
        };
      } else {
        return {
          success: false,
          message: `Test backup failed: ${result.error}`
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Test backup error: ${error.message}`
      };
    }
  }
}

export default BackupService;
