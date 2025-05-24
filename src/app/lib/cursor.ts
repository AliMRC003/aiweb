import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface CursorCommandResult {
  success: boolean;
  output?: string;
  error?: string;
  diff?: string;
}

export class CursorAI {
  private static instance: CursorAI;
  private vmEndpoint: string;
  private vmScriptPath: string;

  private constructor() {
    this.vmEndpoint = process.env.VM_ENDPOINT || 'http://localhost:3001';
    this.vmScriptPath = process.env.VM_SCRIPT_PATH || path.join(process.cwd(), 'vm_scripts', 'run_cursor_command.py');
  }

  public static getInstance(): CursorAI {
    if (!CursorAI.instance) {
      CursorAI.instance = new CursorAI();
    }
    return CursorAI.instance;
  }

  public async initialize(): Promise<void> {
    try {
      // Check if VM is accessible
      const response = await fetch(`${this.vmEndpoint}/health`);
      if (!response.ok) {
        throw new Error('VM is not accessible');
      }

      // Check if VM script exists
      try {
        await fs.access(this.vmScriptPath);
      } catch {
        throw new Error('VM script not found');
      }
    } catch (error) {
      throw new Error(`Failed to initialize CursorAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async validateCommand(command: string): Promise<boolean> {
    // Basic command validation
    if (!command || command.length === 0 || command.length > 1000) {
      return false;
    }

    // Add more validation rules as needed
    const forbiddenCommands = ['rm', 'sudo', 'chmod', 'chown', 'dd', 'mkfs'];
    const lowerCommand = command.toLowerCase();
    return !forbiddenCommands.some(cmd => lowerCommand.includes(cmd));
  }

  public async executeCommand(command: string, filePath: string, userId: string, projectId: string): Promise<CursorCommandResult> {
    try {
      // Validate inputs
      if (!command || !filePath || !userId || !projectId) {
        throw new Error('Missing required parameters');
      }

      // Create backup of the file
      const backupPath = `${filePath}.backup`;
      await fs.copyFile(filePath, backupPath);

      try {
        // Execute command on VM
        const response = await fetch(`${this.vmEndpoint}/execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            command,
            filePath,
            userId,
            projectId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to execute command on VM');
        }

        const result = await response.json();

        // If command was successful, read the modified file
        const modifiedContent = await fs.readFile(filePath, 'utf-8');
        const originalContent = await fs.readFile(backupPath, 'utf-8');

        // Generate diff
        const diff = this.generateDiff(originalContent, modifiedContent);

        return {
          success: true,
          output: result.output,
          diff,
        };
      } catch (error) {
        // Restore from backup if there's an error
        await fs.copyFile(backupPath, filePath);
        throw error;
      } finally {
        // Clean up backup
        try {
          await fs.unlink(backupPath);
        } catch (error) {
          console.error('Failed to clean up backup file:', error);
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private generateDiff(oldContent: string, newContent: string): string {
    // Simple line-by-line diff implementation
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    const diff: string[] = [];

    let i = 0;
    let j = 0;

    while (i < oldLines.length || j < newLines.length) {
      if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
        diff.push(`  ${oldLines[i]}`);
        i++;
        j++;
      } else if (j < newLines.length && (i >= oldLines.length || oldLines[i] !== newLines[j])) {
        diff.push(`+ ${newLines[j]}`);
        j++;
      } else {
        diff.push(`- ${oldLines[i]}`);
        i++;
      }
    }

    return diff.join('\n');
  }
} 