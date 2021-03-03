import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { Connector } from '../common/connector';
import { Header } from './Header/Header';
import { Home } from './Home/Home';
import { QRImage } from './QRImage/QRImage';
import { FileButton } from './FileButton/FileButton';
import { PeerList } from './PeerList/PeerList';
import { FileList } from './FileList/FileList';

export default class App extends Component {

	state = { isConnected: false, code: '', name: '', isPeersShowing: true, isFilesShowing: false, peers: [], files: [] };

	connector = null;

	componentDidMount() {
	}

	startConnection = async (code, name) => {
		this.connector = new Connector();

		this.connector.onConnected = () => {
			this.setState({
				...this.state,
				isConnected: this.connector.isConnected,
				code: this.connector.code,
				name: this.connector.name
			});
		};

		this.connector.onFailed = (error) => {
			alert(error);
			this.setState({ ...this.state, isConnected: false });
		}

		this.connector.onPeerChanged = () => {
			this.setState({
				...this.state,
				peers: this.connector.peers
			});
		};

		this.connector.onFileChanged = () => {
			this.setState({
				...this.state,
				files: this.connector.files
			});
		};

		await this.connector.startConnection(code, name);
	};

    shareNewFile = (file) => {
        if (!this.connector) {
            return;
        }

        const { name, content } = file;

        this.connector.shareNewFile(name, content);
    };

    onCodeChange = (event) => {
        const { value } = event.target;
        this.setState({ ...this.state, code: value.toUpperCase() });
    };

    onNameChange = (event) => {
        const { value } = event.target;
        this.setState({ ...this.state, name: value.toUpperCase() });
    };

    onFileDownload = (file) => {
        this.connector.downloadFile(file);
    }

    showPeers() {
        this.setState({ ...this.state, isPeersShowing: true, isFilesShowing: false });
    }

    showFiles() {
        this.setState({ ...this.state, isPeersShowing: false, isFilesShowing: true });
    }

    onCreate = () => {
        this.startConnection('', '');
    };

    onJoin = (code) => {
        this.startConnection(code, '');
    };

	render = () => {
        if (!this.state.isConnected) {
			return (
				<View style={styles.app}>
					<Header />
					<View style={styles.container}>
						<Home
							onCreate={() => this.onCreate()}
							onJoin={(code) => this.onJoin(code)} />
					</View>
				</View>
			);
		}

		return (
			<View style={styles.app}>
				<Header />
				<View style={styles.container}>
					<View style={styles.left}>
						<View style={styles.qr}>
                            <QRImage code={this.state.code} />
                        </View>
						<View style={styles.form}>
							<Text style={styles.label}>Code</Text>
							<TextInput style={styles.code} value={this.state.code} disabled />
							<Text style={styles.label}>Name</Text>
							<TextInput style={styles.name} value={this.state.name} disabled />
							<FileButton onSelect={(file => this.shareNewFile(file))} />
                        </View>
					</View>
					<View style={styles.right}>
                        <View style={styles.tabs}>
                            <TouchableOpacity
                                style={this.state.isPeersShowing ? styles.activeTab : styles.tab}
                                onPress={() => this.showPeers()}>
								<View style={styles.tabContent}>
                               		<Text style={styles.tabText}>Peers</Text>
									{
										this.state.peers.length > 0 ? <Text style={styles.tabLabel}>{this.state.peers.length}</Text> : <></>
									}
								</View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={this.state.isFilesShowing ? styles.activeTab : styles.tab}
                                onPress={() => this.showFiles()}>
								<View style={styles.tabContent}>
									<Text style={styles.tabText}>Files</Text>
									{
										this.state.files.length > 0 ? <Text style={styles.tabLabel}>{this.state.files.length}</Text> : <></>
									}
								</View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.content}>
                            <PeerList
                                items={this.state.peers}
                                show={this.state.isPeersShowing} />
                            <FileList
                                items={this.state.files}
                                show={this.state.isFilesShowing}
                                onDownload={file => this.onFileDownload(file)} />
                        </View>
					</View>
				</View>
			</View>
		);
	}
};

const styles = StyleSheet.create({
	app: {
		flex: 1,
		backgroundColor: '#292C35'
	},
	container: {
		flex: 1,
		justifyContent: 'flex-start',
		padding: 15,
		paddingTop: 20
	},
	left: {
		flexDirection: 'row'
	},
	right: {
		flex: 1,
		marginTop: 7.5
	},
	qr: {
		marginBottom: 15
	},
	form: {
		flex: 1,
		marginLeft: 20
	},
	label: {
		color: '#f5f5f5',
		fontSize: 15,
		marginBottom: 4
	},
	code: {
		fontSize: 17.5,
		backgroundColor: '#d5d5d5',
		color: '#363636',
		borderRadius: 5,
		paddingTop: 4,
		paddingBottom: 4,
		marginBottom: 5,
		textAlign: 'center',
        letterSpacing: 10
	},
	name: {
		fontSize: 17.5,
		backgroundColor: '#d5d5d5',
		color: '#363636',
		borderRadius: 5,
		paddingTop: 4,
		paddingBottom: 4,
		textAlign: 'center',
        letterSpacing: 5
	},
	tabs: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginBottom: 5
	},
	tab: {
		flex: 1,
		paddingBottom: 5,
		marginLeft: 2,
		marginRight: 2
	},
	tabContent: {
		flexDirection: 'row'
	},
	activeTab: {
		flex: 1,
		borderBottomColor: '#f5f5f5',
		borderBottomWidth: 1,
		paddingBottom: 4,
		marginLeft: 2,
		marginRight: 2
	},
	tabText: {
		flex: 1,
		fontSize: 20,
		color: '#f5f5f5',
		textAlign: 'center'
	},
	tabLabel: {
		backgroundColor: '#9b7b1b',
		color: '#f5f5f5',
		fontSize: 13,
		height: 22,
		borderRadius: 2.5,
		paddingTop: 2,
		paddingBottom: 2,
		paddingLeft: 10,
		paddingRight: 10,
		marginRight: 4
	},
	content: {
		
	}
});
