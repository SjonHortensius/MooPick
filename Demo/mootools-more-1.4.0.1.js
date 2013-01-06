// MooTools: the javascript framework.
// Load this file's selection again by visiting: http://mootools.net/more/239c640e7cfcbf489d34dd80e20d2c92 
// Or build this file again with packager using: packager build More/Drag More/Color
/*
---
copyrights:
  - [MooTools](http://mootools.net)

licenses:
  - [MIT License](http://mootools.net/license.txt)
...
*/
MooTools.More={version:"1.4.0.1",build:"a4244edf2aa97ac8a196fc96082dd35af1abab87"};var Drag=new Class({Implements:[Events,Options],options:{snap:6,unit:"px",grid:false,style:true,limit:false,handle:false,invert:false,preventDefault:false,stopPropagation:false,modifiers:{x:"left",y:"top"}},initialize:function(){var b=Array.link(arguments,{options:Type.isObject,element:function(c){return c!=null;
}});this.element=document.id(b.element);this.document=this.element.getDocument();this.setOptions(b.options||{});var a=typeOf(this.options.handle);this.handles=((a=="array"||a=="collection")?$$(this.options.handle):document.id(this.options.handle))||this.element;
this.mouse={now:{},pos:{}};this.value={start:{},now:{}};this.selection=(Browser.ie)?"selectstart":"mousedown";if(Browser.ie&&!Drag.ondragstartFixed){document.ondragstart=Function.from(false);
Drag.ondragstartFixed=true;}this.bound={start:this.start.bind(this),check:this.check.bind(this),drag:this.drag.bind(this),stop:this.stop.bind(this),cancel:this.cancel.bind(this),eventStop:Function.from(false)};
this.attach();},attach:function(){this.handles.addEvent("mousedown",this.bound.start);return this;},detach:function(){this.handles.removeEvent("mousedown",this.bound.start);
return this;},start:function(a){var j=this.options;if(a.rightClick){return;}if(j.preventDefault){a.preventDefault();}if(j.stopPropagation){a.stopPropagation();
}this.mouse.start=a.page;this.fireEvent("beforeStart",this.element);var c=j.limit;this.limit={x:[],y:[]};var e,g;for(e in j.modifiers){if(!j.modifiers[e]){continue;
}var b=this.element.getStyle(j.modifiers[e]);if(b&&!b.match(/px$/)){if(!g){g=this.element.getCoordinates(this.element.getOffsetParent());}b=g[j.modifiers[e]];
}if(j.style){this.value.now[e]=(b||0).toInt();}else{this.value.now[e]=this.element[j.modifiers[e]];}if(j.invert){this.value.now[e]*=-1;}this.mouse.pos[e]=a.page[e]-this.value.now[e];
if(c&&c[e]){var d=2;while(d--){var f=c[e][d];if(f||f===0){this.limit[e][d]=(typeof f=="function")?f():f;}}}}if(typeOf(this.options.grid)=="number"){this.options.grid={x:this.options.grid,y:this.options.grid};
}var h={mousemove:this.bound.check,mouseup:this.bound.cancel};h[this.selection]=this.bound.eventStop;this.document.addEvents(h);},check:function(a){if(this.options.preventDefault){a.preventDefault();
}var b=Math.round(Math.sqrt(Math.pow(a.page.x-this.mouse.start.x,2)+Math.pow(a.page.y-this.mouse.start.y,2)));if(b>this.options.snap){this.cancel();this.document.addEvents({mousemove:this.bound.drag,mouseup:this.bound.stop});
this.fireEvent("start",[this.element,a]).fireEvent("snap",this.element);}},drag:function(b){var a=this.options;if(a.preventDefault){b.preventDefault();
}this.mouse.now=b.page;for(var c in a.modifiers){if(!a.modifiers[c]){continue;}this.value.now[c]=this.mouse.now[c]-this.mouse.pos[c];if(a.invert){this.value.now[c]*=-1;
}if(a.limit&&this.limit[c]){if((this.limit[c][1]||this.limit[c][1]===0)&&(this.value.now[c]>this.limit[c][1])){this.value.now[c]=this.limit[c][1];}else{if((this.limit[c][0]||this.limit[c][0]===0)&&(this.value.now[c]<this.limit[c][0])){this.value.now[c]=this.limit[c][0];
}}}if(a.grid[c]){this.value.now[c]-=((this.value.now[c]-(this.limit[c][0]||0))%a.grid[c]);}if(a.style){this.element.setStyle(a.modifiers[c],this.value.now[c]+a.unit);
}else{this.element[a.modifiers[c]]=this.value.now[c];}}this.fireEvent("drag",[this.element,b]);},cancel:function(a){this.document.removeEvents({mousemove:this.bound.check,mouseup:this.bound.cancel});
if(a){this.document.removeEvent(this.selection,this.bound.eventStop);this.fireEvent("cancel",this.element);}},stop:function(b){var a={mousemove:this.bound.drag,mouseup:this.bound.stop};
a[this.selection]=this.bound.eventStop;this.document.removeEvents(a);if(b){this.fireEvent("complete",[this.element,b]);}}});Element.implement({makeResizable:function(a){var b=new Drag(this,Object.merge({modifiers:{x:"width",y:"height"}},a));
this.store("resizer",b);return b.addEvent("drag",function(){this.fireEvent("resize",b);}.bind(this));}});(function(){var a=this.Color=new Type("Color",function(c,d){if(arguments.length>=3){d="rgb";
c=Array.slice(arguments,0,3);}else{if(typeof c=="string"){if(c.match(/rgb/)){c=c.rgbToHex().hexToRgb(true);}else{if(c.match(/hsb/)){c=c.hsbToRgb();}else{c=c.hexToRgb(true);
}}}}d=d||"rgb";switch(d){case"hsb":var b=c;c=c.hsbToRgb();c.hsb=b;break;case"hex":c=c.hexToRgb(true);break;}c.rgb=c.slice(0,3);c.hsb=c.hsb||c.rgbToHsb();
c.hex=c.rgbToHex();return Object.append(c,this);});a.implement({mix:function(){var b=Array.slice(arguments);var d=(typeOf(b.getLast())=="number")?b.pop():50;
var c=this.slice();b.each(function(e){e=new a(e);for(var f=0;f<3;f++){c[f]=Math.round((c[f]/100*(100-d))+(e[f]/100*d));}});return new a(c,"rgb");},invert:function(){return new a(this.map(function(b){return 255-b;
}));},setHue:function(b){return new a([b,this.hsb[1],this.hsb[2]],"hsb");},setSaturation:function(b){return new a([this.hsb[0],b,this.hsb[2]],"hsb");},setBrightness:function(b){return new a([this.hsb[0],this.hsb[1],b],"hsb");
}});this.$RGB=function(e,d,c){return new a([e,d,c],"rgb");};this.$HSB=function(e,d,c){return new a([e,d,c],"hsb");};this.$HEX=function(b){return new a(b,"hex");
};Array.implement({rgbToHsb:function(){var c=this[0],d=this[1],k=this[2],h=0;var j=Math.max(c,d,k),f=Math.min(c,d,k);var l=j-f;var i=j/255,g=(j!=0)?l/j:0;
if(g!=0){var e=(j-c)/l;var b=(j-d)/l;var m=(j-k)/l;if(c==j){h=m-b;}else{if(d==j){h=2+e-m;}else{h=4+b-e;}}h/=6;if(h<0){h++;}}return[Math.round(h*360),Math.round(g*100),Math.round(i*100)];
},hsbToRgb:function(){var d=Math.round(this[2]/100*255);if(this[1]==0){return[d,d,d];}else{var b=this[0]%360;var g=b%60;var h=Math.round((this[2]*(100-this[1]))/10000*255);
var e=Math.round((this[2]*(6000-this[1]*g))/600000*255);var c=Math.round((this[2]*(6000-this[1]*(60-g)))/600000*255);switch(Math.floor(b/60)){case 0:return[d,c,h];
case 1:return[e,d,h];case 2:return[h,d,c];case 3:return[h,e,d];case 4:return[c,h,d];case 5:return[d,h,e];}}return false;}});String.implement({rgbToHsb:function(){var b=this.match(/\d{1,3}/g);
return(b)?b.rgbToHsb():null;},hsbToRgb:function(){var b=this.match(/\d{1,3}/g);return(b)?b.hsbToRgb():null;}});})();