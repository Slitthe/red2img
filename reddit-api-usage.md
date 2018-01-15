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
