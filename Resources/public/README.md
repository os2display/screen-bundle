# Aroskanalen screen


# Introduction
This is a javascript client for aroskanalen dislpay systems. For more information see https://github.com/aroskanalen/docs/blob/development/Installation%20guide.md in the docs repository on github.com.

# Flow
1. The index.html loads all resources starts the indexController.
2. The indexController starts the socket.js which sets up the connection with the middleware.
     * if there exists a token in the cookie the connection is resumed with this token.
     * else the activation page is shown where the screen is activated
3. After the screen is activated, it receives the data for the screen (template and options),
   and the channels for the given screen.
4. The screen template is loaded from the backend. This contains a number of regions.
5. Each region has an id.
6. When a channel is received it is emitted with the 'addChannel' event.
7. Each region receives this event. If the channel.region matches the region the channel is added. If not it is removed if it exists.
8. Each region contains a number of channels that are looped. Each channel contains a number of slides which are displayed one at a time.
