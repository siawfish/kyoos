import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Media, MimeType } from '@/redux/app/types';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Pdf from 'react-native-pdf';

interface DocumentViewerProps {
    readonly document: Media;
    readonly isActive?: boolean;
    readonly thumbnail?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DocumentViewer = ({ document, isActive = true, thumbnail = false }: DocumentViewerProps) => {
    const colorScheme = useAppTheme();
    const isDark = colorScheme === 'dark';
    const backgroundColor = useThemeColor(
        { light: colors.light.background, dark: colors.dark.background },
        'background'
    );
    const textColor = useThemeColor(
        { light: colors.light.text, dark: colors.dark.text },
        'text'
    );
    const dangerColor = useThemeColor(
        { light: colors.light.danger, dark: colors.dark.danger },
        'text'
    );
    const borderColor = isDark ? colors.dark.white : colors.light.black;

    // Memoize URL type checks to prevent unnecessary recalculations
    const { isLocalFile, isRemoteUrl, isFirebaseStorage } = useMemo(() => {
        const url = document.url;
        const local = url.startsWith('file://');
        const remote = url.startsWith('http://') || url.startsWith('https://');
        const firebase = remote && url.includes('firebasestorage.googleapis.com');
        return {
            isLocalFile: local,
            isRemoteUrl: remote,
            isFirebaseStorage: firebase,
        };
    }, [document.url]);
    
    const isPDF = document.type === MimeType.PDF;

    const [localPdfUri, setLocalPdfUri] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasLoadedRef = useRef(false);
    const downloadProgressRef = useRef(0);

    const downloadPdfToLocal = React.useCallback(async () => {
        setIsDownloading(true);
        setHasError(false);
        downloadProgressRef.current = 0;

        try {
            // Create a unique filename based on URL hash
            const urlHash = document.url.split('/').pop()?.split('?')[0] || 'pdf';
            const filename = `${urlHash}.pdf`;
            
            // Get cache directory - try different ways to access it
            let cacheDir: string | null = null;
            
            // Try accessing as property (expo-file-system v19+)
            if ((FileSystem as any).cacheDirectory) {
                cacheDir = (FileSystem as any).cacheDirectory;
            }
            // Try accessing as constant
            else if ((FileSystem as any).CacheDirectory) {
                cacheDir = (FileSystem as any).CacheDirectory;
            }
            // Try documentDirectory as fallback
            else if ((FileSystem as any).documentDirectory) {
                cacheDir = (FileSystem as any).documentDirectory;
            }
            else if ((FileSystem as any).DocumentDirectory) {
                cacheDir = (FileSystem as any).DocumentDirectory;
            }
            
            if (!cacheDir) {
                // Cache directory not available - skip download and use direct URL
                console.warn('[DocumentViewer] Cache directory not available, will use direct URL instead');
                setIsDownloading(false);
                setLocalPdfUri(null); // Ensure we don't try to use local file
                return; // Will fall back to direct URL loading
            }
            
            const localUri = `${cacheDir}${filename}`;
            console.log('[DocumentViewer] Downloading PDF to local storage:', localUri);

            // Check if file already exists
            const fileInfo = await FileSystem.getInfoAsync(localUri);
            if (fileInfo.exists) {
                console.log('[DocumentViewer] PDF already cached, using existing file');
                setLocalPdfUri(localUri);
                setIsDownloading(false);
                return;
            }

            // Download the file
            const downloadResult = await FileSystem.downloadAsync(
                document.url,
                localUri,
                {
                    headers: {},
                }
            );

            if (downloadResult.status === 200) {
                console.log('[DocumentViewer] PDF downloaded successfully:', downloadResult.uri);
                setLocalPdfUri(downloadResult.uri);
            } else {
                throw new Error(`Download failed with status: ${downloadResult.status}`);
            }
        } catch (error: any) {
            console.error('[DocumentViewer] Error downloading PDF:', error);
            setHasError(true);
            setErrorMessage(error?.message || 'Failed to download PDF');
            // Fallback to direct URL
            setLocalPdfUri(null);
        } finally {
            setIsDownloading(false);
        }
    }, [document.url]);

    // Download PDF for Firebase Storage URLs (workaround for react-native-pdf compatibility)
    // Only attempt download once per URL - use URL as key to track attempts
    // Only download when isActive to prevent multiple simultaneous downloads
    // Skip download for thumbnails - use direct URL instead for faster loading
    const downloadAttemptsRef = useRef<Set<string>>(new Set());
    useEffect(() => {
        if (!isActive || thumbnail) return; // Don't download when not active or for thumbnails
        
        const url = document.url;
        const shouldDownload = isPDF && isRemoteUrl && isFirebaseStorage && !localPdfUri && !isDownloading;
        const attemptsSet = downloadAttemptsRef.current;
        const hasAttempted = attemptsSet.has(url);
        
        if (shouldDownload && !hasAttempted) {
            attemptsSet.add(url);
            downloadPdfToLocal();
        }
    }, [isActive, thumbnail, document.url, isPDF, isRemoteUrl, isFirebaseStorage, localPdfUri, isDownloading, downloadPdfToLocal]);

    // Prepare PDF source - use local file if downloaded, otherwise use direct URL
    // Use stable reference to prevent unnecessary remounts
    // Only recreate source when the actual URI changes, not when derived values change
    const pdfSourceUri = useMemo(() => {
        if (!isPDF) return null;
        
        // For Firebase Storage, use downloaded local file if available
        if (isFirebaseStorage && localPdfUri) {
            return localPdfUri;
        }
        
        // Otherwise use the document URL
        return document.url;
    }, [document.url, isPDF, isFirebaseStorage, localPdfUri]);
    
    // Create stable source object - only recreate when URI actually changes
    const pdfSource = useMemo(() => {
        if (!pdfSourceUri || !isPDF) {
            return null;
        }

        if (isFirebaseStorage && localPdfUri) {
            console.log('[DocumentViewer] Using downloaded local PDF:', localPdfUri);
            return { uri: localPdfUri };
        }

        if (isRemoteUrl) {
            console.log('[DocumentViewer] Using remote PDF source:', document.url);
            return { 
                uri: document.url, 
                cache: true,
                method: 'GET' as const
            };
        } else if (isLocalFile) {
            console.log('[DocumentViewer] Using local PDF source:', document.url);
            return { uri: document.url };
        } else if (document.url.startsWith('data:')) {
            console.log('[DocumentViewer] Using base64 PDF source');
            return { uri: document.url };
        }

        return null;
    }, [pdfSourceUri, isPDF, isFirebaseStorage, isRemoteUrl, isLocalFile, localPdfUri, document.url]);

    // Log when PDF source changes and set timeout - only reset when URI actually changes
    // Only start timeout when isActive to prevent multiple timeouts
    const currentPdfUri = pdfSource?.uri;
    useEffect(() => {
        // Clear timeout when becoming inactive
        if (!isActive) {
            if (loadTimeoutRef.current) {
                clearTimeout(loadTimeoutRef.current);
                loadTimeoutRef.current = null;
            }
            return;
        }
        
        if (currentPdfUri) {
            console.log('[DocumentViewer] PDF source URI:', currentPdfUri);
            hasLoadedRef.current = false;
            
            // Clear any existing timeout
            if (loadTimeoutRef.current) {
                clearTimeout(loadTimeoutRef.current);
            }
            
            // Set a timeout to detect if PDF doesn't load within 30 seconds
            loadTimeoutRef.current = setTimeout(() => {
                if (!hasLoadedRef.current) {
                    console.error('[DocumentViewer] PDF load timeout after 30 seconds');
                    setHasError(true);
                    setErrorMessage('PDF took too long to load. Please check your internet connection or try opening it externally.');
                }
            }, 30000);
        }
        
        return () => {
            if (loadTimeoutRef.current) {
                clearTimeout(loadTimeoutRef.current);
            }
        };
    }, [isActive, currentPdfUri]); // Depend on isActive and URI

    const handleLoadComplete = (numberOfPages: number, filePath: string) => {
        hasLoadedRef.current = true;
        if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
        }
        console.log('[DocumentViewer] PDF loaded successfully:', { numberOfPages, filePath });
        setHasError(false);
        setErrorMessage(null);
    };

    const handleError = (error: any) => {
        hasLoadedRef.current = true; // Mark as attempted to prevent timeout
        if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
        }
        const errorMsg = error?.message || error?.toString() || 'Unknown error';
        console.error('[DocumentViewer] Error loading PDF:', error);
        console.error('[DocumentViewer] Error details:', JSON.stringify(error, null, 2));
        setHasError(true);
        setErrorMessage(errorMsg);
    };

    const handleLoadProgress = (percent: number) => {
        // Progress is 0-1, log progress updates but throttle logging
        const roundedPercent = Math.round(percent * 100);
        // Only log at 10% intervals to reduce console spam
        if (roundedPercent % 10 === 0 || roundedPercent >= 90) {
            console.log('[DocumentViewer] Loading progress:', roundedPercent + '%');
        }
    };

    const handleOpenExternal = async () => {
        try {
            if (isLocalFile) {
                // For local files, we need to use a different approach
                // Try to open with the system default app
                Alert.alert(
                    'Open Document',
                    'To view this document, please share it or open it from your device\'s file manager.',
                    [{ text: 'OK' }]
                );
            } else if (isRemoteUrl) {
                await WebBrowser.openBrowserAsync(document.url, {
                    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
                });
            } else {
                Alert.alert('Error', 'Unable to open document.');
            }
        } catch (error) {
            console.error('Error opening document externally:', error);
            Alert.alert('Error', 'Failed to open document. Please try again.');
        }
    };

    // Calculate PDF key before early returns (hooks must be called unconditionally)
    const pdfKey = useMemo(() => {
        if (!pdfSource) return 'pdf-viewer';
        // Use a stable key - only change when the URI actually changes
        return `pdf-${pdfSource.uri}`;
    }, [pdfSource]);

    // Show placeholder when not active (e.g., not the current slide in carousel)
    // Skip this check for thumbnails - they should always render
    if (!isActive && !thumbnail) {
        return (
            <View style={[styles.container, { backgroundColor }]}>
                <Ionicons
                    name="document-text"
                    size={64}
                    color={dangerColor}
                />
                <ThemedText
                    style={[styles.documentText, { color: textColor }]}
                    lightColor={colors.light.text}
                    darkColor={colors.dark.text}
                >
                    PDF Document
                </ThemedText>
            </View>
        );
    }

    // Show loading state while downloading Firebase Storage PDF
    if (isDownloading) {
        return (
            <View style={[styles.container, { backgroundColor }]}>
                <ActivityIndicator size="large" color={dangerColor} />
                <ThemedText
                    style={[styles.loadingText, { color: textColor }]}
                    lightColor={colors.light.text}
                    darkColor={colors.dark.text}
                >
                    Downloading PDF...
                </ThemedText>
            </View>
        );
    }

    // Don't render PDF if we don't have a valid source or it's not a PDF
    if (!pdfSource || !isPDF) {
        return (
            <View style={[styles.container, styles.errorContainer, { backgroundColor }]}>
                <Ionicons
                    name="document-text"
                    size={64}
                    color={dangerColor}
                />
                <ThemedText
                    style={[styles.documentText, { color: textColor }]}
                    lightColor={colors.light.text}
                    darkColor={colors.dark.text}
                >
                    {isPDF ? 'PDF Document' : 'Document'}
                </ThemedText>
                <ThemedText
                    style={[styles.documentSubtext, { color: textColor }]}
                    lightColor={colors.light.text}
                    darkColor={colors.dark.text}
                >
                    {isPDF
                        ? errorMessage || 'Unable to preview this document in-app'
                        : 'Preview not available for this document type'}
                </ThemedText>
                <TouchableOpacity
                    style={[
                        styles.externalButton,
                        {
                            backgroundColor: isDark ? colors.dark.white : colors.light.black,
                            borderColor: borderColor,
                        },
                    ]}
                    onPress={handleOpenExternal}
                >
                    <Ionicons
                        name="open-outline"
                        size={fontPixel(18)}
                        color={isDark ? colors.dark.black : colors.light.white}
                    />
                    <ThemedText
                        style={[
                            styles.externalButtonText,
                            { color: isDark ? colors.dark.black : colors.light.white },
                        ]}
                        lightColor={colors.light.white}
                        darkColor={colors.dark.black}
                    >
                        Open in External App
                    </ThemedText>
                </TouchableOpacity>
            </View>
        );
    }

    // Show error state if there's an error
    if (hasError) {
        // For thumbnails, show a simple icon fallback
        if (thumbnail) {
            return (
                <View style={[styles.thumbnailContainer, styles.thumbnailErrorContainer, { backgroundColor }]}>
                    <Ionicons
                        name="document-text"
                        size={32}
                        color={dangerColor}
                    />
                </View>
            );
        }
        
        // Full error view for non-thumbnails
        return (
            <View style={[styles.container, styles.errorContainer, { backgroundColor }]}>
                <Ionicons
                    name="document-text"
                    size={64}
                    color={dangerColor}
                />
                <ThemedText
                    style={[styles.documentText, { color: textColor }]}
                    lightColor={colors.light.text}
                    darkColor={colors.dark.text}
                >
                    PDF Document
                </ThemedText>
                <ThemedText
                    style={[styles.documentSubtext, { color: textColor }]}
                    lightColor={colors.light.text}
                    darkColor={colors.dark.text}
                >
                    {errorMessage || 'Unable to preview this document in-app'}
                </ThemedText>
                <TouchableOpacity
                    style={[
                        styles.externalButton,
                        {
                            backgroundColor: isDark ? colors.dark.white : colors.light.black,
                            borderColor: borderColor,
                        },
                    ]}
                    onPress={handleOpenExternal}
                >
                    <Ionicons
                        name="open-outline"
                        size={fontPixel(18)}
                        color={isDark ? colors.dark.black : colors.light.white}
                    />
                    <ThemedText
                        style={[
                            styles.externalButtonText,
                            { color: isDark ? colors.dark.black : colors.light.white },
                        ]}
                        lightColor={colors.light.white}
                        darkColor={colors.dark.black}
                    >
                        Open in External App
                    </ThemedText>
                </TouchableOpacity>
            </View>
        );
    }

    // Render PDF component - it will show its own loading indicator
    // pdfKey is already calculated above
    const containerStyle = thumbnail ? styles.thumbnailContainer : styles.container;
    const pdfStyle = thumbnail ? styles.thumbnailPdf : styles.pdf;
    
    return (
        <View style={[containerStyle, { backgroundColor }]}>
            <Pdf
                key={pdfKey}
                source={pdfSource}
                style={pdfStyle}
                onLoadComplete={handleLoadComplete}
                onError={handleError}
                onLoadProgress={thumbnail ? undefined : handleLoadProgress}
                enablePaging={!thumbnail}
                enableDoubleTapZoom={!thumbnail}
                trustAllCerts={true}
                spacing={thumbnail ? 0 : heightPixel(10)}
                fitPolicy={0}
                singlePage={thumbnail}
                enableAnnotationRendering={!thumbnail}
                renderActivityIndicator={() => (
                    <View style={[styles.loadingContainer, { backgroundColor }]}>
                        <ActivityIndicator size={thumbnail ? "small" : "large"} color={dangerColor} />
                        {!thumbnail && (
                            <ThemedText
                                style={[styles.loadingText, { color: textColor }]}
                                lightColor={colors.light.text}
                                darkColor={colors.dark.text}
                            >
                                Loading PDF...
                            </ThemedText>
                        )}
                    </View>
                )}
            />
        </View>
    );
};

export default DocumentViewer;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pdf: {
        flex: 1,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: 'transparent',
    },
    thumbnailContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbnailPdf: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
    },
    thumbnailErrorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: heightPixel(16),
        fontSize: fontPixel(14),
        fontFamily: 'Regular',
    },
    errorContainer: {
        paddingHorizontal: widthPixel(40),
    },
    documentText: {
        fontSize: fontPixel(20),
        fontFamily: 'Bold',
        marginTop: heightPixel(24),
        textAlign: 'center',
    },
    documentSubtext: {
        fontSize: fontPixel(14),
        fontFamily: 'Regular',
        marginTop: heightPixel(12),
        textAlign: 'center',
        opacity: 0.7,
        marginBottom: heightPixel(24),
    },
    externalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
        paddingVertical: heightPixel(12),
        paddingHorizontal: widthPixel(20),
        borderWidth: 0.5,
        borderRadius: 0,
    },
    externalButtonText: {
        fontSize: fontPixel(14),
        fontFamily: 'SemiBold',
        letterSpacing: 0.5,
    },
});
