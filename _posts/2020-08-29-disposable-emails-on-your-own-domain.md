---
layout: post
title: Disposable Emails on your own domain
date:   2020-08-29 12:06:39 +0530
author: Sai Ramachandran
---

# Get disposable emails for your domain in minutes

> Protect your privacy and save some serious cash by setting up
> disposable emails for your domain
> 
If you have been on the Internet for more than a day, you have probably heard about [Mailinator](https://mailinator.com).

![Email](https://images.unsplash.com/photo-1581349437898-cebbe9831942?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)

Mailinator, for the one dude at the back who has never heard of it, is a service that lets you use any, yes _any_, email id so long as it is @mailinator.com.

Of course, like I have [written](https://medium.com/@ssr233/use-mailinator-at-your-own-risk-fb84db4f79c1) before, no good deed goes unpunished, so too with Mailinator.

1.  It became a victim of its own success — as more and more people have started using Mailinator, website owners have started blocking people from signing up with an **@mailinator.com** email address.
2.  Your information could leak. Like I showed in the [other article](https://medium.com/@ssr233/use-mailinator-at-your-own-risk-fb84db4f79c1), our friend P. Sai of Orlando, FL, likes to order burgers and has an 889 area code phone number.
3.  Finally, Mailinator is someone else’s property. They may be well meaning today but no one should put all their eggs in someone else’s basket. As the adage goes, if the product is free, _YOU_ are the product.

Mailinator, for all its above problems, had a purpose and a role to play in the progression of the Internet to where it is today.

In this article, I describe how to set up a service similar to Mailinator for your own domain.

## What you will need to make this happen

1.  A domain for which you want to configure disposable emails
2.  Some very basic familiarity with configuring DNS records
3.  An AWS account with credit card SES is a paid service)
4.  Access to git and [github](https://github.com/psiCode/ses-email-client)

We will set up our private Mailinator clone in three parts.

In **Part 1** — consisting of Steps 1 and 2, we will set up our domain and configure SES to start receiving emails. If you want, you can even stop after Part 1 because technically, at this point, you have successfully set up a system to use disposable emails. The issue with stopping after Part 1 is that the emails are not in a very human readable form.

In **Part 2** — Steps 3 to 7 — we will expose two API endpoints to i) download a list of emails ii) and to get the content of those emails.

In **Part 3** — Step 8 — which is left incomplete, you will have to implement a browser or app based UI to use the APIs created in Part 2 to download and display emails in a human friendly manner.

# Step 1 — Setting up your domain in SES

The first thing you need to do to start receiving emails at your domain is to tell SES about your domain.

## An aside about MX records

MX stands for **M**ail e**X**change.

The designers of the Internet, in the interest of decoupling as many parts as possible of a domain’s functionality, made it so that you could tell people where to access your website (through A records) and how to reach you by email (through MX records). This way, even if your website is down, you will be able to communicate with the world via email.

In fact, you do not even need to have a website if all you want to do is to receive emails.

For example, I own a domain called [sairamachandr.in](https://sairamachandr.in) which till date does not have a website. Clicking on that link takes you to [www.ramachandr.in](https://www.ramachandr.in) owned by, you guessed it, ME. I use sairamachandr.in purely to receive emails.

## Configuring SES (the DNS records way)

On the SES home page, navigate to the **Domains** section below Identity Management. This is where you will inform SES that you in fact, own your domain and would like to use SES as your mail provider.

Now click the bright blue **Verify a New** **Domain** button.



![enter image description here](https://miro.medium.com/max/425/1*hD0iw1eKTjUYqDiJgedBPw.png)
After you have entered your domain name, you will see a screen telling you how you need to configure the DNS records so that SES knows that you indeed own your domain name.

![https://miro.medium.com/max/700/1*jO3zWyn_8XwWhMtA4CRp3Q.png](https://miro.medium.com/max/700/1*jO3zWyn_8XwWhMtA4CRp3Q.png)

SES achieves this by asking you create the following DNS records

1.  MX — to tell the world where emails sent to your domain are received
2.  TXT — to verify your ownership of your domain
3.  CNAME (for DKIM) — DKIM stands for DomainKeys Identified Mail. You will create multiple CNAME records to finish this step.

Once the DNS records have been configured, SES automatically verifies the records and tells you that your ownership of your domain has been confirmed. In my experience, this step usually takes less than five minutes but don’t be too alarmed if it takes a little longer.

**_Caveat_**: Here is a bit of a gotcha with setting up MX records. Technically, due to DNS rules, you cannot have both CNAME and MX records with the same domain name.

I.e., in my case, I would not be allowed to configure an MX and a CNAME record whose host was ramachandr.in.

The typical workaround I have seen is to have your website hosted on [www.example.com](http://www.example.com) (CNAME) while your MX record uses example.com. This allows you to receive @example.com emails while people can visit your website on [www.example.com.](http://www.example.com.)

If you like bare domain names, this can be annoying but it isn’t the end of the world, in my opinion.

# Step 2 — Creating a rule set for emails sent to your newly configured domain

Since SES is a transactional email service, it does not provide a UI to let you read emails sent to you. In fact, it goes so far as to not provide any POP or IMAP access to your emails.

It does let you configure certain actions that you can perform when an email is received, namely

1.  Save emails to an S3 bucket
2.  Notify a downstream system via SNS
3.  Trigger a lambda function

You can also combine these actions in any order you want. In our case, we will save the emails to S3.

## Make an S3 bucket

To achieve this, go to S3 and make a bucket with any name you want. You do not have to give any special permissions to this bucket to make it work with SES.

You could also create a folder inside this bucket if you want to receive emails from multiple domains in that same bucket.

While the folder name can be anything, it is typically advisable to name the folder after the domain whose emails you will be storing inside that folder.

## Create new email handling rule

Then, go back to SES, and click on Rule Sets under Receiving Emails.

Click on the Blue button titled **View Active Rule Set**.
![enter image description here](https://miro.medium.com/max/488/1*kom_iCAhvz5jrXIFeJjfpA.png)
Create a new rule.

In the first step, enter the domain name for which you want to receive emails.

In the next step, choose Action Type as S3.
![enter image description here](https://miro.medium.com/max/687/1*67piB16yxFHB5xcXQ_ODvw.png)

Name the bucket where you wish to send these emails. In the field titled **Prefix**, enter the name of the folder within the bucket where you want to store these emails. If you have not created a folder inside the bucket, you can leave the **Prefix** field empty.

![enter image description here](https://miro.medium.com/max/700/1*zfTPLtN6kEtRBE09rc0ZJA.png)

## Testing Part 1 — Steps 1 and 2

Great! Now you are done with Part 1 of the setup.

You should be able to send yourself an email @yourdomain.com and see that email appear in S3 as a file with a random long alphanumeric string name like so.
![enter image description here](https://miro.medium.com/max/700/1*Ky-COphYFHAg4ulDZmWRxA.png)

## Step 3 — Renaming the email file

S3, being a “simple” storage solution, does not provide a way to get a filtered list of files names. When you are talking about emails, which are inherently LIFO in how we access them, this lack of filterability can prove to be a deal breaker.

Fortunately, the solution is quite straightforward though you will have to

1.  create a lambda function which prefixes a date and unix epoch timestamp to each email file name; and
2.  trigger the lambda created above for each email file inserted into S3.

To create the lambda, go to my [project github](https://github.com/psiCode/ses-email-client) and copy the source code of [this lambda function](https://github.com/psiCode/ses-email-client/rename-eml-file-s3.js). Then go to AWS Lambda and recreate this lambda there.

Once the Lambda is created, go back to your S3 bucket created in Step 2.

At the bucket level, you will see a tab called **Properties**. The Properties tab has a section called **Events**. Here, add a new event.
![enter image description here](https://miro.medium.com/max/700/1*fR5p93FCGclxXPR7SgkhXg.png)

Every time a new object is PUT into the S3 bucket (along with an optional prefix representing the email folder), you should trigger the lambda function created above.

You must be wondering why we prefix the email file name with date. This step makes it easy for us to tell S3 to return objects belonging to the same date. Attaching the Unix epoch to the prefix allows us to sort the file names received on a certain date by receipt time.

## Step 4 — Create a lambda to return emails received “today”

Our next step is to create a lambda which returns a list of email file names “today”.

You will need this because, as the days go by, the number of emails in your S3 bucket will keep increasing. So, either you show a filtered list of emails, or paginate your results so that older emails are shown on demand.

In either case, you will need a lambda to filter by date. While the given lambda does not, by default, let your filter by date, the code can easily be extended to support date based filtering.

The source code for this lambda is [here](https://github.com/psiCode/ses-email-client/get-eml-file-ids-s3.js). Recreate this lambda in your own AWS account.

## Step 5 — Create a Lambda layer for the `eml-format` npm module

SES email files are in .eml format which you will have to parse to extract actionable information such as the email’s subject, from address, and attachments, if any.

~~Fortunately, the excellent [eml-format npm module](https://www.npmjs.com/package/eml-format) does the job for us.~~

Fortunately, the excellent [nodemailer npm module](https://nodemailer.com/about/) does the job for us.

The only thing you need to do is to create a Lambda layer which packages up this module for use inside AWS.

Just pick one of the many tutorials online on how to create Lambda layers to complete this step. I [followed this one](https://medium.com/@anjanava.biswas/nodejs-runtime-environment-with-aws-lambda-layers-f3914613e20e) to make my first Lambda layer.

## Step 6 — Create a Lambda to parse eml files

Once again, the source code to [parse eml files](https://github.com/psiCode/ses-email-client/blob/master/lambdas/get-eml-contents.js) is on my github. Recreate this lambda in your own AWS account.

Make sure you add a reference to the layer created in Step 5 while creating this lambda.

## Step 7 — Wiring up the lambdas to API Gateway

Once the three lambdas in steps 4 and 6 have been created, you need to wire them up to API gateway.

You DO NOT need to expose the Lambda created in Step 3 — to rename eml files — to API gateway.

Make sure you “Enable CORS” on these two API endpoints.

## Testing Part 2 — Steps 3 to 7

1.  Send yourself an email. That email should appear in your S3 bucket/folder with a file name which is prefixed with a _yyyy-mm-dd-unix_epoch_. If this does not work, make sure you check the your S3 triggers, Lambda code, and Cloudwatch output.
2.  Make a curl call to the API endpoint which returns a list of emails. This should return the id of the the email received above. The API call should be like this. Of course, your endpoint will have a different URL and path.

> curl -g ‘[https://api-gateway-abcd.amazonaws.com/email/today?domain=example.com](https://api.zeer0.com/v001/email?domain=zeer0.com&id=2020-07-4-1593879519853-v8gjj7mekqedlorqiqnjo3h95b5o84a51k7pr8o1)’

1.  Make a curl call to the API endpoint which returns the contents of the email identified by the id returned in the test above.

> curl -g ‘[https://api-gateway-abcd.amazonaws.com/email](https://api-gateway-abcd.amazonaws.com/email)?domain=zeer0.com&id=2020-07-4-1593879519853-v8gjj7abcdeedcbaiqnjo3h95b5o84a51k7pr8o1'

## Step 8 —

By completing Step 7, you have made your backend and middle tier to support disposable emails.

The last and final part left is to create a UI to show those all emails flowing into S3.

Broadly, here is what you will have to do.

1.  Make an API call to get the list of emails to be shown to the user
2.  Download the contents and metadata of each email
3.  (Optionally) Protect your inbox using a tool like AWS Cognito which is what I have done.

# Conclusion

Voila! You have a way to create disposable email addresses on the fly. What’s more, you also have a way to interact with your email inbox programmatically. You can use this facility to mine your inbox for insights or build workflows specific to your needs around your email.

If you would like to discuss further, please do drop me a line at sai@ramachandr.in. Looking forward to hearing from you.

> Written with [StackEdit](https://stackedit.io/).

