<?php

namespace WakeWorks\PrivacyEmbed\Parser;

use SilverStripe\View\ArrayData;
use SilverStripe\View\Requirements;

class PrivacyEmbedShortcodeParser {
    public static function iframe_parser($arguments) {
        if(!array_key_exists('iframe', $arguments)) {
            return '';
        }

        Requirements::css('wakeworks/privacyembed:client/css/app.css');
        Requirements::javascript('wakeworks/privacyembed:client/js/frontend.js');

        return ArrayData::create([
            'IFrame' => urldecode($arguments['iframe'])
        ])->renderWith('WakeWorks\\PrivacyEmbed\\IFrameContainer');
    }
}