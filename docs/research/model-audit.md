# Model provenance and numerical comparison

Baseline: `2a11ae11b754f366a2135e93d87c8cea5ceb33de`. Baseline year remains **2026**. Equations, parameter values/ranges, indicator IDs and CSV column order are unchanged. Monte Carlo uses the same seed (2026), 200 uniform draws and four preset positions.

`model-comparison.json` records all numeric parameter values before and after. `model-comparison.csv` records all 12 indicators × three quantiles × three years (2035, 2050, 2100) × four futures: **432 deltas, all zero**. SHA-256 hashes of the complete exported CSV strings also match for all four futures, including every year 2026–2126. The comparison used a separate temporary extraction of the baseline model files, not an assumed copy of the current model.

## Interpretation corrections

- Parameter provenance is now observed / estimated / derived / calibrated / assumed, with bilingual units, periods, source references and derivation notes.
- 550 TWh is an **estimated 2026 baseline for all data centres**. The original repository did not document an exact interpolation equation. It is neither a direct measurement nor AI-only demand. New IEA estimates refer to 2025 and scenarios to 2030; neither directly replaces that baseline.
- Epoch's 4–5× historical compute trend is not a 2026 observation or a direct measure of capability. Hardware FLOP/s doubling every 2.3 years gives approximately 1.35×/year; price-performance doubling every 2.1 years is a different quantity. Mapping either to model capability remains assumed.
- The “today” matrix clips the upper 5× endpoint to 1; the unclipped range and inherited rubric date are displayed. Peace scores are editorial judgments, not measured confidence intervals.
- Historical Gini, industrial-robot stock and climate measurements carried into the 2026 baseline retain their original observation periods. Contextual citations do not convert assumptions into observations.
- Calibration targets and tolerances are editorial choices, including the population target. They are not independent validation or official estimates of every coefficient.
- p10–p90 bands are **conditional scenario sensitivity**, not empirical forecast intervals or probabilities of the four futures. CSV rows are scenario outputs. `/datos/procedencia.json` is a companion export with the provenance table, source records and limitations; existing CSVs keep their six columns.

## Narrow output fixes

An automation threshold never reached returns `null` and displays “No alcanzado” / “Not reached”, instead of a fabricated year. Population peak detection identifies the global maximum before decline (the end of a maximum plateau), rather than the following declining year. Tests cover both and nonmonotonic/plateau cases. Event output differences are recorded alongside CSV hashes; numerical series do not change.

The electricity milestone keeps its stable historical event ID but now states its actual 1,000 TWh threshold. The unsupported comparison with Japan “today” is removed.

## Separate redesign needed

The model can double-count electricity when adding data-centre demand to primary energy; it mixes a fixed electricity share with changing electrification; global averages omit local grids and marginal emissions. Compute-to-capability, automation-to-employment, science and catastrophe mechanisms are stylised assumptions. Population does not respond to simulated catastrophe events, and its ±10% scaling is not an official UN confidence interval. These limitations are disclosed; resolving them would change model structure and is outside this implementation.
