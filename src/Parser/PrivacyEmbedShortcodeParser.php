<?php

namespace WakeWorks\PrivacyEmbed\Parser;

use SilverStripe\View\ArrayData;
use SilverStripe\View\Requirements;
use SilverStripe\Assets\Image;

class PrivacyEmbedShortcodeParser {
    public static function iframe_parser($arguments) {
        if(!array_key_exists('iframe', $arguments)) {
            return '';
        }

        Requirements::css('wakeworks/privacyembed:client/css/app.css');
        Requirements::javascript('wakeworks/privacyembed:client/js/frontend.js');

        $data = [
            'IFrame' => urldecode($arguments['iframe'])
        ];

        if(array_key_exists('backgroundimage', $arguments) && is_numeric($arguments['backgroundimage'])) {
            $data['BackgroundImage'] = Image::get()->byID(intval($arguments['backgroundimage']));
        }

        if(array_key_exists('buttontext', $arguments)) {
            $data['ButtonText'] = $arguments['buttontext'];
        }

        if(array_key_exists('content', $arguments)) {
            $data['Content'] = urldecode($arguments['content']);
        }

        return ArrayData::create($data)->renderWith('WakeWorks\\PrivacyEmbed\\IFrameContainer');
    }
}