import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { icons } from '../../utils/AppImages';
import { colors } from '../../utils/colors';
import { font16 } from '../../utils/fontSizes';
import { resWidth, scaleSize } from '../../utils/responsive';
import CustomImage from './CustomImage';
import { FontRegular } from './../../utils/fontFamily';

export const LocationSearch = ({ onLocationSelect, initialLocation }: any) => {
    
    const [address, setAddress] = useState(initialLocation?.placeName);

    // console.log("Updating address with initialLocation:", address);
    // Effect to sync `address` with `initialLocation`
    useEffect(() => {
        if (initialLocation?.placeName) {
            console.log("Updating address with initialLocation:", initialLocation?.placeName);
            setAddress(initialLocation?.placeName);
        }
    }, [initialLocation]);

    // Function to handle location selection
    const fn_SearchLoc = (details:any, data:any) => {
        if (!details) {
            console.log("No details received!");
            return;
        }

        console.log("Google API Response:", details);

        const { lat, lng } = details.geometry.location;
        const placeName = details.name || data.description;
        setAddress(data?.description);

        let zipcode = "";
        let state = "";
        let country = "";

        if (details.address_components) {
            details.address_components.forEach((component:any) => {
                if (component.types.includes("postal_code")) {
                    zipcode = component.long_name;
                }
                if (component.types.includes("administrative_area_level_1")) {
                    state = component.long_name;
                }
                if (component.types.includes("country")) {
                    country = component.long_name;
                }
            });
        }

        // Format data into required structure
        const locationData = {
            location: {
                type: "Point",
                coordinates: [lng, lat], // Longitude first, then Latitude
            },
            placeName,
            zipcode,
            state,
            country
        };

        onLocationSelect(locationData);
        console.log("Selected Address:", locationData);
    };

    return (
        <GooglePlacesAutocomplete
            placeholder={'Start typing the address'}
            fetchDetails={true}
            onPress={(data, details = null) => fn_SearchLoc(details, data)}
            currentLocationLabel="Current location"
            // renderRightButton={() => (
            //     <CustomImage
            //         source={icons.downArrow}
            //         resizeMode="contain"
            //         style={styles.DownArrow}
            //     />
            // )}
            renderLeftButton={() => (
                <CustomImage
                    source={icons.marker}
                    resizeMode="contain"
                    style={styles.locationIcon}
                />
            )}
            query={{
                key: 'AIzaSyB3bpH1IMrpMGeZpt1RMvuQqoEJd-myfpw',
                language: 'en',
                type: '(cities)',
            }}
            currentLocation={true}
            textInputProps={{
                clearButtonMode: 'never',
                returnKeyLabel: 'Done',
                returnKeyType: 'done',
                placeholderTextColor: colors.textBlack41,
                value: address, // Ensuring this updates when `initialLocation` changes
                onChangeText: (text) => setAddress(text),
            }}
            styles={{
                textInputContainer: {
                    minHeight: resWidth(12),
                    marginTop: '1%',
                    borderWidth: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    borderColor: colors.borderColor,
                    borderRadius: resWidth(2),
                    backgroundColor: colors.bgWhite,
                },
                textInput: {
                    height: scaleSize(55),
                    color: colors.textBlack,
                    fontSize: font16,
                    fontFamily: FontRegular,
                    marginBottom: 0,
                    paddingHorizontal: resWidth(2),
                    textAlign: 'left',
                    overflow: 'hidden',
                    backgroundColor: colors.bgWhite13,
                },
                description: { color: colors.textBlack },
            }}
        />
    );
};

const styles = StyleSheet.create({
    DownArrow: {
        width: scaleSize(30),
        height: scaleSize(30),
        marginRight: scaleSize(3),
    },
    locationIcon: {
        width: scaleSize(30),
        height: scaleSize(30),
        marginLeft: scaleSize(3),
    },
});
