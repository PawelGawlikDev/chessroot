import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { ToolPage } from './tool-page';
import { SEO_PAGES } from '../../seo-pages';
import { SeoService } from '../../services/seo.service';

describe('ToolPage', () => {
  for (const tool of ['explorer', 'tools', 'achievements'] as const) {
    it(`sets metadata for ${tool} without adding visible SEO copy`, () => {
      const seo = { setSeo: vi.fn() };
      TestBed.configureTestingModule({
        imports: [ToolPage],
        providers: [
          provideRouter([]),
          { provide: ActivatedRoute, useValue: { snapshot: { data: { tool } } } },
          { provide: SeoService, useValue: seo },
        ],
      });
      const fixture = TestBed.createComponent(ToolPage);
      fixture.detectChanges();
      const element = fixture.nativeElement as HTMLElement;
      expect(element.textContent?.trim()).toBe('');
      expect(element.querySelector('header, article, h1')).toBeNull();
      expect(element.querySelector('cr-game-fetch-panel')).toBeNull();
      expect(seo.setSeo).toHaveBeenCalledWith(SEO_PAGES[tool], `/${tool}`);
      seo.setSeo.mockClear();
      fixture.componentInstance.onRouteReactivated();
      expect(seo.setSeo).toHaveBeenCalledWith(SEO_PAGES[tool], `/${tool}`);
    });
  }
});
