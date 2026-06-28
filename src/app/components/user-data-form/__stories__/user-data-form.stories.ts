import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideStore } from '@ngrx/store';
import { UserDataFormComponent } from '../user-data-form.component';
import { userDataReducer } from '@state/reducers';
import { USER_DATA_FEATURE_KEY } from '@state/selectors';

const meta: Meta<UserDataFormComponent> = {
  title: 'Shared/UserDataForm',
  component: UserDataFormComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        provideNativeDateAdapter(),
        provideStore({ [USER_DATA_FEATURE_KEY]: userDataReducer }),
      ],
    }),
  ],
  render: (args) => ({
    props: args,
  }),
};

export default meta;
type Story = StoryObj<UserDataFormComponent>;

export const Default: Story = {};

export const Prefilled: Story = {
  args: {},
  play: ({ canvasElement }) => {
    const input = canvasElement.querySelector('input') as HTMLInputElement;
    if (input) {
      input.value = 'MagnusCarlsen';
      input.dispatchEvent(new Event('input'));
    }
  },
};
