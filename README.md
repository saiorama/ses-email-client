This project aims to make it a bit easier to work with AWS SES (Simple Email Service). For technical details, scroll to the bottom of this page.

# Why do we need this?

You can look at AWS SES in two ways -

## SES for Marketing
One, SES is a transactional email service. You can use it to run marketing campaigns and broadcast messages to people interested in hearing from you. A vast majority of SES customers use SES this way. This use of SES is similar to using Mailchimp or SendGrid. 

To be most effective, emails must to look good and should be built for scale. This is where email templates come in. You design a beautiful email, then convert it into a template by adding placeholders for customer specific data and thus, achieve email at scale. 

The other aspect of using SES this way is that you would like to know how your broadcast message did. How many people saw it? How many interacted with it? Did some emails bounce or were they all delivered? Are people complaining about receiving spam from you?

Such performance metrics are the backbone of any transactional email service.

Unfortunately, SES has very mediocre offerings for templating and viewing marketing performance. For example, it is not possible to preview your email templates in SES. Neither can you test your email with some dummy data to see how the email looks.

### What can this project do right now?
With this project, I have tried to make it easier for SES customers to view their templates, find template placeholders, and preview it right in the browser without having to send themselves emails.

I have also surfaced some basic stats about your email campaigns - how many emails were sent? Any bounces? Any complaints? Little things like that. If you have other gripes about transactional SES, let me know by raising an issue.

## SES as your inbox

The other,less common use case for SES is as your personal inbox or as a mail provider for your company. Note that SES itself does NOT provide any help to achieve this. They don't even give us a mail server from where we can download our emails. Projects like [this](https://github.com/arithmetric/aws-lambda-ses-forwarder) (Arithmetric) allow you to use SES to send and receive SES emails in Gmail or any other mail client.

While such tools exist, I am building this project to be truly self contained. I don't want to use a third party client like Gmail to send and receive email. This tool is fully serverless and runs only on the user's browser from where it interacts with AWS to retrieve emails (from S3) and 

### What can this project do right now?

Right now, I can do the following things with this client:

1. sort received emails by date and time
2. authenticate the user using AWS Cognito. Force log in if the user is not logged in.
3. retrieve the list of emails received today and yesterday
4. retrieve the content of each email from S3
5. convert the raw email into human readable pretty HTML or Text
6. highlight emails as SPAM or containing a virus
7. show user email content
8. reply-all to everyone in TO and CC. Write rich text using markdown.
9. auto-populate the FROM address depending on the domain
10. compose new rich text (markdown) emails
11. get a shareable link for email


My goal is to have a fully functional email client running directly on SES and S3 without having to resort to lambda forwarders or using Gmail as an SMTP client.

### Future plans for SES as my inbox?

I want to build a commenting system around email to make emails more collaborative.

# Technical Details

The demo site for seeing your SES templates, testing out SES templates in your browser, and generally using SES as a marketing tool is at https://zeer0.com/templates

If you want to build your own SES email client, you are welcome to fork this project.
1. to learn how I sort emails by time and date to allow easy retrieval, look at the [lambdas directory](https://github.com/saiorama/ses-email-client/tree/master/lambdas)
2. follow any online tutorials on using Cognito
3. look at this [lambda](https://github.com/saiorama/ses-email-client/blob/master/lambdas/get-eml-contents.js) to understand how I retrieve an email's content
4. look at this [lambda](https://github.com/saiorama/ses-email-client/blob/master/lambdas/get-eml-file-ids-s3.js) to understand how I retrieve an email list
5. the javascript inside my-email/index.html handles Cognito, spam/virus highlighting
6. composing rich text/markdown emails is handled using stackedit.io

One thing to note is that my email client makes some assumptions about the location of my S3 bucket and the key path where my received emails reside. Therefore, this code is not truly usable until you tweak params and ensure that your emails sit in an S3 bucket under a key path that makes sense to you.

I'm happy to help anyone who wishes to use this project to build their own SES inbox.
