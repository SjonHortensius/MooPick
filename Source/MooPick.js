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
	along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
*/

var MooPick = new Class({
	Implements: [Options, Events],
	spaces: {
		'rgb': ['red', 'green', 'blue'],
		'hsb': ['hue', 'saturation', 'brightness'],
		'hex': ['hex'],
	},
	options: {
		namespace: 'MooPick',
		defaultValue: 'f60',
	},
	container: null,

	initialize: function(options)
	{
		if ('undefined' == typeof Color)
			throw new Exception('MooPick requires Color from MooTools More');

		this.setOptions(options);
		this._create(this.options.namespace);
		this.set(this.options.defaultValue, 'hex');
	},

	_create: function(namespace)
	{
		this.container = new Element('div', {'class': namespace+'Container hidden'});
		
		var palette = new Element('div', {'class': 'palette'});
		var cursor = new Element('span', {'class': 'cursor'});
		palette.addEvent('click', function(e){
			var x = e.client.x - palette.getPosition().x, s = x / palette.clientWidth * 100;
			this.container.getElement('input[name=saturation]').set('value', Math.round(s)).fireEvent('change', e);
			var y = e.client.y - palette.getPosition().y, b = 100 - y / palette.clientHeight * 100;
			this.container.getElement('input[name=brightness]').set('value', Math.round(b)).fireEvent('change', e);

			cursor.setStyles({
				left: x - cursor.clientWidth,
				top: y - cursor.clientHeight,
			});
		}.bind(this));
		this.container.grab(palette.grab(cursor));

		var slider = new Element('span', {'class': 'hueSlider'});
		var hue = new Element('div', {'class': 'hue'}).grab(slider);
		hue.addEvent('click', function(e){
			var y = e.client.y - hue.getPosition().y, h = 360 - y / hue.clientHeight * 360;
			this.container.getElement('input[name=hue]').set('value', Math.round(h)).fireEvent('change', e);
			slider.setStyle('top', Math.min(Math.max(y-slider.clientHeight, 0), hue.clientHeight));
		}.bind(this));

		this.container.grab(hue);
		this.container.grab(new Element('div', {'class': 'preview'}));
		var fieldset = new Element('fieldset');

		Object.each(this.spaces, function (inputs, space){
			inputs.each(function(name)
			{
				input = new Element('input', {type: 'text', accessKey: name.substr(0, 1), name: name});
				input.addEvent('change', function(e){ this.process(e.target, space); }.bind(this));
				fieldset.grab(input);
			}.bind(this));
		}, this);
		this.container.grab(fieldset);
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

	process: function(input, space)
	{
		if (!this.spaces[space])
			throw new Exception('Unsupported colorspace: '+space);

		var value = [];
		this.spaces[space].each(function (name){
			value.push(name == input.get('name') ? input.value : this.container.getElement('input[name='+ name +']').value);
		}.bind(this));

		if ('hex' == space)
			value = value.pop();

		this.set(value, space);
	},

	set: function(color, type)
	{
		// Workaround for https://github.com/mootools/mootools-more/issues/1172
		if (type == 'hex')
			type = null;

		this.value = new Color(color, type);

		Object.each(this.spaces, function (inputs, space){
			if ('hex' == space)
				return this.container.getElement('input[name=hex]').value = this.value.hex;

			inputs.each(function(name, idx)
			{
				this.container.getElement('input[name='+ name +']').value = this.value[space][idx];
			}.bind(this))
		}.bind(this));

		this.container.getElement('.palette').setStyle('background-color', [this.value.hsb[0], 100, 100].hsbToRgb());
		this.container.getElement('.preview').setStyle('background-color', this.value.hex);
	},
});

MooPick.TextInput = new Class({
	Extends: MooPick,
	element: null,

	initialize: function(element, options)
	{
		this.element = $(element);
		this.options.defaultValue = this.element.value;

		this.parent(options);

		document.addEvent('click', this.hide.bind(this));

		this.element.addEvent('change', function(e){ this.set(e.value, 'hex'); }.bind(this));
		this.element.addEvent('click', function(e){ this.show(); e.stopPropagation(); }.bind(this));
		this.container.addEvent('click', function(e){ e.stopPropagation(); }.bind(this));
	},
});
