/**
 * HTML Sanitizer Utility
 * Removes potentially dangerous HTML/script tags from user input
 */

export class HtmlSanitizer {
  /**
   * Strips HTML tags and script content from input
   * Use this for fields that should never contain HTML
   */
  static stripHtml(input: string): string {
    if (!input) return input;

    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]+>/g, '') // Remove all HTML tags
      .trim();
  }

  /**
   * Escapes HTML special characters
   * Use this when you need to display user input as text
   */
  static escapeHtml(input: string): string {
    if (!input) return input;

    const htmlEscapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };

    return input.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char]);
  }

  /**
   * Sanitizes object properties recursively
   * Applies stripHtml to all string values
   */
  static sanitizeObject<T>(obj: T): T {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item)) as unknown as T;
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.stripHtml(value);
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
