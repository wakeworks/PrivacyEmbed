import ReactDOM from 'react-dom';
import { loadComponent } from 'lib/Injector';
import ShortcodeSerialiser from 'lib/ShortcodeSerialiser';

const FormBuilderModal = loadComponent('FormBuilderModal');
const modalId = 'privacy-embed__dialog-wrapper';

(function () {
    if (window.tinymce) {
        window.tinymce.PluginManager.add('privacyembed', function (editor) {
            editor.ui.registry.addIcon('privacyembed-icon', `<svg width="20" height="20" version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 317.855 317.855' style='enable-background:new 0 0 317.855 317.855;' xml:space='preserve'><g><path d='M158.929,317.855c-1.029,0-2.059-0.159-3.051-0.477c-33.344-10.681-61.732-31.168-84.377-60.891 c-17.828-23.401-32.103-52.526-42.426-86.566C11.661,112.506,11.461,61.358,11.461,59.209c0-5.15,3.912-9.459,9.039-9.954 c0.772-0.075,78.438-8.048,132.553-47.347c3.504-2.546,8.249-2.543,11.753,0.001C218.906,41.207,296.582,49.18,297.36,49.256 c5.123,0.5,9.034,4.807,9.034,9.953c0,2.149-0.2,53.297-17.613,110.713c-10.324,34.04-24.598,63.165-42.426,86.566 c-22.644,29.723-51.032,50.21-84.376,60.891C160.987,317.696,159.958,317.855,158.929,317.855z M31.748,67.982 c0.831,16.784,4.062,55.438,16.604,96.591c21.405,70.227,58.601,114.87,110.576,132.746 c52.096-17.916,89.335-62.711,110.713-133.202c12.457-41.074,15.653-79.434,16.472-96.134 c-22.404-3.269-80.438-14.332-127.186-45.785C112.175,53.648,54.153,64.713,31.748,67.982z' /></g></svg>`)
            editor.ui.registry.addButton('privacyembed', {
                tooltip: 'Embed privacy-aware iframes',
                icon: 'privacyembed-icon',
                onAction: function() {
                    jQuery(`#${editor.id}`).entwine('ss').openPrivacyEmbedDialog();
                }
            })

            editor.on('beforeSetContent', function(e) {
                let content = e.content;
                let match = ShortcodeSerialiser.match('privacy_embed', false, content);
                while(match) {
                    const src = 'admin/privacyembed/thumbnailsrc?id=' + (match.properties.backgroundimage ? match.properties.backgroundimage : '');
                    const el = jQuery('<img/>')
                        .attr('class', 'privacyembed-placeholder mceItem mceNonEditable')
                        .attr('src', src)
                        .attr('data-shortcode', match.original);

                    content = content.replace(match.original, (jQuery('<div/>').append(el).html()))
                    match = ShortcodeSerialiser.match('privacy_embed', false, content);
                }

                e.content = content;
            });

            editor.on('postProcess', function(e) {
                var wrappedContent = jQuery('<div>' + e.content + '</div>');
                wrappedContent.find('.privacyembed-placeholder').each(function () {
                    var el = jQuery(this);
                    el.replaceWith(el.attr('data-shortcode'));
                });
                e.content = wrappedContent.html();
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
        Bookmark: null,
        Data: {},

        onunmatch() {
            this._clearModal();
        },

        _clearModal() {
            ReactDOM.unmountComponentAtNode(this[0]);
        },

        open() {
            const editor = this.getElement().getEditor().getInstance();
            this.setBookmark(editor.selection.getBookmark(2, true));

            this._renderModal(true);
        },

        close() {
            this.setData({});
            this._renderModal(false);
        },

        _handleInsert(data) {
            const editor = this.getElement().getEditor().getInstance();
            editor.selection.moveToBookmark(this.getBookmark());

            const iframe = $('<div />').html(data.iframe).find('> iframe')[0];
            if(!iframe|| iframe.nodeName !== 'IFRAME') {
                this.close();
                return Promise.reject(Promise.reject('wrong iframe src'));
            }

            if(iframe.src) {
                iframe.dataset.privacyEmbedSrc = iframe.src;
                iframe.removeAttribute('src');
            }

            let backgroundimage = undefined;
            if(data.backgroundimage && data.backgroundimage['Files']) {
                backgroundimage = data.backgroundimage['Files'][0]
            }

            const shortcode = ShortcodeSerialiser.serialise({
                name: 'privacy_embed',
                properties: {
                    iframe: encodeURIComponent(iframe.outerHTML),
                    backgroundimage: backgroundimage,
                    content: encodeURIComponent(data.content ? data.content : ''),
                    buttontext: data.buttontext
                }
            }, false);

            const selection = tinymce.get(this.getElement()[0].id).selection.setContent(shortcode);
            this.close();

            return Promise.resolve();
        },

        getCurrentShortcode() {
            const editor = this.getElement().getEditor();
            const node = $(editor.getSelectedNode());

            if(!node || !node.length || !node[0] || !node[0].classList.contains('privacyembed-placeholder')) {
                return null;
            }

            return ShortcodeSerialiser.match('privacy_embed', false, node[0].dataset.shortcode);
        },

        _renderModal(isOpen) {
            const handleHide = () => this.close();
            const handleInsert = (data) => this._handleInsert(data);
            const currentShortcode = this.getCurrentShortcode();
            let schemaUrl = '/admin/privacyembed/schema';
            if(currentShortcode) {
                let params = Object.keys(currentShortcode.properties)
                .map(key => `${key}=${currentShortcode.properties[key]}`)
                .join('&');
                schemaUrl += '?' + params;
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