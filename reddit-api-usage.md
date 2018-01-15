The endpoint is the same for all: https://www.reddit.com/

#### Getting Data about a single subreddit
  - /r/*subredditName*.json

#### Getting Data about about multiple subreddits 
  - /r/*subreddit1*+*subreddit2*+*subreddit3*...+*subredditN*.json
  
---
### Sorting

You can use this sorting methods on both single and multiple subreddits

-  /r/subredditName*(s)*/*new*.json
-  /r/subredditName*(s)*/*rising*.json
-  /r/subredditName*(s)*/hot.json
-  /r/subredditName*(s)*/controversial.json
-  /r/subredditName*(s)*/top.json

For *controversial* and *top* posts you can also sort them by time period:
  - hourly
  - daily
  - weekly
  - monthly
  - yearly
  - all
  
To do so, you hvae to use the **t** query  parameter and give it one of the following possible values: **hour**, **day**, **week**, **month**, **year**, **all**

Example: /r/worldnews+pics+pcmasterrace/controversial.json?*t*=*all*


Some other useful query parameters

- before/after --> Use them to get to the next or previous "page" of the curren't posts
  - exampe https://www.reddit.com/r/pcmasterrace+pics+worldnews/controversial.json?t=all&after=t3_2modkc would take you to the next page of the original https://www.reddit.com/r/pcmasterrace+pics+worldnews/controversial.json?t=all (the after id is generated when you first get the page, because it's not static)
  
- limit --> you can use this to limit how many result to get back 
  - its **25** by default, max: **100**, accepts integers (duh!)
  
  ---
  
  #### Data response format
  
  Since you can get back different data types (because you can do a lot of things using reddit, even go as far as build your own reddit client). To identify different data types, the data list has the property of **type**
  
- t1_	Comment
- t2_	Account
- **t3_**	Link
- t4_	Message
- t5_	Subreddit
- t6_	Award

--> the **t3_** represents a post, if that post is an image, then the post's link will link to the image itself, this is what you need for the image gallery 


Each of the post's actual data is stored in *response*.data.children, this property stored an array of objects as data. In the order that you specified (the default sorting order is by **hot**ness


--- 

Individual post data format

--> Now, each post has a whole bunch of iteresting, but largely useless (for this application) properties. However, in thile case here's the one's that seem really useful:

* score: *integer*

    --> this is the score of the link, as it would appear in the reddit's website

* over_18: *true* / *false*

    --> For filtering adult content if the user chooses so
    
 * gilded: *integer*
    --> How many times the link has been given gold, 0 for none, 1+ for how many times
    
 * url: *string*
     --> for link posts, this is the actual link of the post, useful for determining if it's an image
     
  * subreddit_name_prefixed: r/*subredditName*
  
    --> displays the name of the subreddit this post belong to
    
  * preview
    * .enabled --> this basically says that if on the website that preview icon is shown or not
    * .images.*array* (usually it's only one element)
      * .*array*.resolutions --> this stores an array of images of different resolution (starting from the lowest)
        * width: 108, 216, 320, 640 and 900px
        
 !Important note: whole bunch of posts have preview images, but this **DOESN'T** mean that they are all images. For example a link to an article could still have a preview image attached to it, and that image having different resolutions, but that's just because that image has been automatically generated as the preview for that post.
 
 Need to use a different method of determining if that post is a link to an image (maybe be seeing if the url itself has common image extensions: .gif, .png, .jpg etc...

---
#### Searching
/search.json?*url_parameters*

  - q = *string* --> this is the actual search query
  - limit = *integer* --> how many results to show
  - include_over_18 = *boolean* --> if to include ornot adult searches
