/*
	(C) 2012 Sjon Hortensius

	This file is part of MooPick.

	MooPick is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	MooPick is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with MooPick.  If not, see <http://www.gnu.org/licenses/>.
*/

var MooPick = new Class({
	Implements: [Options, Events],
	spaces: {
		'rgb': ['Red', 'Green', 'Blue'],
		'hsb': ['Hue', 'Saturation', 'Brightness'],
		'hex': ['Hex'],
	},
	options: {
		namespace: 'MooPick',
		defaultValue: 'f60',
		defaultValueSpace: 'hex',
	},
	container: null,

	initialize: function(options)
	{
		if ('undefined' == typeof Color || 'undefined' == typeof Drag)
			throw new Error('MooPick requires Color and Drag from MooTools More');

		this.setOptions(options);
		this._create();
		this.set(this.options.defaultValue, this.defaultValueSpace);
	},

	_create: function()
	{
		this.container = new Element('div', {'class': this.options.namespace+'Container hidden'});
		new Element('div', {'class': 'background'}).inject(this.container);

		new MooPick.Palette().inject(this.container);
		new MooPick.Hue().inject(this.container);

		new Element('div', {'class': 'preview'}).inject(this.container);
		var fieldset = new Element('fieldset'), input;

		Object.each(this.spaces, function (inputs, space){
			inputs.each(function(name)
			{
				input = new MooPick.ValueInput(name, space);
				input.addEvent('change', this.inputChanged.bind(this));
				fieldset.grab(input);
			}.bind(this));
		}, this);

		fieldset.inject(this.container);

		document.body.grab(this.container);
	},

	show: function()
	{
		return this.container.removeClass('hidden');
	},

	hide: function()
	{
		return this.container.addClass('hidden');
	},

	// When a single input has been changed, find other inputs for this space, and set new color
	inputChanged: function(e)
	{
		var input = e.target, space = input.get('space');

		if (!this.spaces[space])
			throw new Error('Unsupported colorspace: '+space);

		var values = [];
		this.spaces[space].each(function (name){
			values.push(this.container.getElement('input[name='+ name +']').value);
		}.bind(this));

		if ('hex' == space)
			values = values.pop();

		this.set(values, space);
	},

	set: function(color, type)
	{
		// Workaround for https://github.com/mootools/mootools-more/issues/1172
		if (type == 'hex')
			type = null;

		this.value = new Color(color, type);

		Object.each(this.spaces, function (inputs, space){
			if ('hex' == space)
				return this.container.getElement('input[name=Hex]').value = this.value.hex;

			inputs.each(function(name, idx)
			{
				this.container.getElement('input[name='+ name +']').value = this.value[space][idx];
			}.bind(this))
		}.bind(this));

		this.container.getElement('.palette').setStyle('background-color', [this.value.hsb[0], 100, 100].hsbToRgb());
		this.container.getElement('.preview').setStyle('background-color', this.value.hex);

		this.fireEvent('change', {color: this.value});
	},
});

MooPick.Palette = new Class({
	element: null,
	cursor: null,
	container: null,

	initialize: function()
	{
		this.element = new Element('div', {'class': 'palette'});
		this.cursor = new Element('span', {'class': 'cursor'});

		this.element.addEvent('click', this.set.bind(this));
		this.element.grab(this.cursor);
	},

	set: function(e)
	{
		var x = e.page.x - this.element.getPosition().x, y = e.page.y - this.element.getPosition().y,
			inputSaturation = this.container.getElement('input[name=Saturation]'),
			inputBrightness = this.container.getElement('input[name=Brightness]');

		inputSaturation.set('value', Math.round(x / this.element.clientWidth * 100));
		inputSaturation.fireEvent('change', {target: inputSaturation});

		inputBrightness.set('value', Math.round(100 - y / this.element.clientHeight * 100));
		inputBrightness.fireEvent('change', {target: inputBrightness});

		this.cursor.setStyles({left: x - this.cursor.clientWidth, top: y - this.cursor.clientHeight});
	},

	inject: function(el, where)
	{
		this.element.inject(el, where);
		this.container = el;
	},

	toElement: function()
	{
		return this.element;
	}
});

MooPick.Hue = new Class({
	element: null,
	slider: null,

	initialize: function()
	{
		this.element = new Element('div', {'class': 'hue'});
		this.slider = new Element('span', {'class': 'hueSlider'});
		this.element.grab(this.slider);

		this.element.addEvent('click', this.set.bind(this));
	},

	set: function(e)
	{
		var y = (e.page ? e.page.y : this.slider.getPosition().y) - this.element.getPosition().y,
			h = 360 - (y/this.element.clientHeight) * 360, input;

		input = this.container.getElement('input[name=Hue]').set('value', Math.round(h));
		input.fireEvent('change', {target: input});

		this.slider.setStyle('top', Math.min(Math.max(y-this.slider.clientHeight, 0), this.element.clientHeight));
	},

	inject: function(el, where)
	{
		this.element.inject(el, where);
		this.container = el;

		new Drag(this.slider, {
			snap: 0,
			limit: {
				x: [0, 0],
				y: [0, 253],
			}
		}).addEvent('drag', this.set.bind(this));
	},

	toElement: function()
	{
		return this.element;
	}
});

MooPick.ValueInput = new Class({
	Implements: [Events],
	element: null,
	max: {
		Hue: 366,
		Saturation: 100,
		Brightness: 100
	},

	initialize: function(name, space)
	{
		var input, max = ('rgb' == space) ? 255 : ('hsb' == space) ? this.max[name] : null;
		this.element = new Element('label', {title: name, 'for': name}).appendText(name.substr(0, 1).toUpperCase());

		input = new Element('input', {
			type: 'text',
			accessKey: name.substr(0, 1),
			name: name,
			space: space,
		});

		if (max)
			input.set('max', max);

		this.element.grab(input, 'bottom');

		input.addEvent('keydown', this.onKeyDown);
		input.addEvent('mousewheel', this.onKeyDown);
		input.addEvent('change', this.onChange.bind(this));
	},

	onKeyDown: function(e)
	{
		if ('mousewheel' == e.type)
			e.key = e.wheel>0 ? 'up' : 'down';

		if ('up' == e.key)
			this.value++;
		else if ('down' == e.key)
			this.value--;
		else
			return;

		this.fireEvent('change', {target: this});
	},

	// Check new value, correct overflow and fire event
	onChange: function(e)
	{
		var input = this.element.getFirst('input');

		if (input.get('max'))
		{
			if (isNaN(input.value.toInt()))
				input.value = 0;
			else
				input.value = input.value.toInt();

			if (input.value > input.get('max'))
				input.value = input.value % input.get('max') - 1;
			else if (input.value < 0)
				input.value = input.get('max');
		}

		if ('hex' == input.get('space') && !input.value.match(/^#[0-9a-f]{3,6}$/))
			input.value = '#000';

		this.fireEvent('change', {target: input});
	},

	toElement: function()
	{
		return this.element;
	}
});

MooPick.HandleTextInput = new Class({
	Extends: MooPick,
	input: null,

	initialize: function(input, options)
	{
		this.input = $(input);
		this.options.defaultValue = this.input.value;

		this.parent(options);

		this.input.addEvent('change', function(e){ this.set(e.target.value, 'hex'); }.bind(this));
		this.addEvent('change', function (e){ this.input.value = e.color.hex; }.bind(this));

		document.addEvent('click', this.hide.bind(this));
		this.input.addEvent('click', function(e){ this.show(); e.stopPropagation(); }.bind(this));
		this.container.addEvent('click', function(e){ e.stopPropagation(); }.bind(this));
	},
});
