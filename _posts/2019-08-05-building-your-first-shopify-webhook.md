---
layout: post
title: Learn by example - Building your first Shopify webhook
date:  2019-08-01 11:14:39 +0530
author: Sai Ramachandran
---

## Learn by example: Building your first Shopify webhook

![enter image description here](https://landen.imgix.net/blog_wmVVKGKttSVkmWGQ/assets/WaUIhoXgxHcmYItt.png?w=880)
## Learn how to create your first Shopify Webhook

### ...in 5 easy steps with screenshots and without writing a single line of code!

In this tutorial, I will show you how to create a Shopify webhook and post your first notification from your Shopify store to a webhook listener.

If you are more of a video kinda person, here's a [Youtube video](https://www.youtube.com/watch?v=AYjy8E1tsbM) which summarizes this blog post.

_[If you want to learn why Shopify webhooks are so useful, you can read_ [_this post_](https://zeer0.com/blog/about-shopify-webhooks)_. It gives even the most non-technical layuser an overview of webhooks and their usefulness.]_

## Step 1: Log in to your Shopify store's admin dashboard

The first thing you need to do is to log in to your Shopify store's admin screen.

In my case, I log in to `https://chicshop-dev-store.myshopify.com`**`/admin`**. Once you log in, you should be presented with a screen which looks something like this.

![enter image description here](https://landen.imgix.net/blog_wmVVKGKttSVkmWGQ/assets/qgqAsqWiMLmUeVHQ.png)
## Step 2: Head to the Notifications screen

Click Settings, then click on the Notifications link in the middle of the screen. See the screenshot below if you're lost.
![enter image description here](https://landen.imgix.net/blog_wmVVKGKttSVkmWGQ/assets/UArZNviRTjXjtyPO.png)
Your notifications screen should look like this.

![enter image description here](https://landen.imgix.net/blog_wmVVKGKttSVkmWGQ/assets/eNgrlKVRDaoRvuQT.png)
Scroll to the bottom of the Notifications screen to a section titled Webhooks which looks like this. To summarize, you reached the webhooks section by

1.  Logging in to your store's **`/admin`** dashboard
2.  Clicking on **`Settings`** on the bottom left of the screen
3.  Clicking on **`Notifications`** in the middle of the **`Settings`** screen
4.  Then scrolling to the bottom of the **`Notifications`** screen to the **`webhooks`** section.

![enter image description here](https://landen.imgix.net/blog_wmVVKGKttSVkmWGQ/assets/UoiHDbsIGzgVpCAR.png)
## Step 3: Open beeceptor.com in a new browser window

In a new browser window/tab, open [**`https://beeceptor.com`**](https://beeceptor.com/). Beeceptor is a free tool to receive notifications. For what we are trying to do, you don't even have to create a profile on Beeceptor!

Simply opening Beeceptor.com will show you a screen like below.
![enter image description here](https://landen.imgix.net/blog_wmVVKGKttSVkmWGQ/assets/XjufGABchpTSGgyL.png)

## Step 4: Create your first Shopify webhook!

Go back to the Shopify webhooks screen which you reached at the end of Step 2. Click on the **`Create webhook`** button. This should give you a screen as below.
![enter image description here](https://landen.imgix.net/blog_wmVVKGKttSVkmWGQ/assets/vsqDwEPWRqBxUDkh.png)

Paste the Beeceptor link copied at the end of Step 3 into the URL text box. Then click **`Save webhook`**. This should result in a screen like the below.
![enter image description here](https://landen.imgix.net/blog_wmVVKGKttSVkmWGQ/assets/FnOMuPGjcezhfFpP.png)
Of course, your webhook signature will be different from mine.

## Step 5 - Sending your first notification

You are now ready to send your first Shopify notification!

Click on the `**Send test notification**` link. This posts a dummy notification to Beeceptor. Don't worry - this is a test notification which does not affect your store in any way.

This is what your first test notification looks like on Beeceptor.

![enter image description here](https://landen.imgix.net/blog_wmVVKGKttSVkmWGQ/assets/rdFsJYfGPYyUGLez.png)
# Conclusion

As you can see, Shopify has made it super easy to test webhooks and notifications.

## What can you do after this?

Now that you are starting to get comfortable with webhooks, the next logical step would be to move off Beeceptor to a middle tier (like [Zeer0](https://zeer0.com/)?) which supports attaching workflows to notifications.

I mean, notifications are useful only if you respond to them.

## So what can you do with notifications?

Like I said in the [other blog on Shopify webhooks](https://zeer0.com/blog/about-shopify-webhooks), Shopify has 23 different types of webhooks. You can choose to listen to any or all of them.

For example, if you want to add new customers to a CRM like Salesforce or Hubspot for better relationship management, you could use the **`Customer creation`** webhook to link up Hubspot with Shopify.

![enter image description here](https://landen.imgix.net/blog_wmVVKGKttSVkmWGQ/assets/MzWfjylqvRAbpDZh.png)
Or if you want to inform your inventory management team when the inventory level at a specific location dips too low, you can use the **`Inventory level update`** webhook.

I would look at all the available webhooks and imagine different ways of using those webhooks to automate some or all of your Shopify workflows.

Happy automating!
