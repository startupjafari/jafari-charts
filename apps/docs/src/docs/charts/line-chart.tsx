import { LineChart } from '@startupjafari/charts';
import { activity } from '../../examples/data';
import { Link } from '../../lib/router';
import { baseGroup, cartesianGroup, seriesGroup } from '../props';
import { CARTESIAN_KEYS, ZOOM_KEYS } from '../keyboard';
import type { ChartDoc } from '../types';

export const lineChart: ChartDoc = {
  slug: 'line-chart',
  component: 'LineChart',
  title: { en: 'Line chart', ru: 'Линейная диаграмма', kk: 'Сызықтық график' },
  group: 'Core',
  summary: {
    en: 'One or more series over time, numbers or categories — the workhorse for trends.',
    ru: 'Один или несколько рядов данных по времени, числам или категориям — основной инструмент для трендов.',
    kk: 'Уақыт, сандар немесе санаттар бойынша бір не бірнеше қатар — трендтерді көрсетудің негізгі құралы.',
  },
  description: {
    en: (
      <>
        <p>
          Lines use a monotone curve by default, which never overshoots the data, and break into
          gaps at missing values instead of inventing them. The value axis includes zero when the
          data is close to it (counts) and zooms to the range otherwise (prices, temperatures).
        </p>
        <p>
          With two or more series you get a legend whose items toggle series, a crosshair and a
          shared tooltip. Large inputs are downsampled with LTTB to about two points per pixel, so
          the drawn path — and the DOM — stays the same size whether you pass 1 000 or 100 000
          points (see <Link to="/performance">Performance</Link>).
        </p>
      </>
    ),
    ru: (
      <>
        <p>
          По умолчанию линии строятся монотонной кривой, которая никогда не выходит за пределы
          данных, а на пропущенных значениях прерываются, ничего не додумывая. Ось значений включает
          ноль, когда данные близки к нему (количества), и подстраивается под диапазон данных в
          остальных случаях (цены, температуры).
        </p>
        <p>
          Когда рядов два и больше, появляются легенда, элементы которой скрывают и показывают ряды,
          перекрестие и общая подсказка. Большие наборы данных прореживаются алгоритмом LTTB
          примерно до двух точек на пиксель, поэтому отрисованный путь — а с ним и DOM — остаётся
          того же размера, передадите ли вы 1 000 или 100 000 точек (см.{' '}
          <Link to="/performance">Производительность</Link>).
        </p>
      </>
    ),
    kk: (
      <>
        <p>
          Әдепкіде сызықтар монотонды қисықпен салынады: ол деректер шегінен ешқашан шықпайды, ал
          бос мәндерде ештеңені ойдан қоспай, үзіліп қалады. Деректер нөлге жақын болса (санақ
          мәндері), мәндер осі нөлді қамтиды, ал басқа жағдайларда деректер аралығына бейімделеді
          (бағалар, температура).
        </p>
        <p>
          Екі не одан көп қатар болғанда шартты белгілер (оның элементтері қатарларды жасырады және
          көрсетеді), айқас сызық және ортақ қалқымалы кеңес пайда болады. Үлкен деректер жиыны LTTB
          алгоритмімен пиксельге шамамен екі нүктеге дейін сиретіледі, сондықтан салынған жол —
          онымен бірге DOM да — 1 000 нүкте берсеңіз де, 100 000 нүкте берсеңіз де бірдей өлшемде
          қалады (<Link to="/performance">Өнімділік</Link> бетін қараңыз).
        </p>
      </>
    ),
  },
  thumbnail: () => (
    <LineChart
      data={activity}
      xKey="date"
      series={[{ key: 'students' }, { key: 'teachers' }]}
      height={120}
      xAxis={false}
      yAxis={false}
      legend={false}
      tooltip={false}
      crosshair={false}
      animation={false}
      accessibilityTable={false}
    />
  ),
  sections: {
    usage: [
      {
        id: 'line-chart/Basic',
        title: { en: 'Basic', ru: 'Базовый пример', kk: 'Негізгі мысал' },
        description: {
          en: (
            <p>
              Pass rows, the x field and the value field. <code>Date</code> objects and ISO date
              strings are detected as time; for numeric timestamps add{' '}
              <code>
                xAxis={'{{'} type: 'time' {'}}'}
              </code>
              .
            </p>
          ),
          ru: (
            <p>
              Передайте строки данных, поле для оси X и поле значений. Объекты <code>Date</code> и
              даты в виде ISO-строк распознаются как время; для числовых временных меток добавьте{' '}
              <code>
                xAxis={'{{'} type: 'time' {'}}'}
              </code>
              .
            </p>
          ),
          kk: (
            <p>
              Деректер жолдарын, X осіне арналған өрісті және мәндер өрісін беріңіз.{' '}
              <code>Date</code> объектілері мен ISO пішіміндегі күн жолдары уақыт ретінде танылады;
              сандық уақыт белгілері үшін{' '}
              <code>
                xAxis={'{{'} type: 'time' {'}}'}
              </code>{' '}
              қосыңыз.
            </p>
          ),
        },
      },
      {
        id: 'line-chart/MultiSeries',
        title: {
          en: 'Several series with a reference line',
          ru: 'Несколько рядов и опорная линия',
          kk: 'Бірнеше қатар және тірек сызық',
        },
        description: {
          en: (
            <p>
              <code>series</code> takes one entry per line. Primitives such as{' '}
              <code>ChartReferenceLine</code> go in <code>children</code>.
            </p>
          ),
          ru: (
            <p>
              <code>series</code> принимает по одной записи на линию. Примитивы вроде{' '}
              <code>ChartReferenceLine</code> передаются в <code>children</code>.
            </p>
          ),
          kk: (
            <p>
              <code>series</code> әр сызыққа бір жазба қабылдайды. <code>ChartReferenceLine</code>{' '}
              сияқты примитивтер <code>children</code> ішінде беріледі.
            </p>
          ),
        },
      },
      {
        id: 'line-chart/MissingValues',
        title: {
          en: 'Missing and negative values',
          ru: 'Пропуски и отрицательные значения',
          kk: 'Бос және теріс мәндер',
        },
        description: {
          en: <p>Null values leave gaps; the axis adapts to negative ranges.</p>,
          ru: (
            <p>Значения null оставляют разрывы; ось подстраивается под отрицательный диапазон.</p>
          ),
          kk: <p>null мәндері үзілістер қалдырады; ось теріс аралыққа бейімделеді.</p>,
        },
      },
    ],
    styling: [
      {
        id: 'line-chart/Curves',
        title: { en: 'Curves and markers', ru: 'Кривые и маркеры', kk: 'Қисықтар мен маркерлер' },
        description: {
          en: (
            <p>
              <code>curve</code> switches the interpolation; <code>dots</code> adds markers.
            </p>
          ),
          ru: (
            <p>
              <code>curve</code> переключает интерполяцию; <code>dots</code> добавляет маркеры.
            </p>
          ),
          kk: (
            <p>
              <code>curve</code> интерполяцияны ауыстырады; <code>dots</code> маркерлер қосады.
            </p>
          ),
        },
      },
      {
        id: 'line-chart/Styling',
        title: {
          en: 'Colours, dashes, axes and formatting',
          ru: 'Цвета, пунктир, оси и форматирование',
          kk: 'Түстер, пунктир, осьтер және пішімдеу',
        },
        description: {
          en: (
            <p>
              Per-series <code>color</code> and <code>dashed</code>, vertical gridlines, axis title,
              value formatting and a top-aligned legend.
            </p>
          ),
          ru: (
            <p>
              <code>color</code> и <code>dashed</code> для отдельных рядов, вертикальные линии
              сетки, заголовок оси, форматирование значений и легенда сверху.
            </p>
          ),
          kk: (
            <p>
              Жеке қатарларға арналған <code>color</code> және <code>dashed</code>, тік тор
              сызықтары, ось атауы, мәндерді пішімдеу және жоғарғы жақтағы шартты белгілер.
            </p>
          ),
        },
      },
      {
        id: 'line-chart/Differentiate',
        title: {
          en: 'Identity without colour',
          ru: 'Различимость без цвета',
          kk: 'Түссіз ажырату',
        },
        description: {
          en: (
            <p>
              <code>differentiate</code> gives each series its own marker shape and dash pattern,
              for print, colour-vision deficiency and forced-colours mode.
            </p>
          ),
          ru: (
            <p>
              <code>differentiate</code> даёт каждому ряду свою форму маркеров и тип штриховки — для
              печати, для людей с нарушениями цветовосприятия и для режима принудительных цветов.
            </p>
          ),
          kk: (
            <p>
              <code>differentiate</code> әр қатарға өз маркер пішіні мен пунктир түрін береді —
              басып шығару, түсті қабылдауы ерекше адамдар және мәжбүрлі түстер режимі үшін.
            </p>
          ),
        },
      },
    ],
    interaction: [
      {
        id: 'line-chart/ZoomBrush',
        title: {
          en: 'Zoom, pan and brush',
          ru: 'Масштабирование, панорамирование и выделение диапазона',
          kk: 'Масштабтау, жылжыту және аралықты таңдау',
        },
        description: {
          en: (
            <p>
              Ctrl/⌘ + wheel or pinch zooms, dragging pans when zoomed, dragging on the full view
              selects a range (brush) that zooms in. Double-click or press 0 to reset. The visible
              range is controlled here through <code>xDomain</code>.
            </p>
          ),
          ru: (
            <p>
              Ctrl/⌘ + колесо мыши или щипок масштабируют, перетаскивание в приближенном виде
              панорамирует, а перетаскивание в полном виде выделяет диапазон (brush), который затем
              приближается. Двойной щелчок или клавиша 0 сбрасывают масштаб. Видимый диапазон здесь
              контролируется через <code>xDomain</code>.
            </p>
          ),
          kk: (
            <p>
              Ctrl/⌘ + тінтуір дөңгелегі немесе екі саусақпен қысу масштабтайды; үлкейтілген күйде
              сүйреу көріністі жылжытады, ал толық көріністе сүйреу аралықты таңдайды (brush) және
              оны үлкейтеді. Масштабты қалпына келтіру үшін екі рет шертіңіз немесе 0 пернесін
              басыңыз. Мұнда көрінетін аралық <code>xDomain</code> арқылы басқарылады.
            </p>
          ),
        },
      },
      {
        id: 'line-chart/Controlled',
        title: {
          en: 'Controlled legend, active point and clicks',
          ru: 'Контролируемая легенда, активная точка и нажатия',
          kk: 'Басқарылатын шартты белгілер, белсенді нүкте және басу',
        },
        description: {
          en: (
            <p>
              Toggle series in the legend, step through points with the buttons (or arrow keys when
              the chart is focused) and click a point.
            </p>
          ),
          ru: (
            <p>
              Скрывайте и показывайте ряды в легенде, переходите по точкам кнопками (или стрелками,
              когда диаграмма в фокусе) и нажимайте на точки.
            </p>
          ),
          kk: (
            <p>
              Шартты белгілерде қатарларды жасырыңыз не көрсетіңіз, батырмалармен (немесе диаграмма
              фокуста болғанда көрсеткі пернелерімен) нүктелер бойынша жүріңіз және нүктені басыңыз.
            </p>
          ),
        },
      },
      {
        id: 'line-chart/Sync',
        title: {
          en: 'Synchronised charts',
          ru: 'Синхронизированные диаграммы',
          kk: 'Синхрондалған диаграммалар',
        },
        description: {
          en: (
            <p>
              Charts with the same <code>syncId</code> share the crosshair and tooltip.
            </p>
          ),
          ru: (
            <p>
              Диаграммы с одинаковым <code>syncId</code> синхронизируют перекрестие и подсказку.
            </p>
          ),
          kk: (
            <p>
              Бірдей <code>syncId</code> бар диаграммалар айқас сызық пен қалқымалы кеңесті ортақ
              пайдаланады.
            </p>
          ),
        },
      },
    ],
    responsive: [
      {
        id: 'line-chart/Responsive',
        title: { en: 'Narrow container', ru: 'Узкий контейнер', kk: 'Тар контейнер' },
        width: 320,
      },
    ],
    empty: [
      {
        id: 'line-chart/States',
        title: {
          en: 'Empty, loading and error',
          ru: 'Нет данных, загрузка и ошибка',
          kk: 'Деректер жоқ, жүктелу және қате',
        },
      },
    ],
  },
  keyboard: [...CARTESIAN_KEYS, ...ZOOM_KEYS],
  props: [cartesianGroup, seriesGroup, baseGroup],
};
