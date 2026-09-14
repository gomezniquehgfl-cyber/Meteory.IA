const fs = require('fs');
let content = fs.readFileSync('.github/workflows/build-app.yml', 'utf8');

const mainActivityStr = `          cat << 'EOF' > android/app/src/main/java/com/meteory/ia/app/MainActivity.java
          package com.meteory.ia.app;

          import android.annotation.SuppressLint;
          import android.os.Bundle;
          import android.webkit.WebSettings;
          import android.webkit.WebView;
          import android.webkit.WebViewClient;
          import android.webkit.WebChromeClient;
          import android.webkit.WebResourceRequest;
          import android.webkit.WebResourceResponse;
          import android.Manifest;
          import android.content.pm.PackageManager;
          import androidx.core.app.ActivityCompat;
          import androidx.core.content.ContextCompat;
          import androidx.appcompat.app.AppCompatActivity;
          import androidx.webkit.WebViewAssetLoader;
          import androidx.webkit.WebViewClientCompat;
          import android.net.Uri;

          public class MainActivity extends AppCompatActivity {
              private WebView webView;
              private static final int PERMISSION_REQUEST_CODE = 123;

              @SuppressLint("SetJavaScriptEnabled")
              @Override
              protected void onCreate(Bundle savedInstanceState) {
                  super.onCreate(savedInstanceState);
                  
                  webView = new WebView(this);
                  setContentView(webView);

                  WebSettings settings = webView.getSettings();
                  settings.setJavaScriptEnabled(true);
                  settings.setDomStorageEnabled(true);
                  settings.setDatabaseEnabled(true);
                  settings.setMediaPlaybackRequiresUserGesture(false);
                  settings.setAllowFileAccess(true);
                  settings.setAllowContentAccess(true);

                  final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                          .addPathHandler("/", new WebViewAssetLoader.AssetsPathHandler(this))
                          .build();

                  webView.setWebViewClient(new WebViewClientCompat() {
                      @Override
                      public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                          return assetLoader.shouldInterceptRequest(request.getUrl());
                      }

                      @Override
                      @SuppressWarnings("deprecation")
                      public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
                          return assetLoader.shouldInterceptRequest(Uri.parse(url));
                      }
                  });

                  webView.setWebChromeClient(new WebChromeClient() {
                      @Override
                      public void onPermissionRequest(android.webkit.PermissionRequest request) {
                          request.grant(request.getResources());
                      }
                  });

                  if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                      ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.RECORD_AUDIO}, PERMISSION_REQUEST_CODE);
                  }

                  webView.loadUrl("https://appassets.androidplatform.net/index.html");
              }

              @Override
              public void onBackPressed() {
                  if (webView != null && webView.canGoBack()) {
                      webView.goBack();
                  } else {
                      super.onBackPressed();
                  }
              }
          }
          EOF`;

// Find the start and end of MainActivity block
const startIndex = content.indexOf(`          # Create MainActivity.java`);
const endIndex = content.indexOf(`          cd android`, startIndex);

if (startIndex > -1 && endIndex > -1) {
  content = content.substring(0, startIndex) + `          # Create MainActivity.java\n` + mainActivityStr + `\n` + content.substring(endIndex);
  
  // also add androidx.webkit dependency
  content = content.replace(`              implementation 'com.google.android.material:material:1.9.0'\n          }`, `              implementation 'com.google.android.material:material:1.9.0'\n              implementation 'androidx.webkit:webkit:1.8.0'\n          }`);
  
  fs.writeFileSync('.github/workflows/build-app.yml', content);
  console.log('Success');
} else {
  console.log('Could not find MainActivity block');
}
