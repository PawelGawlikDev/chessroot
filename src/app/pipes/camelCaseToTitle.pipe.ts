import { Pipe } from '@angular/core';

@Pipe({
  name: 'camelCaseToTitle',
})
export class CamelCaseToTitlePipe {
  public transform(value: string): string {
    if (!value) {
      return value;
    }

    const titleCased = value.replace(/([A-Z])/g, ' $1').trim();
    return titleCased.charAt(0).toUpperCase() + titleCased.slice(1);
  }
}
