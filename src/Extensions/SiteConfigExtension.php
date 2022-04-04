<?php

namespace WakeWorks\PrivacyEmbed\Extensions;

use SilverStripe\AssetAdmin\Forms\UploadField;
use SilverStripe\Assets\Image;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\HTMLEditor\HTMLEditorField;
use SilverStripe\Forms\TextField;
use SilverStripe\ORM\DataExtension;

class SiteConfigExtension extends DataExtension
{
    private static $db = [
        'PrivacyEmbedContent' => 'HTMLText',
        'PrivacyEmbedButtonText' => 'Varchar'
    ];

    private static $has_one = [
        'PrivacyEmbedIFrameThumbnail' => Image::class
    ];

    private static $owns = [
        'PrivacyEmbedIFrameThumbnail'
    ];

    public function updateCMSFields(FieldList $fields)
    {
        $fields->addFieldsToTab("Root.PrivacyEmbed", [
            UploadField::create(
                'PrivacyEmbedIFrameThumbnail',
                'iframe thumbnail'
            ),
            HTMLEditorField::create(
                'PrivacyEmbedContent',
                'Content'
            ),
            TextField::create(
                'PrivacyEmbedButtonText',
                'Button text'
            )
        ]);
    }
}