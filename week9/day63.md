# Day 63: Sharing the Regression-Catching Test on X

Posted about the week's Anchor counter program and the test that caught a deliberately introduced regression.

Post link: [https://x.com/tanishhaa_28/status/2081073331827032081?s=20](https://x.com/tanishhaa_28/status/2081073331827032081?s=20)

## Post content

Day 63 of #100DaysOfSolana.

Spent the week building an Anchor counter program. I wrote a test that expects the wrong wallet to get rejected. Then deleted the one line (`has_one = authority`) that makes that true, just to watch my suite turn red.
