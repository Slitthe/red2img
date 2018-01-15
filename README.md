# reddit-image-viewer

Goals/requirements: 

* To be able to view the images of a single or multiple subeditors in a gallery-like format.
* Single or multiple subreddits.
* View the image full size.
* Have the same basic sorting as their website (hot, new, rising, top, constroversial).
  * For top and controversial, you can also select the time frame (hourly, daily, weekly, monthly, yearly or all)
* Starting with a list of predefined subreddits based on which the image gallery is shown (this acts as the "home" page of the website)
  * Users can then add their own subreddits which will be included in that list
  * Additionally, users can also remove those initial subreddits
    * Those settings should be not be lost upon exiting (maybe by using Local Storage?)
  * A list of subreddits suggestions are to be shown (for single or multiple subreddits)
* Users can also see the gallery for a single subreddit by clicking on the name of that subreddit from the list or by manually entering it

* There should be some basic settings (to show/hide NSFW content, to show/hide post's title)
* Users should be able to go to that post's reddit page if they click on the name of the image (only if the post't title's settings is turned on)


* Implement a Full-Page Single Image viewer, the image should fit the 100% of the screen, but maintain it's original aspect ratio

* Upon scrolling past the edge of the screen, more images should be fetched. The same thing should happen for when you view the images in a full screen format (maybe fetch them a bit earlier in order to not have that request/response lag ?)
