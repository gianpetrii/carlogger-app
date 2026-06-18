import * as React from 'react';
import { View, Pressable, Image, ScrollView, Alert } from 'react-native';
import * as ExpoImagePicker from 'expo-image-picker';
import { Camera, ImagePlus, X } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { Text } from './text';

interface ImagePickerProps {
  label?: string;
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

function ImagePickerField({ label, images, onChange, maxImages = 5, className }: ImagePickerProps) {
  const canAdd = images.length < maxImages;

  const pickImage = async () => {
    const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería de fotos.');
      return;
    }

    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: maxImages - images.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      onChange([...images, ...uris]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ExpoImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara.');
      return;
    }

    const result = await ExpoImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      onChange([...images, result.assets[0].uri]);
    }
  };

  const remove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <View className={cn('w-full gap-1.5', className)}>
      {label && (
        <Text variant="small" className="font-medium text-foreground">{label}</Text>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
        <View className="flex-row gap-2 px-1 py-1">
          {images.map((uri, index) => (
            <View key={index} className="relative">
              <Image
                source={{ uri }}
                className="w-20 h-20 rounded-lg"
                resizeMode="cover"
              />
              <Pressable
                onPress={() => remove(index)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive rounded-full items-center justify-center"
              >
                <X size={12} color="white" />
              </Pressable>
            </View>
          ))}
          {canAdd && (
            <View className="gap-2">
              <Pressable
                onPress={pickImage}
                className="w-20 h-[37px] rounded-lg border-2 border-dashed border-border items-center justify-center bg-muted/40"
              >
                <ImagePlus size={20} color="#71717a" />
              </Pressable>
              <Pressable
                onPress={takePhoto}
                className="w-20 h-[37px] rounded-lg border-2 border-dashed border-border items-center justify-center bg-muted/40"
              >
                <Camera size={20} color="#71717a" />
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
      <Text variant="muted" className="text-xs">{images.length}/{maxImages} fotos</Text>
    </View>
  );
}

export { ImagePickerField };
