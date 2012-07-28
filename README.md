Touchy™JS
__________

TML modules
___________

<tml:searchbar onsubmit="submitFunc"></tml:searchbar>

Attributes:
* onsubmit - Define a callback to be invoked when a user clicks "submit"/"done" in mobile. The searchbar value is sent to the callback as first argument.
* defaulttext - A placeholder that appears when empty. Also, a "default" className is added to the input element when the desult text is inserted.
* id - "tml-searchbar-searchfield"

A supporting object TouchyJS.Searchbar is available as well

Methods:

* TouchyJS.Searchbar.getValue()
* TouchyJS.Searchbar.setValue(newValue)
* TouchyJS.Searchbar.submit()
* TouchyJS.Searchbar.onKeyboardVisible(callback)
* TouchyJS.Searchbar.onKeyboardHidden(callback)
* TouchyJS.Searchbar.getInputElement()


