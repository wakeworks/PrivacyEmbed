# Privacy Embed for Silverstripe

![Packagist Version](https://img.shields.io/packagist/v/WakeWorks/PrivacyEmbed?style=flat-square)
![GitHub](https://img.shields.io/github/license/WakeWorks/PrivacyEmbed?style=flat-square)

## Introduction

Allows iframes to be embedded into TinyMCE in a way that asks users for permission before loading.

## Requirements

* silverstripe/framework ^5
* silverstripe/admin ^2

For Silverstripe 4, check out version/branch 1 of the module.

## Installation

```
composer require wakeworks/privacyembed
```

Then dev/build?flush=1.

## How does it work? / Setup

An icon will appear in TinyMCE which will open a modal with a textarea for the iframe.<br>
The iframe will be parsed on insertion and its src will be renamed to data-privacy-embed-src.<br>
This way, the iframe won't load until the user clicked the button which will be inserted into the frontend.

You can customize the text and image in your SiteConfig.

**You can use $Host in your text**

## Screenshots

![Screenshot](https://zazama.de/assets/Uploads/privacyembedtinymce.png)
![Screenshot](https://zazama.de/assets/Uploads/privacyembedmodal.png)
![Screenshot](https://zazama.de/assets/Uploads/privacyembediframe.png)
