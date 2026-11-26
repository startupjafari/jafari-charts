# Benchmark report

Generated 2026-11-26T14:29:37.801Z · 12th Gen Intel(R) Core(TM) i5-12400 (4 cores, 13 GB) · Chromium 156.0.8078.4

Production build, animations off, viewport 1000×800. Times include layout and paint of the next frame. Each machine produces different absolute numbers; compare runs on the same machine.

## Single chart

| chart | renderer | points | mountMs | updateMs | hoverP50Ms | hoverP95Ms | longTasksDuringHover | domNodes | heapMB |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| line | svg | 30 | 30.8 | 14.9 | 16.8 | 19.5 | 0 | 200 | 4.6 |
| line | svg | 90 | 25.6 | 15.3 | 16.7 | 19.5 | 0 | 73 | 4.6 |
| line | svg | 365 | 31.9 | 15 | 16.6 | 17.4 | 0 | 82 | 4.8 |
| line | svg | 1000 | 30.6 | 13 | 16.6 | 18.1 | 0 | 73 | 5.1 |
| line | canvas | 1000 | 26.8 | 14.5 | 16.7 | 18 | 0 | 66 | 5.3 |
| line | svg | 10000 | 37.9 | 14.1 | 16.6 | 21.3 | 0 | 78 | 9.8 |
| line | canvas | 10000 | 33.6 | 13.1 | 16.7 | 17.5 | 0 | 71 | 9.1 |
| line | svg | 100000 | 47.7 | 19 | 16.6 | 17.8 | 0 | 80 | 42.8 |
| line | canvas | 100000 | 43.4 | 22.7 | 16.6 | 18.4 | 0 | 73 | 42.6 |
| line | svg | 1000000 | 116.5 | 139.6 | 16.5 | 22.7 | 2 | 75 | 302.6 |
| line | canvas | 1000000 | 107.7 | 160.5 | 16.5 | 22.3 | 2 | 68 | 317.6 |
| area | svg | 30 | 28.2 | 15.3 | 16.7 | 19.5 | 0 | 152 | 4.5 |
| area | svg | 90 | 26.1 | 15 | 16.6 | 17.5 | 0 | 56 | 4.5 |
| area | svg | 365 | 30.7 | 14.4 | 16.7 | 19.6 | 0 | 63 | 4.7 |
| area | svg | 1000 | 29.3 | 13.2 | 16.6 | 18.7 | 0 | 58 | 5.1 |
| area | canvas | 1000 | 26 | 14.3 | 16.6 | 18.7 | 0 | 49 | 5.1 |
| area | svg | 10000 | 36.1 | 14.7 | 16.6 | 18.7 | 0 | 66 | 8.2 |
| area | canvas | 10000 | 30.4 | 13.6 | 16.7 | 18.8 | 0 | 57 | 8.1 |
| area | svg | 100000 | 47.7 | 21.5 | 16.6 | 21.3 | 0 | 64 | 37.2 |
| area | canvas | 100000 | 46.5 | 24.7 | 16.6 | 22.1 | 0 | 54 | 34.7 |
| area | svg | 1000000 | 158.5 | 112.9 | 16.6 | 17.9 | 2 | 59 | 264.3 |
| area | canvas | 1000000 | 98.8 | 106.9 | 16.7 | 17.7 | 2 | 49 | 264 |
| bar | svg | 30 | 29.5 | 14.4 | 16.8 | 18.5 | 0 | 153 | 4.5 |
| bar | svg | 90 | 26.7 | 15.3 | 16.6 | 20.1 | 0 | 57 | 4.6 |
| bar | svg | 365 | 33.5 | 11.9 | 16.7 | 17.8 | 0 | 57 | 5 |
| bar | svg | 1000 | 42.5 | 13.1 | 16.7 | 17.8 | 0 | 59 | 5.9 |
| bar | canvas | 1000 | 36.1 | 14.5 | 16.7 | 17.9 | 0 | 53 | 6 |
| bar | svg | 10000 | 155.5 | 61.2 | 16.6 | 19.2 | 5 | 59 | 19.8 |
| bar | canvas | 10000 | 86.2 | 57.7 | 16.7 | 17.4 | 1 | 53 | 20 |
| scatter | svg | 30 | 25.9 | 15.1 | 16.6 | 18.5 | 0 | 182 | 4.4 |
| scatter | svg | 90 | 23.9 | 14.9 | 16.7 | 20.1 | 0 | 53 | 4.4 |
| scatter | svg | 365 | 24 | 14.6 | 16.6 | 17.7 | 0 | 61 | 4.6 |
| scatter | svg | 1000 | 29.7 | 14.4 | 16.6 | 19.2 | 0 | 65 | 4.9 |
| scatter | canvas | 1000 | 25.1 | 15.2 | 16.6 | 19 | 0 | 60 | 4.8 |
| scatter | svg | 10000 | 56.9 | 44.8 | 16.6 | 19.1 | 0 | 62 | 9.8 |
| scatter | canvas | 10000 | 29.1 | 50.9 | 16.6 | 20.4 | 0 | 57 | 9.5 |
| scatter | svg | 100000 | 334.2 | 572.5 | 16.7 | 458 | 12 | 67 | 72.6 |
| scatter | canvas | 100000 | 49.8 | 417.1 | 16.6 | 20.5 | 6 | 62 | 70 |

## Many charts (365 points each)

| charts | mountMs | filterSwitchMs | resizeMs | hoverP95Ms | longTasks | longestTaskMs | domNodes | heapMB |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 28.5 | 15.4 | 14.6 | 18.6 | 0 | 0 | 80 | 4.9 |
| 10 | 60.6 | 12.1 | 10.4 | 18.2 | 0 | 0 | 611 | 8 |
| 20 | 77.6 | 22.4 | 11.9 | 19.9 | 0 | 0 | 1201 | 10.6 |
| 50 | 147.2 | 45.7 | 43.2 | 18.1 | 1 | 56 | 2971 | 24 |

## Scenarios

| name | p50Ms | p95Ms | heapStartMB | heapEndMB | heapDeltaMB | domNodesAfter |
| --- | --- | --- | --- | --- | --- | --- |
| streaming (1 000-point window) | 15.3 | 16.6 | — | — | — | — |
| leak check (100 × mount/unmount of 10 charts) | — | — | 4.9 | 7.8 | 2.8 | 0 |

## Leak check (10 charts mounted and unmounted, heap after forced GC)

| cycles | heap MB | DOM nodes |
| --- | --- | --- |
| 0 | 3.12 | 0 |
| 50 | 4.89 | 0 |
| 100 | 4.93 | 0 |
| 200 | 5.01 | 0 |
| 300 | 5.04 | 0 |
| 400 | 5.06 | 0 |

Growth after warm-up (cycles 50 → 400, i.e. 3 500 chart mounts): 0.17 MB — one-time caches, no leak.
