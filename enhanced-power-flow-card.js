// Enhanced Power Flow Card â€" Visual Editor (Vanilla Web Component)
// Avoids importing 'lit' to ensure it works in all HA environments

const CARD_VERSION = '3.0.5';

const FLOW_COLOR_DEFAULTS = {
  ac_input: { positive: '#2f80ed', negative: '#f2994a' },
  ac_output: { positive: '#f2994a', negative: '#2f80ed' },
  inverter_charger: { positive: '#f2994a', negative: '#2f80ed' },
  battery: { positive: '#2f80ed', negative: '#f2994a' },
  dc: { positive: '#27ae60', negative: '#f2994a' },
};

class EnhancedPowerFlowCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = undefined;
    this._initialized = false;
    this.attachShadow({ mode: 'open' });
  }

  set hass(h) {
    const first = !this._hass;
    this._hass = h;
    // Re-render once when hass first arrives so HA pickers are created with hass.
    if (first) {
      this._render();
    }
    // Defer hass application to ensure elements are upgraded first.
    requestAnimationFrame(() => this._applyHassToPickers());
  }

  setConfig(config) {
    if (!this._initialized) {
      this._config = JSON.parse(JSON.stringify(config || {}));
      this._ensureDefaults(true);
      this._initialized = true;
      this._render();
      this._applyHassToPickers();
      return;
    }

    const prev = JSON.stringify(this._config || {});
    this._config = JSON.parse(JSON.stringify(config || {}));
    this._ensureDefaults(false);
    const current = JSON.stringify(this._config || {});
    if (current === prev) {
      this._applyHassToPickers();
      return;
    }
    this._render();
    this._applyHassToPickers();
  }

  _ensureDefaults(initial = false) {
    const c = this._config;
    c.entities = c.entities || {};
    for (const k of ['ac_input','ac_output','inverter_charger','battery','dc']) {
      c.entities[k] = c.entities[k] || {};
    }
    c.flow_colors = c.flow_colors || {};
    for (const pathKey of ['inverter_battery','battery_dc','inverter_dc']) {
      c.flow_colors[pathKey] = c.flow_colors[pathKey] || {};
    }
    if (initial) {
      if (c.show_defaults === undefined) c.show_defaults = true;
      if (c.show_background === undefined) c.show_background = true;
      if (c.line_width === undefined) c.line_width = 2;
      if (c.ball_diameter === undefined) c.ball_diameter = 4;
      if (c.corner_radius === undefined) c.corner_radius = 8;
      if (!c.shape) c.shape = 'oval';
      if (c.line_glow_size === undefined) c.line_glow_size = 3;
      if (c.ball_glow_size === undefined) c.ball_glow_size = 3;
      if (c.line_glow_brightness === undefined) c.line_glow_brightness = 0.4;
      if (c.ball_glow_brightness === undefined) c.ball_glow_brightness = 1;
      if (c.entities.battery.power_unit === undefined) c.entities.battery.power_unit = 'W';
      const flowDefaults = {
        inverter_battery: FLOW_COLOR_DEFAULTS.battery,
        battery_dc: FLOW_COLOR_DEFAULTS.dc,
        inverter_dc: FLOW_COLOR_DEFAULTS.dc,
      };
      for (const [pathKey, defaults] of Object.entries(flowDefaults)) {
        const target = c.flow_colors[pathKey];
        if (target.positive === undefined) target.positive = defaults.positive;
        if (target.negative === undefined) target.negative = defaults.negative;
      }
    }
  }

  _render() {
    if (!this.shadowRoot) return;
    const c = this._config || {};
    const e = c.entities || {};
    const inverterDisplayName = e.inverter_charger?.name || 'Inverter-Charger';

    this.shadowRoot.innerHTML = `
      <style>
        .editor { padding: 8px 0; font: inherit; }
        .section { margin: 12px 0 20px; }
        .section.flow-spacing { margin-top: 32px; }
        .header { font-weight: 600; margin: 8px 0 10px; }
        .grid { display: grid; gap: 12px; }
        .grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        details { margin: 12px 0; }
        details summary {
          cursor: pointer;
          font-weight: 600;
          padding: 8px 0;
          user-select: none;
        }
        details summary::-webkit-details-marker { display: none; }
        details .details-content { padding: 8px 0; }
        ha-textfield, ha-select, ha-selector { width: 100%; display: block; min-height: 56px; }
        ha-formfield { display: flex; align-items: center; min-height: 48px; }
        .row { display:flex; align-items:center; gap:12px; }
        .no-link {
          pointer-events: none;
        }
      </style>
      <div class="editor">
        <div class="section">
          <div class="header">Card Configuration</div>
          <div class="grid two">
            <ha-textfield label="Card title" value="${c.title || ''}" data-path="title"></ha-textfield>
            <ha-formfield label="Show card background">
              <ha-switch ${c.show_background !== false ? 'checked' : ''} data-path="show_background"></ha-switch>
            </ha-formfield>
          </div>
        </div>

        <details open>
          <summary>Appearance</summary>
          <div class="details-content">
            <div class="grid two">
              <ha-textfield label="Line thickness (0.1-10)" type="number" step="0.1" min="0.1" max="10" value="${c.line_width ?? ''}" data-path="line_width"></ha-textfield>
              <ha-textfield label="Corner radius (0-50)" type="number" step="1" min="0" max="50" value="${c.corner_radius ?? ''}" data-path="corner_radius"></ha-textfield>
              <ha-textfield label="Line glow size (0-20)" type="number" step="0.5" min="0" max="20" value="${c.line_glow_size ?? ''}" data-path="line_glow_size"></ha-textfield>
              <ha-textfield label="Line glow brightness (0-1)" type="number" step="0.1" min="0" max="1" value="${c.line_glow_brightness ?? ''}" data-path="line_glow_brightness"></ha-textfield>
              <ha-textfield label="Flow diameter (1-20)" type="number" step="1" min="1" max="20" value="${c.ball_diameter ?? ''}" data-path="ball_diameter"></ha-textfield>
              <ha-select label="Flow shape" value="${c.shape || 'oval'}" data-path="shape">
                <mwc-list-item value="circle">Circle</mwc-list-item>
                <mwc-list-item value="oval">Oval</mwc-list-item>
                <mwc-list-item value="squircle">Squircle</mwc-list-item>
                <mwc-list-item value="square">Square</mwc-list-item>
              </ha-select>
              <ha-textfield label="Flow glow size (0-20)" type="number" step="0.5" min="0" max="20" value="${c.ball_glow_size ?? ''}" data-path="ball_glow_size"></ha-textfield>
              <ha-textfield label="Flow glow brightness (0-1)" type="number" step="0.1" min="0" max="1" value="${c.ball_glow_brightness ?? ''}" data-path="ball_glow_brightness"></ha-textfield>
            </div>
          </div>
        </details>

        ${this._entitySection('AC Input','ac_input', e.ac_input)}
        ${this._entitySection('AC Output','ac_output', e.ac_output)}
        ${this._entitySection('Inverter-Charger','inverter_charger', e.inverter_charger, {
          showColor: false,
          showInvert: false,
          labels: {
            unit: 'Consumed power unit',
            secondary: 'Secondary (template ok)',
            secondary_unit: 'Unit',
            tertiary: 'Tertiary (template ok)',
            tertiary_unit: 'Unit'
          },
          includeBatteryFlowControls: {
            batteryName: e.battery?.name || 'Battery',
            dcName: e.dc?.name || 'DC System'
          }
        })}
        ${this._batterySection('Battery','battery', e.battery)}
        ${this._entitySection('DC System','dc', e.dc, {
          showColor: false,
          showInverterBatteryColors: false,
          showInvert: false
        })}
      </div>
    `;

    this._wireEvents();
  }

  _entitySection(label, key, cfg = {}, options = {}) {
    const pos = cfg.positive === true ? 'checked' : '';
    const inv = cfg.invert === true ? 'checked' : '';
    const opts = {
      showColor: options.showColor !== false,
      showInvert: options.showInvert !== false,
      showInverterBatteryColors: options.showInverterBatteryColors === true,
      invertLabel: options.invertLabel,
      includeBatteryFlowControls: options.includeBatteryFlowControls,
    };
    const labels = options.labels || {};
    const labelFor = (prop, fallback) => labels[prop] || fallback;
    const entityLabelAttr = labels.entity ? ` label="${labels.entity}"` : '';
    const mainEntityField = `<ha-selector${entityLabelAttr} data-selector="entity" data-path="entities.${key}.entity"></ha-selector>`;

    const rows = [
      [
        `<ha-textfield label="Name" value="${cfg.name || ''}" data-path="entities.${key}.name"></ha-textfield>`,
        `<ha-icon-picker label="Icon" value="${cfg.icon || ''}" data-path="entities.${key}.icon"></ha-icon-picker>`
      ]
    ];

    let urlField = '';
    switch (key) {
      case 'ac_input':
        urlField = `<ha-textfield label="AC Input URL (example: 'power-input' for local dashboard)" value="${this._config.ac_in_url || ''}" data-path="ac_in_url"></ha-textfield>`;
        break;
      case 'ac_output':
        urlField = `<ha-textfield label="AC Output URL (example: 'power-output' for local dashboard)" value="${this._config.ac_output_url || ''}" data-path="ac_output_url"></ha-textfield>`;
        break;
      case 'inverter_charger':
        urlField = `<ha-textfield label="Inverter URL (example: 'power-inverter' for local dashboard)" value="${this._config.inverter_url || ''}" data-path="inverter_url"></ha-textfield>`;
        break;
      case 'battery':
        urlField = `<ha-textfield label="Battery URL (example: 'power-battery' for local dashboard)" value="${this._config.battery_url || ''}" data-path="battery_url"></ha-textfield>`;
        break;
      case 'dc':
        urlField = `<ha-textfield label="DC System URL (example: 'power-dc' for local dashboard)" value="${this._config.dc_url || ''}" data-path="dc_url"></ha-textfield>`;
        break;
    }

    rows.push([
      `<div style="grid-column: 1 / -1">${urlField}</div>`,
      ''
    ]);

    rows.push([
      mainEntityField,
      `<ha-textfield label="${labelFor('unit','Main unit')}" value="${cfg.unit || ''}" data-path="entities.${key}.unit"></ha-textfield>`
    ]);

    rows.push([
      `<ha-textfield label="${labelFor('secondary','Secondary (template ok)')}" value="${cfg.secondary || ''}" data-path="entities.${key}.secondary"></ha-textfield>`,
      `<ha-textfield label="${labelFor('secondary_unit','Secondary unit')}" value="${cfg.secondary_unit || ''}" data-path="entities.${key}.secondary_unit"></ha-textfield>`
    ]);

    rows.push([
      `<ha-textfield label="${labelFor('tertiary','Tertiary (template ok)')}" value="${cfg.tertiary || ''}" data-path="entities.${key}.tertiary"></ha-textfield>`,
      `<ha-textfield label="${labelFor('tertiary_unit','Tertiary unit')}" value="${cfg.tertiary_unit || ''}" data-path="entities.${key}.tertiary_unit"></ha-textfield>`
    ]);

    if (opts.showInverterBatteryColors) {
      rows.push([
        `<ha-textfield type="color" label="Inverter→Battery positive color" value="${this._flowColorInputValue('inverter_charger', cfg, 'positive', 'inverter_battery_color_positive')}" data-path="entities.${key}.inverter_battery_color_positive"></ha-textfield>`,
        `<ha-textfield type="color" label="Inverter→Battery negative color" value="${this._flowColorInputValue('inverter_charger', cfg, 'negative', 'inverter_battery_color_negative')}" data-path="entities.${key}.inverter_battery_color_negative"></ha-textfield>`
      ]);
    }

    if (opts.showColor) {
      rows.push([
        `<ha-textfield type="color" label="Positive flow color" value="${this._flowColorInputValue(key, cfg, 'positive')}" data-path="entities.${key}.color_positive"></ha-textfield>`,
        `<ha-textfield type="color" label="Negative flow color" value="${this._flowColorInputValue(key, cfg, 'negative')}" data-path="entities.${key}.color_negative"></ha-textfield>`
      ]);
    }

    if (opts.includeBatteryFlowControls) {
      const batteryName = opts.includeBatteryFlowControls.batteryName || 'Battery';
      const dcName = opts.includeBatteryFlowControls.dcName || 'DC System';
      rows.push([
        `<ha-textfield style="grid-column: span 2;" label="Flow On/Off Binary Sensor (template ok)" placeholder="" value="${cfg.dc_flow_template || ''}" data-path="entities.${key}.dc_flow_template"></ha-textfield>`,
        ``,
      ]);      
      rows.push([
        `<ha-textfield type="color" label="Inverter→Battery positive color" value="${this._flowPathColorInputValue('inverter_battery', 'positive')}" data-path="flow_colors.inverter_battery.positive"></ha-textfield>`,
        `<ha-textfield type="color" label="Inverter→Battery negative color" value="${this._flowPathColorInputValue('inverter_battery', 'negative')}" data-path="flow_colors.inverter_battery.negative"></ha-textfield>`
      ]);
      rows.push([
        `<ha-formfield label="Invert flow to Battery"><ha-switch ${this._config?.entities?.battery?.invert === true ? 'checked' : ''} data-path="entities.battery.invert"></ha-switch></ha-formfield>`,
        '<div>&nbsp;</div>'
      ]);
      rows.push([
        `<ha-textfield type="color" label="Inverter→DC positive color" value="${this._flowPathColorInputValue('inverter_dc', 'positive')}" data-path="flow_colors.inverter_dc.positive"></ha-textfield>`,
        `<ha-textfield type="color" label="Inverter→DC negative color" value="${this._flowPathColorInputValue('inverter_dc', 'negative')}" data-path="flow_colors.inverter_dc.negative"></ha-textfield>`
      ]);
      rows.push([
        `<ha-formfield label="Invert flow to ${dcName}"><ha-switch ${this._config?.entities?.dc?.invert === true ? 'checked' : ''} data-path="entities.dc.invert"></ha-switch></ha-formfield>`,
        ``
      ]);
    }

    rows.push([
      `<ha-formfield label="Always positive"><ha-switch ${pos} data-path="entities.${key}.positive"></ha-switch></ha-formfield>`,
      opts.showInvert
        ? `<ha-formfield label="${opts.invertLabel || 'Invert flow'}"><ha-switch ${inv} data-path="entities.${key}.invert"></ha-switch></ha-formfield>`
        : '<div>&nbsp;</div>'
    ]);

    const fields = rows.map(([a,b]) => `${a}${b}`).join('');
    return `
      <details>
        <summary>${label}</summary>
        <div class="details-content">
          <div class="grid two">${fields}</div>
        </div>
      </details>
    `;
  }

  _batterySection(label, key, cfg = {}) {
    const pos = cfg.positive === true ? 'checked' : '';
    const inv = cfg.invert === true ? 'checked' : '';

    const socSelector = `<ha-selector label="" data-selector="entity" data-path="entities.${key}.entity"></ha-selector>`;
    const socUnitField = `<ha-textfield label="State of charge unit" value="${cfg.unit || ''}" data-path="entities.${key}.unit"></ha-textfield>`;
    const mainSelector = `<ha-selector label="" data-selector="entity" data-path="entities.${key}.power_entity"></ha-selector>`;
    const mainUnitField = `<ha-textfield label="Battery power unit" value="${cfg.power_unit || ''}" data-path="entities.${key}.power_unit"></ha-textfield>`;
    const flowStateSelector = `<ha-textfield style="grid-column: span 2;" label="Charging/Discharging State Entity (template ok)" value="${cfg.flow_state_entity || ''}" data-path="entities.${key}.flow_state_entity"></ha-textfield>`;
    const rows = [
      [
        `<ha-textfield label="Name" value="${cfg.name || ''}" data-path="entities.${key}.name"></ha-textfield>`,
        `<ha-icon-picker label="Icon" value="${cfg.icon || ''}" data-path="entities.${key}.icon"></ha-icon-picker>`
      ],
      [
        socSelector,
        socUnitField
      ],
      [
        mainSelector,
        mainUnitField
      ],
      [
        `<ha-textfield label="Secondary (template ok)" value="${cfg.secondary || ''}" data-path="entities.${key}.secondary"></ha-textfield>`,
        `<ha-textfield label="Secondary unit" value="${cfg.secondary_unit || ''}" data-path="entities.${key}.secondary_unit"></ha-textfield>`
      ],
      [
        `<ha-textfield label="Tertiary (template ok)" value="${cfg.tertiary || ''}" data-path="entities.${key}.tertiary"></ha-textfield>`,
        `<ha-textfield label="Tertiary unit" value="${cfg.tertiary_unit || ''}" data-path="entities.${key}.tertiary_unit"></ha-textfield>`
      ],
      [
        `<ha-textfield style="grid-column: span 2;" label="Flow On/Off Binary Sensor (template ok)" value="${cfg.dc_flow_template || ''}" data-path="entities.${key}.dc_flow_template"></ha-textfield>`,
        ``,
      ],
      [
        flowStateSelector,
        ''
      ],
      [
        `<ha-textfield type="color" label="Battery→DC positive color" value="${this._flowPathColorInputValue('battery_dc', 'positive')}" data-path="flow_colors.battery_dc.positive"></ha-textfield>`,
        `<ha-textfield type="color" label="Battery→DC negative color" value="${this._flowPathColorInputValue('battery_dc', 'negative')}" data-path="flow_colors.battery_dc.negative"></ha-textfield>`
      ],
      [
        `<ha-formfield label="Invert flow to DC System"><ha-switch ${cfg.invert_to_battery === true ? 'checked' : ''} data-path="entities.${key}.invert_to_battery"></ha-switch></ha-formfield>`,
        ``,
      ],
      [
        `<ha-formfield label="Always positive"><ha-switch ${pos} data-path="entities.${key}.positive"></ha-switch></ha-formfield>`,
        ``
      ]
    ];

    const fields = rows.map(([a,b]) => `${a}${b}`).join('');
    return `
      <details>
        <summary>${label}</summary>
        <div class="details-content">
          <div class="grid two">${fields}</div>
        </div>
      </details>
    `;
  }

  _flowColorInputValue(key, cfg, type, customFieldName = null) {
    const fieldName = customFieldName || `color_${type}`;
    const setting = cfg?.[fieldName];
    if (setting) {
      return setting;
    }
    const defaults = FLOW_COLOR_DEFAULTS[key] || FLOW_COLOR_DEFAULTS.ac_input;
    return defaults[type];
  }

  _flowPathColorInputValue(pathKey, type) {
    const override = this._config?.flow_colors?.[pathKey];
    if (override && override[type]) {
      return override[type];
    }
    let defaults = FLOW_COLOR_DEFAULTS.battery;
    if (pathKey === 'battery_dc' || pathKey === 'inverter_dc') {
      defaults = FLOW_COLOR_DEFAULTS.dc;
    }
    return defaults[type];
  }

  _formatWithUnit(value, unit) {
    if (value === undefined || value === null || value === '') return '';
    return unit ? `${value} ${unit}` : `${value}`;
  }

  _enforcePositiveNumberString(text) {
    if (text === undefined || text === null) return text;
    return String(text).replace(/-?\d+\.?\d*/g, (match) => {
      const num = parseFloat(match);
      if (Number.isNaN(num)) return match;
      const decimals = match.includes('.') ? match.split('.')[1].length : 0;
      return Math.abs(num).toFixed(decimals);
    });
  }

  _looksLikeEntityId(value) {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (!trimmed.includes('.')) return false;
    return /^[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+$/.test(trimmed);
  }

  _getSecondaryDisplayValue(config) {
    if (!config) return '';
    const raw = config.secondary;
    if (raw === undefined || raw === null) return '';

    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed) return '';

      if (trimmed.includes('{{') || trimmed.includes('{%')) {
        return this._evaluateTemplate(trimmed, config.entity);
      }

      if (this._looksLikeEntityId(trimmed)) {
        const entity = this._hass?.states?.[trimmed];
        if (entity && entity.state !== undefined) {
          return entity.state;
        }
      }

      return trimmed;
    }

    return raw;
  }

  _getTertiaryDisplayValue(config) {
    if (!config) return '';
    const raw = config.tertiary;
    if (raw === undefined || raw === null) return '';

    if (typeof raw === 'object') {
      const maybeEntity = typeof raw.entity === 'string' ? raw.entity : (typeof raw.entity_id === 'string' ? raw.entity_id : '');
      if (maybeEntity) {
        const entity = this._hass?.states?.[maybeEntity];
        if (entity && entity.state !== undefined && entity.state !== null) {
          return entity.state;
        }
      }
      return '';
    }

    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed) return '';

      if (trimmed.includes('{{') || trimmed.includes('{%')) {
        return this._evaluateTemplate(trimmed, config.entity);
      }

      if (this._looksLikeEntityId(trimmed)) {
        const entity = this._hass?.states?.[trimmed];
        if (entity && entity.state !== undefined) {
          return entity.state;
        }
      }

      return trimmed;
    }

    return raw;
  }

  _convertPythonConditional(expression) {
    if (!expression) return expression;
    const pattern = /(.+?)\s+if\s+(.+?)\s+else\s+(.+?)(?=$|\s|,|\)|\])/g;
    return expression.replace(pattern, (_match, trueExpr, condition, falseExpr) => {
      return `(${condition} ? ${trueExpr} : ${falseExpr})`;
    });
  }

  _wireEvents() {
    const root = this.shadowRoot;
    if (!root) return;

    const numberFields = root.querySelectorAll('ha-textfield[type="number"]');
    numberFields.forEach((el) => {
      el.addEventListener('input', (e) => {
        const path = e.target.getAttribute('data-path');
        const val = e.target.value === '' ? undefined : Number(e.target.value);
        this._set(path, val);
      });
    });

    const textFields = root.querySelectorAll('ha-textfield:not([type="number"])');
    textFields.forEach((el) => {
      el.addEventListener('input', (e) => {
        const path = e.target.getAttribute('data-path');
        this._set(path, e.target.value);
      });
    });

    const selects = root.querySelectorAll('ha-select');
    selects.forEach((el) => {
      el.addEventListener('selected', (e) => {
        const path = el.getAttribute('data-path');
        this._set(path, el.value);
      });
      el.addEventListener('closed', (e) => e.stopPropagation());
    });

    const switches = root.querySelectorAll('ha-switch');
    switches.forEach((el) => {
      el.addEventListener('change', (e) => {
        const path = e.target.getAttribute('data-path');
        this._set(path, e.target.checked);
      });
    });

    const pickers = root.querySelectorAll('ha-selector');
    pickers.forEach((el) => {
      const path = el.getAttribute('data-path');
      const selectorType = el.getAttribute('data-selector') || 'entity';

      el.selector = { [selectorType]: {} };

      if (this._hass) el.hass = this._hass;

      const current = this._getValueFromConfig(path);
      if (current !== undefined) {
        el.value = current;
      }

      el.addEventListener('value-changed', (e) => {
        this._set(path, e.detail.value);
      });
    });

    const iconPickers = root.querySelectorAll('ha-icon-picker');
    iconPickers.forEach((el) => {
      const path = el.getAttribute('data-path');
      if (this._hass) el.hass = this._hass;
      const current = this._getValueFromConfig(path);
      if (current !== undefined) {
        el.value = current;
      }
      el.addEventListener('value-changed', (e) => {
        this._set(path, e.detail.value);
      });
    });
  }

  _applyHassToPickers() {
    if (!this._hass || !this.shadowRoot) return;
    this.shadowRoot.querySelectorAll('ha-selector').forEach((el) => {
      el.hass = this._hass;
      const path = el.getAttribute('data-path');
      const val = this._getValueFromConfig(path);
      if (val !== undefined) el.value = val;
    });
    this.shadowRoot.querySelectorAll('ha-icon-picker').forEach((el) => {
      el.hass = this._hass;
      const path = el.getAttribute('data-path');
      const val = this._getValueFromConfig(path);
      if (val !== undefined) el.value = val;
    });
  }

  _getValueFromConfig(path) {
    if (!path) return undefined;
    const parts = path.split('.');
    let ref = this._config;
    for (const p of parts) {
      if (ref == null) return undefined;
      ref = ref[p];
    }
    return ref;
  }

  _set(path, value) {
    const newConfig = JSON.parse(JSON.stringify(this._config || {}));
    const parts = (path || '').split('.');
    let ref = newConfig;
    for (let i = 0; i < parts.length - 1; i++) {
      const k = parts[i];
      if (ref[k] === undefined || typeof ref[k] !== 'object') ref[k] = {};
      ref = ref[k];
    }
    const last = parts[parts.length - 1];
    if (value === undefined) delete ref[last]; else ref[last] = value;
    this._config = newConfig;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
  }
}

customElements.define('enhanced-power-flow-card-editor', EnhancedPowerFlowCardEditor);


// Enhanced Power Flow Card for Home Assistant
// Version 4: Responsive path recalculation on resize

class EnhancedPowerFlowCard extends HTMLElement {
    static DEBUG = false;
    static VERSION = CARD_VERSION;

    constructor() {
        super();
        console.log('%c Enhanced Power Flow Card %c v' + CARD_VERSION + ' ',
            'background: #2196F3; color: white; font-weight: bold; padding: 2px 4px;',
            'background: #1976D2; color: white; padding: 2px 4px;');
        this._debug('Constructor called');
        this._renderedOnce = false;
        this._primedDefaults = false;
    }

    static async getConfigElement() {
        try {
            if (!customElements.get('enhanced-power-flow-card-editor')) {
                await import('./enhanced-power-flow-card-editor.js');
            }
        } catch (e) {
            // no-op: HA will still try to create the element if already registered
        }
        return document.createElement('enhanced-power-flow-card-editor');
    }

    static getStubConfig(hass) {
        return {
            line_width: 2,
            ball_diameter: 4,
            corner_radius: 8,
            line_glow_size: 3,
            ball_glow_size: 3,
            line_glow_brightness: 0.4,
            ball_glow_brightness: 1,
            shape: 'oval',
            entities: {
                ac_input: { entity: 'sensor.ac_in', name: 'Grid', unit: 'W', icon: 'mdi:transmission-tower' },
                ac_output: { entity: 'sensor.ac_out', name: 'AC Output', unit: 'W', icon: 'mdi:home' },
                inverter_charger: { entity: 'sensor.inverter', name: 'Inverter-Charger', unit: 'W', icon: 'mdi:sync' },
                battery: { entity: 'sensor.battery_soc', power_entity: 'sensor.battery_power', power_unit: 'W', name: 'Battery', unit: '%', icon: 'mdi:battery' },
                dc: { entity: 'sensor.dc_power', name: 'DC System', unit: 'W', icon: 'mdi:current-dc' }
            }
        };
    }

    _debug(message, data = null) {
        if (EnhancedPowerFlowCard.DEBUG) {
            const timestamp = new Date().toISOString();
            console.log(`[EnhancedPowerFlowCard ${timestamp}] ${message}`, data || '');
        }
    }

    setConfig(config) {
        this._debug('setConfig called', config);

        if (!config.entities) {
            throw new Error('You need to define entities');
        }
        if (config.entities && !config.entities.ac_output && config.entities.ac_output) {
            config.entities.ac_output = config.entities.ac_output;
        }

        const prevCfg = this.config || {};
        this.config = config;
        this._applyConfigValues();
        const pathChanged = !this._renderedOnce ||
            prevCfg.line_width !== config.line_width ||
            prevCfg.corner_radius !== config.corner_radius ||
            prevCfg.ball_diameter !== config.ball_diameter ||
            prevCfg.shape !== config.shape;

        if (!this.content) {
            this.attachShadow({ mode: "open" });
            this.content = document.createElement("div");
            this.shadowRoot.appendChild(this.content);
        }

        if (!this._renderedOnce) {
            this.render();
            this._attachClickHandlers();
            this._setupResizeObserver();
            this._renderedOnce = true;
            return;
        } else {
            if (pathChanged) {
                this._createDynamicPaths();
            }
            this.updateValues();
        }
    }

    _applyConfigValues() {
        const cfg = this.config || {};
        this.lineWidth = cfg.line_width || 2;
        this.arrowSize = cfg.arrow_size || 3;
        this.cornerRadius = cfg.corner_radius || 8;
        this.ballDiameter = cfg.ball_diameter || 4;
        this.lineGlowSize = cfg.line_glow_size || 3;
        this.ballGlowSize = cfg.ball_glow_size || 3;
        this.lineGlowBrightness = cfg.line_glow_brightness || 0.4;
        this.ballGlowBrightness = cfg.ball_glow_brightness || 1;
        this.shape = cfg.shape || 'oval';
        this.cardTitle = typeof cfg.title === 'string' ? cfg.title.trim() : '';
        this.showCardBackground = cfg.show_background !== false;
    }

    _setupResizeObserver() {
        // Recalculate paths on resize with debouncing
        if (typeof ResizeObserver !== 'undefined') {
            this._resizeObserver = new ResizeObserver(() => {
                clearTimeout(this._resizeDebounce);
                this._resizeDebounce = setTimeout(() => {
                    this._createDynamicPaths();
                }, 100);
            });

            setTimeout(() => {
                const grid = this.shadowRoot.getElementById('grid');
                if (grid) {
                    this._resizeObserver.observe(grid);
                }
            }, 0);
        }

        // Fallback for older browsers
        this._windowResizeHandler = () => {
            clearTimeout(this._resizeTimeout);
            this._resizeTimeout = setTimeout(() => {
                this._createDynamicPaths();
            }, 100);
        };
        window.addEventListener('resize', this._windowResizeHandler);
    }

    disconnectedCallback() {
        // Cleanup resize observers and listeners
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
        }
        if (this._windowResizeHandler) {
            window.removeEventListener('resize', this._windowResizeHandler);
        }
        clearTimeout(this._resizeTimeout);
        clearTimeout(this._resizeDebounce);
    }

    _attachClickHandlers() {
        setTimeout(() => {
            const cfg = this.config || {};

            const handlers = {
                'ac-in-node': cfg.ac_in_url,
                'ac-output-node': cfg.ac_output_url,
                'inverter-node': cfg.inverter_url,
                'battery-node': cfg.battery_url,
                'dc-node': cfg.dc_url,
            };

            Object.entries(handlers).forEach(([nodeId, path]) => {
                const node = this.shadowRoot.getElementById(nodeId);
                if (!node) return;

                // if no URL, ensure it is not clickable
                if (!path || !path.trim()) {
                    node.style.cursor = 'default';
                    return;
                }

                // URL exists, make it clickable
                node.style.cursor = 'pointer';

                node.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.history.pushState(null, '', path);
                    window.dispatchEvent(new CustomEvent('location-changed'));
                });
            });
        }, 0);
    }

    set hass(hass) {
        this._debug('hass setter called');
        this._hass = hass;
        this.updateValues();
    }

    getCardSize() {
        return 4;
    }

    _evaluateTemplate(template, entityId) {
        this._debug('_evaluateTemplate', { template, entityId });

        if (!template) return null;

        if (typeof template !== 'string') return template;

        const vars = {};
        let working = template;

        const setPattern = /\{\%\s*set\s+(\w+)\s*=\s*(.+?)\s*\%\}/g;
        working = working.replace(setPattern, (full, name, expression) => {
            const value = this._runTemplateExpression(expression.trim(), entityId, vars);
            vars[name] = value;
            return '';
        });

        if (!working.includes('{{')) {
            return working.replace(/\s+/g, ' ').trim();
        }

        const result = working.replace(/\{\{\s*(.+?)\s*\}\}/g, (match, expression) => {
            const value = this._runTemplateExpression(expression.trim(), entityId, vars);
            return value !== undefined ? value : '';
        });

        this._debug('Template evaluated', { original: template, result });
        return result;
    }

    _runTemplateExpression(expression, entityId, vars = {}) {
        let expr = expression;
        let precision;

        const floatMatch = expr.match(/\|\s*float(?:\s*\(\s*(\d+)\s*\))?/);
        if (floatMatch) {
            precision = floatMatch[1] !== undefined ? Number(floatMatch[1]) : undefined;
        }

        expr = expr.replace(/\|\s*float(?:\([^)]*\))?/g, '');
        expr = expr.replace(/states\(['"]([^'"]+)['"]\)/g, (m, eid) => {
            const value = this._hass?.states?.[eid]?.state;
            return this._literalForValue(value ?? '0');
        });
        expr = expr.replace(/states\.([^.]+)\.([^.]+)\.state/g, (m, domain, name) => {
            const value = this._hass?.states?.[`${domain}.${name}`]?.state;
            return this._literalForValue(value ?? '0');
        });
        expr = expr.replace(/states\.([^.]+)\.([^.]+)\.attributes\.([^\s}]+)\s*/g, (m, domain, name, attr) => {
            const value = this._hass?.states?.[`${domain}.${name}`]?.attributes?.[attr];
            return this._literalForValue(value ?? '0');
        });
        expr = this._convertPythonConditional(expr);

        const varInit = Object.entries(vars).map(([name, val]) => `const ${name} = ${this._literalForValue(val)};`).join('\n');

        try {
            // eslint-disable-next-line no-eval
            const res = eval(`${varInit}${expr}`);
            if (precision !== undefined && typeof res === 'number') {
                return res.toFixed(precision);
            }
            return res;
        } catch (e) {
            console.warn('Template math evaluation failed:', e);
            return undefined;
        }
    }

    _literalForValue(value) {
        if (value === undefined || value === null) return '0';
        if (typeof value === 'number') return `${value}`;
        if (typeof value === 'string') {
            return `'${value.replace(/'/g, "\\'")}'`;
        }
        return JSON.stringify(value);
    }

    _getEntityConfig(entityKey) {
        this._debug('_getEntityConfig', entityKey);
        return this.config.entities[entityKey];
    }

  _getEntityValue(config) {
    const numeric = this._getEntityValueNumber(config);
    if (numeric === undefined || Number.isNaN(numeric)) return 0;
    return numeric.toFixed(0);
  }

  _getEntityValueNumber(config) {
    this._debug('_getEntityValueNumber', config);
    if (!config || !config.entity || !this._hass) return undefined;

    let value = 0;

    if (typeof config.entity === 'string') {
      if (config.entity.includes('{{')) {
        const evaluated = this._evaluateTemplate(config.entity, null);
        value = parseFloat(evaluated);
      } else {
        const entity = this._hass.states[config.entity];
        if (!entity) return undefined;
        value = parseFloat(entity.state);
      }
    }

    if (Number.isNaN(value)) return undefined;
    value = this._applyValueTransforms(config, value);
    return value;
  }

    _canCalculateConsumedPower() {
        const acInput = this._getEntityConfig('ac_input');
        const acOutput = this._getEntityConfig('ac_output');
        return Boolean(acInput?.entity && acOutput?.entity);
    }

    _calculateConsumedPower() {
        if (!this._hass) return undefined;
        const acInputConfig = this._getEntityConfig('ac_input');
        const acOutputConfig = this._getEntityConfig('ac_output');
        if (!acInputConfig || !acOutputConfig) return undefined;
        const acInput = this._getEntityValueNumber(acInputConfig);
        const acOutput = this._getEntityValueNumber(acOutputConfig);
        if (acInput === undefined || acOutput === undefined) return undefined;
        return acInput - acOutput;
    }

    _applyValueTransforms(config, value) {
        let v = Number(value);
        if (isNaN(v)) return 0;
        if (config?.positive === true) v = Math.abs(v);
        return v;
    }

    _getPowerEntityValue(config) {
        if (!config?.power_entity || !this._hass) return undefined;
        const st = this._hass.states[config.power_entity];
        if (!st) return undefined;
        const val = parseFloat(st.state);
        if (isNaN(val)) return undefined;
        return this._applyValueTransforms(config, val);
    }

    _getBatteryChargeState(config) {
        if (!config?.flow_state_entity || !this._hass) return undefined;

        const flowStateEntity = config.flow_state_entity.trim();
        let raw;

        // Check if it's a template
        if (flowStateEntity.includes('{{') || flowStateEntity.includes('{%')) {
            raw = this._evaluateTemplate(flowStateEntity, config.entity);
        } else if (this._looksLikeEntityId(flowStateEntity)) {
            // It's an entity ID
            const st = this._hass.states[flowStateEntity];
            if (!st) return undefined;
            raw = st.state;
        } else {
            // It's a literal value
            raw = flowStateEntity;
        }

        if (raw === undefined || raw === null) return undefined;
        const val = parseFloat(raw);
        if (isNaN(val)) return undefined;
        return val >= 0.5;
    }

    _getBatteryFlowStateDisplay(config) {
        if (!config?.flow_state_entity || !this._hass) return '';

        const flowStateEntity = config.flow_state_entity.trim();
        let raw;

        // Check if it's a template
        if (flowStateEntity.includes('{{') || flowStateEntity.includes('{%')) {
            raw = this._evaluateTemplate(flowStateEntity, config.entity);
        } else if (this._looksLikeEntityId(flowStateEntity)) {
            // It's an entity ID
            const st = this._hass.states[flowStateEntity];
            if (!st) return '';
            raw = st.state;
        } else {
            // It's a literal value
            raw = flowStateEntity;
        }

        if (raw === undefined || raw === null) return '';
        if (raw === 'on') return 'Charging';
        if (raw === 'off') return 'Discharging';
        if (raw === 'true') return 'Charging';
        if (raw === 'false') return 'Discharging';
        const numeric = parseFloat(raw);
        if (!Number.isNaN(numeric)) {
            return numeric >= 0.5 ? 'Charging' : 'Discharging';
        }
        const trimmed = String(raw).trim();
        if (!trimmed) return '';
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }

    render() {
        this._debug('render called');
        const showBackground = this.config?.show_background !== false;
        const cardClass = `card${showBackground ? '' : ' card-plain'}`;
        const titleMarkup = this.cardTitle ? `<div class="card-title">${this.cardTitle}</div>` : '';

        this.content.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .card {
          background: linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%);
          border-radius: 16px;
          padding: clamp(16px, 2.5vw, 24px);
          color: #fff;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
        }

        .card-plain {
          background: transparent;
          box-shadow: none;
          border: none;
        }

        .card-plain::before {
          display: none;
        }

        .card-title {
          font-size: clamp(1em, 2vw, 1.25em);
          font-weight: 600;
          margin-bottom: 12px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          grid-template-rows: repeat(3, auto);
          gap: clamp(12px, 2vw, 20px);
          position: relative;
          width: 100%;
          max-width: 100%;
          min-height: 400px;
        }

        .node {
          background: rgba(30, 40, 55, 1.0);
          border: 2px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: clamp(8px, 1.5vw, 16px);
          text-align: center;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 2px;
          position: relative;
          z-index: 2;
          min-height: fit-content;
          height: auto;
          box-sizing: border-box;
          max-width: 100%;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .node.hidden {
          display: none;
        }
        
        .node:hover {
          transform: translateY(-2px);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.15), 0 6px 16px rgba(0, 0, 0, 0.4);
        }
        
        .node:active {
          transform: translateY(0);
        }

        .node-icon {
          width: clamp(28px, 5vw, 40px);
          height: clamp(28px, 5vw, 40px);
          margin-bottom: 2px;
          opacity: 0.9;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .node-icon ha-icon {
          --mdc-icon-size: 100%;
          width: 100%;
          height: 100%;
        }

        .node .title {
          font-size: clamp(0.7em, 1.5vw, 0.85em);
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 500;
          margin: 0;
        }

        .node .value {
          font-size: clamp(0.9em, 1.125vw, 1.35em);
          font-weight: 700;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          word-break: break-all;
        }

        .node .secondary {
          font-size: clamp(0.65em, 1.3vw, 0.8em);
          opacity: 0.6;
          margin-top: 0;
        }
        .node .tertiary {
          font-size: clamp(0.65em, 1.3vw, 0.8em);
          opacity: 0.6;
          margin-top: 0;
        }
        
        .battery-power {
          font-size: clamp(0.9em, 1.125vw, 1.35em);
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          margin: 0;
        }

        .node.desaturated {
          filter: saturate(0.5);
          opacity: 1;
        }

        .center { 
          grid-column: 2; 
          grid-row: 2;
          background: rgba(20, 30, 45, 1.0);
          border: 2px solid rgba(255, 255, 255, 0.15);
          min-height: auto;
          height: auto;
        }
        
        .top-left { grid-column: 1; grid-row: 1; }
        .top-right { grid-column: 3; grid-row: 1; }
        .bottom-left { grid-column: 1; grid-row: 3; }
        .bottom-right { grid-column: 3; grid-row: 3; }

        .flow-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        svg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .flow {
          stroke-width: ${this.lineWidth};
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          opacity: 0;
          transition: opacity 0.3s ease, stroke 0.3s ease;
        }

        .flow.active {
          opacity: 0.85;
        }
        
        .flow.inactive {
          stroke: #555 !important;
          opacity: 0.3;
        }

        .flow-dot {
          fill: currentColor;
          opacity: 0;
        }

        .flow-dot.active {
          opacity: 1;
        }

        .endpoint-circle {
          fill: currentColor;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .endpoint-circle.active {
          opacity: 0.85;
        }

        .endpoint-circle.inactive {
          fill: #555 !important;
          opacity: 0.3;
        }

        .flow-ac { stroke: #2f80ed; }
        .flow-load { stroke: #f2994a; }
        .flow-dc-in { stroke: #27ae60; }

        .flow-dot-ac { color: #2f80ed; }
        .flow-dot-load { color: #f2994a; }
        .flow-dot-dc-in { color: #27ae60; }
      </style>

      <div class="${cardClass}">
        ${titleMarkup}
        <div class="grid" id="grid">
          <div class="node top-left" id="ac-in-node">
            <div class="node-icon" id="ac-in-icon"></div>
          <div class="title" id="ac-in-title">AC INPUT</div>
          <div class="value" id="ac-in-value">-- kW</div>
          <div class="secondary" id="ac-in-secondary"></div>
          <div class="tertiary" id="ac-in-tertiary"></div>
        </div>

        <div class="node top-right" id="ac-output-node">
          <div class="node-icon" id="ac-output-icon"></div>
          <div class="title" id="ac-output-title">AC OUTPUT</div>
          <div class="value" id="ac-output-value">-- kW</div>
          <div class="secondary" id="ac-output-secondary"></div>
          <div class="tertiary" id="ac-output-tertiary"></div>
        </div>
        <div class="node center" id="inverter-node">
          <div class="node-icon" id="inverter-icon"></div>
          <div class="title" id="inverter-title">INVERTER/CHARGER</div>
          <div class="value" id="inverter-value">-- kW</div>
          <div class="secondary" id="inverter-secondary"></div>
          <div class="tertiary" id="inverter-tertiary"></div>
        </div>

        <div class="node bottom-left" id="battery-node">
          <div class="node-icon" id="battery-icon"></div>
          <div class="title" id="battery-title">BATTERY</div>
          <div class="secondary" id="battery-charge-state"></div>
          <div class="value" id="battery-value">-- %</div>
          <div class="battery-power" id="battery-power">-- W</div>
          <div class="secondary" id="battery-secondary"></div>
          <div class="tertiary" id="battery-tertiary"></div>
        </div>

        <div class="node bottom-right" id="dc-node">
          <div class="node-icon" id="dc-icon"></div>
          <div class="title" id="dc-title">DC SYSTEM</div>
          <div class="value" id="dc-value">-- W</div>
          <div class="secondary" id="dc-secondary"></div>
          <div class="tertiary" id="dc-tertiary"></div>
        </div>

          <div class="flow-container">
            <svg id="flow-svg"></svg>
          </div>
        </div>
      </div>
    `;

        setTimeout(() => this._createDynamicPaths(), 100);
    }

    _getContainerPoint(nodeId, position) {
        const node = this.shadowRoot.getElementById(nodeId);
        if (!node) return { x: 0, y: 0 };

        const relX = node.offsetLeft;
        const relY = node.offsetTop;
        const width = node.offsetWidth;
        const height = node.offsetHeight;

        switch(position) {
            case 'bottom-center':
                return { x: relX + width / 2, y: relY + height };
            case 'left-middle':
                return { x: relX, y: relY + height / 2 };
            case 'right-middle':
                return { x: relX + width, y: relY + height / 2 };
            case 'right-two-thirds-up':
                return { x: relX + width, y: relY + (height / 3) };
            case 'left-two-thirds-up':
                return { x: relX, y: relY + (height / 3) };
            case 'right-one-third-up':
                return { x: relX + width, y: relY + (height * 2 / 3) };
            case 'left-one-third-up':
                return { x: relX, y: relY + (height * 2 / 3) };
            default:
                return { x: relX, y: relY };
        }
    }

    _createPath(start, end, cornerRadius) {
        const dx = end.x - start.x;
        const dy = end.y - start.y;

        // Straight horizontal line
        if (Math.abs(dy) < 0.1) {
            return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
        }

        // Straight vertical line
        if (Math.abs(dx) < 0.1) {
            return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
        }

        const r = Math.min(cornerRadius, Math.abs(dx), Math.abs(dy));
        
        // Going DOWN and RIGHT
        if (dy > 0 && dx > 0) {
            return `M ${start.x} ${start.y} L ${start.x} ${end.y - r} Q ${start.x} ${end.y} ${start.x + r} ${end.y} L ${end.x} ${end.y}`;
        }
        // Going DOWN and LEFT
        else if (dy > 0 && dx < 0) {
            return `M ${start.x} ${start.y} L ${start.x} ${end.y - r} Q ${start.x} ${end.y} ${start.x - r} ${end.y} L ${end.x} ${end.y}`;
        }
        // Going UP and RIGHT
        else if (dy < 0 && dx > 0) {
            return `M ${start.x} ${start.y} L ${end.x - r} ${start.y} Q ${end.x} ${start.y} ${end.x} ${start.y - r} L ${end.x} ${end.y}`;
        }
        // Going UP and LEFT
        else if (dy < 0 && dx < 0) {
            return `M ${start.x} ${start.y} L ${end.x + r} ${start.y} Q ${end.x} ${start.y} ${end.x} ${start.y - r} L ${end.x} ${end.y}`;
        }
        
        // Fallback
        return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    }

    _createDynamicPaths() {
        const svg = this.shadowRoot.getElementById('flow-svg');
        const grid = this.shadowRoot.getElementById('grid');
        if (!svg || !grid) return;

        const width = grid.offsetWidth;
        const height = grid.offsetHeight;

        // If layout isn't ready yet, retry on the next frame so paths get real coordinates
        if (!width || !height) {
            requestAnimationFrame(() => this._createDynamicPaths());
            return;
        }

        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        const p1_start = this._getContainerPoint('ac-in-node', 'bottom-center');
        const p1_end = this._getContainerPoint('inverter-node', 'left-middle');
        
        const p2_start = this._getContainerPoint('inverter-node', 'right-middle');
        const p2_end = this._getContainerPoint('ac-output-node', 'bottom-center');
        
        const p3_start = this._getContainerPoint('inverter-node', 'bottom-center');
        const p3_end = this._getContainerPoint('battery-node', 'right-two-thirds-up');
        
        const p4_start = this._getContainerPoint('inverter-node', 'bottom-center');
        const p4_end = this._getContainerPoint('dc-node', 'left-two-thirds-up');
        
        const p5_start = this._getContainerPoint('battery-node', 'right-one-third-up');
        const p5_end = this._getContainerPoint('dc-node', 'left-one-third-up');

        const path1 = this._createPath(p1_start, p1_end, this.cornerRadius);
        const path2 = this._createPath(p2_start, p2_end, this.cornerRadius);
        const path3 = this._createPath(p3_start, p3_end, this.cornerRadius);
        const path4 = this._createPath(p4_start, p4_end, this.cornerRadius);
        const path5 = `M ${p5_start.x} ${p5_start.y} L ${p5_end.x} ${p5_end.y}`;

        svg.innerHTML = `
            <path id="flow-ac" class="flow flow-ac inactive" d="${path1}" />
            ${this._createEndpointCircles('flow-ac', p1_start, p1_end)}
            ${this._createFlowShape('dot-ac', 'flow-dot-ac', 'flow-ac')}

            <path id="flow-load" class="flow flow-load inactive" d="${path2}" />
            ${this._createEndpointCircles('flow-load', p2_start, p2_end)}
            ${this._createFlowShape('dot-load', 'flow-dot-load', 'flow-load')}

            <path id="flow-inverter-bat" class="flow flow-inverter-bat inactive" d="${path3}" />
            ${this._createEndpointCircles('flow-inverter-bat', p3_start, p3_end)}
            ${this._createFlowShape('dot-inverter-bat', 'flow-dot-inverter-bat', 'flow-inverter-bat')}

            <path id="flow-dc-in" class="flow flow-dc-in inactive" d="${path4}" />
            ${this._createEndpointCircles('flow-dc-in', p4_start, p4_end)}
            ${this._createFlowShape('dot-dc-in', 'flow-dot-dc-in', 'flow-dc-in')}

            <path id="flow-dc-out" class="flow flow-dc-out inactive" d="${path5}" />
            ${this._createEndpointCircles('flow-dc-out', p5_start, p5_end)}
            ${this._createFlowShape('dot-dc-out', 'flow-dot-dc-out', 'flow-dc-out')}
        `;

        // Apply dynamic stroke widths without full re-render
        svg.querySelectorAll('.flow').forEach((p) => {
            p.style.strokeWidth = `${this.lineWidth}`;
        });

        // If defaults are enabled, re-prime once paths exist so they become visible
        if (!this._primedDefaults && this._primeInitialDefaults && (this.config?.show_defaults !== false)) {
            try { this._primeInitialDefaults(); this._primedDefaults = true; } catch (e) {}
        }
    }

    _ensurePathsReady() {
        const svg = this.shadowRoot?.getElementById('flow-svg');
        const grid = this.shadowRoot?.getElementById('grid');
        if (!svg || !grid) return false;
        if (!grid.offsetWidth || !grid.offsetHeight) {
            requestAnimationFrame(() => this._createDynamicPaths());
            return false;
        }
        if (!svg.childElementCount) {
            this._createDynamicPaths();
        }
        return !!svg.childElementCount;
    }

    _isReversed(config, value) {
        const invert = config?.invert === true;
        const signalReverse = value < -0.05;
        return invert ? !signalReverse : signalReverse;
    }

    _getFlowColor(key, config, value) {
        const defaults = FLOW_COLOR_DEFAULTS[key] || FLOW_COLOR_DEFAULTS.ac_input;
        const positive = config?.color_positive || defaults.positive;
        const negative = config?.color_negative || defaults.negative;
        return value < 0 ? negative : positive;
    }

    _getOverrideFlowColor(pathKey, isPositive) {
        const overrides = this.config?.flow_colors?.[pathKey];
        if (!overrides) return null;
        const color = isPositive ? overrides.positive : overrides.negative;
        return color || null;
    }

    _enforcePositiveNumberString(text) {
        if (text === undefined || text === null) return text;
        return String(text).replace(/-?\d+\.?\d*/g, (match) => {
            const num = parseFloat(match);
            if (Number.isNaN(num)) return match;
            const decimals = match.includes('.') ? match.split('.')[1].length : 0;
            return Math.abs(num).toFixed(decimals);
        });
    }

    _looksLikeEntityId(value) {
        if (typeof value !== 'string') return false;
        const trimmed = value.trim();
        if (!trimmed.includes('.')) return false;
        return /^[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+$/.test(trimmed);
    }

    _getSecondaryDisplayValue(config) {
        if (!config) return '';
        const raw = config.secondary;
        if (raw === undefined || raw === null) return '';

        if (typeof raw === 'object') {
            const maybeEntity = typeof raw.entity === 'string' ? raw.entity : (typeof raw.entity_id === 'string' ? raw.entity_id : '');
            if (maybeEntity) {
                const entity = this._hass?.states?.[maybeEntity];
                if (entity && entity.state !== undefined && entity.state !== null) {
                    return entity.state;
                }
            }
            return '';
        }

        if (typeof raw === 'string') {
            const trimmed = raw.trim();
            if (!trimmed) return '';

            if (trimmed.includes('{{') || trimmed.includes('{%')) {
                return this._evaluateTemplate(trimmed, config.entity);
            }

            if (this._looksLikeEntityId(trimmed)) {
                const entity = this._hass?.states?.[trimmed];
                if (entity && entity.state !== undefined) {
                    return entity.state;
                }
            }

            return trimmed;
        }

        return raw;
    }

    _getTertiaryDisplayValue(config) {
        if (!config) return '';
        const raw = config.tertiary;
        if (raw === undefined || raw === null) return '';

        if (typeof raw === 'object') {
            const maybeEntity = typeof raw.entity === 'string' ? raw.entity : (typeof raw.entity_id === 'string' ? raw.entity_id : '');
            if (maybeEntity) {
                const entity = this._hass?.states?.[maybeEntity];
                if (entity && entity.state !== undefined && entity.state !== null) {
                    return entity.state;
                }
            }
            return '';
        }

        if (typeof raw === 'string') {
            const trimmed = raw.trim();
            if (!trimmed) return '';

            if (trimmed.includes('{{') || trimmed.includes('{%')) {
                return this._evaluateTemplate(trimmed, config.entity);
            }

            if (this._looksLikeEntityId(trimmed)) {
                const entity = this._hass?.states?.[trimmed];
                if (entity && entity.state !== undefined) {
                    return entity.state;
                }
            }

            return trimmed;
        }

        return raw;
    }

  _formatWithUnit(value, unit) {
    if (value === undefined || value === null || value === '') return '';
    return unit ? `${value} ${unit}` : `${value}`;
  }

  _convertPythonConditional(expression) {
    if (!expression) return expression;
    const pattern = /(.+?)\s+if\s+(.+?)\s+else\s+(.+?)(?=$|\s|,|\)|\])/g;
    return expression.replace(pattern, (_match, trueExpr, condition, falseExpr) => {
      return `(${condition} ? ${trueExpr} : ${falseExpr})`;
        });
    }

  _evaluateVisibilityTemplate(template, entityId) {
    if (template === undefined || template === null) return undefined;
    const trimmed = String(template).trim();
    if (!trimmed) return undefined;
    let value = trimmed;
    if (trimmed.includes('{{') || trimmed.includes('{%')) {
      value = this._evaluateTemplate(trimmed, entityId);
    } else if (this._looksLikeEntityId(trimmed)) {
      value = this._hass?.states?.[trimmed]?.state;
    }
    return this._coerceBoolean(value);
  }

  _coerceBoolean(value) {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    const str = String(value).trim().toLowerCase();
    if (!str) return undefined;
    if (['on','true','1','open','enabled','yes','active','charging'].includes(str)) return true;
    if (['off','false','0','closed','disabled','no','inactive','discharging'].includes(str)) return false;
    return undefined;
  }

    _createFlowShape(id, className, pathId) {
        const r = this.ballDiameter / 2;
        
        switch(this.shape) {
            case 'circle':
                return `<circle id="${id}" class="flow-dot ${className}" r="${r}">
                <animateMotion dur="3s" repeatCount="indefinite" calcMode="linear">
                <mpath href="#${pathId}"/>
                </animateMotion>
                </circle>`;
            
            case 'oval':
                return `<ellipse id="${id}" class="flow-dot ${className}" rx="${r * 1.5}" ry="${r * 0.8}">
                        <animateMotion dur="3s" repeatCount="indefinite" rotate="auto" calcMode="linear">
                        <mpath href="#${pathId}"/>
                        </animateMotion>
                        </ellipse>`;
            
            case 'squircle':
                const size = r * 1.8;
                return `<rect id="${id}" class="flow-dot ${className}" 
                        x="${-size/2}" y="${-size/2}" width="${size}" height="${size}" 
                        rx="${size * 0.3}" ry="${size * 0.3}">
                        <animateMotion dur="3s" repeatCount="indefinite" rotate="auto" calcMode="linear">
                        <mpath href="#${pathId}"/>
                        </animateMotion>
                        </rect>`;
            
            case 'square':
                const squareSize = r * 1.6;
                return `<rect id="${id}" class="flow-dot ${className}" 
                        x="${-squareSize/2}" y="${-squareSize/2}" width="${squareSize}" height="${squareSize}">
                        <animateMotion dur="3s" repeatCount="indefinite" rotate="auto" calcMode="linear">
                        <mpath href="#${pathId}"/>
                        </animateMotion>
                        </rect>`;
            
            default:
                return `<ellipse id="${id}" class="flow-dot ${className}" rx="${r * 1.5}" ry="${r * 0.8}">
                        <animateMotion dur="3s" repeatCount="indefinite" rotate="auto" calcMode="linear">
                        <mpath href="#${pathId}"/>
                        </animateMotion>
                        </ellipse>`;
        }
    }

    _createEndpointCircles(flowId, startPoint, endPoint) {
        const r = this.lineWidth * 1.5;
        return `
            <circle class="endpoint-circle" data-flow="${flowId}" cx="${startPoint.x}" cy="${startPoint.y}" r="${r}" />
            <circle class="endpoint-circle" data-flow="${flowId}" cx="${endPoint.x}" cy="${endPoint.y}" r="${r}" />
        `;
    }

    _renderIcon(iconName) {
        this._debug('_renderIcon', iconName);
        if (!iconName) return '';
        return `<ha-icon icon="${iconName}"></ha-icon>`;
    }

    updateValues() {
        this._debug('updateValues called');

        if (!this._hass) {
            this._debug('No hass object, skipping update');
            return;
        }

        this._updateNode('ac_input', 'ac-in');
        this._updateNode('ac_output', 'ac-output');
        this._updateNode('inverter_charger', 'inverter');
        this._updateNode('battery', 'battery');
        this._updateNode('dc', 'dc');

        this._updateFlows();
    }

    _updateNode(configKey, nodePrefix) {
        this._debug('_updateNode', { configKey, nodePrefix });

        const config = this._getEntityConfig(configKey);
        const nodeEl = this.shadowRoot.getElementById(`${nodePrefix}-node`);
        if (!config) {
            nodeEl?.classList?.add('hidden');
            return;
        }

        if (configKey === 'battery') {
            const hasBatteryEntity = Boolean(config.entity || config.power_entity);
            if (!hasBatteryEntity) {
                nodeEl?.classList?.add('hidden');
                return;
            }
            nodeEl?.classList?.remove('hidden');
            this._updateBatteryNode(config, nodePrefix);
            return;
        }
        if (configKey === 'inverter_charger') {
            const hasPrimarySource = Boolean(config.entity) || this._canCalculateConsumedPower();
            if (!hasPrimarySource && !config.secondary && !config.tertiary) {
                nodeEl?.classList?.add('hidden');
                return;
            }
            nodeEl?.classList?.remove('hidden');
            this._updateInverterNode(config, nodePrefix);
            return;
        }

        if (!config.entity) {
            nodeEl?.classList?.add('hidden');
            return;
        }

        nodeEl?.classList?.remove('hidden');

        const titleEl = this.shadowRoot.getElementById(`${nodePrefix}-title`);
        if (titleEl) {
            const name = this._evaluateTemplate(config.name, config.entity);
            if (name) {
                titleEl.textContent = name;
                titleEl.style.display = '';
            } else {
                titleEl.textContent = '';
                titleEl.style.display = 'none';
            }
        }

        const iconEl = this.shadowRoot.getElementById(`${nodePrefix}-icon`);
        if (iconEl) {
            const icon = this._evaluateTemplate(config.icon, config.entity);
            if (icon) {
                iconEl.innerHTML = this._renderIcon(icon);
                iconEl.style.display = '';
            } else {
                iconEl.innerHTML = '';
                iconEl.style.display = 'none';
            }
        }

        const value = this._getEntityValue(config);
        const valueEl = this.shadowRoot.getElementById(`${nodePrefix}-value`);
        if (valueEl) {
            const displayText = `${value} ${config.unit}`;
            valueEl.textContent = displayText;
            
            const length = displayText.length;
            if (length > 10) {
                valueEl.style.fontSize = `${Math.max(0.9, 1.8 - (length - 10) * 0.08)}em`;
            } else {
                valueEl.style.fontSize = '';
            }
            
            if (configKey === 'ac_input') {
                const nodeEl = this.shadowRoot.getElementById(`${nodePrefix}-node`);
                if (nodeEl) {
                    const numValue = parseFloat(value);
                    if (numValue <= 0.05) {
                        nodeEl.classList.add('desaturated');
                    } else {
                        nodeEl.classList.remove('desaturated');
                    }
                }
            }
        }

        const secondaryEl = this.shadowRoot.getElementById(`${nodePrefix}-secondary`);
        if (secondaryEl) {
            const secondaryValue = this._getSecondaryDisplayValue(config);
            let preparedSecondary = secondaryValue !== undefined && secondaryValue !== null ? `${secondaryValue}` : '';
            if (config.positive === true && preparedSecondary) {
                preparedSecondary = this._enforcePositiveNumberString(preparedSecondary);
            }
            const secondaryText = this._formatWithUnit(preparedSecondary, config.secondary_unit);
            secondaryEl.textContent = secondaryText;
            secondaryEl.style.display = secondaryText ? 'block' : 'none';
        }

        const tertiaryEl = this.shadowRoot.getElementById(`${nodePrefix}-tertiary`);
        if (tertiaryEl && config.tertiary) {
            let tertiary = this._evaluateTemplate(config.tertiary, config.entity);
            let preparedTertiary = tertiary !== undefined && tertiary !== null ? `${tertiary}` : '';
            if (config.positive === true && preparedTertiary) {
                preparedTertiary = this._enforcePositiveNumberString(preparedTertiary);
            }
            const tertiaryText = this._formatWithUnit(preparedTertiary, config.tertiary_unit);
            tertiaryEl.textContent = tertiaryText;
            tertiaryEl.style.display = tertiaryText ? 'block' : 'none';
        }
    }

    _updateInverterNode(config, nodePrefix) {
        const titleEl = this.shadowRoot.getElementById(`${nodePrefix}-title`);
        if (titleEl) {
            const name = this._evaluateTemplate(config.name, config.entity);
            if (name) {
                titleEl.textContent = name;
                titleEl.style.display = '';
            } else {
                titleEl.textContent = '';
                titleEl.style.display = 'none';
            }
        }

        const iconEl = this.shadowRoot.getElementById(`${nodePrefix}-icon`);
        if (iconEl) {
            const icon = this._evaluateTemplate(config.icon, config.entity);
            if (icon) {
                iconEl.innerHTML = this._renderIcon(icon);
                iconEl.style.display = '';
            } else {
                iconEl.innerHTML = '';
                iconEl.style.display = 'none';
            }
        }

        const valueEl = this.shadowRoot.getElementById(`${nodePrefix}-value`);
        if (valueEl) {
            let displayText = '--';
            if (config.entity) {
                const value = this._getEntityValue(config);
                displayText = this._formatWithUnit(value, config.unit);
            } else {
                const computed = this._calculateConsumedPower();
                if (computed !== undefined) {
                    const unit = config.unit || 'W';
                    displayText = this._formatWithUnit(computed.toFixed(0), unit);
                }
            }
            valueEl.textContent = displayText || '--';
            const length = (displayText || '').length;
            if (length > 10) {
                valueEl.style.fontSize = `${Math.max(0.9, 1.8 - (length - 10) * 0.08)}em`;
            } else {
                valueEl.style.fontSize = '';
            }
        }

        const secondaryEl = this.shadowRoot.getElementById(`${nodePrefix}-secondary`);
        if (secondaryEl) {
            const secondaryValue = this._getSecondaryDisplayValue(config);
            let prepared = secondaryValue !== undefined && secondaryValue !== null ? `${secondaryValue}` : '';
            if (config.positive === true && prepared) {
                prepared = this._enforcePositiveNumberString(prepared);
            }
            const secondaryText = this._formatWithUnit(prepared, config.secondary_unit);
            secondaryEl.textContent = secondaryText;
            secondaryEl.style.display = secondaryText ? 'block' : 'none';
        }

        const tertiaryEl = this.shadowRoot.getElementById(`${nodePrefix}-tertiary`);
        if (tertiaryEl) {
            let tertiaryText = '';
            if (config.tertiary) {
                let tertiary = this._evaluateTemplate(config.tertiary, config.entity);
                let preparedTertiary = tertiary !== undefined && tertiary !== null ? `${tertiary}` : '';
                if (config.positive === true && preparedTertiary) {
                    preparedTertiary = this._enforcePositiveNumberString(preparedTertiary);
                }
                tertiaryText = this._formatWithUnit(preparedTertiary, config.tertiary_unit);
            }
            tertiaryEl.textContent = tertiaryText;
            tertiaryEl.style.display = tertiaryText ? 'block' : 'none';
        }
    }

    _updateBatteryNode(config, nodePrefix) {
        this._debug('_updateBatteryNode', { config, nodePrefix });

        const powerNumeric = this._getPowerEntityValue(config);
        const hasPowerEntity = Boolean(config.power_entity);
        const chargeStateEl = this.shadowRoot.getElementById(`${nodePrefix}-charge-state`);
        if (chargeStateEl) {
            const statusText = this._getBatteryFlowStateDisplay(config);
            chargeStateEl.textContent = statusText;
            chargeStateEl.style.display = statusText ? 'block' : 'none';
        }

        const titleEl = this.shadowRoot.getElementById(`${nodePrefix}-title`);
        if (titleEl) {
            const name = this._evaluateTemplate(config.name, config.entity);
            if (name) {
                titleEl.textContent = name;
                titleEl.style.display = '';
            } else {
                titleEl.textContent = '';
                titleEl.style.display = 'none';
            }
        }

        const iconEl = this.shadowRoot.getElementById(`${nodePrefix}-icon`);
        if (iconEl) {
            const icon = this._evaluateTemplate(config.icon, config.entity);
            if (icon) {
                iconEl.innerHTML = this._renderIcon(icon);
                iconEl.style.display = '';
            } else {
                iconEl.innerHTML = '';
                iconEl.style.display = 'none';
            }
        }

        const valueEl = this.shadowRoot.getElementById(`${nodePrefix}-value`);
        if (valueEl) {
            const hasSoc = Boolean(config.entity);
            const value = hasSoc ? this._getEntityValue(config) : '--';
            const displayText = this._formatWithUnit(value, config.unit);
            const textContent = displayText || '--';
            valueEl.textContent = textContent;
            
            const length = textContent.length;
            if (length > 10) {
                valueEl.style.fontSize = `${Math.max(0.9, 1.8 - (length - 10) * 0.08)}em`;
            } else {
                valueEl.style.fontSize = '';
            }
        }

        const powerEl = this.shadowRoot.getElementById(`${nodePrefix}-power`);
        if (powerEl) {
            if (!hasPowerEntity) {
                powerEl.style.display = 'none';
            } else {
                powerEl.style.display = '';
                let displayValue = '--';
                if (powerNumeric !== undefined && !isNaN(powerNumeric)) {
                    displayValue = powerNumeric.toFixed(0);
                }
                const unit = config.power_unit || 'W';
                const displayText = this._formatWithUnit(displayValue, unit);
                powerEl.textContent = displayText;
                
                const length = displayText.length;
                if (length > 8) {
                    powerEl.style.fontSize = `${Math.max(0.7, 1.2 - (length - 8) * 0.06)}em`;
                } else {
                    powerEl.style.fontSize = '';
                }
            }
        }

        const secondaryEl = this.shadowRoot.getElementById(`${nodePrefix}-secondary`);
        if (secondaryEl) {
            const secondaryValue = this._getSecondaryDisplayValue(config);
            let prepared = secondaryValue !== undefined && secondaryValue !== null ? `${secondaryValue}` : '';
            if (config.positive === true && prepared) {
                prepared = this._enforcePositiveNumberString(prepared);
            }
            const secondaryText = this._formatWithUnit(prepared, config.secondary_unit);
            secondaryEl.textContent = secondaryText;
            secondaryEl.style.display = secondaryText ? 'block' : 'none';
        }

        const tertiaryEl = this.shadowRoot.getElementById(`${nodePrefix}-tertiary`);
        if (tertiaryEl) {
            let tertiaryText = '';
            if (config.tertiary) {
                const tertiary = this._evaluateTemplate(config.tertiary, config.entity);
                let preparedTertiary = tertiary !== undefined && tertiary !== null ? `${tertiary}` : '';
                if (config.positive === true && preparedTertiary) {
                    preparedTertiary = this._enforcePositiveNumberString(preparedTertiary);
                }
                tertiaryText = this._formatWithUnit(preparedTertiary, config.tertiary_unit);
            }
            tertiaryEl.textContent = tertiaryText;
            tertiaryEl.style.display = tertiaryText ? 'block' : 'none';
        }
    }

    _updateFlows() {
        this._debug('_updateFlows called');

        if (!this._ensurePathsReady()) {
            setTimeout(() => this._updateFlows(), 50);
            return;
        }

        const acInputConfig = this._getEntityConfig('ac_input');
        const acOutputConfig = this._getEntityConfig('ac_output');
        const batteryConfig = this._getEntityConfig('battery');
        const dcConfig = this._getEntityConfig('dc');
        const inverterConfig = this._getEntityConfig('inverter_charger');

        const acInputValue = parseFloat(this._getEntityValue(acInputConfig)) || 0;
        const acOutputValue = parseFloat(this._getEntityValue(acOutputConfig)) || 0;
        const inverterValue = parseFloat(this._getEntityValue(inverterConfig)) || 0;

        const batteryVisible = Boolean(batteryConfig?.entity || batteryConfig?.power_entity);
        let batteryValue = 0;
        if (batteryVisible) {
            if (batteryConfig.power_entity) {
                batteryValue = this._getPowerEntityValue(batteryConfig) ?? 0;
            } else {
                batteryValue = parseFloat(this._getEntityValue(batteryConfig)) || 0;
            }
        }
        
        const dcValue = parseFloat(this._getEntityValue(dcConfig)) || 0;
        const baseReverseDcFlow = dcValue < -0.05;
        let reverseDcFlow = baseReverseDcFlow;
        if (dcConfig?.invert === true) {
            reverseDcFlow = !reverseDcFlow;
        }
        let reverseBatteryDcFlow = baseReverseDcFlow;
        if (batteryConfig?.invert_to_battery === true) {
            reverseBatteryDcFlow = !reverseBatteryDcFlow;
        }

        const reverseAcInput = this._isReversed(acInputConfig, acInputValue);
        const reverseLoad = this._isReversed(acOutputConfig, acOutputValue);
        const acColor = this._getFlowColor('ac_input', acInputConfig, acInputValue);
        const loadColor = this._getFlowColor('ac_output', acOutputConfig, acOutputValue);

        if (!acInputConfig?.entity) {
            this._hideFlow('flow-ac');
        } else {
            this._showFlow('flow-ac');
            this._setFlowState('flow-ac', acInputValue, reverseAcInput, acColor, 5000);
        }

        if (!acOutputConfig?.entity) {
            this._hideFlow('flow-load');
        } else {
            this._showFlow('flow-load');
            this._setFlowState('flow-load', acOutputValue, reverseLoad, loadColor, 5000);
        }

        const inverterTertiaryRaw = this._getTertiaryDisplayValue(inverterConfig);
        const inverterMode = typeof inverterTertiaryRaw === 'string' ? inverterTertiaryRaw.trim().toLowerCase() : '';
        const inverterToBatteryStates = ['bulk','absorption','float'];
        const batteryToInverterStates = ['inverting','assisting','power supply'];
        let inverterFlowDirectionBase = 0;
        if (inverterToBatteryStates.includes(inverterMode)) {
            inverterFlowDirectionBase = 1;
        } else if (batteryToInverterStates.includes(inverterMode)) {
            inverterFlowDirectionBase = -1;
        }
        let inverterFlowDirection = inverterFlowDirectionBase;
        if (batteryConfig?.invert === true && inverterFlowDirectionBase !== 0) {
            inverterFlowDirection *= -1;
        }

        let batteryColor = null;
        if (batteryVisible && inverterFlowDirectionBase !== 0) {
            const directionPositive = inverterFlowDirectionBase > 0;
            const overrideColor = this._getOverrideFlowColor('inverter_battery', directionPositive);
            if (overrideColor) {
                batteryColor = overrideColor;
            } else if (inverterConfig?.inverter_battery_color_positive && inverterConfig?.inverter_battery_color_negative) {
                batteryColor = directionPositive ? inverterConfig.inverter_battery_color_positive : inverterConfig.inverter_battery_color_negative;
            } else {
                batteryColor = this._getFlowColor('battery', batteryConfig, directionPositive ? 1 : -1);
            }
        }

        if (!batteryVisible) {
            this._hideFlow('flow-inverter-bat');
        } else if (inverterFlowDirection === 0) {
            this._showFlow('flow-inverter-bat');
            const pathEl = this.shadowRoot?.getElementById('flow-inverter-bat');
            const dotEl = this.shadowRoot?.getElementById('dot-inverter-bat');
            if (pathEl) {
                pathEl.classList.remove('active');
                pathEl.classList.add('inactive');
                pathEl.style.display = '';
                pathEl.style.stroke = '#666666';
                pathEl.style.filter = 'none';
            }
            if (dotEl) {
                dotEl.style.display = 'none';
                dotEl.classList.remove('active');
            }
        } else {
            this._showFlow('flow-inverter-bat');
            const flowVal = Math.abs(batteryValue) || 0.5;
            const reverseFlow = inverterFlowDirection < 0;
            this._setFlowState('flow-inverter-bat', flowVal, reverseFlow, batteryColor, 1800);
        }

        const dcColor = this._getFlowColor('dc', dcConfig, dcValue);
        const inverterDcOverrideColor = this._getOverrideFlowColor('inverter_dc', dcValue >= 0);
        const inverterDcColor = inverterDcOverrideColor || dcColor;
        const batteryDcOverrideColor = this._getOverrideFlowColor('battery_dc', dcValue >= 0);
        const batteryDcColor = batteryDcOverrideColor || dcColor;

        const inverterNodeEl = this.shadowRoot?.getElementById('inverter-node');
        const batteryNodeEl = this.shadowRoot?.getElementById('battery-node');
        const dcNodeEl = this.shadowRoot?.getElementById('dc-node');
        const inverterNodeVisible = Boolean(inverterNodeEl && !inverterNodeEl.classList.contains('hidden'));
        const batteryNodeVisible = Boolean(batteryNodeEl && !batteryNodeEl.classList.contains('hidden'));
        const dcNodeVisible = Boolean(dcNodeEl && !dcNodeEl.classList.contains('hidden'));

        const inverterDcTemplate = this._evaluateVisibilityTemplate(inverterConfig?.dc_flow_template, inverterConfig?.entity);
        const batteryDcTemplate = this._evaluateVisibilityTemplate(batteryConfig?.dc_flow_template, batteryConfig?.entity);
        const inverterFlowActive = Boolean(inverterDcTemplate);
        const batteryFlowActive = batteryDcTemplate === undefined ? false : Boolean(batteryDcTemplate);

        const manualFlowMagnitude = Math.max(
            Math.abs(dcValue),
            Math.abs(batteryValue),
            Math.abs(inverterValue),
            1
        );
        const inverterFlowValue = inverterFlowActive ? manualFlowMagnitude : 0;
        const batteryFlowValue = batteryFlowActive ? manualFlowMagnitude : 0;

        if (!dcNodeVisible) {
            this._hideFlow('flow-dc-in');
            this._hideFlow('flow-dc-out');
        } else {
            if (!inverterNodeVisible) {
                this._hideFlow('flow-dc-in');
            } else {
                this._showFlow('flow-dc-in');
                if (!inverterFlowActive) {
                    this._setFlowDormant('flow-dc-in');
                } else {
                    this._setFlowState('flow-dc-in', inverterFlowValue, reverseDcFlow, inverterDcColor, 1000);
                }
            }

            if (!batteryNodeVisible || !batteryVisible) {
                this._hideFlow('flow-dc-out');
            } else {
                this._showFlow('flow-dc-out');
                if (!batteryFlowActive) {
                    this._setFlowDormant('flow-dc-out');
                } else {
                    this._setFlowState('flow-dc-out', batteryFlowValue, reverseBatteryDcFlow, batteryDcColor, 360);
                }
            }
        }
    }

  _setFlowState(flowId, value, reverse, color = null, maxRange = 3500) {
        this._debug('_setFlowState', { flowId, value, reverse, color, maxRange });

        const pathEl = this.shadowRoot.getElementById(flowId);
        const dotId = flowId.replace('flow-', 'dot-');
        const dotEl = this.shadowRoot.getElementById(dotId);
        const endpointCircles = this.shadowRoot.querySelectorAll(`.endpoint-circle[data-flow="${flowId}"]`);

        if (pathEl) pathEl.style.display = '';
        if (dotEl) dotEl.style.display = '';
        endpointCircles.forEach(circle => circle.style.display = '');

        if (!pathEl || !dotEl) return;

        const absValue = Math.abs(value);
        const threshold = 0.05;

        if (absValue > threshold) {
            pathEl.classList.add('active');
            pathEl.classList.remove('inactive');
            endpointCircles.forEach(circle => {
                circle.classList.add('active');
                circle.classList.remove('inactive');
            });

            if (color) {
                pathEl.style.stroke = color;
                dotEl.style.color = color;
                endpointCircles.forEach(circle => circle.style.color = color);
            }

            const lineColor = color || window.getComputedStyle(pathEl).stroke;
            const lineColorMatch = lineColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)|#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/);
            
            let r, g, b;
            if (lineColorMatch) {
                if (lineColorMatch[1]) {
                    r = lineColorMatch[1];
                    g = lineColorMatch[2];
                    b = lineColorMatch[3];
                } else {
                    r = parseInt(lineColorMatch[4], 16);
                    g = parseInt(lineColorMatch[5], 16);
                    b = parseInt(lineColorMatch[6], 16);
                }
                const glowIntensity = this.lineGlowBrightness;
                pathEl.style.filter = `
                    drop-shadow(0 0 ${this.lineGlowSize * 0.5}px rgba(${r}, ${g}, ${b}, ${glowIntensity}))
                    drop-shadow(0 0 ${this.lineGlowSize}px rgba(${r}, ${g}, ${b}, ${glowIntensity * 0.8}))
                    drop-shadow(0 0 ${this.lineGlowSize * 1.5}px rgba(${r}, ${g}, ${b}, ${glowIntensity * 0.4}))
                `.trim();
            }

            const ballColor = color || window.getComputedStyle(dotEl).color;
            const ballColorMatch = ballColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)|#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/);
            
            if (ballColorMatch) {
                let br, bg, bb;
                if (ballColorMatch[1]) {
                    br = ballColorMatch[1];
                    bg = ballColorMatch[2];
                    bb = ballColorMatch[3];
                } else {
                    br = parseInt(ballColorMatch[4], 16);
                    bg = parseInt(ballColorMatch[5], 16);
                    bb = parseInt(ballColorMatch[6], 16);
                }
                const ballGlowIntensity = this.ballGlowBrightness;
                dotEl.style.filter = `
                    drop-shadow(0 0 ${this.ballGlowSize * 0.5}px rgba(${br}, ${bg}, ${bb}, ${ballGlowIntensity}))
                    drop-shadow(0 0 ${this.ballGlowSize}px rgba(${br}, ${bg}, ${bb}, ${ballGlowIntensity * 0.8}))
                    drop-shadow(0 0 ${this.ballGlowSize * 1.5}px rgba(${br}, ${bg}, ${bb}, ${ballGlowIntensity * 0.6}))
                `.trim();
            }
            dotEl.style.opacity = 1;

            const maxPower = Math.max(0.001, maxRange || 3500);
            const minDuration = 1.5;
            const maxDuration = 5;
            const pct = Math.min(1, Math.max(0, absValue / maxPower));
            const duration = Math.max(minDuration, maxDuration - (pct * (maxDuration - minDuration)));

            const animateMotion = dotEl.querySelector('animateMotion');
            if (animateMotion) {
                const currentDur = parseFloat(animateMotion.getAttribute('dur')) || 0;
                if (Math.abs(duration - currentDur) > 0.3) {
                    animateMotion.setAttribute('dur', `${duration}s`);
                }

                animateMotion.setAttribute('keyPoints', reverse ? '1;0' : '0;1');
                animateMotion.setAttribute('keyTimes', '0;1');
            }
            
            dotEl.classList.add('active');
        } else {
            pathEl.classList.remove('active');
            pathEl.classList.add('inactive');
            pathEl.style.filter = 'none';
            endpointCircles.forEach(circle => {
                circle.classList.remove('active');
                circle.classList.add('inactive');
            });

            dotEl.style.opacity = 0;
            setTimeout(() => {
                if (dotEl.style.opacity === '0') {
                    dotEl.classList.remove('active');
                    dotEl.style.filter = 'none';
                }
            }, 500);
    }
  }

  _setFlowDormant(flowId) {
    const pathEl = this.shadowRoot?.getElementById(flowId);
    const dotEl = this.shadowRoot?.getElementById(flowId.replace('flow-', 'dot-'));
    const endpointCircles = this.shadowRoot?.querySelectorAll(`.endpoint-circle[data-flow="${flowId}"]`);
    if (!pathEl) return;
    pathEl.style.display = '';
    pathEl.classList.remove('active');
    pathEl.classList.add('inactive');
    pathEl.style.stroke = '#666666';
    pathEl.style.filter = 'none';
    endpointCircles?.forEach(circle => {
      circle.style.display = '';
      circle.classList.remove('active');
      circle.classList.add('inactive');
      circle.style.fill = '#666666';
    });
    if (dotEl) {
      dotEl.style.display = 'none';
      dotEl.classList.remove('active');
      dotEl.style.filter = 'none';
    }
  }

  _hideFlow(flowId) {
    const pathEl = this.shadowRoot?.getElementById(flowId);
    const dotEl = this.shadowRoot?.getElementById(flowId.replace('flow-', 'dot-'));
    const endpointCircles = this.shadowRoot?.querySelectorAll(`.endpoint-circle[data-flow="${flowId}"]`);
        if (pathEl) {
            pathEl.style.display = 'none';
            pathEl.classList.remove('active');
            pathEl.classList.add('inactive');
        }
        if (dotEl) {
            dotEl.style.display = 'none';
            dotEl.style.opacity = 0;
            dotEl.classList.remove('active');
        }
        endpointCircles?.forEach(circle => {
            circle.style.display = 'none';
            circle.classList.remove('active');
        });
    }

    _showFlow(flowId) {
        const pathEl = this.shadowRoot?.getElementById(flowId);
        const dotEl = this.shadowRoot?.getElementById(flowId.replace('flow-', 'dot-'));
        const endpointCircles = this.shadowRoot?.querySelectorAll(`.endpoint-circle[data-flow="${flowId}"]`);
        if (pathEl) pathEl.style.display = '';
        if (dotEl) dotEl.style.display = '';
        endpointCircles?.forEach(circle => circle.style.display = '');
    }
}

try {
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'enhanced-power-flow-card',
    name: 'Enhanced Power Flow Card',
    description: 'Responsive power flow visual with animated paths',
  });
} catch (e) { /* ignore in non-HA contexts */ }
customElements.define('enhanced-power-flow-card', EnhancedPowerFlowCard);


// --- Bootstrap: ensure editor is used without dynamic import and prime defaults (configurable) ---
(function(){
  const EPFC = customElements.get('enhanced-power-flow-card');
  if (!EPFC) return;
  // Replace getConfigElement to avoid dynamic import
  EPFC.getConfigElement = async function() {
    if (!customElements.get('enhanced-power-flow-card-editor')) {
      // Editor class is defined above in this bundle
    }
    return document.createElement('enhanced-power-flow-card-editor');
  };
  // Ensure stub config includes show_defaults by default
  const _origStub = EPFC.getStubConfig;
  EPFC.getStubConfig = function(hass){
    const base = _origStub ? _origStub(hass) : {
      line_width: 2,
      ball_diameter: 4,
      corner_radius: 8,
      line_glow_size: 3,
      ball_glow_size: 3,
      line_glow_brightness: 0.4,
      ball_glow_brightness: 1,
      shape: 'oval',
      entities: {
        ac_input: { entity: 'sensor.ac_in', name: 'Grid', unit: 'W', icon: 'mdi:transmission-tower' },
        ac_output: { entity: 'sensor.ac_out', name: 'AC Output', unit: 'W', icon: 'mdi:home' },
        inverter_charger: { entity: 'sensor.inverter', name: 'Inverter-Charger', unit: 'W', icon: 'mdi:sync' },
        battery: { entity: 'sensor.battery_soc', power_entity: 'sensor.battery_power', power_unit: 'W', name: 'Battery', unit: '%', icon: 'mdi:battery' },
        dc: { entity: 'sensor.dc_power', name: 'DC System', unit: 'W', icon: 'mdi:current-dc' }
      }
    };
    if (base.show_defaults === undefined) base.show_defaults = true;
    return base;
  };
  // Prime defaults so lines show before hass arrives (guarded by config.show_defaults !== false)
  EPFC.prototype._primeInitialDefaults = function() {
    try {
      if (this.config && this.config.show_defaults === false) return;
      const ents = (this.config && this.config.entities) || {};
      const unitOr = (cfg, d) => (cfg && cfg.unit) ? cfg.unit : d;
      const acInUnit = unitOr(ents.ac_input, 'W');
      const acLoadUnit = unitOr(ents.ac_output, 'W');
      const invUnit = unitOr(ents.inverter_charger, 'W');
      const dcUnit = unitOr(ents.dc, 'W');
      const batUnit = unitOr(ents.battery, '%');
      const setText = (id, text) => { const el = this.shadowRoot && this.shadowRoot.getElementById(id); if (el) el.textContent = text; };
      const hide = (id) => { const el = this.shadowRoot && this.shadowRoot.getElementById(id); if (el) el.style.display = 'none'; };
      setText('ac-in-value', 1 );
      setText('ac-output-value', 1 );
      setText('inverter-value', 1 );
      setText('dc-value', 1 );
      setText('battery-value', 1 );
      setText('battery-power', '1 W');
      
      this._setFlowState && this._setFlowState('flow-ac', 1, false);
      this._setFlowState && this._setFlowState('flow-load', 1, false);
      this._setFlowState && this._setFlowState('flow-inverter-bat', 1, false);
      this._setFlowState && this._setFlowState('flow-dc-in', 1, false);
      this._setFlowState && this._setFlowState('flow-dc-out', 1, false);
    } catch (e) { /* ignore */ }
  };
  // Wrap render to call prime after render
  const _origRender = EPFC.prototype.render;
  if (_origRender) {
    EPFC.prototype.render = function() {
      _origRender.call(this);
      setTimeout(() => {
        try { this._createDynamicPaths && this._createDynamicPaths(); } catch (e) {}
        try { this._primeInitialDefaults && this._primeInitialDefaults(); } catch (e) {}
      }, 100);
    };
  }
})();
