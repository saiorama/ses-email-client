---
layout: post
title: Adding Rich Snippets to Shopify
date:  2019-08-03 15:33:19 +0530
author: Sai Ramachandran
---

![enter image description here](https://landen.imgix.net/blog_wmVVKGKttSVkmWGQ/assets/zwrLGdBtMzIDJvwo.jpg?w=880)
This blog post is going to be quite technical but the subject it deals with - rich snippets - is very important so you would do well to not let your eyes glaze over. Rich snippets can really boost your search performance and bring you lots of eyeballs which would otherwise go to your competitors.

# What is a Rich Snippet?

The dirty little secret of all the fancy technology that people like me and the thousands of engineers sitting in Silicon Valley make is that it is quite dumb. Even the most amazing AI or machine learning models cannot hold a candle to your average 10 year old..._for anything that needs inferential and deductive reasoning_.

## Why search engines have it hard?

Search engines have it harder than almost any other technology. Their inputs are, by definition, written text - often badly - placed inside markup that no one would be able to easily read and digest at length.

(_Aside_ - _Markup allows you format and display content. HTML is a type of markup. Without markup, the entire internet would like text written in Notepad._)

What is worse is that browsers - whose job it is to digest this markup and show it to humans - are very forgiving. They will try their hardest to make sense of the markup given to them to show *something* to the human.

Further, humans are very, very good at inferring patterns and working with sparse data. So even if a browser breaks down while trying to process a piece of content, humans can still make some sense of whatever gobbledygook the browser throws up on the screen.

Search engines don't have the luxury of reading in poorly formed content and asking humans to fill in any gaps they may encounter. This is because search engines index millions upon millions of pages each of which is likely to have one or more errors. They have to independently figure out as much about the internet as they can.

## Why rich snippets were invented?

Faced with this difficulty, the companies behind these search engines got together and came up with a way to help content creators (i.e., website owners) help them.

### Defining entities

They first identified a set of entities and relationships between those entities. E.g., a website and its founder are both entities whose interrelationship could be defined as `<website>` was `<founded>` by `<person>`.

### Inventing a format

Then they defined a format using which a person could identify themselves as the founder of a website. Of course, this format is not limited to just this above interrelationship. There are a whole host of entities and interrelationships covered in great, though in a very dry and technical manner, detail on [Schema.org](https://schema.org/)

### Making the format public

Finally, they made this format public and asked website owners to insert such formatted information into their website's markup so that search engines could make better sense of the entities which make up the Internet.

Each such formatted information is a Rich Snippet.

An entity on the internet can have any number of rich snippets explaining to Google, Bing, Yandex, and every other search engine how exactly this entity fits into whatever else these search engines know about the Internet.

For example, I run both [Zeer0](https://zeer0.com/) and [Chicshop](https://chicshop.in/). Once the search engines read in both Zeer0's and Chicshop's rich snippets, they can easily work out that Zeer0 and Chicshop are siblings belonging to someone named [Sai Ramachandran](https://ramachandr.in/).

Now that you have a 10,000 ft view of Rich Snippets, let us see how Shopify handles them.

# Does Shopify even support Rich Snippets?

Yes, Shopify does handle Rich Snippets but how do we find out what your Shopify store's default rich snippet looks like?

To do this,

1.  go to Google's [Structured Data Testing Tool](https://search.google.com/structured-data/testing-tool/u/0/)
2.  enter your Shopify store's URL here
3.  click `Run Test`

Google will proceed to show you your store's source code and any snippets if it finds them. For example, Google read these two entities from my Shopify store - namely an `Organization` and a `Website`

![enter image description here](https://landen.imgix.net/blog_wmVVKGKttSVkmWGQ/assets/weKgrdaeKAAJJkIR.png)
# So where are these Rich Snippets located?

Before I tell you where these rich snippets are located, I want to take a brief detour into the world of web technologies.

There used to be a time when HTML files were written as monoliths. I'm talking about a really long time ago, circa mid-nineties Internet.

Web technology has evolved since then. Today, web pages are composed of blocks of functionality. For example, the search box shown on the top of the page may be a block. The header, the footer, the hero section, everything you see on the screen is built independently. Web developers then mix and match these blocks to come up with a look and layout they like. Once done, they write a single file which contains all the blocks they need to define a page.

## Theme.liquid

In Shopify's case, that single page is `theme.liquid`.

### Experiment: adding a new rich snippet at the bottom of theme.liquid

Therefore, our first experiment will be to insert our Rich Snippet into theme.liquid to see how it affects how Google reads our page.

_[Here is my_ [_video showing you where to paste your rich snippet_](https://youtu.be/wlDhtC-5tRE?t=127) _inside_ _`theme.liquid`__.]_

This is what that would look like.

![enter image description here](https://landen.imgix.net/blog_wmVVKGKttSVkmWGQ/assets/NvSgbpvoqTddcdDr.png)
And here's how Google Structured Data Testing Tool sees our rich snippet.
![enter image description here](https://landen.imgix.net/blog_wmVVKGKttSVkmWGQ/assets/gjtRYGPEwcVDpfdT.png)
As you can see, Google thinks there are two `Organization` rich snippets on that page. This is clearly wrong. It's poor Internet hygiene to leave duplicated and possibly conflicting data lying around.

### Experiment: Outcome

This means that the place where we inserted our new rich snippet inside `theme.liquid` is incorrect.

### Experiment: More digging

The Structured Data Testing Tool actually helps us figure out where exactly the default Shopify rich snippet related to Organization and Website are located. Clicking on any portion of the output of the Structured Data Testing Tool takes you to the corresponding link of content displayed on the left.

_[See how to use the use_ [_the output of the Structured Data Testing Tool_](https://youtu.be/wlDhtC-5tRE?t=201) _to figure out where your rich snippet is located.]_

### Header.liquid

They're located inside `sections/header.liquid` which looks like this.

![enter image description here](https://landen.imgix.net/blog_wmVVKGKttSVkmWGQ/assets/tltfSTpbnwozFKyw.png)
### Two approaches to updating rich snippets

Now that you know which file to edit to insert the correct, long form rich snippet, you have two choices. You could either replace the old rich snippets with the snippets emailed to you by `Zeer0` or simply add the extra fields you need to the existing snippets.

In my case, I plan to replace the old rich snippets with Zeer0's snippets which have a lot more detail. Both approaches are equally valid.

The choice is yours.

> Written with [StackEdit](https://stackedit.io/).


