# Sharup
Sharup is a peer-to-peer file sharing application for both web and mobile.

Sometimes, we need share files with a friend group or with devices that we can't be sure it's secure. We don't want to share any login info for cloud providers or connect our devices to others using cables.

To solve this problem, Sharup is a good option for us. It does not want to know your login, connect your devices and store your files. It matches you with other peers that you shared given code.

To achieve this, it uses WebRTC (Web Real-Time Communication) technology that developed by Google.

## Structure
### Server
This is a server application that developed with Express, SocketIO. This application are contains a Websocket connection to matches the peers by the code.

### Web
This is a web application that developed with ReactJS, WebRTC, SocketIO. This application connects the Websocket and waits other peers to connect with the same code. 

You can access the web application from [sharup.kiyar.io](https://sharup.kiyar.io).

### Mobile
This is a mobile application that developed with React Native, WebRTC, SocketIO. This application connects the Websocket and waits other peers to connect with the same code.

You can install the mobile application from [Releases](https://github.com/oguzhankiyar/sharup/releases).

## Scenario
- The web or mobile application connects websockets from server application.
- The web or mobile application gives two option to create or join.
- If the user select "create" option, the server application creates a random code and name for this user.
- If the user select "join" option, the server application adds the user as a peer for requested code and assigns a random name.
- When a client application is joined a room, the server application sends the client information to other peers.
- When a client application received a new client, connects the peer over WebRTC by sending sdp and candidate. Then, creates a data channel to share files.
- When a client application shared a file, the file is shared the other peers over WebRTC.

## Screenshots
### Web
<p float="middle">
    <img src="https://user-images.githubusercontent.com/4726180/110245316-a324da00-7f73-11eb-9aac-6445f6c05199.png" width="49%" />
    <img src="https://user-images.githubusercontent.com/4726180/110248318-7a0b4600-7f81-11eb-945c-078d266427d5.png" width="49%" />
    <img src="https://user-images.githubusercontent.com/4726180/110245321-a5873400-7f73-11eb-99df-84dc2c838e2b.png" width="49%" />
    <img src="https://user-images.githubusercontent.com/4726180/110245323-a8822480-7f73-11eb-80cc-552368f7b4eb.png" width="49%" />
</p>

### Mobile
<p float="middle">
    <img src="https://user-images.githubusercontent.com/4726180/110245295-986a4500-7f73-11eb-8913-c0adad2164e4.jpg" width="24.5%" />
    <img src="https://user-images.githubusercontent.com/4726180/110245304-9b653580-7f73-11eb-95b7-a6a7de75e214.jpg" width="24.5%" />
    <img src="https://user-images.githubusercontent.com/4726180/110245306-9c966280-7f73-11eb-928f-f5ed3043eebe.jpg" width="24.5%" />
    <img src="https://user-images.githubusercontent.com/4726180/110245311-9f915300-7f73-11eb-95da-f6a14a78916c.jpg" width="24.5%" />
</p>

### Happy Coding!