import React from 'react';
import {
    View,
    StyleSheet,
    Image,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { Text } from '../../UI';
import Spotify from 'rn-spotify-sdk';
import Icon from 'react-native-vector-icons/Ionicons';
import globalStyles from '../../UI/styles';
import Song from '../../components/Song';
import { ModalContext } from '../../components/Modal';

class PlaylistView extends React.Component {
    state = {
        playlist: null,
        loading: true
    };
    routeSubscription = null;

    componentDidMount() {
        // create route subscription to know when to re-fetch data because the component is mounted even if it is
        // not in the view, so react-navigation provides events
        this.routeSubscription = this.props.navigation.addListener(
            'willFocus',
            this.fetchData
        );
    }

    fetchData = ctx => {
        this.setState({ loading: true });
        let playlistId;
        // sometimes react-navigation gives a 'context' object which contains the route params
        if (ctx) {
            playlistId = ctx.state.params.playlistId;
        } else {
            playlistId = this.props.navigation.getParam('playlistId');
        }
        // if all data has been loaded and the previous playlist id is the same as the current one -
        // there is no need to fetch the data again, display the old data
        if (this.state.playlist && this.state.playlist.id === playlistId) {
            this.setState({ loading: false });
            return;
        }

        // fetch playlists (contains the playlist tracks)
        Spotify.getPlaylist(playlistId)
            .then(res => {
                console.log(res);
                this.setState({ playlist: res, loading: false });
            })
            .catch(err => {
                console.log(err);
            });

        // check if the user follows this playlist (currently the HTTP request does not work)
        Spotify.getMe().then(res => {
            Spotify.sendRequest(
                `v1/playlists/${playlistId}/followers/contains?ids=${res.id}`,
                'GET',
                {},
                false
            ).then(isFollowing => {
                console.log(isFollowing);
            });
        });
    };

    componentWillUnmount() {
        // cancel route subscription when the component unmounts (if the subscription exists)
        if (this.routeSubscription) {
            this.routeSubscription.remove();
        }
    }

    render() {
        return (
            <View style={globalStyles.container}>
                {this.state.playlist && !this.state.loading ? (
                    <ModalContext.Consumer>
                        {({ openModal }) => (
                            <ScrollView>
                                <View
                                    style={
                                        ([globalStyles.container],
                                        { paddingTop: 0 })
                                    }
                                >
                                    <View style={styles.header}>
                                        <TouchableOpacity
                                            onPress={() =>
                                                this.props.navigation.goBack()
                                            }
                                        >
                                            <Icon
                                                name="ios-arrow-back"
                                                size={30}
                                                color="#fff"
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => {
                                                openModal(
                                                    {
                                                        image: this.state
                                                            .playlist.images[0]
                                                            .url,
                                                        primaryText: this.state
                                                            .playlist.name,
                                                        secondaryText: `Playlist by ${
                                                            this.state.playlist
                                                                .owner
                                                                .display_name
                                                        }`
                                                    },
                                                    [
                                                        {
                                                            text: 'Follow',
                                                            click: () =>
                                                                Spotify.sendRequest(
                                                                    `v1/playlists/${
                                                                        this
                                                                            .state
                                                                            .playlist
                                                                            .id
                                                                    }/followers`,
                                                                    'PUT',
                                                                    {},
                                                                    false
                                                                )
                                                        }
                                                    ]
                                                );
                                            }}
                                        >
                                            <Icon
                                                name="md-more"
                                                size={30}
                                                color="#fff"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ alignItems: 'center' }}>
                                        <Image
                                            source={{
                                                uri: this.state.playlist
                                                    .images[0].url
                                            }}
                                            style={{ width: 150, height: 150 }}
                                        />
                                        <Text
                                            bold
                                            size={24}
                                            style={{
                                                textAlign: 'center'
                                            }}
                                        >
                                            {this.state.playlist.name}
                                        </Text>
                                        <Text
                                            size={14}
                                            style={{
                                                textAlign: 'center'
                                            }}
                                            color="grey"
                                        >
                                            Playlist by{' '}
                                            {
                                                this.state.playlist.owner
                                                    .display_name
                                            }
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() =>
                                                Spotify.playURI(
                                                    this.state.playlist.uri,
                                                    0,
                                                    0
                                                )
                                            }
                                        >
                                            <View
                                                style={{
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: 150,
                                                    height: 50,
                                                    borderRadius: 25,
                                                    backgroundColor: '#1DB954',
                                                    marginTop: 10,
                                                    marginBottom: 10
                                                }}
                                            >
                                                <Text
                                                    bold
                                                    size={28}
                                                    style={{
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    Play
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>

                                    <FlatList
                                        contentContainerStyle={{
                                            flex: 1,
                                            marginHorizontal: 10
                                        }}
                                        scrollEnabled={false}
                                        data={this.state.playlist.tracks.items}
                                        keyExtractor={(_, i) => i.toString()}
                                        renderItem={({ item, index }) => (
                                            <Song
                                                onPress={() =>
                                                    Spotify.playURI(
                                                        this.state.playlist.uri,
                                                        index,
                                                        0
                                                    )
                                                }
                                                song={item.track}
                                                artists={item.track.artists}
                                            />
                                        )}
                                    />
                                </View>
                            </ScrollView>
                        )}
                    </ModalContext.Consumer>
                ) : (
                    <View
                        style={[
                            globalStyles.container,
                            {
                                justifyContent: 'center',
                                alignItems: 'center'
                            }
                        ]}
                    >
                        <ActivityIndicator size="large" color="#1DB954" />
                    </View>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        flex: 1,
        flexGrow: 1,
        backgroundColor: '#191414',
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginHorizontal: 15,
        height: 35
    }
});

export default PlaylistView;
