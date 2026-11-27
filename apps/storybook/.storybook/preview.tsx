import { ChartProvider } from '@startupjafari/charts';
import type { Decorator, Preview } from '@storybook/react-vite';

const withChartTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme as 'light' | 'dark' | 'auto';
  const locale = context.globals.locale as string;
  const dark = theme === 'dark';
  return (
    <div
      className={dark ? 'dark' : undefined}
      style={{
        background: dark ? '#0f1115' : '#ffffff',
        padding: 24,
        colorScheme: dark ? 'dark' : 'light',
      }}
    >
      <ChartProvider theme={theme} locale={locale}>
        <Story />
      </ChartProvider>
    </div>
  );
};

const preview: Preview = {
  decorators: [withChartTheme],
  globalTypes: {
    theme: {
      description: 'Chart theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: ['light', 'dark', 'auto'],
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'Locale',
      toolbar: { title: 'Locale', icon: 'globe', items: ['en', 'ru', 'kk'], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: 'light', locale: 'en' },
  parameters: { layout: 'fullscreen', controls: { expanded: true } },
};

export default preview;
