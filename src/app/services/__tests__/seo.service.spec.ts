import { SeoService } from '../seo.service';
import { TestBed } from '@angular/core/testing';

describe('SeoService', () => {
  let service: SeoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('setSeo', () => {
    it('should set the document title with site name suffix', () => {
      service.setSeo({ title: 'My Page', description: 'Desc' }, '/my-page');
      expect(document.title).toBe('My Page — ChessRoot');
    });

    it('should set meta description tag', () => {
      service.setSeo({ title: 'T', description: 'Test description' }, '/test');
      const meta = document.querySelector('meta[name="description"]');
      expect(meta?.getAttribute('content')).toBe('Test description');
    });

    it('should set og:title meta tag', () => {
      service.setSeo({ title: 'OG Title', description: 'Desc' }, '/og');
      const meta = document.querySelector('meta[property="og:title"]');
      expect(meta?.getAttribute('content')).toBe('OG Title — ChessRoot');
    });

    it('should set og:description meta tag', () => {
      service.setSeo({ title: 'T', description: 'OG Desc' }, '/og');
      const meta = document.querySelector('meta[property="og:description"]');
      expect(meta?.getAttribute('content')).toBe('OG Desc');
    });

    it('should set og:image to default image when no image provided', () => {
      service.setSeo({ title: 'T', description: 'Desc' }, '/img');
      const meta = document.querySelector('meta[property="og:image"]');
      expect(meta?.getAttribute('content')).toBe('https://chessroot.app/icon.svg');
    });

    it('should set og:image to provided image', () => {
      service.setSeo(
        { title: 'T', description: 'Desc', image: 'https://example.com/custom.png' },
        '/img',
      );
      const meta = document.querySelector('meta[property="og:image"]');
      expect(meta?.getAttribute('content')).toBe('https://example.com/custom.png');
    });

    it('should set og:url meta tag', () => {
      service.setSeo({ title: 'T', description: 'Desc' }, '/my-page');
      const meta = document.querySelector('meta[property="og:url"]');
      expect(meta?.getAttribute('content')).toBe('https://chessroot.app/my-page');
    });

    it('should set og:type meta tag to website', () => {
      service.setSeo({ title: 'T', description: 'Desc' }, '/t');
      const meta = document.querySelector('meta[property="og:type"]');
      expect(meta?.getAttribute('content')).toBe('website');
    });

    it('should set og:site_name meta tag', () => {
      service.setSeo({ title: 'T', description: 'Desc' }, '/t');
      const meta = document.querySelector('meta[property="og:site_name"]');
      expect(meta?.getAttribute('content')).toBe('ChessRoot');
    });

    it('should set twitter:card meta tag', () => {
      service.setSeo({ title: 'T', description: 'Desc' }, '/t');
      const meta = document.querySelector('meta[name="twitter:card"]');
      expect(meta?.getAttribute('content')).toBe('summary_large_image');
    });

    it('should set twitter:title meta tag', () => {
      service.setSeo({ title: 'Tweet Title', description: 'Desc' }, '/t');
      const meta = document.querySelector('meta[name="twitter:title"]');
      expect(meta?.getAttribute('content')).toBe('Tweet Title — ChessRoot');
    });

    it('should set twitter:description meta tag', () => {
      service.setSeo({ title: 'T', description: 'Twitter Desc' }, '/t');
      const meta = document.querySelector('meta[name="twitter:description"]');
      expect(meta?.getAttribute('content')).toBe('Twitter Desc');
    });

    it('should set twitter:image meta tag with default image', () => {
      service.setSeo({ title: 'T', description: 'Desc' }, '/t');
      const meta = document.querySelector('meta[name="twitter:image"]');
      expect(meta?.getAttribute('content')).toBe('https://chessroot.app/icon.svg');
    });

    it('should create canonical link element if it does not exist', () => {
      // Remove any existing canonical link
      const existing = document.querySelector('link[rel="canonical"]');
      existing?.remove();

      service.setSeo({ title: 'T', description: 'Desc' }, '/canonical');
      const link = document.querySelector('link[rel="canonical"]');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('https://chessroot.app/canonical');
    });

    it('should update existing canonical link element', () => {
      service.setSeo({ title: 'T', description: 'Desc' }, '/first');
      service.setSeo({ title: 'T', description: 'Desc' }, '/second');

      const links = document.querySelectorAll('link[rel="canonical"]');
      expect(links.length).toBe(1);
      expect(links[0].getAttribute('href')).toBe('https://chessroot.app/second');
    });
  });
});
