import ReactDOM from 'react-dom';
import { loadComponent } from 'lib/Injector';
import ShortcodeSerialiser from 'lib/ShortcodeSerialiser';

const FormBuilderModal = loadComponent('FormBuilderModal');
const modalId = 'privacy-embed__dialog-wrapper';

(function () {
    if (window.tinymce) {
        window.tinymce.PluginManager.add('privacyembed', function (editor) {
            editor.addButton('privacyembed', {
                classes: 'privacyembed',
                tooltip: 'Embed privacy-aware iframes',
                stateSelector: 'img.privacyembed-placeholder',
                cmd: 'privacyembed'
            })

            editor.on('beforeSetContent', function(e) {
                let content = e.content;
                let match = ShortcodeSerialiser.match('privacy_embed', false, content);
                while(match) {
                    const iframe = match.properties.iframe;
                    const src = 'admin/privacyembed/thumbnailsrc';
                    const el = jQuery('<img/>')
                        .attr('class', 'privacyembed-placeholder mceItem mceNonEditable')
                        .attr('src', src)
                        .attr('data-shortcode', iframe);

                    content = content.replace(match.original, (jQuery('<div/>').append(el).html()))
                    match = ShortcodeSerialiser.match('privacy_embed', false, content);
                }

                e.content = content;
            });

            editor.on('postProcess', function(e) {
                var wrappedContent = jQuery('<div>' + e.content + '</div>');
                wrappedContent.find('.privacyembed-placeholder').each(function () {
                    var el = jQuery(this);
                    el.replaceWith('[privacy_embed iframe="' + tinymce.trim(el.attr('data-shortcode')) + '"]');
                });
                e.content = wrappedContent.html();
            });

            editor.addCommand('privacyembed', function () {
                jQuery(`#${editor.id}`).entwine('ss').openPrivacyEmbedDialog();
            });
        });
    }
})();

jQuery.entwine('ss', ($) => {
    $('textarea.htmleditor').entwine({
        openPrivacyEmbedDialog() {
            let dialog = $(`#${modalId}`);

            if (!dialog.length) {
                dialog = $(`<div id="${modalId}" />`);
                $('body').append(dialog);
            }
            dialog.addClass('privacy-embed__dialog-wrapper');

            dialog.setElement(this);
            dialog.open();
        }
    });

    $(`.js-injector-boot #${modalId}`).entwine({
        Element: null,
        Data: {},

        onunmatch() {
            this._clearModal();
        },

        _clearModal() {
            ReactDOM.unmountComponentAtNode(this[0]);
        },

        open() {
            this._renderModal(true);
        },

        close() {
            this.setData({});
            this._renderModal(false);
        },

        _handleInsert(data) {
            const editor = this.getElement().getEditor();
            const $node = $(editor.getSelectedNode());

            const iframe = $('<div />').html(data.iframe).find('> iframe')[0];
            if(!iframe|| iframe.nodeName !== 'IFRAME') {
                this.close();
                return Promise.reject(Promise.reject('wrong iframe src'));
            }

            if(iframe.src) {
                iframe.dataset.privacyEmbedSrc = iframe.src;
                iframe.removeAttribute('src');
            }

            const shortcode = ShortcodeSerialiser.serialise({
                name: 'privacy_embed',
                properties: { iframe: encodeURIComponent(iframe.outerHTML) },
            }, false);

            const selection = tinymce.activeEditor.selection.setContent(shortcode);
            this.close();

            return Promise.resolve();
        },

        getCurrentIframe() {
            const editor = this.getElement().getEditor();
            const node = $(editor.getSelectedNode());

            if(!node || !node.length || !node[0] || !node[0].classList.contains('privacyembed-placeholder')) {
                return null;
            }

            return node[0].dataset.shortcode;
        },

        _renderModal(isOpen) {
            const handleHide = () => this.close();
            const handleInsert = (data) => this._handleInsert(data);
            const currentIframe = this.getCurrentIframe();
            let schemaUrl = '/admin/privacyembed/schema';
            if(currentIframe) {
                schemaUrl += '?iframe=' + currentIframe;
            }

            // create/update the react component
            ReactDOM.render(
                <FormBuilderModal
                    title="Privacy Embed"
                    isOpen={isOpen}
                    onClosed={handleHide}
                    onSubmit={handleInsert}
                    schemaUrl={schemaUrl}
                    bodyClassName="modal__dialog"
                    className="privacy-embed-modal"
                    responseClassBad="modal__response modal__response--error"
                    responseClassGood="modal__response modal__response--good"
                    identifier="PrivacyEmbed.IFRAME"
                />,
                this[0]
            );
        },
    });
});