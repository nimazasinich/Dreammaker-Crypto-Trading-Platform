#!/usr/bin/env tsx
/**
 * CI Configuration Validator
 * 
 * Validates the CI configuration files against the schema and checks for consistency.
 * Usage: tsx scripts/ci/validate-ci-config.ts
 */

import fs from 'fs';
import path from 'path';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

class CIConfigValidator {
  private configPath = '.github/ci-config.json';
  private schemaPath = '.github/ci-config-schema.json';
  private workflowPath = '.github/workflows/comprehensive-ci.yml';
  
  private result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    info: []
  };

  async validate(): Promise<ValidationResult> {
    console.log('🔍 Validating CI Configuration...\n');

    this.checkFilesExist();
    this.validateJSON();
    this.validateStructure();
    this.checkConsistency();
    
    return this.result;
  }

  private checkFilesExist(): void {
    console.log('📁 Checking required files...');
    
    const files = [
      { path: this.configPath, name: 'CI Config' },
      { path: this.schemaPath, name: 'JSON Schema' },
      { path: this.workflowPath, name: 'GitHub Workflow' }
    ];

    for (const file of files) {
      if (!fs.existsSync(file.path)) {
        this.result.errors.push(`Missing required file: ${file.path}`);
        this.result.valid = false;
      } else {
        this.result.info.push(`✓ Found ${file.name}: ${file.path}`);
      }
    }
    
    console.log('');
  }

  private validateJSON(): void {
    console.log('📄 Validating JSON syntax...');
    
    try {
      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      this.result.info.push('✓ ci-config.json has valid JSON syntax');
      
      // Check required fields
      const requiredFields = ['version', 'name', 'pipeline', 'jobs'];
      for (const field of requiredFields) {
        if (!config[field]) {
          this.result.errors.push(`Missing required field: ${field}`);
          this.result.valid = false;
        }
      }
      
      // Validate version format
      if (config.version && !/^\d+\.\d+\.\d+$/.test(config.version)) {
        this.result.warnings.push('Version should follow semver format (e.g., 1.0.0)');
      }
      
    } catch (error) {
      this.result.errors.push(`Invalid JSON in ${this.configPath}: ${error}`);
      this.result.valid = false;
    }
    
    try {
      JSON.parse(fs.readFileSync(this.schemaPath, 'utf8'));
      this.result.info.push('✓ ci-config-schema.json has valid JSON syntax');
    } catch (error) {
      this.result.errors.push(`Invalid JSON in ${this.schemaPath}: ${error}`);
      this.result.valid = false;
    }
    
    console.log('');
  }

  private validateStructure(): void {
    console.log('🏗️  Validating structure...');
    
    try {
      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      
      // Validate jobs
      if (config.jobs) {
        const jobCount = Object.keys(config.jobs).length;
        this.result.info.push(`✓ Found ${jobCount} jobs in configuration`);
        
        for (const [jobName, job] of Object.entries(config.jobs)) {
          const jobConfig = job as any;
          
          // Check required job fields
          if (!jobConfig.name) {
            this.result.warnings.push(`Job '${jobName}' missing 'name' field`);
          }
          
          if (!jobConfig.description) {
            this.result.warnings.push(`Job '${jobName}' missing 'description' field`);
          }
          
          if (!jobConfig.timeout_minutes) {
            this.result.warnings.push(`Job '${jobName}' missing 'timeout_minutes' field`);
          }
          
          // Validate dependencies
          if (jobConfig.depends_on) {
            for (const dep of jobConfig.depends_on) {
              if (!config.jobs[dep]) {
                this.result.errors.push(`Job '${jobName}' depends on non-existent job '${dep}'`);
                this.result.valid = false;
              }
            }
          }
          
          // Validate artifacts
          if (jobConfig.artifacts) {
            for (const [artifactName, artifact] of Object.entries(jobConfig.artifacts)) {
              const artifactConfig = artifact as any;
              
              if (!artifactConfig.path) {
                this.result.warnings.push(`Artifact '${artifactName}' in job '${jobName}' missing 'path' field`);
              }
              
              if (!artifactConfig.retention_days) {
                this.result.warnings.push(`Artifact '${artifactName}' in job '${jobName}' missing 'retention_days' field`);
              }
            }
          }
        }
      }
      
      // Validate reports structure
      if (config.reports) {
        if (!config.reports.directory) {
          this.result.warnings.push('Reports configuration missing directory field');
        }
        
        if (config.reports.structure) {
          const structureCount = Object.keys(config.reports.structure).length;
          this.result.info.push(`✓ Found ${structureCount} report directories defined`);
        }
      }
      
    } catch (error) {
      this.result.errors.push(`Error validating structure: ${error}`);
      this.result.valid = false;
    }
    
    console.log('');
  }

  private checkConsistency(): void {
    console.log('🔄 Checking consistency...');
    
    try {
      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      const workflowContent = fs.readFileSync(this.workflowPath, 'utf8');
      
      // Check if job names in config match workflow
      if (config.jobs) {
        for (const jobName of Object.keys(config.jobs)) {
          // Convert job name format (e.g., "setup-validation" to "setup_validation")
          const workflowJobName = jobName.replace(/-/g, '_');
          
          if (!workflowContent.includes(workflowJobName + ':')) {
            this.result.warnings.push(
              `Job '${jobName}' in config may not exist in workflow (expected: ${workflowJobName})`
            );
          }
        }
      }
      
      // Check reports directory
      if (config.reports?.directory) {
        const reportsDir = config.reports.directory;
        
        // Count references to reports directory in workflow
        const regex = new RegExp(reportsDir, 'g');
        const matches = workflowContent.match(regex);
        
        if (matches && matches.length > 0) {
          this.result.info.push(`✓ Reports directory '${reportsDir}' referenced ${matches.length} times in workflow`);
        } else {
          this.result.warnings.push(`Reports directory '${reportsDir}' not found in workflow`);
        }
      }
      
      // Check environment variables
      if (config.environment_variables) {
        for (const [varName, varConfig] of Object.entries(config.environment_variables)) {
          const varData = varConfig as any;
          
          if (!workflowContent.includes(varName)) {
            this.result.warnings.push(`Environment variable '${varName}' defined but not used in workflow`);
          }
        }
      }
      
    } catch (error) {
      this.result.errors.push(`Error checking consistency: ${error}`);
      this.result.valid = false;
    }
    
    console.log('');
  }

  printResults(): void {
    console.log('\n📊 Validation Results\n');
    console.log('='.repeat(60));
    
    if (this.result.errors.length > 0) {
      console.log('\n❌ ERRORS:\n');
      this.result.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }
    
    if (this.result.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:\n');
      this.result.warnings.forEach((warning, i) => {
        console.log(`  ${i + 1}. ${warning}`);
      });
    }
    
    if (this.result.info.length > 0) {
      console.log('\n✅ INFO:\n');
      this.result.info.forEach((info, i) => {
        console.log(`  ${i + 1}. ${info}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (this.result.valid) {
      console.log('\n✅ CI Configuration is VALID!\n');
    } else {
      console.log('\n❌ CI Configuration has ERRORS that must be fixed!\n');
    }
    
    // Generate JSON report
    this.saveReport();
  }

  private saveReport(): void {
    const reportDir = 'ci-reports/validation';
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      valid: this.result.valid,
      summary: {
        errors: this.result.errors.length,
        warnings: this.result.warnings.length,
        info: this.result.info.length
      },
      details: this.result
    };
    
    const reportPath = path.join(reportDir, 'validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 Validation report saved: ${reportPath}\n`);
  }
}

// Main execution
async function main() {
  const validator = new CIConfigValidator();
  const result = await validator.validate();
  validator.printResults();
  
  // Exit with error code if validation failed
  process.exit(result.valid ? 0 : 1);
}

main();
