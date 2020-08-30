---
layout: post
title: Hosting on Landen.co
date:  2019-08-27 18:18:25 +0530
author: Sai Ramachandran
---

![enter image description here](https://landen.imgix.net/blog_wmVVKGKttSVkmWGQ/assets/rUHHfQcVEWTZHNIF.svg?w=880)

Until very recently, the Zeer0.com website was hosted on Landen which provides easy to use tools to create and quickly deploy beautiful landing pages for your startup.

As Zeer0 grew in complexity, it became more and more apparent that it would soon outgrow a simple landing page service and would need tighter integrations with a middle tier of some sort.

Obviously, this is a good problem to have. It means that the Zeer0 landing page served its purpose of converting site visitors into interested customers. It was now a matter of retaining those customers with great workflows while maintaining the excellent pagespeed performance of the original Landen website.

The first order of business for this rearchitecting project was to expose our services hosted on Wix as RESTful APIs. I will cover our RESTful middle tier in a later blog post.

In this post, I want to discuss the migration away from Landen.

# What Landen gets right?

[Landen](https://www.landen.co/) is a fantastic landing page service. If Net Promoter Scores were still a thing, my score for Landen would be 100.

While their free version is great to play around with, if you want to connect a custom domain to a Landen website, you have to buy their $29/month plan which lets you host three custom domains on their service. If you have just one landing page to host, you will still find yourself paying $29 to host it on Landen.

If you, like many entrepreneurs are working on more than one idea at the same time, the monthly $29 fee might motivate you to try up to three ideas in parallel to see which one gains traction first.

## Landen's UI/UX options are top notch

I am as far from being a competent designer as one can be but even I was able to create a nice looking website with complementary fonts, pleasing colors, and nifty touches like sloping lines and shading.

The number of choices available are sufficient to create a non-boxy, non-Bootstrappy like website without becoming overwhelming.

Compared to website builders like Wix, Landen errs on the side of simplicity. To be fair, Wix et al have far a loftier goal of helping you build ANY website while Landen is primarily for building landing pages.

This choice seems to work really well for Landen. As I was evaluating other landing page template, I kept coming back to Landen. With Landen, I was able to express my ideas about the Zeer0 website much faster and more smoothly than with any other website builder.

## Landen is fast

Landen is fast.

I discovered Landen through posts on IndieHackers where people were looking for reviews on their Landen landing pages. I invariably found that these landing pages scored 90+ on Google Pagespeed Insights - both mobile and desktop. Since page speeds are an important ranking factor to rank well in search results, entrepreneurs would do well to invest in trying to minimise their load speeds.

Somehow, Landen gets this correct right out of the box.

In fact, the search ranking for Chicshop - Zeer0's sister website - went up significantly as soon as I switched to Landen. Now, chicshop.in appears on the first page of Google when you search for **`chicshop`**  where it used to earlier languish in the second or third page.

Since nothing significant has changed about ChicShop other than the migration to Landen, I attribute it to Landen's blazing fast load speeds.

## Easy Deployment

Landen also makes it very easy to link custom domains to their website. It is practically idiot proof with just two DNS settings to worry about - one A record and one CNAME record.

The other thing I liked about Landen is that they auto-resolve people away from **`www.website.com`** to the naked **`website.com`** URL. The **`www`** subdomain has outlived its utility as a crutch for new internet users and Landen, to its credit, recognizes that.

In fact, if I hadn't figured out how to self-host a naked url outside Landen, I would have probably continued hosting Zeer0.com on Landen.

## Custom Code Sections

This is an experimental feature within Landen which lets you add custom code blocks to a landing page. I used this custom code section to add rich snippets to my Landen website. These rich snippets are obviously not visible to users but are consumed by Google to better contextualize my website.

## In-built Analytics

Landen websites come with built-in analytics which ad-blockers aren't equipped to block. This means you get a much clearer picture of how much traffic your website received compared to tools like Google Analytics and Google Tag Manager which can be blocked by blockers like Ghostery or UBlock Origin.

# What Landen does not get right?

I think Landen missed a trick by not having a cheaper option for a single domain. $29/month for three custom domains is definitely pricey for an entrepreneur who often don't have use for all three available custom domains.

Here are a few other places where Landen could improve.

## Terrible blog/post interface

The blogging/posting experience leaves a lot to be desired.

For example, the text box used to insert URL anchored by visible text looks like something copied from a W3C tutorial.

Maybe blogging isn't really a big priority for entrepreneurs but for me, content forms a big part of my marketing strategy so the blogging experience left my cold.

## Limited options for Email/Lead Capture

Email capture forms a critical function a landing page service but Landen does not have great tools or integrations to facilitate this function.

For example, leads can be dropped into a custom Landen email list, into a Mailchimp list, or posted to a URL you control. Of these, Mailchimp is only half-decent option.

Using Landen's inbuilt email list means you will have to monitor yet another email list to see if any one has subscribed to your website.

Building and deploying a URL just to manage leads is wasted time/effort, IMHO.

Contact forms on Landen can either be emailed or posted to Slack. Receiving contact form data via email seems far more reasonable than building an inbound webhook in Slack.

## Confused Header Navigation

Landen's header breaks down if your site has more than one page while also deep linking into sections within the home page.

For example, if your home page has a **`#pricing`** section linked in the header and a separate **About** page, the **`#pricing`** link won't work from the **About** page out of the box. You will have to link the Pricing menu option to **`/#pricing`** (note the leading /) which is a little awkard to see.

# And so?

IMHO, the benefits of Landen far outstrip its negatives. You could do much worse than using it to host your next landing page. Like I said above, even as I was looking for landing page templates, I kept going back to Landen despite their price and even though I didn't have a need for three custom domains.

If you need any help with your Landen site, feel free to email me from the Zeer0.com homepage.


> Written with [StackEdit](https://stackedit.io/).
