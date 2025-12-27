import { widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { selectPortfolioFormFiles } from '@/redux/portfolio/selector';
import { actions } from '@/redux/portfolio/slice';
import { useDispatch, useSelector } from 'react-redux';
import { Media, MimeType } from '@/redux/app/types';
import { Fontisto } from '@expo/vector-icons';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import * as ImagePicker from 'expo-image-picker';
import { VideoView, useVideoPlayer } from 'expo-video';
import React from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';

export default function PortfolioMediaUpload() {
    const backgroundColor = useThemeColor({ light: colors.light.lightTint, dark: colors.dark.lightTint }, 'text');
    const files = useSelector(selectPortfolioFormFiles);
    const dispatch = useDispatch();

    const handleImagePick = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 1,
      });
  
      if (!result.canceled) {
        const selectedImages = result.assets.map((asset) => ({
          id: asset.fileName as string,
          uri: asset.uri,
          type: asset.mimeType as MimeType,
        }));
        dispatch(actions.addPortfolioFiles(selectedImages));        
      }
    };

    const handleOnRemove = (id: string) => {
        Alert.alert('Remove', 'Are you sure you want to remove this file?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => dispatch(actions.removePortfolioFile(id)) },
        ]);
    }

    const VideoThumbnail = ({ uri }: { uri: string }) => {
        const player = useVideoPlayer(uri, (player) => {
            player.loop = true;
            player.muted = true;
            player.play();
        });

        return <VideoView player={player} style={styles.video} />;
    };

    const renderItem = ({ item: file }: { item: Media }) => {
        if (file.type === MimeType.JPEG || file.type === MimeType.JPG || file.type === MimeType.PNG) {
            return (
                <TouchableOpacity 
                    onPress={() => handleOnRemove(file.id as string)} 
                    style={[styles.imageWrapper, {backgroundColor}]}
                >
                    <Image source={{uri: file.uri}} style={[styles.image]} />
                </TouchableOpacity>
            )
        }
        if (file.type === MimeType.MP4) {
            return (
                <TouchableOpacity 
                    onPress={() => handleOnRemove(file.id as string)} 
                    style={[styles.videoWrapper]}
                >
                    <VideoThumbnail uri={file.uri} />
                </TouchableOpacity>
            )
        }
        return null;
    };

    const UploadButton = () => (
        <TouchableOpacity style={[styles.card, {backgroundColor}]} onPress={handleImagePick}>
            <Fontisto name="photograph" size={15} color={colors.light.tint} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container]}>
            <FlashList
                data={files || []}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListFooterComponent={UploadButton}
                contentContainerStyle={styles.listContent}
                keyExtractor={(item) => item.id as string}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 10,
        bottom: 10,
        left: 10,
        height: widthPixel(45),
        justifyContent: 'flex-end',
        alignItems: 'center',
        flexDirection: 'row',
    },
    listContent: {
        gap: widthPixel(5),
        alignItems: 'center',
        paddingRight: widthPixel(5),
    },
    card: {
        width: widthPixel(40),
        height: widthPixel(40),
        borderRadius: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageWrapper: {
        width: widthPixel(40),
        height: widthPixel(40),
        borderRadius: 0,
        position: 'relative',
        marginRight: widthPixel(5),
        overflow: 'hidden',
    },
    image: {
        width: widthPixel(40),
        height: widthPixel(40),
        borderRadius: 0,
    },
    removeButton: {
        position: 'absolute',
        top: 0,
        right: 0,
    },
    videoWrapper: {
        width: widthPixel(40),
        height: widthPixel(40),
        borderRadius: 0,
        overflow: 'hidden',
    },
    video: {
        width: widthPixel(40),
        height: widthPixel(40),
        borderRadius: 0,
    }
})

