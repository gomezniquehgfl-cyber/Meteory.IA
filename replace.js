const fs = require('fs');
let content = fs.readFileSync('.github/workflows/build-app.yml', 'utf8');

const replacement = `                  webView.setWebChromeClient(new WebChromeClient() {
                      @Override
                      public void onPermissionRequest(final android.webkit.PermissionRequest request) {
                          MainActivity.this.runOnUiThread(new Runnable() {
                              @Override
                              public void run() {
                                  request.grant(request.getResources());
                              }
                          });
                      }
                  });`;

const searchFor = `                  webView.setWebChromeClient(new WebChromeClient() {
                      @Override
                      public void onPermissionRequest(android.webkit.PermissionRequest request) {
                          request.grant(request.getResources());
                      }
                  });`;

if (content.includes(searchFor)) {
  content = content.replace(searchFor, replacement);
  fs.writeFileSync('.github/workflows/build-app.yml', content);
  console.log('Success - replaced WebChromeClient permissions');
} else {
  console.log('Could not find WebChromeClient permissions block');
}
