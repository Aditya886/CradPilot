import ImagePicker from 'react-native-image-crop-picker';

type Props = {
  multiple?: boolean;
  profile?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
};

export const pickImages = async ({
  multiple = false,
  profile = false,
  onSuccess,
  onError,
}: Props) => {
  try {
    // MULTIPLE IMAGES
    if (multiple) {
      const images = await ImagePicker.openPicker({
        multiple: true,
        mediaType: 'photo',
        maxFiles: 9,

        cropping: false,

        compressImageQuality: 1,

        forceJpg: true,
      });

      if (!images?.length) {
        return;
      }

      const croppedImages = [];

      for (let i = 0; i < images.length; i++) {
        try {
          const cropped = await ImagePicker.openCropper({
            path: images[i].path,

            mediaType: 'photo',

            width: 1600,
            height: 1200,

            // freeStyleCropEnabled: true,

            compressImageQuality: 1,

            cropperToolbarTitle: 'Crop Image',
          });

          croppedImages.push({
            uri: cropped.path,
            name:
              cropped.filename ||
              cropped.path?.split('/').pop() ||
              `image_${Date.now()}.jpg`,
            type: cropped.mime || 'image/jpeg',
            size: cropped.size,
          });
        } catch (e) {
          console.log('Crop cancelled');
        }
      }

      onSuccess?.(croppedImages);

      return croppedImages;
    }

    // SINGLE IMAGE
    const image = await ImagePicker.openPicker({
      mediaType: 'photo',

      cropping: true,

      // freeStyleCropEnabled: true,

      width: profile ? 1200 : 1600,
      height: 1200,

      compressImageQuality: 1,

      cropperToolbarTitle: 'Crop Image',
    });

    const formatted = {
      uri: image.path,
      name:
        image.filename ||
        image.path?.split('/').pop() ||
        `image_${Date.now()}.jpg`,
      type: image.mime || 'image/jpeg',
      size: image.size,
    };

    onSuccess?.(formatted);

    return formatted;
  } catch (error: any) {
    console.log(error);

    if (!error?.message?.toLowerCase()?.includes('cancel')) {
      onError?.(error);
    }
  }
};