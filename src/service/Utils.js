import ejs from "ejs";

export default class Utils {
    /**
     * @param {Array<string>|string} scripts
     * @param {any} locals
     * @returns {string}
     */
    static renderDefaultReactPage(scripts, locals = {}) {
        // ! Ignore: lol
        // eslint-disable-next-line no-param-reassign
        if(!Array.isArray(scripts)) scripts = [scripts];

        const src = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="/favicon.png" sizes="32x32">
    <link rel="icon" type="image/png" href="/favicon.png" sizes="96x96">
    <title><%= locals.title || "Webbase v3" %></title>

    <% (locals.scripts || []).forEach(script => { %>
    <script src="<%= script %>"></script>
    <% }); %>

    <style>
        html, body, main {
            min-height: 100vh;
        }
    </style>
</head>
<body>
    <main id="react-container">

    </main>
</body>
</html>`;

        locals.scripts = scripts;
        return ejs.render(src, locals);
    }
}
