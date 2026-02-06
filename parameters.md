# Eye focus area (raw: x,y or bounding box / area of gaze)
- `gaze_mean_x`, `gaze_mean_y` (average gaze coordinates)
- `gaze_std_x`, `gaze_std_y` (dispersion)
- `gaze_dispersion` = sqrt(var_x + var_y) (measure of fixation spread)
- `gaze_velocity_mean` = mean( sqrt((dx/dt)^2 + (dy/dt)^2) )
- `gaze_fixation_count` = number of fixations (use threshold on velocity)
- `percentage_on_target` = fraction of gaze samples inside active window/interest area (if available)
- `gaze_entropy` = entropy of gaze positions across a grid (higher = more wandering)

# Mouse cursor velocity / movement
- `mouse_mean_vel` = mean(|v|) over window.
- `mouse_std_vel`, `mouse_max_vel`
- `mouse_total_dist` = sum of |delta_pos|
- `mouse_idle_time_ratio` = fraction of window with no movement for >= X ms (e.g., 2000 ms)
- `mouse_click_count`
- `mouse_direction_changes` = number of sign changes in angular velocity

# Scrolling pattern
- `scroll_mean_rate` = avg px/sec or events/sec
- `scroll_std_rate`, `scroll_bursts` = count of scroll events above threshold
- `scroll_direction_changes`
- `scroll_idle_ratio` = similar to mouse idle
- `scroll_entropy` or `scroll_sparsity` (how regular the scroll is)

# Tab / clicking frequency
- `tab_switch_count` within window
- `tab_switch_rate` = count / window_duration
- `click_count` (distinct from mouse clicks if already counted)
- `inter_click_interval_mean` and `std`
- `focus_change_events` (blur/focus events count)

# Cross-features / contextual
- `gaze_on_cursor_ratio` = % of time gaze and cursor are within proximity (smaller → possibly multitasking)
- `active_input_ratio` = fraction of window with either mouse or scroll activity
- `tab_click_entropy` = entropy of tab switching (high means many different tabs)
- `time_since_last_tab_switch` (recency)
- `time_of_day_hour_sin/cos` (circadian effects)
- `session_length` (seconds since session start)
- `moving_average_focus_prev_N` (temporal smoothing from previous windows)

## Feature engineering formula examples
- Mean velocity: `mean_v = (1/N) * Σ sqrt((x_i - x_{i-1})^2 + (y_i - y_{i-1})^2) / Δt_i`
- Dispersion: `disp = sqrt( var(x) + var(y) )`
- Entropy on binned grid: `H = - Σ p_i log p_i`, where p_i is fraction of gaze in bin i.