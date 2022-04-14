<div class="privacy-embed" data-thumbnail-url="<% if BackgroundImage %>$BackgroundImage.URL<% else %>$SiteConfig.PrivacyEmbedIFrameThumbnail.URL<% end_if %>">
    $IFrame.RAW

    <div class="privacy-embed-overlay">
        <div class="privacy-embed-content">
            <% if $Content %>
                $Content.RAW
            <% else %>
                $SiteConfig.PrivacyEmbedContent
            <% end_if %>
        </div>

        <div class="privacy-embed-button-wrapper">
            <a class="privacy-embed-button">
                <% if ButtonText %>
                    $ButtonText
                <% else %>
                    $SiteConfig.PrivacyEmbedButtonText
                <% end_if %>
            </a>
        </div>
    </div>
</div>