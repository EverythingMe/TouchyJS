# Touchy™JS - mobile webapp developement made easy

Out of the box, your app gets fullscreen size, animated navigation and browser history, smart searchbar, environment info and much more.
Touchy™JS is built as a toolkit so you can use it within your existing webapp without refactoring (apart from the Nav module).

### Touchy™JS Modules

* Env - Environment info about the user's device. Platform, OS, orientation, screen size, touch and swipe detection..
* Nav - In-page animated navigation, browser history, deep linking and a progress indicator.
* Viewport - Calculates fullscreen dimensions and allows to hide the address bar.
* UI components - a smart searchbar, a swiper and a slider.

### Dependencies

Loading one of these is required before TouchyJs script.
[Zepto](http://www.zeptojs.com) / [jQuery](http://www.jquery.com)

### Quick start


Prepare the page DOM

~~~ html
<body>

  <div class="tml_header">
    header
  </div>
  
  <div class="tml_content" id="page1">
    first page
  </div>
  
  <div class="tml_content" id="page2">
    second page
  </div>
  
</body>
~~~

Include required scripts near end of page

~~~ html
<script src="zepto.js"></script>
<script src="touchy.min.js"></script>
~~~

That's it! You're ready to go! Here's a demo page.

Now, let's try page navigation. Insert some buttons into the pages that use `TouchyJS.Nav`.

~~~ html
<div class="tml_content" id="page1">
  first page
  <br />
  <button onclick="TouchyJS.Nav.goTo('page2')">Go to second page</button>
</div>

<div class="tml_content" id="page2">
  second page
  <br />
  <button onclick="TouchyJS.Nav.back()">Go to second page</button>
</div>
~~~

Here's a demo page

Let's take it further though.
Insert a searchbar TML component:

HTML

~~~ html
<div class="tml_header">
  <tml:searchbar onsubmit="showSearchTerm" defaulttext="Type something in"></tml:searchbar>
</div>
~~~

JavaScript

~~~ javascript
function showSearchTerm() {
  var term = TouchyJS.Searchbar.getValue();
  alert(term);
}
~~~

Here's a demo page

### Target platforms

* All modern browsers apart from IE
* iOS 3+ Safari
* Android 2.1+ Browser
* Android Firefox mobile


