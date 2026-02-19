/**
 * Template Engine for STM32N6 Development Server
 */

import Handlebars from 'handlebars';
import { glob } from 'glob';
import { readFile } from 'fs/promises';

/**
 * Template metadata
 */
export interface TemplateInfo {
  name: string;
  category: string;
  description: string;
  variables: string[];
}

/**
 * Template Engine
 * Manages template loading and rendering
 */
export class TemplateEngine {
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();
  private templateInfo: Map<string, TemplateInfo> = new Map();
  private templatesDir: string;

  constructor(templatesDir: string = './templates') {
    this.templatesDir = templatesDir;
    this.registerHelpers();
  }

  /**
   * Register Handlebars helpers
   */
  private registerHelpers(): void {
    // Convert to uppercase
    Handlebars.registerHelper('upper', (str: string) => str.toUpperCase());

    // Convert to lowercase
    Handlebars.registerHelper('lower', (str: string) => str.toLowerCase());

    // Convert to camelCase
    Handlebars.registerHelper('camel', (str: string) => {
      return str
        .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
        .replace(/^(.)/, (c) => c.toLowerCase());
    });

    // Convert to PascalCase
    Handlebars.registerHelper('pascal', (str: string) => {
      return str
        .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
        .replace(/^(.)/, (c) => c.toUpperCase());
    });

    // Convert to snake_case
    Handlebars.registerHelper('snake', (str: string) => {
      return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[-\s]/g, '_')
        .toLowerCase();
    });

    // Conditional equality
    Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);

    // Conditional inequality
    Handlebars.registerHelper('ne', (a: unknown, b: unknown) => a !== b);

    // JSON stringify
    Handlebars.registerHelper('json', (obj: unknown) => JSON.stringify(obj, null, 2));

    // Hex format
    Handlebars.registerHelper('hex', (num: number) => `0x${num.toString(16).toUpperCase()}`);

    // Bit shift
    Handlebars.registerHelper('shift', (num: number, bits: number) => num << bits);

    // Comment block
    Handlebars.registerHelper('comment', (text: string) => {
      return `/**\n * ${text.split('\n').join('\n * ')}\n */`;
    });
  }

  /**
   * Load all templates from directory
   */
  async loadTemplates(): Promise<void> {
    try {
      const files = await glob(`${this.templatesDir}/**/*.hbs`);

      for (const file of files) {
        await this.loadTemplate(file);
      }
    } catch {
      // Templates directory may not exist during initial setup
    }
  }

  /**
   * Load a single template
   */
  async loadTemplate(filePath: string): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const name = this.getTemplateName(filePath);

      this.templates.set(name, Handlebars.compile(content));

      // Extract template info
      this.templateInfo.set(name, {
        name,
        category: this.getTemplateCategory(filePath),
        description: this.extractDescription(content),
        variables: this.extractVariables(content),
      });
    } catch {
      // Ignore errors for individual templates
    }
  }

  /**
   * Register a template from string
   */
  registerTemplate(name: string, content: string): void {
    this.templates.set(name, Handlebars.compile(content));
  }

  /**
   * Render a template
   */
  render(name: string, context: Record<string, unknown>): string {
    const template = this.templates.get(name);

    if (!template) {
      throw new Error(`Template not found: ${name}`);
    }

    return template(context);
  }

  /**
   * Check if template exists
   */
  has(name: string): boolean {
    return this.templates.has(name);
  }

  /**
   * List all templates
   */
  listAll(): TemplateInfo[] {
    return Array.from(this.templateInfo.values());
  }

  /**
   * Get template info
   */
  getInfo(name: string): TemplateInfo | undefined {
    return this.templateInfo.get(name);
  }

  /**
   * Get template name from file path
   */
  private getTemplateName(filePath: string): string {
    const relative = filePath.replace(this.templatesDir, '').replace(/^\//, '');
    return relative.replace('.hbs', '');
  }

  /**
   * Get template category from file path
   */
  private getTemplateCategory(filePath: string): string {
    const parts = filePath.replace(this.templatesDir, '').split('/');
    return parts[1] ?? 'general';
  }

  /**
   * Extract description from template comments
   */
  private extractDescription(content: string): string {
    const match = content.match(/{{!\s*(.+?)\s*}}/);
    return match?.[1] ?? 'No description';
  }

  /**
   * Extract variable names from template
   */
  private extractVariables(content: string): string[] {
    const regex = /\{\{([^#/][^}\s]*)\}\}/g;
    const variables = new Set<string>();
    let match;

    while ((match = regex.exec(content)) !== null) {
      const name = match[1];
      if (name && !name.startsWith('.')) {
        variables.add(name);
      }
    }

    return Array.from(variables);
  }
}
