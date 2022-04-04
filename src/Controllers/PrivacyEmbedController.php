<?php

namespace WakeWorks\PrivacyEmbed\Controllers;

use SilverStripe\Admin\LeftAndMain;
use SilverStripe\Control\Controller;
use SilverStripe\Control\HTTPResponse;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\FormAction;
use SilverStripe\Forms\Schema\FormSchema;
use SilverStripe\Forms\TextareaField;
use SilverStripe\SiteConfig\SiteConfig;

class PrivacyEmbedController extends Controller {
    private static $url_segment = 'admin/privacyembed';
    private static $allowed_actions = [
        'schema',
        'thumbnailsrc'
    ];

    public function schema() {
        $this->getResponse()->addHeader('Content-Type', 'application/json');
        $parts = $this->getRequest()->getHeader(LeftAndMain::SCHEMA_HEADER);
        $schema = FormSchema::create();
        $schema = $schema->getMultipartSchema($parts, $this->getRequest()->getURL(), $this->getModalForm($this->getRequest()->getVar('iframe')), null);

        $response = new HTTPResponse(json_encode($schema));
        $response->addHeader('Content-Type', 'application/json');
        return $response;
    }

    public function getModalForm($iframeValue = null) {
        $fields = FieldList::create(
            TextareaField::create('iframe', _t(__CLASS__ . '.IFRAME', 'Iframe'), $iframeValue)
        );

        $actions = FieldList::create(
            FormAction::create('insert', _t(__CLASS__ . '.INSERT', 'Insert'))->setSchemaData(['data' => ['buttonStyle' => 'primary']])
        );

        return Form::create($this, 'getModal', $fields, $actions, null);
    }

    public function thumbnailsrc() {
        $siteconfig = SiteConfig::current_site_config();
        if($siteconfig->PrivacyEmbedIFrameThumbnailID) {
            return $this->redirect($siteconfig->PrivacyEmbedIFrameThumbnail()->FitMax(300, 300)->Link());
        } else {
            $svg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="187" height="30"><rect width="187" height="30" fill="#fff"></rect><text x="15" y="22" fill="#000" font-family="Arial, Helvetica, sans-serif">PrivacyEmbed Iframe</text></svg>';
            return $this
                ->getResponse()
                ->addHeader('Content-Type', 'image/svg+xml')
                ->addHeader('Vary','Accept-Encoding')
                ->setBody($svg)
                ->output();
        }
    }
}