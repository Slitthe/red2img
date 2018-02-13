# Red2IMG
Single page web app for viewing images from a customizable list of Reddit's subreddits. 

- Able to change the sorting **type** and **time**.



- Scrolling or pressing the "Load More" button attempts to load new images

- At first load, a maximum of 5 attempts are made in order to find an image/video, if none are found the search stops

- For performance reasons the image grid displays an image preview fetched via the  Reddit's API, which is 320px wide

- When going into Full Screen, videos are also played (automatically and without controls) 

- When going Full Screen, images/videos will be displayed in their **full** quality and occupy the whole window. (even if the image is smaller than the window)

- subreddits which do not allow images will not show in the autocomplete (but they can still be added manually by just writing the name and submitting the text input)

* The **Safe For Work** settings doesn't display images with a **NSFW** tag (which makes it possible for images which are NSFW but do not have the NSFW tag to still show)

* When **Safe For Work** is on, the autocomplete doesn't display **NSFW** subreddits (but again, this is dependent on the subreddits settings, so some NSFW results might still show)
---
### localStorage
The following settings are saved into Local Storage upon updating/changing them:
  - Subreddit List
  - Sorting Type
  - Sorting Time
  - Safe For Work
  - Show Titles
  
When the page loads, it attempts to these settings, if it fails to find one of them it load the default values instead.

The settings above will be saved when visiting from the same device and non-icognite browser.
  
---
### Customizable JavaScript Variables

urlParams.limit.value 

--- this specifiec how many API values to get (as to get at most 20 images per request)
  
images.imagesTarget

--- when to stop trying to get more images, only applies when the page first loads
  
images.maxNewSearchRequests 

--- the maximum amount of requests to make when trying to get images at first page load (it will attempt)
  
localStorageData.initialData

--- the default values for the settings, which will be loaded if they are not found in localStorage

---

## Libraries used:
* [FontAwesome](https://github.com/FortAwesome/Font-Awesome)
* [normalize.css](https://github.com/necolas/normalize.css)
* [alertify.js](https://github.com/alertifyjs/alertify.js) (to display communication errors and confirm certain changes in the settings)
* [awesomplete](https://github.com/LeaVerou/awesomplete) (for add subreddit autocomplete)
* [hammer.js](https://github.com/hammerjs/hammer.js) (touch gestures)
* [maonsry](https://github.com/desandro/masonry) (for image layout)
* [jQuery](https://github.com/jquery/jquery)
