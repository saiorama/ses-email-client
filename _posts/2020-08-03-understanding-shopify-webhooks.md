---
layout: post
title: About Shopify Webhooks
date:   2019-08-03 12:06:39 +0530
author: Sai Ramachandran
---

# What is a webhook anyway?

Before we start discussing webhooks, I want to go over a related concept - the client/server architecture.

![enter image description here](https://landen.imgix.net/blog_wmVVKGKttSVkmWGQ/assets/hYBMlbzIzMvncWEe.jpg?w=880)

# Offering a service

So what is the client/server architecture? A server is something offering a service. For example, a dentist's office is a server providing services like teeth cleaning, extractions, selling you Invisalign, and more.

If you think abstractly enough, you can classify as a lot of things as servers. A lawyer? Just a server for filing lawsuits and to watch out for you in court. A public transit system? A service aimed at getting you from point A to point B.

# Client: Someone using a service

A client is therefore someone who uses a service. If I were to have dental issues, I could choose to be a client of the dentist "server".

## A matter of perspective

This is not to say that a client is usually a person and a server is usually a business. Far from it. Who is a client and who is a server in a relationship is merely a matter of perspective. To someone wishing to sell you (say) insurance products, you are the server. You serve out insurance premiums to them and they provide insurance coverage to you.

## Server: A more nuanced definition

If you think even more abstractly about client/servers, it should be apparent that a server has something a client wants. It could be skills, money, information, power - all sorts of things can make you a server.

# How do clients and servers interact?

Now that we understand client/server architectures, let's talk about the different ways clients and servers can interact.

Say you have applied to the Stanford MBA program. Every morning you open your email to find out your admission status. Did you get in? Will you soon be rubbing shoulders with the best of breed entrepreneurs of the world?

## Polling

This is type of interaction between the _client_ - you - and the _server_ - Stanford, which controls your admissions - is called **polling**. You periodically ask the server if they have new information about your admission status.

Eventually, the big email from Stanford comes. You're in! You've made it to the big leagues. Go YOU!

## Notifications/Webhooks

Now the roles are reversed. You no longer worry about hearing from Stanford. You go about your day without a care in the world knowing that Stanford's admissions office will call you when need your first semester fees or student loan application on file.

This is state of affairs is analogous to a **webhook** or a **notification**.

A webhook is a way for a server to tell the client to take an action. Of course, the client can choose to ignore the message from the server - like you would if your backup MBA program from the community college next door asked you to fill their forms now that you're Stanford bound.

It is useful to think of webhooks like the push notification you get on your phone but instead of a push notification sent to an app on your phone, it is directly sent by the server to a listener working on your behalf.

# Why webhooks?

So why use webhooks at all?

Think about **polling** for a second. You, the client, ask the server if it has anything for you. The server has to check its records, determine that it doesn't have anything for you, and then respond to you. Both you and the server are doing work in this case. Now multiply this amount of work by requests from all the clients of a server. Imagine the amount of wasted work.

On the other hand, when it comes to webhooks, you only start working when the server tells you that it has something for you. Until then, you're that cool kid who is Stanford bound and burning it up with friends in the intervening months.

From a workload perspective, webhooks are much less wasteful. Both you and the server work just once - the server tells you that it has something for you and you respond to that notification. Much better than haranguing the server for updates, don't you think?

Shopify provides both ways of interacting with them. You can keep bugging them for updates or you can wait for them to tell you when something happens.

### Webhooks reduce the load on both client and server

Therefore, the biggest argument in favor of webhooks is the reduced workload on both parties. The client and the server only talk to each other when necessary. Otherwise, they're off doing their own thing.

### Webhooks make the both the client and server a little more secure

Webhooks also provide an additional layer of security to both the server and the client. Servers have to open only a single point of entry - namely a way for clients to tell them how the server can reach them. On the flip side, the client too only opens a single point of entry - a place to receive notifications from the server.

If ever they want to stop talking to each - maybe because they no longer need to or because one party has been hacked - all they need to do is to stop using that webhook.

# How to create webhooks?

This is a great question. It isn't all peaches and cream in the world of webhooks. When it comes to polling, the client can poll the server using a simple mobile phone app.

In the case of webhooks, the server needs to know where to send a notification which implies that the client will have to be reachable via a single location. To go back to the Stanford story, this is analogous to you giving Stanford with a working phone number where you would be reachable.

## Webhooks in the case of Shopify

When it comes to Shopify webhooks, this requirement that clients provide a permanent reachable address isn't trivial to implement.

This is actually a major downside of webhooks.

You would have to create an entire infrastructure with a public URL in order to receive notifications from Shopify.

# What notifications does Shopify provide?

In any case, assuming you can use a third party service (maybe something like [Zeer0](https://zeer0.com/)?) to receive notifications from Shopify, what kinds of notifications does it provide?

[Shopify has 23 categories of notifications](https://help.shopify.com/en/api/reference/events/webhook) ranging from creation of orders to fulfillments to customers requesting a refund.

What you do with them is up to you. You could choose to ignore them, respond to them, or forward them to a downstream process.

# Now what?

I hope this brief overview of Webhooks (notifications) has given you a clearer understanding of what they actually are.

In brief, they are a safer way of listening to events happening on your Shopify store and responding to them in any way you please.

Businesses could use notifications to create beautiful invoices, manage their VATs or GST, tell fulfillment centers to prepare an outbound package, collect metrics about sales, or send hand written Thank You notes to new customers. The sky is the limit on what you can do with notifications.


> Written with [StackEdit](https://stackedit.io/).

