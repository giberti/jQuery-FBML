/**	

jQuery Plugin to mimic Facebook's Dynamic Visibility Syntax in FBML
Copyright (C) 2011 by Erik Giberti http://af-design.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

Usage:
Instantiate using standard jQuery syntax using the values passed as part of
the signature request.

$('body').fbml({
	"connection":true,
	"admin":true,
	"is_18":true,
	"is_21":true,
	"country":"us",
	"locale":"en_US"
});

*/

(function($) {

	var fbml = {
	
		// Parses FBML syntax
		parse: function(el){
			fbml.boolean_conditional(el, "fb\\:visible-to-connection", settings.connection);
			fbml.boolean_conditional(el, "fb\\:18-plus", settings.is_18);
			fbml.boolean_conditional(el, "fb\\:21-plus", settings.is_21);
			fbml.array_conditional(el, "fb\\:restricted-to", 'location', settings.country);
			var videos = $(el).find('fb\\:swf');
			for(var i=0; i< videos.length; i++){
				var $vid = $(videos[i]);
				var src = $vid.attr('swfsrc');
				if(src !== undefined){
					var width = $vid.attr('width');
					if(width == undefined){ width = 340; }
					var height = $vid.attr('height');
					if(height == undefined){ height = 270; }
					var embed = '<object width="'+ width +'" height="' + height + '"><param name="movie" value="' + src + '"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="' + src + '" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="'+ width +'" height="' + height + '"></embed></object>';
					$vid.html(embed);
				}
			}
		},

		// Handles click events
		click: function(evt){
			var el = evt.srcElement;
			fbml.showhide('hide', $(el).attr('clicktohide'));
			fbml.showhide('show', $(el).attr('clicktoshow'));
			fbml.showhide('toggle', $(el).attr('clicktotoggle'));
		},

		// For the else which is used in multiple locations
		fbelse: function(wrapper, condition){
			$(wrapper).find("fb\\:else").each(function(k,inner){
				if(condition){
					$(inner).html('<span style="display:none;">' + $(inner).html() + '<' + '/span>')
				}
			});
		},

		// Runs conditional display logic based on a boolean value
		array_conditional: function(el, tag, attr, user){
			$(el).find(tag).each(function(k,outer){
				var permitted = $(outer).attr(attr).split(',');
				condition = false;
				for(var i=0; i<permitted.length; i++){
					if(user.toLowerCase() == permitted[i].toLowerCase()){
						condition = true;
						i = permitted.length;
					}
				}
				var html = $(outer).html();
				if(!condition){
					html = '<span style="display:none;">' + html;
					html = html.replace("fb:else","/span><fb:else");
				}
				$(outer).html(html);
				fbml.fbelse(outer, condition);
			});
		},

		// Runs conditional display logic based on a boolean value
		boolean_conditional: function(el, tag, condition){
			$(el).find(tag).each(function(k,outer){
				var html = $(outer).html();
				if(!condition){
					html = '<span style="display:none;">' + html;
					html = html.replace("fb:else","/span><fb:else");
				}
				$(outer).html(html);
				fbml.fbelse(outer, condition);
			});
		},

		// Uses jQuery's built in show() and hide() to work
		showhide: function(type, idList){
			if(!idList){ return; }
			var ids = idList.split(',');
			if(ids.length === 0){ return; }
			switch(type){
				case 'hide': $.each(ids, function(k,v){ $('#' + v).hide(settings.duration); }); break;
				case 'show': $.each(ids, function(k,v){ $('#' + v).show(settings.duration); }); break;
				case 'toggle': $.each(ids, function(k,v){ $('#' + v).toggle(settings.duration); }); break;
			}
		}
	};

	var settings = {
		duration:	0,
		fbml:		true,
		connection:	false,
		admin:		false,
		is_18:		false,
		is_21:		false,
		country:	false,
		locale:		false
	};

	var methods = {
		init: function(options){
			return this.each(function(){
				if(options){ $.extend(settings, options); }
				$this = $(this);
				$this.bind({click:fbml.click});				
				fbml.parse($this);
			});
		}
	};

	$.fn.fbml = function(method){
		if(methods[method]){
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method){
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' is not supported in jquery.fbml');
		}
	};

})(jQuery);
