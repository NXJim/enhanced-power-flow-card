# Enhanced Power Flow Card

A highly customizable Home Assistant Lovelace card for visualizing power flow between AC input, inverter/charger, battery, DC system, and AC output with animated flow indicators.

![Version](https://img.shields.io/badge/version-3.0.5-blue.svg)

## Features

- 🎨 **Fully Customizable Appearance** - Adjust line thickness, corner radius, glow effects, and flow shapes
- 🔄 **Animated Flow Indicators** - Dynamic visual feedback showing power direction and magnitude
- 🎯 **Smart Flow Control** - Automatically shows/hides flows based on inverter state and binary sensors
- 📊 **Template Support** - Use Jinja2 templates for dynamic values
- 🌈 **Custom Colors** - Per-flow color customization for positive and negative power
- 📱 **Responsive Design** - Adapts to different screen sizes
- ⚡ **Real-time Updates** - Live power flow visualization

## Installation

### HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Click on "Frontend"
3. Click the "+" button
4. Search for "Enhanced Power Flow Card"
5. Click "Install"
6. Restart Home Assistant

### Manual Installation

1. Download `enhanced-power-flow-card.js`
2. Copy it to your `config/www` folder
3. Add the resource in your Lovelace configuration:

```yaml
resources:
  - url: /local/enhanced-power-flow-card.js
    type: module
```

## Configuration

### Basic Example

```yaml
type: custom:enhanced-power-flow-card
entities:
  ac_input:
    entity: sensor.grid_power
    name: Grid
    unit: W
    icon: mdi:transmission-tower
  ac_output:
    entity: sensor.load_power
    name: AC Load
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
    entity: sensor.dc_power
    name: DC System
    unit: W
    icon: mdi:current-dc
```

### Advanced Configuration

```yaml
type: custom:enhanced-power-flow-card
title: Power Flow
show_background: true
line_width: 2
corner_radius: 8
ball_diameter: 4
line_glow_size: 3
ball_glow_size: 3
line_glow_brightness: 0.4
ball_glow_brightness: 1
shape: oval  # circle, oval, squircle, or square

entities:
  ac_input:
    entity: sensor.grid_power
    name: Grid
    unit: W
    icon: mdi:transmission-tower
    color_positive: '#2f80ed'
    color_negative: '#f2994a'
    invert: false
    positive: false
    secondary: sensor.grid_voltage
    secondary_unit: V
    tertiary: sensor.grid_frequency
    tertiary_unit: Hz

  inverter_charger:
    entity: sensor.inverter_power
    name: Inverter-Charger
    unit: W
    icon: mdi:sync
    tertiary: sensor.inverter_state  # bulk, absorption, float, inverting, etc.
    dc_flow_template: binary_sensor.dc_flow_enabled

  battery:
    entity: sensor.battery_soc
    power_entity: sensor.battery_power
    power_unit: W
    name: Battery
    unit: '%'
    icon: mdi:battery
    flow_state_entity: sensor.battery_state
    dc_flow_template: binary_sensor.battery_dc_enabled
    invert: false
    invert_to_battery: false

flow_colors:
  inverter_battery:
    positive: '#2f80ed'
    negative: '#f2994a'
  battery_dc:
    positive: '#27ae60'
    negative: '#f2994a'
  inverter_dc:
    positive: '#27ae60'
    negative: '#f2994a'
```

## Configuration Options

### Card Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | - | Card title |
| `show_background` | boolean | `true` | Show card background |
| `line_width` | number | `2` | Line thickness (0.1-10) |
| `corner_radius` | number | `8` | Corner radius (0-50) |
| `ball_diameter` | number | `4` | Flow indicator diameter (1-20) |
| `shape` | string | `oval` | Flow shape: `circle`, `oval`, `squircle`, `square` |
| `line_glow_size` | number | `3` | Line glow size (0-20) |
| `ball_glow_size` | number | `3` | Flow glow size (0-20) |
| `line_glow_brightness` | number | `0.4` | Line glow brightness (0-1) |
| `ball_glow_brightness` | number | `1` | Flow glow brightness (0-1) |

### Entity Options

Each entity section (ac_input, ac_output, inverter_charger, battery, dc) supports:

| Name | Type | Description |
|------|------|-------------|
| `entity` | string | Entity ID for main value |
| `name` | string | Display name |
| `unit` | string | Unit of measurement |
| `icon` | string | Material Design Icon |
| `secondary` | string | Secondary display value (supports templates) |
| `secondary_unit` | string | Unit for secondary value |
| `tertiary` | string | Tertiary display value (supports templates) |
| `tertiary_unit` | string | Unit for tertiary value |
| `color_positive` | string | Color for positive flow |
| `color_negative` | string | Color for negative flow |
| `invert` | boolean | Invert flow direction |
| `positive` | boolean | Always show as positive value |

### Battery-Specific Options

| Name | Type | Description |
|------|------|-------------|
| `power_entity` | string | Entity for battery power (separate from SoC) |
| `power_unit` | string | Unit for power entity |
| `flow_state_entity` | string | Entity that determines charge/discharge state |
| `dc_flow_template` | string | Binary sensor to enable/disable battery→DC flow |
| `invert_to_battery` | boolean | Invert battery→DC flow direction |

### Inverter-Charger-Specific Options

| Name | Type | Description |
|------|------|-------------|
| `dc_flow_template` | string | Binary sensor to enable/disable inverter→DC flow |

## Flow Control

The inverter→battery flow is controlled by the inverter's tertiary state:

**Charging States** (inverter → battery):
- `bulk`
- `absorption`
- `float`

**Discharging States** (battery → inverter):
- `inverting`
- `assisting`
- `power supply`

Any other state shows the flow as inactive (gray).

## Templates

You can use Jinja2 templates in `secondary` and `tertiary` fields:

```yaml
secondary: "{{ states('sensor.voltage') | float | round(1) }}"
tertiary: "{% if is_state('binary_sensor.charging', 'on') %}Charging{% else %}Idle{% endif %}"
```

## Screenshots

(Add screenshots of your card in action)

## Support

If you encounter issues or have feature requests, please [open an issue](https://github.com/NXJim/enhanced-power-flow-card/issues).

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

Created by NXJim with assistance from Claude Code.
