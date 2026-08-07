export function renderErrorPage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Internal Server Error</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f0f10; color: #ececed; }
        .container { text-align: center; padding: 2rem; }
        h1 { font-size: 2rem; margin-bottom: 1rem; color: #e5484d; }
        p { color: #a1a1aa; }
        a { color: #3e63dd; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Something went wrong</h1>
        <p>An unexpected error occurred on the server.</p>
        <p><a href="/">Return to Editor</a></p>
      </div>
    </body>
    </html>
  `;
}
