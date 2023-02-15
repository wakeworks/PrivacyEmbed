<?php

use SilverStripe\Core\Manifest\ModuleResourceLoader;
use SilverStripe\Forms\HTMLEditor\HTMLEditorConfig;
use SilverStripe\View\Parsers\ShortcodeParser;
use WakeWorks\PrivacyEmbed\Parser\PrivacyEmbedShortcodeParser;

$pluginPath = ModuleResourceLoader::singleton()->resolveURL('wakeworks/privacyembed:client/dist/js/tinymce_plugin.js');
HTMLEditorConfig::get('cms')->enablePlugins(['privacyembed' => $pluginPath]);
HTMLEditorConfig::get('cms')->addButtonsToLine(1, '| privacyembed');

ShortcodeParser::get('default')->register('privacy_embed', [PrivacyEmbedShortcodeParser::class, 'iframe_parser']);