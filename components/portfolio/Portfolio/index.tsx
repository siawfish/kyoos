import { StyleSheet, Image, View } from 'react-native'
import React from 'react'
import { colors } from '@/constants/theme/colors'
import { heightPixel, widthPixel } from '@/constants/normalize'
import user from "@/assets/images/individual.png";
import { ThemedText } from '@/components/ui/Themed/ThemedText'
import Thumbnails from '@/components/ui/Thumbnails'
import { Media, MediaType } from '@/redux/app/types'
import Actions from './Actions'
import { Link } from 'expo-router'
import Button from '@/components/ui/Button'

const IMAGES:Media[] = [
    {
        uri: 'https://plus.unsplash.com/premium_photo-1723200799223-0095f042decb?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        type: MediaType.IMAGE,
        id: '1',
    },
    {
        uri: 'https://plus.unsplash.com/premium_photo-1723200799223-0095f042decb?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        type: MediaType.IMAGE,
        id: '2',
    },
    {
        uri: 'https://plus.unsplash.com/premium_photo-1723200799223-0095f042decb?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        type: MediaType.IMAGE,
        id: '3',
    },
    {
        uri: 'https://plus.unsplash.com/premium_photo-1723200799223-0095f042decb?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        type: MediaType.IMAGE,
        id: '4',
    },
    {
        uri: 'https://plus.unsplash.com/premium_photo-1723200799223-0095f042decb?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        type: MediaType.IMAGE,
        id: '5',
    },
]

interface PortfolioProps {
  id: string;
}

const Portfolio = ({ id }: PortfolioProps) => {
  
  return (
    <Link asChild href={`/(tabs)/(search)/portfolio`}>
        <Button
            lightBackgroundColor={colors.light.white}
            darkBackgroundColor={colors.dark.black}
            style={styles.container}
        >
            <View style={styles.content}>
                <View style={styles.topContent}>
                    <View style={styles.user}>
                        <Image
                            source={user}
                            style={styles.image}
                        />
                        <View>
                            <ThemedText 
                                type='title' 
                                style={styles.name}
                            >
                                John Doe
                            </ThemedText>
                            <ThemedText 
                                type='subtitle' 
                                style={styles.skills}
                            >
                                Carpenter, Electrician, Plumber
                            </ThemedText>
                        </View>
                    </View>
                    <ThemedText darkColor={colors.dark.secondary} lightColor={colors.light.secondary} style={styles.createdAt}>
                        2 days ago
                    </ThemedText>
                </View>
                <Thumbnails 
                    data={IMAGES}
                />
                <View>
                    <ThemedText 
                        darkColor={colors.dark.text} 
                        lightColor={colors.light.text} 
                        style={styles.description}
                    >
                        Nisi eu culpa laborum aliqua aute culpa veniam id labore do qui eiusmod sit ea. Nulla eiusmod laborum commodo occaecat adipisicing enim occaecat irure id dolor laboris laborum tempor. Magna eu aliqua fugiat qui exercitation exercitation eu anim est fugiat. Commodo consequat pariatur aliquip non anim ipsum eiusmod. Deserunt ipsum excepteur fugiat et in.
                    </ThemedText>
                </View>
            </View>
            <Actions />
        </Button>
    </Link>
  )
}

export default Portfolio

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: "auto",
        flexDirection: 'column',
        marginHorizontal: 0,
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(16),
        borderRadius: widthPixel(16),
        elevation: 0,
        shadowColor: "transparent",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        marginBottom: widthPixel(16),
    },
    image: { 
        width: widthPixel(40), 
        height: widthPixel(40),
        borderRadius: widthPixel(20),
    },
    user: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(5),
        flex: 1,
    },
    name: {
        fontSize: widthPixel(16),
    },
    skills: {
        fontSize: widthPixel(12),
    },
    createdAt: {
        fontFamily: 'Regular',
        fontSize: widthPixel(12),
    },
    description: {
        fontFamily: 'Regular',
        fontSize: widthPixel(16),
        marginTop: widthPixel(5),
    },
    content: {
        flex: 1,
    },
    topContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }
})