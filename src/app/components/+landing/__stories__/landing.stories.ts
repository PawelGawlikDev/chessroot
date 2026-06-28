import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { LandingComponent } from '../landing.component';
import { LichessAuthService } from '@services/lichess-auth.service';

const mockLoggedOut: Partial<LichessAuthService> = {
  isLoggedIn: () => false,
  getUsername: () => '',
  login: () => Promise.resolve(),
};

const mockLoggedIn: Partial<LichessAuthService> = {
  isLoggedIn: () => true,
  getUsername: () => 'MagnusCarlsen',
  login: () => Promise.resolve(),
};

const meta: Meta<LandingComponent> = {
  title: 'Landing/Page',
  component: LandingComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
  render: (args) => ({
    props: args,
  }),
};

export default meta;
type Story = StoryObj<LandingComponent>;

export const LoggedOut: Story = {
  decorators: [
    applicationConfig({
      providers: [{ provide: LichessAuthService, useValue: mockLoggedOut }],
    }),
  ],
};

export const LoggedIn: Story = {
  decorators: [
    applicationConfig({
      providers: [{ provide: LichessAuthService, useValue: mockLoggedIn }],
    }),
  ],
};
