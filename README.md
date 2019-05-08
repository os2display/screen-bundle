# OS2Display screen-bundle
Bundle to add a screen frontend to the administration.

## Configuration
Add the following to routing.yml:
<pre>
os2display_screen:
    resource: "@Os2DisplayScreenBundle/Resources/config/routing.yml"
    prefix:   /
</pre>

Add the following to security.yml firewalls section:
<pre>
screen_bundle_public:
    pattern: ^/screen/public/(.*)
    security: false
</pre>

## Access screen with middleware
To open screen go to `/screen/`.

## Access screen without middleware
Go to the administration under a screen. Make it publicly available.
Distribute the url.

## Configuration reference

<pre>
os2_display_screen:
    strategies:
       pull:
            enabled: false
            debug: true
            log_to_console: true
            log_level: all
            update_path: /screen/serialized
            update_interval: 60                # seconds
        push:
            enabled: true
            debug: true
            log_to_console: true
            log_level: all
