# Huebee

🐝 _1-click color picker_

See [huebee.buzz](http://huebee.buzz) for complete docs and demos.

## Install

### Download

+ CSS:
  - [huebee.min.css](https://unpkg.com/huebee@1/dist/huebee.min.css) minified, or
  - [huebee.css](https://unpkg.com/flickity@1/dist/huebee.css) un-minified
+ JavaScript:
  - [huebee.pkgd.min.js](https://unpkg.com/huebee@1/dist/huebee.pkgd.min.js) minified, or
  - [huebee.pkgd.js](https://unpkg.com/huebee@1/dist/huebee.pkgd.js) un-minified

### CDN

Link directly to Huebee files on [unpkg](https://unpkg.com).

``` html
<link rel="stylesheet" href="https://unpkg.com/huebee@1/dist/huebee.min.css">
<!-- or -->
<link rel="stylesheet" href="https://unpkg.com/huebee@1/dist/huebee.css">
```

``` html
<script src="https://unpkg.com/huebee@1/dist/huebee.pkgd.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/huebee@1/dist/huebee.pkgd.js"></script>
```

### Package managers

Bower: `bower install huebee --save`

npm: `npm install huebee --save`

## License

### Commercial license

If you want to use Huebee to develop commercial sites, themes, projects, and applications, the Commercial license is the appropriate license. With this option, your source code is kept proprietary. Purchase a Huebee Commercial License at [huebee.buzz](http://huebee.buzz/#commercial-license)

### Open source license

If you are creating an open source application under a license compatible with the [GNU GPL license v3](https://www.gnu.org/licenses/gpl-3.0.html), you may use Huebee under the terms of the GPLv3.

[Read more about Huebee's license](http://huebee.buzz/license.html).

## Usage

Initialize Huebee on an anchor element.

``` html
<input class="color-input" />
```

Huebee will open whenever the anchor is clicked or focused (for inputs and buttons).

### Initialize with JavaScript

``` js
// use selector string to initialize on single element
var hueb = new Huebee( '.color-input', {
  // options
  setBGColor: true,
  saturations: 2,
});

// or use element
var colorInput = document.querSelector('.color-input');
var hueb = new Huebee( colorInput, {
  // options
  setBGColor: true,
  saturations: 2,
});
```

### Initialize with HTML

You can initialize Huebee in HTML, without writing any JavaScript. Add `data-huebee` attribute to an element.

``` html
<input class="color-input" data-huebee />
```

Options can be set in value of `data-huebee`. Options set in HTML must be valid JSON. Keys need to be quoted, for example `"setBGColor"`:. Note that the attribute value uses single quotes `'`, but the JSON entities use double-quotes `"`.

``` html
<input class="color-input" data-huebee='{ "setBGColor": true, "saturations": 2 }' />
```

## Options

``` js
var hueb = new Huebee( '.color-input', {
  // options

  hues: 6,
  // number of hues of the color grid
  // default: 12

  hue0: 210,
  // the first hue of the color grid
  // default: 0

  shades: 7,
  // number of shades of colors and shades of gray between white and black
  // default: 5

  saturations: 2,
  // number of sets of saturation of the color grid
  // 3 saturations => [ 100% saturation, 66% saturation, 33% saturation ]
  // default: 3

  notation: 'hex',
  // the text syntax of colors
  // values: shortHex, hex, hsl
  // shortHex => #F00, hex => #FF0000, hsl => hsl(0, 100%, 50%)
  // default: shortHex

  setText: false,
  // sets text of elements to color, and sets text color
  // true => sets text of anchor
  // string, '.color-text' => sets elements that match selector
  // default: true

  setBGColor: false,
  // sets background color of elements
  // and text color so text is visible on light or dark colors
  // true => sets background color of anchor
  // string, '.color-bg' => sets elements that match selector
  // default: true

  customColors: [ '#19F', '#E5A628', 'darkgray', 'hsl(210, 90%, 55%)' ]
  // custom colors added to the top of the grid

  staticOpen: true,
  // displays open and stays open
  // default: false

  className: 'color-input-picker',
  // class added to Huebee element, useful for CSS
});
```

## CSS

Set the size of the color grid with by setting the size of `.huebee__cursor` in CSS.

``` css
.huebee__cursor {
  width: 25px;
  height: 25px;
}
```

Style Huebee with your own CSS.

``` css
.huebee {
  transition: none; /* disable reveal/hide transition */
}

.huebee__container {
  background: #444;
  border: 1px solid #222;
  border-radius: 20px;
}

.huebee__cursor {
  border: 2px solid #19F;
}

.huebee__close-button {
  background: red;
}

.huebee__close-button__x {
  stroke-width: 2;
}
```

Use `className` option for specificity.

``` html
<div class="dark-swatch" data-huebee='{ "className": "dark-picker" }'></div>
<div class="light-swatch" data-huebee='{ "className": "light-picker" }'></div>
```

``` css
.dark-picker .huebee__container {
  background: #222;
}

.light-picker .huebee__container {
  background: #F8F8F8;
}
```

## API

``` js
var hueb = new Huebee( element, options );
```

### Properties

``` js
hueb.color // => #F00
// {String} - text color value

hueb.hue // -> 0
// {Number} - angle of hue of color, 0...360

hueb.sat // -> 1
// {Number} - saturation of color, 0...1

hueb.lum // -> 0.5
// {Number} - luminance of color, 0...1
```

### Methods

``` js
hueb.open()
// opens Huebee

hueb.close()
// closes Huebee
```

### Events

``` js
hueb.on( 'change', function( color, hue, sat, lum ) {
  console.log( 'color changed to: ' + color )
})
```

---

By [Metafizzy](http://metafizzy.co)
