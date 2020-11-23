
## Setting up
### Prerequisites:
 * Server that can run Node.js applications
 * Proxy server(s) that runs [cors-anywhere]
 * Microsoft SQL Server
 * [Facebook] account
 * [Facebook page]

This project uses the public [Google Translate](https://translate.google.com)
for the translations. It detects multiple requests from a server, so the proxy
servers are used to bypass this.

### Installation
Firstly, when hosting your own Messenger Translator bot application, you'll need
to have a [Facebook] account, [Facebook page], and
[Facebook app][Facebook for Developers]:

 * Log in to [Facebook] and create a [Facebook page]
 * Log in to [Facebook for Developers] with your [Facebook] account then create
   an app
 * Set up the Messenger product for your app then add your created page
 * Save your **page access token** and **app secret** from
   [Facebook for Developers] dashboard

##### Setting up SQL Server and running the Webhook Server
 * When setting up your SQL Server, run `database.sql` to initialize the SQL
   tables
 * Define the necessary environment variables which are defined below in your
   server
 * Run the Node.js server by running `npm start`
 * Add a Messenger webhook to your [app][Facebook for Developers] that points to
   `https://{YOUR_HOST_NAME}/webhook` with your defined verify token
   (validation token)

   **Note:** Messenger webhook page should have the 2 fields `messages` and
   `messaging_postbacks`

 * You can edit `profile.json` and run `run.sh` for setting your Messenger app
   profile.

 * Message your Facebook page and see if it replies back. It should reply back
   if you're using the account you used when creating the app

**Note:** Before making your app live, Facebook needs to verify it and it might
take a couple of days before other users can access the app.

### Environment Variables

 | Environment name | Description                                 |
 | ---------------- | ------------------------------------------- |
 | ACCESS_TOKEN     | Page access token                           |
 | APP_SECRET       | App secret                                  |
 | VALIDATION_TOKEN | Verify token when connecting the webhook    |
 | PROXIES          | Comma-seprated hostnames of proxy server(s) |
 | ORIGIN           | Origin server (eg. https://yourhost.com)    |
 | SERVER           | SQL Server hostname                         |
 | USERNAME         | SQL Server username                         |
 | PASSWORD         | SQL Server password                         |
 | DATABASE         | SQL Server database                         |

**Note:** Proxy servers should run [cors-anywhere]

If you have any more questions about the installation, please contact me through
[email](mailto:eidoriantantan@gmail.com) instead.

#### Support
[Messenger Translator] source codes were opened to public to gain our customer's
trust. If you wanted to run this on your own server, please consider supporting
the [original page][Messenger Translator] and/or donate through
[PayPal](https://paypal.me/adrianejustine) or
[Patreon](https://www.patreon.com/eidoriantan).

[Facebook]: https://www.facebook.com
[Facebook for Developers]: https://developers.facebook.com
[Facebook page]: https://www.facebook.com/pages/create/
[Messenger Translator]: https://www.facebook.com/msgr.translator
[cors-anywhere]: https://github.com/Rob--W/cors-anywhere