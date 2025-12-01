# Enhanced Power Flow Card - Complete Documentation

[![Version](https://img.shields.io/badge/version-3.0.5-blue.svg)](https://github.com/NXJim/enhanced-power-flow-card)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> ⚠️ **DISCLAIMER**: This card was designed specifically for the author's home energy system setup and use-case. While efforts have been made to make it flexible and customizable, it may not fit every configuration out of the box. Users install and use this card at their own risk. Please test thoroughly in your environment and report any issues. The author may or may not have time to update the card or troubleshoot bugs.

A highly customizable Home Assistant Lovelace card for visualizing power flow between AC input (grid/generator), inverter/charger, battery, DC system (solar/wind), and AC output (loads) with animated flow indicators and real-time updates.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
  - [Manual Installation](#manual-installation)
  - [Adding the Resource](#adding-the-resource)
- [Quick Start](#quick-start)
- [Configuration Reference](#configuration-reference)
  - [Card Options](#card-options)
  - [Entity Configuration](#entity-configuration)
  - [Flow Colors](#flow-colors)
- [Advanced Features](#advanced-features)
  - [Template Support](#template-support)
  - [Flow Control Logic](#flow-control-logic)
  - [Binary Sensor Control](#binary-sensor-control)
- [Styling with card-mod](#styling-with-card-mod)
- [Complete Examples](#complete-examples)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

- 🎨 **Fully Customizable Appearance**
  - Adjustable line thickness (0.1-10px)
  - Configurable corner radius (0-50px)
  - Endpoint circles at flow connections
  - Adjustable glow effects for lines and indicators
  - Four flow shapes: circle, oval, squircle, square

- 🔄 **Animated Flow Indicators**
  - Real-time visual feedback
  - Speed adjusts based on power magnitude
  - Dynamic color changes for positive/negative flow
  - Smooth animations with proper easing

- 🎯 **Smart Flow Control**
  - Inverter state-based flow direction (bulk/absorption/float/inverting/assisting)
  - Binary sensor support for manual flow enable/disable
  - Automatic gray-out when flows are inactive
  - Minimum flow threshold prevents flickering

- 📊 **Rich Data Display**
  - Main value with custom unit
  - Secondary value (entity ID or template)
  - Tertiary value (entity ID or template)
  - Battery: SoC + separate power display
  - Customizable icons and labels per node

- 🌈 **Flexible Color System**
  - Per-entity positive/negative colors
  - Per-flow-path color overrides
  - Default color schemes included
  - Supports hex, rgb, rgba formats

- 📱 **Responsive Design**
  - Adapts to different screen sizes
  - Dynamic path recalculation on resize
  - Touch-friendly node interactions
  - Clamp-based sizing for mobile support

- ⚡ **Performance Optimized**
  - Debounced resize handlers (100ms)
  - Efficient SVG rendering
  - Minimal DOM manipulation
  - Proper cleanup on disconnect

---

## Installation

### HACS Installation (Recommended)

This card is available via HACS as a custom repository:

1. Open HACS in Home Assistant
2. Go to **Frontend** section
3. Click the **⋮** (three dots menu) in the top right
4. Select **Custom repositories**
5. Add repository URL: `https://github.com/NXJim/enhanced-power-flow-card`
6. Select category: **Lovelace**
7. Click **Add**
8. Find "Enhanced Power Flow Card" in the list and click **Download**
9. Restart Home Assistant
10. Clear browser cache (Ctrl + F5)

### Manual Installation

Alternatively, install manually:

#### Step 1: Download the Card

Download the JavaScript file from GitHub:
- [enhanced-power-flow-card.js](https://raw.githubusercontent.com/NXJim/enhanced-power-flow-card/master/enhanced-power-flow-card.js)

Or use wget/curl:
```bash
# Using wget
wget https://raw.githubusercontent.com/NXJim/enhanced-power-flow-card/master/enhanced-power-flow-card.js -O /config/www/enhanced-power-flow-card.js

# Using curl
curl -o /config/www/enhanced-power-flow-card.js https://raw.githubusercontent.com/NXJim/enhanced-power-flow-card/master/enhanced-power-flow-card.js
```

#### Step 2: Copy to www Folder

1. Navigate to your Home Assistant `config` directory
2. If the `www` folder doesn't exist, create it:
   ```bash
   mkdir -p /config/www
   ```
3. Copy `enhanced-power-flow-card.js` to `/config/www/`
4. Verify file permissions (Linux/Docker):
   ```bash
   chmod 644 /config/www/enhanced-power-flow-card.js
   chown homeassistant:homeassistant /config/www/enhanced-power-flow-card.js
   ```

#### Step 3: Verify Installation

Check the file is accessible:
```bash
ls -lah /config/www/enhanced-power-flow-card.js
```

Expected output:
```
-rw-r--r-- 1 homeassistant homeassistant 89K Dec 1 12:00 enhanced-power-flow-card.js
```

### Adding the Resource

You must register the JavaScript file as a Lovelace resource.

#### Option 1: Via UI (Recommended for Beginners)

1. **Navigate to Resources:**
   - Go to **Settings** → **Dashboards**
   - Click the **three-dot menu** (⋮) in the top right
   - Select **Resources**

2. **Add Resource:**
   - Click **"+ Add Resource"** button
   - Enter URL: `/local/enhanced-power-flow-card.js`
   - Select Resource type: **"JavaScript Module"**
   - Click **"Create"**

3. **Verify:**
   - You should see the resource listed
   - Note the version number displayed in browser console

4. **Refresh Browser:**
   - **Windows/Linux**: Ctrl + Shift + R or Ctrl + F5
   - **Mac**: Cmd + Shift + R
   - This clears cache and loads the new resource

#### Option 2: Via YAML Configuration

If using YAML mode for Lovelace:

**Edit `configuration.yaml`:**
```yaml
lovelace:
  mode: yaml
  resources:
    - url: /local/enhanced-power-flow-card.js
      type: module
```

**Or edit `ui-lovelace.yaml` directly:**
```yaml
resources:
  - url: /local/enhanced-power-flow-card.js
    type: module

views:
  # Your views here
```

**After editing:**
1. **Check Configuration**: Settings → System → Check Configuration
2. **Restart Home Assistant**: Settings → System → Restart
3. **Clear Browser Cache**: Ctrl + F5

#### Verification

Check if the card loaded successfully:

1. **Open Browser Console** (F12)
2. Look for the version message:
   ```
   Enhanced Power Flow Card v3.0.5
   ```
3. If you see errors, check the [Troubleshooting](#troubleshooting) section

---

## Quick Start

### Absolute Minimum Configuration

The simplest possible card (one entity):

```yaml
type: custom:enhanced-power-flow-card
entities:
  ac_input:
    entity: sensor.grid_power
    name: Grid
    unit: W
```

This displays:
- Single node (AC Input)
- No flows (need at least 2 nodes for a flow)
- Default styling

### Basic Two-Node Configuration

Minimal setup with one flow:

```yaml
type: custom:enhanced-power-flow-card
entities:
  ac_input:
    entity: sensor.grid_power
    name: Grid
    unit: W
    icon: mdi:transmission-tower

  inverter_charger:
    entity: sensor.inverter_power
    name: Inverter
    unit: W
    icon: mdi:sync
```

This displays:
- Two nodes connected by animated flow
- Flow direction based on power sign
- Default colors and styling

### Recommended Starting Configuration

A practical complete setup:

```yaml
type: custom:enhanced-power-flow-card
title: Power Flow

entities:
  ac_input:
    entity: sensor.grid_power
    name: Grid
    unit: W
    icon: mdi:transmission-tower

  ac_output:
    entity: sensor.load_power
    name: Loads
    unit: W
    icon: mdi:home

  inverter_charger:
    entity: sensor.inverter_power
    name: Inverter
    unit: W
    icon: mdi:sync
    tertiary: sensor.inverter_state

  battery:
    entity: sensor.battery_soc
    power_entity: sensor.battery_power
    power_unit: W
    name: Battery
    unit: '%'
    icon: mdi:battery

  dc:
    entity: sensor.solar_power
    name: Solar
    unit: W
    icon: mdi:solar-power
```

---

## Configuration Reference

### Card Options

These options control the overall card appearance and behavior.

| Name | Type | Default | Range | Description |
|------|------|---------|-------|-------------|
| `type` | string | **required** | - | Must be `custom:enhanced-power-flow-card` |
| `title` | string | none | - | Card title displayed at top |
| `show_background` | boolean | `true` | - | Show gradient background and styling |
| `line_width` | number | `2` | 0.1-10 | Flow line thickness in pixels |
| `corner_radius` | number | `8` | 0-50 | Corner rounding radius in pixels |
| `ball_diameter` | number | `4` | 1-20 | Size of animated flow indicator |
| `shape` | string | `oval` | see below | Flow indicator shape |
| `line_glow_size` | number | `3` | 0-20 | Glow effect size for lines |
| `ball_glow_size` | number | `3` | 0-20 | Glow effect size for flow indicators |
| `line_glow_brightness` | number | `0.4` | 0-1 | Line glow intensity (0=off, 1=max) |
| `ball_glow_brightness` | number | `1` | 0-1 | Flow indicator glow intensity |
| `entities` | object | **required** | - | Entity configurations (see below) |
| `flow_colors` | object | none | - | Override colors for flow paths |

#### Shape Options

| Value | Description | Visual |
|-------|-------------|--------|
| `circle` | Perfect circle | ● |
| `oval` | Horizontal ellipse (default) | ⬭ |
| `squircle` | Rounded square | ▢ |
| `square` | Perfect square | ■ |

#### Appearance Examples

**Minimal (no glow):**
```yaml
line_width: 1
line_glow_size: 0
ball_glow_size: 0
show_background: false
```

**Bold with strong glow:**
```yaml
line_width: 4
ball_diameter: 8
line_glow_size: 6
ball_glow_size: 6
line_glow_brightness: 0.8
ball_glow_brightness: 1
```

**Sharp geometric:**
```yaml
corner_radius: 0
shape: square
ball_diameter: 6
```

---

### Entity Configuration

The `entities` object contains up to five nodes. Each is optional—omit any you don't need.

#### Available Nodes

| Node Key | Position | Purpose |
|----------|----------|---------|
| `ac_input` | Top Left | Grid, generator, or AC source |
| `ac_output` | Top Right | AC loads, house consumption |
| `inverter_charger` | Center | Inverter/charger (hub) |
| `battery` | Bottom Left | Battery bank with SoC |
| `dc` | Bottom Right | DC sources (solar, wind) |

#### Common Properties (All Nodes)

These properties work on all five node types:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `entity` | string | none | Home Assistant entity ID for main value |
| `name` | string | none | Display name (supports templates) |
| `unit` | string | none | Unit of measurement |
| `icon` | string | none | Material Design Icon (e.g., `mdi:home`) |
| `secondary` | string | none | Secondary value (entity ID or template) |
| `secondary_unit` | string | none | Unit for secondary value |
| `tertiary` | string | none | Tertiary value (entity ID or template) |
| `tertiary_unit` | string | none | Unit for tertiary value |
| `color_positive` | string | auto | Hex color for positive flow |
| `color_negative` | string | auto | Hex color for negative flow |
| `invert` | boolean | `false` | Reverse flow direction |
| `positive` | boolean | `false` | Force value to absolute (always positive) |

#### AC Input Node (`ac_input`)

Represents grid power, generator, or primary AC source.

**Example:**
```yaml
ac_input:
  entity: sensor.grid_power
  name: Grid
  unit: W
  icon: mdi:transmission-tower
  secondary: sensor.grid_voltage
  secondary_unit: V
  tertiary: sensor.grid_frequency
  tertiary_unit: Hz
  color_positive: '#2f80ed'
  color_negative: '#f2994a'
  invert: false
```

**Flow Behavior:**
- **Positive value**: Power flowing from grid → inverter (blue arrow)
- **Negative value**: Power flowing from inverter → grid (orange arrow)
- **Use `invert: true`** to reverse this behavior

**Common Use Cases:**
```yaml
# Grid connection
ac_input:
  entity: sensor.grid_import_export
  name: Grid
  # Positive = importing, Negative = exporting

# Generator
ac_input:
  entity: sensor.generator_power
  name: Generator
  positive: true  # Generator can't export
  icon: mdi:engine
```

---

#### AC Output Node (`ac_output`)

Represents AC loads, house consumption, or critical loads.

**Example:**
```yaml
ac_output:
  entity: sensor.house_load
  name: House Load
  unit: W
  icon: mdi:home
  secondary: sensor.critical_loads
  secondary_unit: W
  positive: true
```

**Flow Behavior:**
- **Positive value**: Power flowing from inverter → loads (orange arrow)
- **Negative value**: Rare; power flowing from loads → inverter

**Common Use Cases:**
```yaml
# Total house load
ac_output:
  entity: sensor.total_load
  name: AC Output
  positive: true
  secondary: sensor.non_essential_load
  secondary_unit: W

# Critical loads only
ac_output:
  entity: sensor.critical_loads
  name: Critical
  icon: mdi:lightning-bolt
```

---

#### Inverter-Charger Node (`inverter_charger`)

The center hub connecting all other nodes.

**Additional Properties:**

| Name | Type | Description |
|------|------|-------------|
| `dc_flow_template` | string | Binary sensor to enable/disable inverter→DC flow |

**Example:**
```yaml
inverter_charger:
  entity: sensor.inverter_power
  name: Multiplus II
  unit: W
  icon: mdi:sync
  secondary: sensor.inverter_voltage
  secondary_unit: V
  tertiary: sensor.inverter_state
  dc_flow_template: binary_sensor.dc_feed_enabled
```

**Auto-Calculated Power:**

If you omit `entity`, the card calculates:
```
inverter_power = ac_input - ac_output
```

```yaml
inverter_charger:
  name: Inverter
  unit: W
  # No entity = auto-calculate
```

**Tertiary State Controls Battery Flow:**

The `tertiary` field should contain the inverter's operational state:

| State | Direction | Description |
|-------|-----------|-------------|
| `bulk` | Inverter → Battery | Bulk charging |
| `absorption` | Inverter → Battery | Absorption charging |
| `float` | Inverter → Battery | Float/maintenance |
| `inverting` | Battery → Inverter | Discharging to AC |
| `assisting` | Battery → Inverter | Assisting grid/generator |
| `power supply` | Battery → Inverter | Power supply mode |
| **any other** | Gray (inactive) | No flow animation |

```yaml
inverter_charger:
  tertiary: sensor.ve_bus_state
  # Must output one of the states above
```

**DC Flow Control:**

Use `dc_flow_template` to enable/disable the inverter→DC flow:

```yaml
inverter_charger:
  dc_flow_template: binary_sensor.pv_connected
  # on = flow enabled
  # off = flow gray (dormant)
```

---

#### Battery Node (`battery`)

Displays battery state-of-charge and power.

**Additional Properties:**

| Name | Type | Description |
|------|------|-------------|
| `power_entity` | string | Separate entity for battery power (if different from SoC) |
| `power_unit` | string | Unit for power entity (default: `W`) |
| `flow_state_entity` | string | Entity showing charge/discharge state for display |
| `dc_flow_template` | string | Binary sensor to enable/disable battery→DC flow |
| `invert_to_battery` | boolean | Invert battery→DC flow direction |

**Example:**
```yaml
battery:
  entity: sensor.battery_soc
  power_entity: sensor.battery_power
  power_unit: W
  name: LiFePO4 Bank
  unit: '%'
  icon: mdi:battery
  flow_state_entity: sensor.battery_state
  secondary: sensor.battery_voltage
  secondary_unit: V
  tertiary: sensor.battery_temperature
  tertiary_unit: °C
  dc_flow_template: binary_sensor.battery_dc_enabled
  invert: false
  invert_to_battery: false
```

**Display Layout:**
```
┌─────────────┐
│  [Icon]     │
│  BATTERY    │
│  Charging   │ ← flow_state_entity (optional)
│  85%        │ ← entity (SoC)
│  -1250 W    │ ← power_entity
│  51.2 V     │ ← secondary
│  25°C       │ ← tertiary
└─────────────┘
```

**Flow State Display:**

The `flow_state_entity` shows as text above SoC:

| Entity Value | Display |
|--------------|---------|
| `on`, `true`, `1` | "Charging" |
| `off`, `false`, `0` | "Discharging" |
| `numeric >= 0.5` | "Charging" |
| `numeric < 0.5` | "Discharging" |
| `"bulk"` | "Bulk" |
| Any other string | Capitalized string |

**Flow Direction Control:**

- `invert`: Reverses inverter↔battery flow
- `invert_to_battery`: Reverses battery↔DC flow

---

#### DC System Node (`dc`)

Represents DC sources like solar panels, wind turbines, or DC loads.

**Additional Properties:**

| Name | Type | Description |
|------|------|-------------|
| `invert` | boolean | Invert flow direction from inverter→DC |

**Example:**
```yaml
dc:
  entity: sensor.solar_power
  name: Solar Array
  unit: W
  icon: mdi:solar-power
  secondary: sensor.solar_voltage
  secondary_unit: V
  tertiary: |
    {{ states('sensor.solar_energy_today') | float | round(1) }}
  tertiary_unit: kWh
  positive: true
  invert: false
```

**Flow Behavior:**

- **Normal** (`invert: false`): DC → Inverter (power generation)
- **Inverted** (`invert: true`): Inverter → DC (DC loads)

**Common Use Cases:**

```yaml
# Solar panels
dc:
  entity: sensor.pv_power
  positive: true  # Can't generate negative

# Wind turbine
dc:
  entity: sensor.wind_power
  icon: mdi:wind-turbine

# DC loads
dc:
  entity: sensor.dc_loads
  name: DC Loads
  invert: true  # Consuming power
```

---

### Flow Colors

Override default colors for specific flow paths between nodes.

**Available Paths:**

| Path Key | Description | Nodes Connected |
|----------|-------------|-----------------|
| `inverter_battery` | Inverter ↔ Battery | Center ↔ Bottom Left |
| `battery_dc` | Battery ↔ DC | Bottom Left ↔ Bottom Right |
| `inverter_dc` | Inverter ↔ DC | Center ↔ Bottom Right |

**Default Colors:**

Without overrides, colors come from entity-specific settings or these defaults:

```javascript
{
  ac_input: { positive: '#2f80ed', negative: '#f2994a' },      // Blue/Orange
  ac_output: { positive: '#f2994a', negative: '#2f80ed' },     // Orange/Blue
  inverter_charger: { positive: '#f2994a', negative: '#2f80ed' },
  battery: { positive: '#2f80ed', negative: '#f2994a' },       // Blue/Orange
  dc: { positive: '#27ae60', negative: '#f2994a' }             // Green/Orange
}
```

**Override Example:**

```yaml
flow_colors:
  inverter_battery:
    positive: '#00ff00'  # Green for charging
    negative: '#ff0000'  # Red for discharging

  battery_dc:
    positive: '#ffff00'  # Yellow
    negative: '#ff00ff'  # Magenta

  inverter_dc:
    positive: '#00ffff'  # Cyan
    negative: '#ff9900'  # Orange
```

**Color Priority (highest to lowest):**

1. `flow_colors` overrides (this section)
2. Entity-specific colors (`color_positive`, `color_negative`)
3. Default colors (`FLOW_COLOR_DEFAULTS`)

**Color Format:**

Supports hex colors only in configuration:
- `#RGB` - Short hex
- `#RRGGBB` - Full hex
- `#RRGGBBAA` - With alpha (transparency)

For RGB/RGBA, use card-mod styling.

---

## Advanced Features

### Template Support

Use Jinja2 templates in `secondary`, `tertiary`, `name`, and `icon` fields for dynamic values.

#### Template Basics

**Direct entity reference:**
```yaml
secondary: sensor.voltage
# Displays the state of sensor.voltage
```

**Simple template:**
```yaml
secondary: "{{ states('sensor.power') | float }}"
# Converts to number
```

**With unit conversion:**
```yaml
secondary: "{{ (states('sensor.power') | float / 1000) | round(2) }}"
secondary_unit: kW
# Divides watts by 1000 for kilowatts
```

#### Conditional Templates

**If/else statement:**
```yaml
tertiary: >
  {% if is_state('binary_sensor.charging', 'on') %}
    Charging
  {% else %}
    Idle
  {% endif %}
```

**Multiple conditions:**
```yaml
tertiary: >
  {% if states('sensor.battery_soc') | float < 20 %}
    Low Battery!
  {% elif states('sensor.battery_soc') | float > 90 %}
    Fully Charged
  {% else %}
    Normal
  {% endif %}
```

#### Math Operations

**Temperature conversion:**
```yaml
secondary: "{{ (states('sensor.temp_c') | float * 9/5 + 32) | round(1) }}"
secondary_unit: °F
```

**Calculate current:**
```yaml
secondary: >
  {% set power = states('sensor.power') | float %}
  {% set voltage = states('sensor.voltage') | float %}
  {{ (power / voltage) | round(1) if voltage > 0 else 0 }}
secondary_unit: A
```

**Energy calculation:**
```yaml
tertiary: >
  {{ ((states('sensor.power') | float) *
      (states('sensor.runtime') | float / 3600)) | round(2) }}
tertiary_unit: kWh
```

#### State Attributes

**Access entity attributes:**
```yaml
secondary: "{{ state_attr('sensor.inverter', 'voltage') }}"
secondary_unit: V
```

**With fallback:**
```yaml
secondary: "{{ state_attr('sensor.inverter', 'voltage') | default(0) }}"
```

#### Python-style Conditionals

The card supports Python's inline if/else:

```yaml
secondary: "{{ 'Online' if is_state('binary_sensor.connected', 'on') else 'Offline' }}"
```

Converted internally to:
```javascript
(is_state('binary_sensor.connected', 'on') ? 'Online' : 'Offline')
```

#### Variable Assignment

Use `{% set %}` for complex calculations:

```yaml
tertiary: |
  {% set soc = states('sensor.battery_soc') | float %}
  {% set capacity = 200 %}
  {% set remaining = (soc / 100 * capacity) | round(1) %}
  {{ remaining }}
tertiary_unit: Ah
```

#### Template Filters

**Supported filters:**

| Filter | Example | Result |
|--------|---------|--------|
| `float` | `{{ '123.45' \| float }}` | 123.45 |
| `int` | `{{ '123.45' \| int }}` | 123 |
| `round(n)` | `{{ 123.456 \| round(2) }}` | 123.46 |
| `abs` | `{{ -50 \| abs }}` | 50 |
| `default(x)` | `{{ none \| default(0) }}` | 0 |

**Chain filters:**
```yaml
secondary: "{{ states('sensor.temp') | float | round(1) }}"
```

#### Entity State Checks

**Binary sensor:**
```yaml
tertiary: >
  {{ 'Active' if is_state('binary_sensor.running', 'on') else 'Stopped' }}
```

**Numeric comparison:**
```yaml
tertiary: >
  {{ 'High' if states('sensor.power') | float > 1000 else 'Normal' }}
```

#### Template Debugging

Test templates in **Developer Tools → Template**:

```jinja2
{% set power = states('sensor.power') | float %}
{% set voltage = states('sensor.voltage') | float %}
Current: {{ (power / voltage) | round(1) if voltage > 0 else 0 }} A
```

---

### Flow Control Logic

Understanding how the card decides when and how to animate flows.

#### Flow Activation Threshold

All flows activate when:
```
absolute_value > 0.05
```

Below this threshold, flows appear gray (inactive).

#### AC Input/Output Flows

**Formula:**
```javascript
flowSpeed = max(1.5, 5 - (power / maxRange) * 3.5)
```

- **Low power** (< 100W): Slow animation (~5 seconds)
- **Medium power** (~2500W): Medium speed (~3.25 seconds)
- **High power** (> 5000W): Fast animation (~1.5 seconds)

**Direction:**
- **Positive value**: Forward direction
- **Negative value**: Reverse direction
- **`invert: true`**: Swaps directions

**maxRange values:**
- AC flows: 5000W
- Inverter→Battery: 1800W
- Inverter→DC: 1000W
- Battery→DC: 360W

#### Inverter↔Battery Flow

**Controlled by inverter tertiary state.**

**Example configuration:**
```yaml
inverter_charger:
  tertiary: sensor.ve_bus_state
```

**State behavior:**

| Tertiary Value | Flow Direction | Visual |
|----------------|----------------|--------|
| `bulk` | Inverter → Battery | Blue arrow →  |
| `absorption` | Inverter → Battery | Blue arrow → |
| `float` | Inverter → Battery | Blue arrow → |
| `inverting` | Battery → Inverter | Orange arrow ← |
| `assisting` | Battery → Inverter | Orange arrow ← |
| `power supply` | Battery → Inverter | Orange arrow ← |
| **anything else** | None | Gray line (no animation) |

**String matching:**
- Case-insensitive
- Trimmed whitespace
- Exact match required

**Flow value:**
```javascript
flowValue = Math.abs(batteryPower) || 0.5
```

Even at 0W, the flow shows 0.5W minimum to prevent gray-out during active states.

**Direction override:**
```yaml
battery:
  invert: true
  # Reverses charging/discharging direction
```

#### DC System Flows

**Two separate flows:**
1. **Inverter → DC** (or reverse)
2. **Battery → DC** (or reverse)

**Manual control via binary sensors:**

```yaml
inverter_charger:
  dc_flow_template: binary_sensor.pv_connected

battery:
  dc_flow_template: binary_sensor.battery_dc_enabled
```

**Binary sensor states:**

| Value | Flow Behavior |
|-------|---------------|
| `on`, `true`, `1` | **Active** - Animated flow |
| `off`, `false`, `0` | **Dormant** - Gray line |
| `undefined` | **Hidden** - No line at all |

**Flow magnitude:**

When enabled, uses highest of:
```javascript
max(
  abs(dcValue),
  abs(batteryValue),
  abs(inverterValue),
  1  // Minimum
)
```

**Direction control:**

```yaml
dc:
  invert: true
  # Inverter→DC becomes Inverter←DC

battery:
  invert_to_battery: true
  # Battery→DC becomes Battery←DC
```

#### Flow Colors

**Selection priority:**

1. **Check `flow_colors` overrides**
   ```yaml
   flow_colors:
     inverter_battery:
       positive: '#00ff00'
   ```

2. **Check entity colors**
   ```yaml
   battery:
     color_positive: '#2f80ed'
     color_negative: '#f2994a'
   ```

3. **Use defaults**
   ```javascript
   FLOW_COLOR_DEFAULTS.battery
   ```

**Direction determines positive/negative:**
- **Charging** (inverter → battery): Uses `positive` color
- **Discharging** (battery → inverter): Uses `negative` color

#### Gray (Dormant) State

Flows become gray when:
- Below activation threshold (< 0.05)
- Binary sensor is `off`
- Inverter state is not recognized
- Node is hidden

**Visual appearance:**
- Color: `#666666`
- Opacity: 0.3
- No animation
- Endpoint circles also gray

---

### Binary Sensor Control

Create template binary sensors for advanced flow logic.

#### Basic Binary Sensor

```yaml
# configuration.yaml
template:
  - binary_sensor:
      - name: "DC Feed Enabled"
        state: "{{ states('sensor.solar_power') | float > 10 }}"
```

Use in card:
```yaml
inverter_charger:
  dc_flow_template: binary_sensor.dc_feed_enabled
```

#### Time-Based Control

```yaml
template:
  - binary_sensor:
      - name: "Daytime Solar Active"
        state: >
          {{ now().hour >= 6 and now().hour <= 18 and
             states('sensor.solar_power') | float > 50 }}
```

#### Multi-Condition Logic

```yaml
template:
  - binary_sensor:
      - name: "Battery DC Enabled"
        state: >
          {{
            is_state('sensor.battery_state', 'discharging') and
            states('sensor.battery_soc') | float > 20 and
            states('sensor.dc_load') | float > 10
          }}
```

#### State-Based Enable

```yaml
template:
  - binary_sensor:
      - name: "Grid Feed Enabled"
        state: >
          {{
            states('sensor.grid_power') | float < -100 and
            is_state('binary_sensor.grid_connected', 'on')
          }}
```

#### With Hysteresis

Prevent flickering with hysteresis:

```yaml
template:
  - binary_sensor:
      - name: "High Power Mode"
        state: >
          {% set power = states('sensor.power') | float %}
          {% set current = states('binary_sensor.high_power_mode') %}
          {% if current == 'on' %}
            {{ power > 800 }}
          {% else %}
            {{ power > 1000 }}
          {% endif %}
```

**Explanation:**
- **Turn ON**: Power > 1000W
- **Turn OFF**: Power < 800W
- **200W hysteresis** prevents rapid toggling

#### Example Integration

Full configuration with binary sensors:

```yaml
# configuration.yaml
template:
  - binary_sensor:
      # Enable inverter→DC when solar producing
      - name: "PV Feed Active"
        state: "{{ states('sensor.solar_power') | float > 50 }}"

      # Enable battery→DC when battery high and DC loads present
      - name: "Battery DC Feed"
        state: >
          {{
            states('sensor.battery_soc') | float > 60 and
            states('sensor.dc_loads') | float > 20
          }}
```

```yaml
# Lovelace card
type: custom:enhanced-power-flow-card
entities:
  inverter_charger:
    entity: sensor.inverter_power
    dc_flow_template: binary_sensor.pv_feed_active

  battery:
    entity: sensor.battery_soc
    dc_flow_template: binary_sensor.battery_dc_feed
```

---

## Styling with card-mod

Extensive customization using [card-mod](https://github.com/thomasloven/lovelace-card-mod).

### Prerequisites

**Install card-mod:**
1. Via HACS: Search "card-mod" and install
2. Add resource (if not auto-added):
   ```yaml
   resources:
     - url: /hacsfiles/lovelace-card-mod/card-mod.js
       type: module
   ```
3. Restart Home Assistant

### Basic Syntax

```yaml
type: custom:enhanced-power-flow-card
card_mod:
  style: |
    /* CSS styles here */
    .selector {
      property: value !important;
    }
entities:
  # ... your config
```

**Important notes:**
- Use `!important` to override existing styles
- Styles must be inside `card_mod: style: |`
- Use CSS syntax (not YAML)

### Node Styling

#### All Nodes

```yaml
card_mod:
  style: |
    /* Change all node backgrounds */
    .node {
      background: rgba(30, 30, 30, 0.95) !important;
      border: 2px solid #00ff00 !important;
      border-radius: 20px !important;
    }
```

#### Specific Node by ID

Available IDs:
- `#ac-in-node` - AC Input (top left)
- `#ac-output-node` - AC Output (top right)
- `#inverter-node` - Inverter (center)
- `#battery-node` - Battery (bottom left)
- `#dc-node` - DC System (bottom right)

```yaml
card_mod:
  style: |
    /* Style specific nodes */
    #ac-in-node {
      background: linear-gradient(135deg, #1a4d2e 0%, #0f2419 100%) !important;
      border-color: #00ff00 !important;
    }

    #inverter-node {
      border: 3px solid #ffd700 !important;
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.6) !important;
    }

    #battery-node {
      transform: scale(1.1) !important;
    }
```

#### Node Hover Effects

```yaml
card_mod:
  style: |
    .node:hover {
      transform: translateY(-4px) scale(1.05) !important;
      box-shadow: 0 8px 30px rgba(0, 255, 136, 0.5) !important;
      border-color: #00ff88 !important;
    }
```

#### Node Animations

```yaml
card_mod:
  style: |
    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 0 10px rgba(47, 128, 237, 0.5);
      }
      50% {
        box-shadow: 0 0 30px rgba(47, 128, 237, 1);
      }
    }

    #inverter-node {
      animation: pulse 2s infinite !important;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    #dc-node .node-icon {
      animation: rotate 10s linear infinite !important;
    }
```

### Text Styling

#### All Text Elements

```yaml
card_mod:
  style: |
    /* Node titles */
    .node .title {
      font-size: 1em !important;
      color: #00ff00 !important;
      font-weight: 700 !important;
      letter-spacing: 1px !important;
      text-shadow: 0 0 5px rgba(0, 255, 0, 0.5) !important;
    }

    /* Main values */
    .node .value {
      font-size: 1.8em !important;
      color: #ffd700 !important;
      font-family: 'Courier New', monospace !important;
      font-weight: 800 !important;
    }

    /* Secondary/tertiary text */
    .node .secondary,
    .node .tertiary {
      color: #aaaaaa !important;
      font-style: italic !important;
      font-size: 0.85em !important;
    }

    /* Battery power display */
    .battery-power {
      color: #ff6b6b !important;
      font-weight: 700 !important;
    }
```

#### Specific Node Text

```yaml
card_mod:
  style: |
    /* AC Input value only */
    #ac-in-node .value {
      color: #2f80ed !important;
    }

    /* Battery title */
    #battery-node .title {
      color: #27ae60 !important;
    }
```

### Flow Line Styling

#### All Flow Lines

```yaml
card_mod:
  style: |
    /* All flow paths */
    .flow {
      stroke-width: 5 !important;
      opacity: 0.9 !important;
      stroke-linecap: round !important;
    }

    /* Active flows */
    .flow.active {
      filter: drop-shadow(0 0 10px currentColor) !important;
    }

    /* Inactive flows */
    .flow.inactive {
      stroke: #444 !important;
      opacity: 0.4 !important;
      stroke-dasharray: 8, 4 !important;
    }
```

#### Specific Flow Lines

Available IDs:
- `#flow-ac` - AC Input → Inverter
- `#flow-load` - Inverter → AC Output
- `#flow-inverter-bat` - Inverter ↔ Battery
- `#flow-dc-in` - Inverter → DC
- `#flow-dc-out` - Battery → DC

```yaml
card_mod:
  style: |
    #flow-ac {
      stroke: #00ff00 !important;
      stroke-width: 6 !important;
    }

    #flow-load {
      stroke: #ff0000 !important;
    }

    #flow-inverter-bat {
      stroke: #ffff00 !important;
      filter: drop-shadow(0 0 15px #ffff00) !important;
    }
```

#### Dashed Lines

```yaml
card_mod:
  style: |
    .flow {
      stroke-dasharray: 10, 5 !important;
    }

    /* Different pattern for inactive */
    .flow.inactive {
      stroke-dasharray: 4, 4 !important;
    }
```

### Endpoint Circle Styling

```yaml
card_mod:
  style: |
    /* All endpoint circles */
    .endpoint-circle {
      fill: #ffffff !important;
      opacity: 1 !important;
    }

    /* Active endpoints */
    .endpoint-circle.active {
      fill: #00ff00 !important;
      filter: drop-shadow(0 0 5px #00ff00) !important;
    }

    /* Inactive endpoints */
    .endpoint-circle.inactive {
      fill: #666 !important;
      opacity: 0.5 !important;
    }

    /* Larger circles */
    .endpoint-circle {
      r: 5 !important;
    }
```

### Flow Indicator (Dot) Styling

```yaml
card_mod:
  style: |
    /* All flow dots */
    .flow-dot {
      fill: #ffffff !important;
    }

    /* Active flow dots */
    .flow-dot.active {
      filter: drop-shadow(0 0 10px currentColor) !important;
    }

    /* Specific flow dot colors */
    .flow-dot-ac {
      color: #00ff00 !important;
    }

    .flow-dot-load {
      color: #ff0000 !important;
    }

    /* Make dots larger (not recommended) */
    .flow-dot {
      transform: scale(1.5) !important;
    }
```

### Card Background

```yaml
card_mod:
  style: |
    /* Custom gradient background */
    ha-card {
      background: linear-gradient(135deg, #2c3e50 0%, #1a1a2e 100%) !important;
      border: 3px solid #00ff88 !important;
      border-radius: 25px !important;
      box-shadow: 0 15px 50px rgba(0, 255, 136, 0.3) !important;
    }

    /* Remove background entirely */
    ha-card {
      background: transparent !important;
      box-shadow: none !important;
      border: none !important;
    }

    /* Glass effect */
    ha-card {
      background: rgba(255, 255, 255, 0.05) !important;
      backdrop-filter: blur(10px) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
    }
```

### Card Title

```yaml
card_mod:
  style: |
    .card-title {
      font-size: 1.5em !important;
      color: #00ff88 !important;
      text-align: center !important;
      font-weight: 800 !important;
      text-transform: uppercase !important;
      letter-spacing: 3px !important;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.5) !important;
    }
```

### Conditional Styling

Use Jinja2 templates for dynamic styles:

```yaml
card_mod:
  style: |
    {% if states('sensor.grid_power') | float > 1000 %}
      #ac-in-node {
        border-color: red !important;
        box-shadow: 0 0 20px rgba(255, 0, 0, 0.6) !important;
      }
    {% elif states('sensor.grid_power') | float < -500 %}
      #ac-in-node {
        border-color: green !important;
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.6) !important;
      }
    {% else %}
      #ac-in-node {
        border-color: yellow !important;
      }
    {% endif %}
```

### Complete Theming Example

**Neon Cyberpunk Theme:**

```yaml
type: custom:enhanced-power-flow-card
title: POWER GRID
card_mod:
  style: |
    /* Dark base with neon accents */
    ha-card {
      background: #0a0a0a !important;
      border: 2px solid #00ff88 !important;
      box-shadow: 0 0 30px rgba(0, 255, 136, 0.3) !important;
    }

    /* Card title */
    .card-title {
      color: #00ff88 !important;
      font-size: 1.8em !important;
      font-weight: 900 !important;
      letter-spacing: 4px !important;
      text-shadow: 0 0 15px rgba(0, 255, 136, 0.8) !important;
    }

    /* All nodes */
    .node {
      background: rgba(0, 20, 40, 0.9) !important;
      border: 2px solid #00ff88 !important;
      backdrop-filter: blur(10px) !important;
    }

    .node:hover {
      transform: translateY(-4px) scale(1.05) !important;
      box-shadow: 0 8px 25px rgba(0, 255, 136, 0.5) !important;
    }

    /* Node text */
    .node .title {
      color: #00ff88 !important;
      text-shadow: 0 0 8px rgba(0, 255, 136, 0.6) !important;
    }

    .node .value {
      color: #00ff88 !important;
      font-weight: 900 !important;
      font-size: 1.6em !important;
      text-shadow: 0 0 12px rgba(0, 255, 136, 0.8) !important;
    }

    /* Flow lines */
    .flow.active {
      stroke: #00ff88 !important;
      stroke-width: 4 !important;
      filter: drop-shadow(0 0 10px #00ff88) !important;
    }

    /* Endpoint circles */
    .endpoint-circle.active {
      fill: #00ff88 !important;
    }

    @keyframes glow {
      0%, 100% {
        filter: drop-shadow(0 0 5px #00ff88);
      }
      50% {
        filter: drop-shadow(0 0 20px #00ff88);
      }
    }

    .endpoint-circle.active {
      animation: glow 2s infinite !important;
    }

    /* Flow dots */
    .flow-dot.active {
      color: #00ff88 !important;
      filter: drop-shadow(0 0 15px #00ff88) !important;
    }

entities:
  # ... your configuration
```

---

## Complete Examples

### Example 1: Full Off-Grid Solar System

```yaml
type: custom:enhanced-power-flow-card
title: Off-Grid Solar Power
show_background: true

# Appearance
line_width: 3
ball_diameter: 6
shape: circle
corner_radius: 10
line_glow_size: 5
ball_glow_size: 5
line_glow_brightness: 0.7
ball_glow_brightness: 1

entities:
  # Generator input
  ac_input:
    entity: sensor.generator_power
    name: Generator
    unit: W
    icon: mdi:engine
    secondary: sensor.generator_runtime
    secondary_unit: hrs
    tertiary: |
      {% if is_state('binary_sensor.generator_running', 'on') %}
        Running
      {% else %}
        Stopped
      {% endif %}
    color_positive: '#e67e22'
    positive: true

  # House loads
  ac_output:
    entity: sensor.total_load
    name: House Load
    unit: W
    icon: mdi:home
    secondary: sensor.critical_load
    secondary_unit: W
    tertiary: sensor.non_critical_load
    tertiary_unit: W
    positive: true
    color_positive: '#f2994a'

  # Inverter/Charger
  inverter_charger:
    name: Victron Multiplus II
    unit: W
    icon: mdi:sync
    secondary: sensor.inverter_voltage
    secondary_unit: V
    tertiary: sensor.ve_bus_state
    dc_flow_template: binary_sensor.pv_connected

  # Battery bank
  battery:
    entity: sensor.battery_soc
    power_entity: sensor.battery_power
    power_unit: W
    name: LiFePO4 24V 400Ah
    unit: '%'
    icon: mdi:battery
    flow_state_entity: sensor.battery_state
    secondary: sensor.battery_voltage
    secondary_unit: V
    tertiary: |
      {{ (states('sensor.battery_time_remaining') | float / 60) | round(1) }}
    tertiary_unit: hrs
    dc_flow_template: binary_sensor.battery_dc_feed

  # Solar array
  dc:
    entity: sensor.solar_power
    name: Solar Array (8x400W)
    unit: W
    icon: mdi:solar-power
    secondary: sensor.solar_voltage
    secondary_unit: V
    tertiary: |
      {{ states('sensor.solar_energy_today') | float | round(1) }}
    tertiary_unit: kWh
    positive: true

# Flow colors
flow_colors:
  inverter_battery:
    positive: '#27ae60'  # Green for charging
    negative: '#e74c3c'  # Red for discharging
  battery_dc:
    positive: '#f39c12'  # Orange
    negative: '#95a5a6'  # Gray
  inverter_dc:
    positive: '#3498db'  # Blue
    negative: '#9b59b6'  # Purple
```

### Example 2: Grid-Tie with Battery Backup

```yaml
type: custom:enhanced-power-flow-card
title: Grid-Tie System
line_width: 2
ball_diameter: 4
shape: oval

entities:
  # Grid connection
  ac_input:
    entity: sensor.grid_import_export
    name: Grid
    unit: W
    icon: mdi:transmission-tower
    secondary: sensor.grid_voltage
    secondary_unit: V
    tertiary: |
      {% if states('sensor.grid_import_export') | float > 0 %}
        Importing {{ (states('sensor.grid_import_export') | float / 1000) | round(2) }} kW
      {% elif states('sensor.grid_import_export') | float < 0 %}
        Exporting {{ (states('sensor.grid_import_export') | float / -1000) | round(2) }} kW
      {% else %}
        Balanced
      {% endif %}

  # Home consumption
  ac_output:
    entity: sensor.home_consumption
    name: Home Load
    unit: W
    icon: mdi:home-lightning-bolt
    positive: true
    secondary: |
      {{ (states('sensor.energy_consumed_today') | float) | round(2) }}
    secondary_unit: kWh today

  # Hybrid inverter
  inverter_charger:
    entity: sensor.inverter_power
    name: Hybrid Inverter
    unit: W
    icon: mdi:sync
    tertiary: sensor.inverter_mode
    dc_flow_template: binary_sensor.solar_active

  # Battery backup
  battery:
    entity: sensor.battery_percentage
    power_entity: sensor.battery_watts
    power_unit: W
    name: Battery Backup
    unit: '%'
    icon: mdi:battery-charging
    flow_state_entity: sensor.battery_charge_state
    secondary: |
      {% set pwr = states('sensor.battery_watts') | float %}
      {% set soc = states('sensor.battery_percentage') | float %}
      {% if pwr > 0 %}
        Charging
      {% elif pwr < 0 %}
        {% set hrs = (soc / 100 * 13.5 / (pwr / -1000)) %}
        {{ hrs | round(1) }} hrs remaining
      {% else %}
        Idle
      {% endif %}

  # Solar panels
  dc:
    entity: sensor.solar_production
    name: Solar (6.4 kW)
    unit: W
    icon: mdi:solar-panel-large
    positive: true
    secondary: |
      {{ (states('sensor.solar_production_today') | float) | round(1) }}
    secondary_unit: kWh today
```

### Example 3: Minimal RV Setup

```yaml
type: custom:enhanced-power-flow-card
title: RV Power
show_background: true
line_width: 2
corner_radius: 8

entities:
  # Shore power / Generator
  ac_input:
    entity: sensor.shore_power
    name: Shore/Gen
    unit: W
    icon: mdi:power-plug

  # RV Loads
  ac_output:
    entity: sensor.rv_load
    name: RV Load
    unit: W
    icon: mdi:rv-truck
    positive: true

  # Inverter
  inverter_charger:
    name: Inverter
    unit: W
    icon: mdi:sync
    tertiary: sensor.inverter_state

  # House battery
  battery:
    entity: sensor.house_battery_soc
    power_entity: sensor.house_battery_power
    power_unit: W
    name: House Battery
    unit: '%'
    icon: mdi:battery-outline
    flow_state_entity: sensor.battery_status

  # Solar on roof
  dc:
    entity: sensor.roof_solar
    name: Roof Solar
    unit: W
    icon: mdi:solar-power
    positive: true
```

### Example 4: Advanced with Card-Mod Styling

```yaml
type: custom:enhanced-power-flow-card
title: ENERGY MANAGEMENT
card_mod:
  style: |
    /* Neon theme */
    ha-card {
      background: radial-gradient(circle at top left, #1a1a2e 0%, #0f0f1e 100%) !important;
      border: 2px solid #00ff88 !important;
      box-shadow: 0 0 40px rgba(0, 255, 136, 0.4), inset 0 0 20px rgba(0, 255, 136, 0.1) !important;
    }

    .card-title {
      color: #00ff88 !important;
      font-size: 2em !important;
      font-weight: 900 !important;
      text-align: center !important;
      letter-spacing: 5px !important;
      text-shadow: 0 0 20px rgba(0, 255, 136, 1) !important;
      margin-bottom: 20px !important;
    }

    .node {
      background: rgba(0, 30, 50, 0.8) !important;
      border: 2px solid #00ff88 !important;
      box-shadow: inset 0 0 15px rgba(0, 255, 136, 0.2), 0 4px 15px rgba(0, 0, 0, 0.5) !important;
    }

    .node:hover {
      transform: translateY(-5px) scale(1.08) !important;
      box-shadow: 0 10px 30px rgba(0, 255, 136, 0.6) !important;
    }

    .node .value {
      color: #00ff88 !important;
      font-size: 2em !important;
      font-weight: 900 !important;
      text-shadow: 0 0 15px rgba(0, 255, 136, 0.9) !important;
    }

    .flow.active {
      stroke: #00ff88 !important;
      stroke-width: 5 !important;
      filter: drop-shadow(0 0 12px #00ff88) drop-shadow(0 0 25px #00ff88) !important;
    }

    @keyframes pulse-endpoint {
      0%, 100% { r: 4; opacity: 1; }
      50% { r: 6; opacity: 0.7; }
    }

    .endpoint-circle.active {
      fill: #00ff88 !important;
      animation: pulse-endpoint 1.5s infinite !important;
    }

    .flow-dot.active {
      color: #00ff88 !important;
      filter: drop-shadow(0 0 20px #00ff88) !important;
    }

line_width: 4
ball_diameter: 8
shape: circle
line_glow_size: 6
ball_glow_size: 6
line_glow_brightness: 0.8

entities:
  ac_input:
    entity: sensor.grid_power
    name: GRID
    unit: kW
    icon: mdi:transmission-tower

  ac_output:
    entity: sensor.load_power
    name: LOAD
    unit: kW
    icon: mdi:home
    positive: true

  inverter_charger:
    entity: sensor.inverter_power
    name: INVERTER
    unit: kW
    icon: mdi:sync
    tertiary: sensor.inverter_state

  battery:
    entity: sensor.battery_soc
    power_entity: sensor.battery_power
    power_unit: kW
    name: BATTERY
    unit: '%'
    icon: mdi:battery

  dc:
    entity: sensor.solar_power
    name: SOLAR
    unit: kW
    icon: mdi:solar-power
    positive: true
```

---

## Troubleshooting

### Installation Issues

#### Card Not Appearing

**Symptoms:**
- Card shows as "Custom element doesn't exist: enhanced-power-flow-card"
- Blank card or error message

**Solutions:**

1. **Verify file location:**
   ```bash
   ls -la /config/www/enhanced-power-flow-card.js
   ```
   Expected: File exists with ~89KB size

2. **Check resource registration:**
   - Settings → Dashboards → Resources
   - Look for `/local/enhanced-power-flow-card.js`
   - Type should be "JavaScript Module"

3. **Clear browser cache:**
   - Chrome/Edge: Ctrl + Shift + Delete
   - Firefox: Ctrl + Shift + Delete
   - Safari: Cmd + Option + E
   - **Then hard refresh**: Ctrl + F5 (Windows) or Cmd + Shift + R (Mac)

4. **Check browser console:**
   - Press F12
   - Go to Console tab
   - Look for errors:
     ```
     Failed to fetch /local/enhanced-power-flow-card.js
     → Wrong file path or permissions

     Unexpected token '<'
     → File contains HTML (404 page), not JavaScript

     Cannot read property 'define' of undefined
     → Resource not loaded as module
     ```

5. **Verify Home Assistant can access file:**
   ```bash
   # Check permissions
   ls -l /config/www/enhanced-power-flow-card.js

   # Should show: -rw-r--r-- homeassistant homeassistant

   # Fix if needed:
   chown homeassistant:homeassistant /config/www/enhanced-power-flow-card.js
   chmod 644 /config/www/enhanced-power-flow-card.js
   ```

6. **Restart Home Assistant:**
   - Settings → System → Restart
   - Wait for full restart
   - Hard refresh browser

#### Version Not Displaying

**Check console for version message:**

Press F12 → Console → Look for:
```
 Enhanced Power Flow Card  v3.0.5
```

If missing:
- Card not loaded
- Check resource registration
- Verify file integrity

### Display Issues

#### Nodes Not Showing

**Symptoms:**
- Some or all nodes are invisible
- Card appears but empty

**Solutions:**

1. **Check entity existence:**
   ```yaml
   # Developer Tools → States
   # Search for your entities
   ```

2. **Verify entity IDs are correct:**
   ```yaml
   entities:
     ac_input:
       entity: sensor.grid_power  # Must exist
   ```

3. **Check for hidden class:**
   - Press F12 → Elements
   - Search for `.node.hidden`
   - If present, entity is deliberately hidden

4. **Common causes:**
   - `entity` not defined
   - Entity doesn't exist in Home Assistant
   - For inverter: no entity AND can't calculate (missing ac_input or ac_output)
   - For battery: no `entity` AND no `power_entity`

#### Flows Not Animating

**Symptoms:**
- Lines visible but gray (no color)
- No animated indicators
- Endpoint circles gray

**Solutions:**

1. **Check entity values:**
   ```yaml
   # Developer Tools → States
   # Verify entities have numeric values
   ```

2. **Check value threshold:**
   - Flows only activate when `|value| > 0.05`
   - Increase power to test

3. **For inverter→battery flow:**
   ```yaml
   inverter_charger:
     tertiary: sensor.inverter_state
     # Must output: bulk, absorption, float, inverting, assisting, or power supply
   ```

4. **For DC flows:**
   ```yaml
   inverter_charger:
     dc_flow_template: binary_sensor.pv_connected
     # Must be 'on' for flow to activate
   ```

5. **Check browser performance:**
   - Animations disabled by browser?
   - GPU acceleration enabled?
   - Try different browser

#### Wrong Colors

**Symptoms:**
- Flows showing unexpected colors
- Colors don't match configuration

**Solutions:**

1. **Check color priority:**
   ```yaml
   # Priority (highest to lowest):
   # 1. flow_colors overrides
   # 2. Entity color_positive/color_negative
   # 3. Defaults
   ```

2. **Verify color format:**
   ```yaml
   color_positive: '#2f80ed'  # ✓ Correct
   color_positive: '2f80ed'   # ✗ Missing #
   color_positive: 'blue'     # ✗ Named colors not supported
   ```

3. **Check card-mod conflicts:**
   ```yaml
   card_mod:
     style: |
       .flow {
         stroke: red !important;  # Overrides everything
       }
   ```

#### Flow Direction Wrong

**Symptoms:**
- Flows animate backwards
- Charging shows as discharging

**Solutions:**

1. **Use `invert` option:**
   ```yaml
   battery:
     invert: true  # Reverses inverter↔battery

   dc:
     invert: true  # Reverses inverter↔DC

   battery:
     invert_to_battery: true  # Reverses battery↔DC
   ```

2. **Check entity sign:**
   - Positive should flow "forward"
   - Negative should flow "backward"
   - Verify entity reports correct sign

3. **For battery flow:**
   ```yaml
   # Check tertiary state
   inverter_charger:
     tertiary: sensor.inverter_state

   # Expected values:
   # Charging: bulk, absorption, float
   # Discharging: inverting, assisting, power supply
   ```

### Performance Issues

#### Slow/Laggy Animations

**Solutions:**

1. **Reduce glow effects:**
   ```yaml
   line_glow_size: 0
   ball_glow_size: 0
   ```

2. **Simplify card-mod styles:**
   ```yaml
   # Remove heavy animations
   # Remove drop-shadow filters
   # Remove backdrop-filter
   ```

3. **Disable background:**
   ```yaml
   show_background: false
   ```

4. **Check browser:**
   - Enable GPU acceleration
   - Update browser
   - Try hardware acceleration settings

5. **Check CPU usage:**
   - Other animations on page?
   - Too many cards on dashboard?

#### High CPU Usage

**Solutions:**

1. **Reduce update frequency:**
   - Configure sensors to update less frequently
   - Use state_class: measurement

2. **Limit concurrent animations:**
   - Hide unused flows
   - Disable glows

3. **Simplify templates:**
   - Use simpler calculations
   - Cache template results

### Configuration Issues

#### Templates Not Working

**Symptoms:**
- Template shows as raw text
- Values not updating
- Error in template

**Solutions:**

1. **Test template separately:**
   ```yaml
   # Developer Tools → Template
   {{ states('sensor.power') | float }}
   ```

2. **Common template errors:**
   ```yaml
   # ✗ Wrong
   secondary: {{ states('sensor.voltage') }}

   # ✓ Correct
   secondary: "{{ states('sensor.voltage') }}"
   ```

3. **Check entity exists:**
   ```yaml
   # Use default filter
   secondary: "{{ states('sensor.voltage') | default(0) }}"
   ```

4. **Verify Jinja2 syntax:**
   ```yaml
   # Use | float for math
   secondary: "{{ states('sensor.power') | float / 1000 }}"
   ```

#### Binary Sensors Not Controlling Flows

**Symptoms:**
- Flow always gray or always active
- Binary sensor changes don't affect flow

**Solutions:**

1. **Check binary sensor state:**
   ```yaml
   # Developer Tools → States
   # Search for binary_sensor
   # Verify it toggles on/off
   ```

2. **Verify entity ID:**
   ```yaml
   inverter_charger:
     dc_flow_template: binary_sensor.pv_connected
     # Must match exactly (case-sensitive)
   ```

3. **Check binary sensor output:**
   ```yaml
   # Must output: on, off, true, false, 0, or 1
   # Any other value = undefined behavior
   ```

4. **Test with direct toggle:**
   ```yaml
   # Developer Tools → States
   # Click binary sensor
   # Set to "on" or "off"
   # Watch flow change
   ```

#### card-mod Styles Not Applying

**Symptoms:**
- Styles have no effect
- Only some styles work

**Solutions:**

1. **Install card-mod:**
   - Via HACS: Search "card-mod"
   - Restart Home Assistant

2. **Use `!important`:**
   ```yaml
   card_mod:
     style: |
       .node {
         background: red !important;  # ✓
         background: red;              # ✗ May not work
       }
   ```

3. **Check selector:**
   ```yaml
   # Use browser DevTools (F12)
   # Inspect element
   # Copy exact selector
   ```

4. **Verify syntax:**
   ```yaml
   card_mod:
     style: |
       /* CSS comment */
       .selector {
         property: value !important;
       }

   # NOT this:
   card_mod:
     style:
       .selector:
         property: value  # ✗ Wrong syntax
   ```

5. **Check for conflicts:**
   ```yaml
   # Later styles override earlier ones
   .node { background: red; }
   .node { background: blue; }  # This wins
   ```

### Entity Issues

#### "Entity not available"

**Symptoms:**
- Node shows "-- W" or "unavailable"
- Values don't update

**Solutions:**

1. **Check entity state:**
   ```yaml
   # Developer Tools → States
   # Search for entity
   # Check "State" column
   ```

2. **Common states:**
   - `unavailable` - Entity exists but offline
   - `unknown` - Entity has no value yet
   - `None` - Entity returned null

3. **Wait for update:**
   - Some sensors update slowly
   - Check `last_updated` timestamp

4. **Verify entity ID:**
   ```yaml
   entity: sensor.grid_power  # Check spelling
   ```

#### Values Not Updating

**Symptoms:**
- Values frozen
- Old data displayed

**Solutions:**

1. **Check entity updates:**
   ```yaml
   # Developer Tools → States
   # Watch "Last Updated" column
   ```

2. **Check sensor configuration:**
   ```yaml
   # Ensure sensor is polling/pushing updates
   ```

3. **Force card refresh:**
   - Edit card config
   - Change any value
   - Save
   - Change back

4. **Clear cache:**
   - Ctrl + F5
   - Or disable cache in DevTools (F12 → Network → Disable cache)

---

## License

**MIT License**

Copyright (c) 2025 NXJim

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

**THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.**

---

## Support & Contributing

### Getting Help

If you encounter issues:

1. **Check this documentation** - Most questions are answered here
2. **Search existing issues** - [GitHub Issues](https://github.com/NXJim/enhanced-power-flow-card/issues)
3. **Open a new issue** with:
   - Home Assistant version
   - Browser and version
   - Card version (check console: F12)
   - Configuration (sanitize sensitive data)
   - Browser console errors (F12 → Console)
   - Screenshots showing the problem

### Contributing

Contributions welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

**For major changes:**
- Open an issue first to discuss
- Explain the problem and proposed solution
- Get feedback before implementing

### Development Setup

```bash
# Clone repository
git clone https://github.com/NXJim/enhanced-power-flow-card.git
cd enhanced-power-flow-card

# Copy to Home Assistant
cp enhanced-power-flow-card.js /config/www/

# Make changes
# Test in Home Assistant
# Increment version in file
# Commit and push
```

### Reporting Bugs

**Good bug report includes:**
- Clear description of expected vs actual behavior
- Steps to reproduce
- Configuration that triggers the bug
- Browser console errors
- Screenshots or video

**Example:**
```
Title: Battery flow shows wrong direction when inverter state is "bulk"

Expected: Flow should go from inverter to battery (blue arrow)
Actual: Flow goes from battery to inverter (orange arrow)

Configuration:
```yaml
inverter_charger:
  tertiary: sensor.ve_bus_state
battery:
  invert: false
```

Home Assistant: 2024.12.0
Browser: Chrome 120
Card Version: 3.0.5
Console Errors: None
```

---

## Credits & Acknowledgments

- **Created by**: NXJim
- **Inspired by**: Home Assistant community's energy monitoring needs
- **Special Thanks**:
  - Home Assistant community
  - HACS maintainers
  - All users providing feedback and bug reports

### Related Projects

- [Home Assistant](https://www.home-assistant.io/)
- [HACS](https://hacs.xyz/)

---

## Changelog

### v3.0.5 (2025-12-01)

**Initial Public Release**

- ✨ Full power flow visualization with 5 nodes
- ✨ Animated flow indicators (4 shapes available)
- ✨ Smart flow control based on inverter state
- ✨ Binary sensor flow enable/disable
- ✨ Template support for dynamic values
- ✨ Per-flow color customization
- ✨ Endpoint circles at flow connections
- ✨ Collapsible GUI editor sections
- ✨ Responsive design with resize handling
- ✨ Comprehensive documentation
- 🐛 Fixed XOR logic in flow direction control
- 🐛 Fixed battery→DC flow backwards behavior
- ⚡ Added debounced resize handlers
- ⚡ Added proper cleanup on disconnect
- 🎨 Improved card styling and animations

**Breaking Changes:** None (initial release)

**Known Issues:**
- Card not available on HACS (manual install only)
- Flow speed scaling may need adjustment for different power ranges

---

**End of Documentation**

For the latest updates, visit: https://github.com/NXJim/enhanced-power-flow-card
