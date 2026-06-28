import { Meta, StoryObj } from '@storybook/angular';
import { Component, Input, OnChanges, ElementRef, inject } from '@angular/core';

interface TokenGroup {
  name: string;
  tokens: { name: string; var: string }[];
}

const CR_TOKENS: TokenGroup[] = [
  {
    name: 'Grandmaster Colors',
    tokens: [
      { name: 'Primary', var: '--cr-primary' },
      { name: 'On Primary', var: '--cr-on-primary' },
      { name: 'Primary Container', var: '--cr-primary-container' },
      { name: 'Secondary', var: '--cr-secondary' },
      { name: 'Tertiary', var: '--cr-tertiary' },
      { name: 'Error', var: '--cr-error' },
      { name: 'Surface', var: '--cr-surface' },
      { name: 'On Surface', var: '--cr-on-surface' },
      { name: 'Surface Container', var: '--cr-surface-container' },
      { name: 'Outline', var: '--cr-outline' },
    ],
  },
  {
    name: 'Chess Surfaces',
    tokens: [
      { name: 'Container Start', var: '--cr-chess-container-start' },
      { name: 'Container End', var: '--cr-chess-container-end' },
      { name: 'Card BG', var: '--cr-chess-card-bg' },
      { name: 'Card Border', var: '--cr-chess-card-border' },
      { name: 'Elevation 2', var: '--cr-surface-elevation-2' },
    ],
  },
  {
    name: 'Result Colors',
    tokens: [
      { name: 'Win', var: '--cr-win-green' },
      { name: 'Loss', var: '--cr-loss-red' },
      { name: 'Draw', var: '--cr-draw-gray' },
    ],
  },
  {
    name: 'Typography',
    tokens: [
      { name: 'Display LG', var: '--cr-display-lg-size' },
      { name: 'Headline MD', var: '--cr-headline-md-size' },
      { name: 'Headline SM', var: '--cr-headline-sm-size' },
      { name: 'Body LG', var: '--cr-body-lg-size' },
      { name: 'Body MD', var: '--cr-body-md-size' },
      { name: 'Label Caps', var: '--cr-label-caps-size' },
    ],
  },
  {
    name: 'Rounded',
    tokens: [
      { name: 'SM', var: '--cr-rounded-sm' },
      { name: 'DEFAULT', var: '--cr-rounded' },
      { name: 'MD', var: '--cr-rounded-md' },
      { name: 'LG', var: '--cr-rounded-lg' },
      { name: 'XL', var: '--cr-rounded-xl' },
      { name: 'Full', var: '--cr-rounded-full' },
    ],
  },
];

const MAT_TOKENS: { name: string; var: string }[] = [
  { name: 'Primary', var: '--mat-sys-primary' },
  { name: 'On Primary', var: '--mat-sys-on-primary' },
  { name: 'Primary Container', var: '--mat-sys-primary-container' },
  { name: 'On Primary Container', var: '--mat-sys-on-primary-container' },
  { name: 'Secondary', var: '--mat-sys-secondary' },
  { name: 'On Secondary', var: '--mat-sys-on-secondary' },
  { name: 'Tertiary', var: '--mat-sys-tertiary' },
  { name: 'On Tertiary', var: '--mat-sys-on-tertiary' },
  { name: 'Tertiary Container', var: '--mat-sys-tertiary-container' },
  { name: 'On Tertiary Container', var: '--mat-sys-on-tertiary-container' },
  { name: 'Error', var: '--mat-sys-error' },
  { name: 'On Error', var: '--mat-sys-on-error' },
  { name: 'Surface', var: '--mat-sys-surface' },
  { name: 'On Surface', var: '--mat-sys-on-surface' },
  { name: 'Surface Container', var: '--mat-sys-surface-container' },
  { name: 'Surface Container Low', var: '--mat-sys-surface-container-low' },
  { name: 'Surface Container High', var: '--mat-sys-surface-container-high' },
  { name: 'Background', var: '--mat-sys-background' },
  { name: 'On Background', var: '--mat-sys-on-background' },
  { name: 'Outline', var: '--mat-sys-outline' },
  { name: 'Outline Variant', var: '--mat-sys-outline-variant' },
];

@Component({
  selector: 'cr-tokens-display',
  standalone: true,
  template: `
    <div class="tokens-page">
      <section class="tokens-section">
        <h2>Material Design Tokens</h2>
        <p class="tokens-hint">Use the controls below to override primary / tertiary colors.</p>

        <div class="tokens-grid">
          @for (token of matTokens; track token.var) {
            <div class="token-card">
              <div class="token-swatch" [style.background]="'var(' + token.var + ')'"></div>
              <div class="token-label">{{ token.name }}</div>
              <code class="token-var">{{ token.var }}</code>
            </div>
          }
        </div>
      </section>

      <section class="tokens-section">
        <h2>App Custom Tokens</h2>
        <p class="tokens-hint">Custom CSS properties scoped to light / dark theme.</p>

        @for (group of tokenGroups; track group.name) {
          <div class="token-group">
            <h3 class="group-title">{{ group.name }}</h3>
            <div class="tokens-grid">
              @for (token of group.tokens; track token.var) {
                <div class="token-card">
                  <div
                    class="token-swatch"
                    [style.background]="'var(' + token.var + ')'"
                    [style.borderColor]="'var(' + token.var + ')'"
                  ></div>
                  <div class="token-label">{{ token.name }}</div>
                  <code class="token-var">{{ token.var }}</code>
                </div>
              }
            </div>
          </div>
        }
      </section>
    </div>
  `,
  styles: [
    `
      .tokens-page {
        padding: 24px;
        font-family: 'JetBrains Mono', monospace;
        color: black;
      }
      .tokens-section {
        margin-bottom: 40px;
      }
      .tokens-section h2 {
        margin: 0 0 4px;
        font-size: 1.4rem;
        font-weight: 600;
      }
      .tokens-hint {
        margin: 0 0 20px;
        font-size: 0.85rem;
        opacity: 0.65;
      }
      .token-group {
        margin-bottom: 28px;
      }
      .group-title {
        margin: 0 0 10px;
        font-size: 0.95rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        opacity: 0.7;
      }
      .tokens-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 12px;
      }
      .token-card {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
        padding: 12px;
        border-radius: 10px;
        background: var(--mat-sys-surface-container-low);
        border: 1px solid var(--mat-sys-outline-variant);
        color: var(--mat-sys-on-background);
      }
      .token-swatch {
        width: 100%;
        height: 48px;
        border-radius: 6px;
        border: 2px solid var(--mat-sys-outline-variant);
        flex-shrink: 0;
      }
      .token-label {
        font-size: 0.82rem;
        font-weight: 500;
        margin-top: 4px;
      }
      .token-var {
        font-size: 0.65rem;
        opacity: 0.6;
        word-break: break-all;
      }
    `,
  ],
})
class TokensDisplayComponent implements OnChanges {
  @Input() public primaryColor = '';
  @Input() public tertiaryColor = '';

  private host = inject(ElementRef);

  public tokenGroups = CR_TOKENS;
  public matTokens = MAT_TOKENS;

  public ngOnChanges(): void {
    const el = this.host.nativeElement;
    if (this.primaryColor) {
      el.style.setProperty('--mat-sys-primary', this.primaryColor);
    } else {
      el.style.removeProperty('--mat-sys-primary');
    }
    if (this.tertiaryColor) {
      el.style.setProperty('--mat-sys-tertiary', this.tertiaryColor);
    } else {
      el.style.removeProperty('--mat-sys-tertiary');
    }
  }
}

const meta: Meta<TokensDisplayComponent> = {
  title: 'Design Tokens',
  component: TokensDisplayComponent,
  argTypes: {
    primaryColor: { control: 'color', name: 'Primary Override' },
    tertiaryColor: { control: 'color', name: 'Tertiary Override' },
  },
  args: {
    primaryColor: '',
    tertiaryColor: '',
  },
};

export default meta;
type Story = StoryObj<TokensDisplayComponent>;

export const Light: Story = {};

export const Dark: Story = {
  globals: { theme: 'dark' },
};
