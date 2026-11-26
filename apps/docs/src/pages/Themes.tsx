import { cssVar, darkTheme, lightTheme, palette, type ThemeTokens } from '@jafari/charts';
import { Callout, PageHeader, Section } from '../ui/Callout';
import { CodeBlock } from '../ui/CodeBlock';
import { Example } from '../ui/Example';

type TokenName = Exclude<keyof ThemeTokens, 'series'>;

const TOKEN_NOTES: Record<TokenName, string> = {
  background: 'Surface behind the chart; also the 2 px ring around markers.',
  surface: 'Tooltip and popover surface.',
  textPrimary: 'Values, titles, centre labels.',
  textSecondary: 'Axis labels, legend, tooltip labels.',
  textMuted: 'Reference lines, de-emphasised text.',
  border: 'Tooltip and button borders.',
  grid: 'Gridlines.',
  axis: 'Axis baselines and the zero line.',
  crosshair: 'Crosshair line.',
  track: 'Unfilled tracks (radial progress, gauge) and placeholders.',
  focus: 'Focus rings and brush selection.',
  onFill: 'Text drawn inside filled marks.',
  positive: 'Increases (waterfall), good values.',
  negative: 'Decreases (waterfall), bad values.',
  warning: 'Warnings (gauge bands).',
  neutral: 'Neutral values.',
  fontFamily: 'Font family (inherits from the page).',
  fontSize: 'Tick and label size.',
  fontSizeSmall: 'Small text.',
  fontSizeLarge: 'Large text.',
  radius: 'Bar corner radius.',
  tooltipRadius: 'Tooltip corner radius.',
  tooltipShadow: 'Tooltip shadow.',
  duration: 'Transition duration.',
  easing: 'Transition easing.',
};

const TOKENS = Object.keys(TOKEN_NOTES) as TokenName[];

function isColor(value: string): boolean {
  return /^#|^rgb/.test(value);
}

function Swatch({ color }: { color: string }) {
  return <span className="swatch" style={{ background: color }} aria-hidden="true" />;
}

function Value({ value }: { value: string }) {
  return (
    <span className="token-value">
      {isColor(value) ? <Swatch color={value} /> : null}
      <code>{value}</code>
    </span>
  );
}

export function Themes() {
  return (
    <article>
      <PageHeader
        eyebrow="Guides"
        title="Themes"
        lead="Every visual parameter is a design token exposed as a CSS custom property (--jc-*). Themes are just token values — switch them with a prop, a provider or plain CSS."
      />

      <Section id="modes" title="Light, dark and auto">
        <p>
          <code>theme="auto"</code> (the default) follows <strong>the host application</strong>, not
          the operating system:
        </p>
        <ol>
          <li>
            a <code>.dark</code>, <code>[data-theme=dark]</code>, <code>[data-mode=dark]</code> or{' '}
            <code>[data-color-scheme=dark]</code> ancestor (Tailwind, next-themes) → dark; the{' '}
            <code>.light</code> equivalents force light;
          </li>
          <li>
            otherwise the app’s <code>color-scheme</code>, through CSS <code>light-dark()</code>;
          </li>
          <li>an app that declares no dark support stays light even when the OS is dark.</li>
        </ol>
        <p>
          This site toggles a <code>dark</code> class on <code>&lt;html&gt;</code>; every chart uses{' '}
          <code>theme="auto"</code>. The per-example Light/Dark switches add a <code>.light</code>/
          <code>.dark</code> class to the preview.
        </p>
        <Example id="themes/Modes" title="Forced and automatic modes" codeOpen />
      </Section>

      <Section id="create-theme" title="createTheme">
        <p>
          <code>createTheme</code> overrides any tokens, for every mode or per mode. Pass the result
          to a chart’s <code>theme</code> prop or to <code>ChartProvider</code>. Overrides for all
          modes are inlined as CSS variables; per-mode overrides are scoped to the chart with a
          generated style element.
        </p>
        <Example id="themes/Brand" title="Brand theme" codeOpen />
      </Section>

      <Section id="css" title="Plain CSS">
        <p>
          Tokens are CSS custom properties on <code>.jc-root</code>, so a stylesheet is enough:
        </p>
        <CodeBlock
          title="styles.css"
          language="css"
          code={`.jc-root {
  --jc-series-1: #0ea5e9;
  --jc-radius: 6px;
}

.dark .jc-root {
  --jc-grid: #1f2937;
}`}
        />
        <Example id="themes/CssVariables" title="Tokens set inline" />
        <Callout tone="info" title="Canvas uses the same colours">
          The Canvas renderer resolves colours through a hidden probe element, so it paints exactly
          what CSS computes — including <code>light-dark()</code>, <code>color-mix()</code> and CSS
          variables.
        </Callout>
      </Section>

      <Section id="palette" title="Categorical palette">
        <p>
          Series colours are assigned in order. The order was validated for colour-vision
          deficiency: every adjacent pair stays distinguishable (OKLab ΔE ≥ 8 under
          protanopia/deuteranopia simulation) in both modes, so stacks, legends and neighbouring
          bars stay readable. Dark mode uses darker steps of the same hues. For identity without
          colour, use <code>differentiate</code>.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Slot</th>
                <th scope="col">Light</th>
                <th scope="col">Dark</th>
              </tr>
            </thead>
            <tbody>
              {lightTheme.series.map((c, i) => (
                <tr key={c}>
                  <th scope="row">
                    <code>--jc-series-{i + 1}</code>
                  </th>
                  <td>
                    <Value value={c} />
                  </td>
                  <td>
                    <Value value={darkTheme.series[i] ?? ''} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          The brand palette is exported as <code>palette</code>:
        </p>
        <div className="palette-row">
          {Object.entries(palette).map(([name, color]) => (
            <span key={name} className="palette-chip">
              <Swatch color={color} />
              <span>{name}</span>
              <code>{color}</code>
            </span>
          ))}
        </div>
      </Section>

      <Section id="tokens" title="Token reference">
        <p>
          Names as used by <code>createTheme</code> and <code>cssVar()</code>, with their CSS
          variables and default values.
        </p>
        <div className="table-wrap tokens-table">
          <table>
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Light</th>
                <th scope="col">Dark</th>
                <th scope="col">Used for</th>
              </tr>
            </thead>
            <tbody>
              {TOKENS.map((t) => (
                <tr key={t}>
                  <th scope="row">
                    <code>{t}</code>
                    <br />
                    <code className="muted">{cssVar(t).slice(4, -1)}</code>
                  </th>
                  <td>
                    <Value value={lightTheme[t]} />
                  </td>
                  <td>
                    <Value value={darkTheme[t]} />
                  </td>
                  <td>{TOKEN_NOTES[t]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </article>
  );
}
