<?php

namespace WakeWorks\PrivacyEmbed\Controllers;

use SilverStripe\Admin\LeftAndMain;
use SilverStripe\Control\Controller;
use SilverStripe\Control\HTTPResponse;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\TextField;
use SilverStripe\Forms\FormAction;
use SilverStripe\Forms\Schema\FormSchema;
use SilverStripe\Forms\TextareaField;
use SilverStripe\SiteConfig\SiteConfig;
use SilverStripe\AssetAdmin\Forms\UploadField;
use SilverStripe\Assets\Image;
use SilverStripe\Forms\FieldGroup;
use SilverStripe\Forms\HTMLEditor\HTMLEditorField;
use SilverStripe\Forms\HTMLEditor\HTMLEditorConfig;
use SilverStripe\Forms\LiteralField;
use SilverStripe\Forms\Tab;
use SilverStripe\Forms\TabSet;

class PrivacyEmbedController extends Controller {
    private static $url_segment = 'admin/privacyembed';
    private static $allowed_actions = [
        'schema',
        'thumbnailsrc',
        'getModalForm'
    ];

    public function schema() {
        $this->getResponse()->addHeader('Content-Type', 'application/json');
        $parts = $this->getRequest()->getHeader(LeftAndMain::SCHEMA_HEADER);
        $schema = FormSchema::create();
        $schema = $schema->getMultipartSchema(
            $parts,
            $this->getRequest()->getURL(),
            $this->getModalForm($this->getRequest()),
            null
        );

        $response = new HTTPResponse(json_encode($schema));
        $response->addHeader('Content-Type', 'application/json');
        return $response;
    }

    public function getModalForm($request) {
        $backgroundImage = $request->getVar('backgroundimage') ? Image::get()->filter('ID', $request->getVar('backgroundimage')) : null;
        $fields = FieldList::create(
            new TabSet(
                'Root',
                [
                    new Tab(
                        _t(__CLASS__ . '.IFRAME', 'Iframe'),
                        TextareaField::create('iframe', _t(__CLASS__ . '.IFRAME', 'Iframe'), $request->getVar('iframe'))
                    ),
                    new Tab(
                        'Settings',
                        UploadField::create('backgroundimage', _t(__CLASS__ . '.BACKGROUNDIMAGE', 'Background image'), $backgroundImage)->setIsMultiUpload(false),
                        HTMLEditorField::create('content', _t(__CLASS__ . '.CONTENT', 'Content'), $request->getvar('content'))
                            ->setEditorConfig(HTMLEditorConfig::get('cms')->disablePlugins(['privacyembed'])),
                        TextField::create('buttontext', 'Button', $request->getVar('buttontext'))
                    )
                ]
            )
        );

        $actions = FieldList::create(
            FormAction::create('insert', _t(__CLASS__ . '.INSERT', 'Insert'))->setSchemaData(['data' => ['buttonStyle' => 'primary']])
        );

        return Form::create($this, 'getModalForm', $fields, $actions, null);
    }

    public function thumbnailsrc() {
        $siteconfig = SiteConfig::current_site_config();

        if($this->getRequest()->getVar('id') && is_numeric($this->getRequest()->getVar('id')) && $backgroundImage = Image::get()->byID(intval($this->getRequest()->getVar('id')))) {
            return $this->redirect($backgroundImage->FitMax(300, 300)->Link());
        }
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